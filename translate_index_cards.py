"""Translate remaining English card content in localized index pages.

This script targets only localized index pages and only replaces text
that is still exactly the same as the English source page.

Usage:
  python translate_index_cards.py
  python translate_index_cards.py --dry-run
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
from dataclasses import dataclass
from typing import Dict, List, Tuple

from bs4 import BeautifulSoup


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


@dataclass
class CardSource:
    tags: List[str]
    title: str
    desc: str
    meta: str


LANG_FILES = {
    "ar": "index-ar.html",
    "de": "index-de.html",
    "es": "index-es.html",
    "fr": "index-fr.html",
    "hi": "index-hi.html",
    "it": "index-it.html",
    "ja": "index-ja.html",
    "ko": "index-ko.html",
    "pt": "index-pt.html",
    "ru": "index-ru.html",
    "zh-cn": "index-zh.html",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Translate index card text still in English.")
    parser.add_argument(
        "--root",
        default=os.path.dirname(os.path.abspath(__file__)),
        help="Folder containing index.html and index-*.html files.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Compute and report changes without writing files.",
    )
    parser.add_argument(
        "--langs",
        default="",
        help="Comma-separated subset of language codes (e.g., ar,es,fr).",
    )
    parser.add_argument(
        "--backup-dir",
        default="_translation_backups",
        help="Backup root folder (relative to --root, or absolute path). Empty string disables backups. Uses a unique per-run subfolder.",
    )
    return parser.parse_args()


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def normalize_lang_code(code: str) -> str:
    key = (code or "").strip().lower().replace("_", "-")
    if key in {"zh", "zh-hans", "zh-cn"}:
        return "zh-cn"
    return key


def to_google_lang(code: str) -> str:
    return "zh-CN" if code == "zh-cn" else code


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


def get_source_cards(root: str) -> Tuple[Dict[str, CardSource], List[str]]:
    source_path = os.path.join(root, "index.html")
    with open(source_path, "r", encoding="utf-8", errors="replace") as fh:
        soup = BeautifulSoup(fh.read(), "html.parser")

    cards: Dict[str, CardSource] = {}
    for card in soup.select("a.course-card"):
        href = (card.get("href") or "").strip()
        if not href:
            continue
        title_el = card.select_one(".title")
        desc_el = card.select_one(".desc")
        meta_el = card.select_one(".meta")
        cards[href] = CardSource(
            tags=[normalize(t.get_text(" ", strip=True)) for t in card.select(".card-top .tag")],
            title=normalize(title_el.get_text(" ", strip=True) if title_el else ""),
            desc=normalize(desc_el.get_text(" ", strip=True) if desc_el else ""),
            meta=normalize(meta_el.get_text(" ", strip=True) if meta_el else ""),
        )

    path_steps = [normalize(a.get_text(" ", strip=True)) for a in soup.select(".path-step")]
    return cards, path_steps


def translate_google(text: str, lang: str, cache: Dict[Tuple[str, str], str]) -> str:
    text = normalize(text)
    if not text:
        return text
    key = (lang, text)
    if key in cache:
        return cache[key]

    params = urllib.parse.urlencode(
        {"client": "gtx", "sl": "en", "tl": lang, "dt": "t", "q": text}
    )
    url = f"https://translate.googleapis.com/translate_a/single?{params}"

    last_err = None
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=25) as resp:
                payload = resp.read().decode("utf-8")
            obj = json.loads(payload)
            translated = "".join(part[0] for part in obj[0]).strip()
            if translated:
                cache[key] = translated
                return translated
        except Exception as exc:  # noqa: BLE001
            last_err = exc
            time.sleep(0.4 * (attempt + 1))

    raise RuntimeError(f"Translation failed for lang={lang}, text={text!r}: {last_err}")


def set_plain_text(el, value: str) -> None:
    el.clear()
    el.append(value)


def translate_file(
    file_path: str,
    root: str,
    backup_base: str | None,
    lang: str,
    source_cards: Dict[str, CardSource],
    source_steps: List[str],
    cache: Dict[Tuple[str, str], str],
    dry_run: bool = False,
) -> int:
    with open(file_path, "r", encoding="utf-8", errors="replace") as fh:
        html = fh.read()

    soup = BeautifulSoup(html, "html.parser")
    changes = 0

    for href, src in source_cards.items():
        card = soup.select_one(f'a.course-card[href="{href}"]')
        if not card:
            continue

        tags = card.select(".card-top .tag")
        for idx, tag_el in enumerate(tags):
            if idx >= len(src.tags):
                continue
            current = normalize(tag_el.get_text(" ", strip=True))
            if current == src.tags[idx]:
                translated = translate_google(src.tags[idx], lang, cache)
                if translated != current:
                    set_plain_text(tag_el, translated)
                    changes += 1

        for sel, src_text in (
            (".title", src.title),
            (".desc", src.desc),
            (".meta", src.meta),
        ):
            if not src_text:
                continue
            el = card.select_one(sel)
            if not el:
                continue
            if el.find(attrs={"lang": True}):
                continue
            current = normalize(el.get_text(" ", strip=True))
            if current == src_text:
                translated = translate_google(src_text, lang, cache)
                if translated != current:
                    set_plain_text(el, translated)
                    changes += 1

    steps = soup.select(".path-step")
    for idx, step_el in enumerate(steps):
        if idx >= len(source_steps):
            break
        src_step = source_steps[idx]
        current = normalize(step_el.get_text(" ", strip=True))
        if current == src_step:
            translated = translate_google(src_step, lang, cache)
            if translated != current:
                set_plain_text(step_el, translated)
                changes += 1

    if changes > 0 and not dry_run:
        backup_path = backup_file(file_path, root, backup_base)
        with open(file_path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(str(soup))
        if backup_path:
            print(f"[BAK] {os.path.relpath(backup_path, root)}")

    return changes


def main() -> int:
    configure_stdout_utf8()
    args = parse_args()
    root = os.path.abspath(args.root)
    if not os.path.isdir(root):
        print(f"[ERR] Root directory not found: {root}")
        return 1
    source_path = os.path.join(root, "index.html")
    if not os.path.exists(source_path):
        print(f"[ERR] Required source file not found: {source_path}")
        return 1

    source_cards, source_steps = get_source_cards(root)
    cache: Dict[Tuple[str, str], str] = {}

    total_changes = 0
    per_file: Dict[str, int] = {}
    selection_errors = 0
    processed_files = 0
    backup_base: str | None = None
    if not args.dry_run and (args.backup_dir or "").strip():
        backup_base = make_backup_run_dir(
            root,
            args.backup_dir,
            "translate-index-cards",
        )
        try:
            shown = os.path.relpath(backup_base, root)
        except ValueError:
            shown = backup_base
        print(f"[BAK] backup run folder: {shown}")
    selected = {
        normalize_lang_code(code)
        for code in args.langs.split(",")
        if code.strip()
    }
    unknown_langs = sorted(code for code in selected if code not in LANG_FILES)
    for code in unknown_langs:
        selection_errors += 1
        print(f"[ERR] Unsupported language code for index translation: {code}")
    selected_filenames = [LANG_FILES[code] for code in selected if code in LANG_FILES]
    missing_selected = sorted(
        filename for filename in selected_filenames if not os.path.exists(os.path.join(root, filename))
    )
    for filename in missing_selected:
        selection_errors += 1
        print(f"[ERR] Selected language file not found: {filename}")
    if selection_errors:
        print("[ERR] Aborting before processing due to selection errors.")
        return 1

    for lang_code, filename in LANG_FILES.items():
        if selected and lang_code not in selected:
            continue
        lang = to_google_lang(lang_code)
        path = os.path.join(root, filename)
        if not os.path.exists(path):
            print(f"[SKIP] {filename} not found")
            continue
        processed_files += 1
        print(f"[RUN] {filename} ({lang}) ...", flush=True)
        try:
            changes = translate_file(
                file_path=path,
                root=root,
                backup_base=backup_base,
                lang=lang,
                source_cards=source_cards,
                source_steps=source_steps,
                cache=cache,
                dry_run=args.dry_run,
            )
            per_file[filename] = changes
            total_changes += changes
            print(f"[OK] {filename}: {changes} replacements")
        except Exception as exc:  # noqa: BLE001
            print(f"[ERR] {filename}: {exc}")
            return 1

    if selected and processed_files == 0:
        selection_errors += 1
        print("[ERR] no index files matched the provided --langs filter")

    print(f"\nTotal replacements: {total_changes}")
    print(f"Unique translated phrases cached: {len(cache)}")
    if selection_errors:
        print(f"Selection errors: {selection_errors}")
    if args.dry_run:
        print("Dry run only. No files written.")
    return 1 if selection_errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
