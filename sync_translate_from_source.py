"""Translate unchanged English strings in localized files using source file matching.

For each (source -> localized) pair:
- Collect visible text nodes from the English source.
- In localized file, any visible text node still exactly matching a source string
  is treated as untranslated and translated to target language.
"""

from __future__ import annotations

import argparse
import io
import json
import os
import re
import shutil
import sys
import time
import urllib.parse
import urllib.request
from typing import Dict, List, Sequence, Set, Tuple

from bs4 import BeautifulSoup, Comment, NavigableString


def configure_stdout_utf8() -> None:
    """Best-effort UTF-8 stdout setup without import-time side effects."""
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        return
    except Exception:  # noqa: BLE001
        pass

    buffer = getattr(sys.stdout, "buffer", None)
    if buffer is None:
        return
    try:
        sys.stdout = io.TextIOWrapper(buffer, encoding="utf-8", errors="replace")
    except Exception:  # noqa: BLE001
        pass


LANG_ALIASES = {
    "zh": "zh-cn",
    "zh_cn": "zh-cn",
    "zh-hans": "zh-cn",
    "zh-cn": "zh-cn",
}
LANG_CODE_RE = re.compile(r"^[a-z]{2}(?:-[a-z]{2})?$")


def normalize(s: str) -> str:
    text = (s or "").replace("\u2019", "'").replace("\u2018", "'")
    return re.sub(r"\s+", " ", text).strip()


def normalize_lang_code(code: str) -> str:
    key = (code or "").strip().lower().replace("_", "-")
    return LANG_ALIASES.get(key, key)


def to_google_lang(code: str) -> str:
    return "zh-CN" if code == "zh-cn" else code


WORDS_RE = re.compile(r"\b[A-Za-z][A-Za-z'\-]{2,}\b")
STOP_WORDS = {
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "to",
    "of",
    "in",
    "on",
    "at",
    "by",
    "and",
    "or",
    "not",
    "for",
    "as",
    "with",
    "from",
    "this",
    "that",
    "these",
    "those",
    "you",
    "your",
    "we",
    "our",
    "course",
    "module",
    "review",
    "analysis",
    "evidence",
    "method",
    "methods",
    "question",
    "answer",
    "results",
    "study",
    "studies",
    "data",
}


def is_english_source_text(text: str) -> bool:
    t = normalize(text)
    if len(t) < 4:
        return False
    words = [w.lower() for w in WORDS_RE.findall(t)]
    if not words:
        return False
    letters = sum(ch.isalpha() for ch in t)
    ascii_letters = sum(("A" <= ch <= "Z") or ("a" <= ch <= "z") for ch in t)
    if letters == 0:
        return False
    if ascii_letters / letters < 0.92:
        return False
    if len(words) == 1:
        # keep one-word terms like "Meta-Analysis", "Dashboard"
        return len(words[0]) >= 4
    hits = sum(1 for w in words if w in STOP_WORDS)
    return hits >= 1 or len(words) >= 3


def visible_text_nodes(soup: BeautifulSoup) -> List[NavigableString]:
    nodes: List[NavigableString] = []
    for node in soup.find_all(string=True):
        if isinstance(node, Comment):
            continue
        if node.parent and node.parent.name in {"script", "style", "code", "pre", "noscript"}:
            continue
        nodes.append(node)
    return nodes


def translate_google(text: str, lang: str) -> str:
    params = urllib.parse.urlencode(
        {"client": "gtx", "sl": "en", "tl": lang, "dt": "t", "q": text}
    )
    url = f"https://translate.googleapis.com/translate_a/single?{params}"
    with urllib.request.urlopen(url, timeout=25) as resp:
        payload = resp.read().decode("utf-8")
    obj = json.loads(payload)
    return "".join(part[0] for part in obj[0]).strip()


def batch_translate(texts: Sequence[str], lang: str, cache: Dict[Tuple[str, str], str]) -> Dict[str, str]:
    uniq = []
    seen = set()
    for t in texts:
        key = (lang, t)
        if key in cache:
            continue
        if t not in seen:
            uniq.append(t)
            seen.add(t)

    sep = "<<<SYNC_SEP_A12F>>>"
    i = 0
    while i < len(uniq):
        chunk: List[str] = []
        total = 0
        while i < len(uniq):
            nxt = uniq[i]
            add_len = len(nxt) + (len(sep) if chunk else 0)
            if chunk and (len(chunk) >= 40 or total + add_len > 3900):
                break
            chunk.append(nxt)
            total += add_len
            i += 1

        joined = sep.join(chunk)
        try:
            translated = translate_google(joined, lang)
            parts = translated.split(sep)
            if len(parts) != len(chunk):
                raise RuntimeError("separator mismatch")
            for src, tr in zip(chunk, parts):
                cache[(lang, src)] = tr.strip()
        except Exception:
            for src in chunk:
                try:
                    cache[(lang, src)] = translate_google(src, lang)
                    time.sleep(0.08)
                except Exception:
                    cache[(lang, src)] = src
        time.sleep(0.06)

    return {t: cache[(lang, t)] for t in texts}


def backup_file(path: str, root: str, backup_base: str | None) -> str | None:
    if not backup_base:
        return None
    rel = os.path.relpath(path, root)
    backup_path = os.path.join(backup_base, rel + ".bak")
    os.makedirs(os.path.dirname(backup_path), exist_ok=True)
    shutil.copy2(path, backup_path)
    return backup_path


def make_backup_run_dir(root: str, backup_dir: str, run_label: str) -> str:
    base_root = backup_dir if os.path.isabs(backup_dir) else os.path.join(root, backup_dir)
    stamp = time.strftime("%Y%m%d_%H%M%S")
    safe_label = re.sub(r"[^A-Za-z0-9_.-]+", "-", run_label).strip("-") or "run"
    nonce = f"{time.time_ns() % 1_000_000_000:09d}"
    run_dir = os.path.join(base_root, f"{stamp}_{safe_label}_{os.getpid()}_{nonce}")
    os.makedirs(run_dir, exist_ok=True)
    return run_dir


def process_pair(
    root: str,
    source_fn: str,
    target_fn: str,
    lang: str,
    cache: Dict[Tuple[str, str], str],
    dry_run: bool,
    backup_base: str | None,
) -> int:
    source_path = os.path.join(root, source_fn)
    target_path = os.path.join(root, target_fn)

    with open(source_path, "r", encoding="utf-8", errors="replace") as f:
        source_soup = BeautifulSoup(f.read(), "html.parser")
    with open(target_path, "r", encoding="utf-8", errors="replace") as f:
        target_soup = BeautifulSoup(f.read(), "html.parser")

    source_texts: Set[str] = set()
    for n in visible_text_nodes(source_soup):
        s = normalize(str(n))
        if is_english_source_text(s):
            source_texts.add(s)

    targets: List[Tuple[NavigableString, str, str, str]] = []
    for n in visible_text_nodes(target_soup):
        raw = str(n)
        stripped = normalize(raw)
        if not stripped:
            continue
        if stripped not in source_texts:
            continue
        if not is_english_source_text(stripped):
            continue
        leading = raw[: len(raw) - len(raw.lstrip())]
        trailing = raw[len(raw.rstrip()) :]
        targets.append((n, stripped, leading, trailing))

    unique = sorted({t[1] for t in targets}, key=len)
    if unique:
        batch_translate(unique, lang, cache)

    changes = 0
    for node, src, leading, trailing in targets:
        tr = cache.get((lang, src), src)
        new = f"{leading}{tr}{trailing}"
        if new != str(node):
            node.replace_with(NavigableString(new))
            changes += 1

    if changes and not dry_run:
        backup_path = backup_file(target_path, root, backup_base)
        with open(target_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(str(target_soup))
        if backup_path:
            print(f"[BAK] {os.path.relpath(backup_path, root)}")

    return changes


def main() -> int:
    configure_stdout_utf8()
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=os.path.dirname(os.path.abspath(__file__)))
    ap.add_argument("--lang", required=True, help="target language code, e.g., fr or es")
    ap.add_argument(
        "--pairs",
        required=True,
        help="semicolon-separated pairs: source.html>target.html;source2.html>target2.html",
    )
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument(
        "--backup-dir",
        default="_translation_backups",
        help="Backup root folder (relative to --root, or absolute path). Empty string disables backups. Uses a unique per-run subfolder.",
    )
    args = ap.parse_args()

    root = os.path.abspath(args.root)
    if not os.path.isdir(root):
        print(f"[ERR] Root directory not found: {root}")
        return 1
    lang_code = normalize_lang_code(args.lang)
    if not LANG_CODE_RE.fullmatch(lang_code):
        print(f"[ERR] Invalid language code: {args.lang}")
        print("Use codes like: fr, es, de, zh-cn")
        return 1
    lang = to_google_lang(lang_code)
    cache: Dict[Tuple[str, str], str] = {}
    total = 0
    backup_base: str | None = None
    if not args.dry_run and (args.backup_dir or "").strip():
        backup_base = make_backup_run_dir(
            root,
            args.backup_dir,
            "sync-translate-from-source",
        )
        try:
            shown = os.path.relpath(backup_base, root)
        except ValueError:
            shown = backup_base
        print(f"[BAK] backup run folder: {shown}")

    pair_items = []
    parse_errors = 0
    for part in args.pairs.split(";"):
        part = part.strip()
        if not part:
            continue
        if ">" not in part:
            parse_errors += 1
            print(f"[ERR] Invalid pair format: {part} (expected source.html>target.html)")
            continue
        src, tgt = [x.strip() for x in part.split(">", 1)]
        if not src or not tgt:
            parse_errors += 1
            print(f"[ERR] Invalid pair format: {part} (missing source or target)")
            continue
        pair_items.append((src, tgt))
    if parse_errors:
        print(f"\nPair format errors: {parse_errors}")
    if not pair_items:
        print("[ERR] No valid source>target pairs were provided.")
        return 1
    if parse_errors:
        return 1

    pair_errors = 0
    for src, tgt in pair_items:
        src_path = os.path.join(root, src)
        tgt_path = os.path.join(root, tgt)
        if not os.path.exists(src_path):
            pair_errors += 1
            print(f"[ERR] Source file not found: {src}")
        if not os.path.exists(tgt_path):
            pair_errors += 1
            print(f"[ERR] Target file not found: {tgt}")
    if pair_errors:
        print(f"\nPair validation errors: {pair_errors}")
        return 1

    for src, tgt in pair_items:
        print(f"[RUN] {src} -> {tgt}")
        c = process_pair(root, src, tgt, lang, cache, args.dry_run, backup_base)
        total += c
        print(f"[OK] {tgt}: {c} replacements")

    print(f"\nTotal replacements: {total}")
    print(f"Cached phrases: {len(cache)}")
    if args.dry_run:
        print("Dry run only. No files written.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
