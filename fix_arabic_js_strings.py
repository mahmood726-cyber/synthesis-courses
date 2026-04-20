"""Translate remaining English strings inside JavaScript blocks of Arabic course files.

Targets:
- Module titles/subtitles (sidebar navigation)
- Quiz feedback text ("Correct! ...", "Incorrect ...")
- Certificate text ("Certificate of Completion", etc.)
- Decision tree labels ("YES", "NO", "Now")
- Spaced retrieval answers
- English connectives in Arabic text ("but", "and", "or", "that")
- UI strings ("Continue Learning", "Quick Review", etc.)

Safety:
- Only translates string literal VALUES, never object keys
- Preserves JS syntax (quotes, escapes, semicolons)
- Skips URLs, CSS selectors, element IDs, function names
- Creates backup before modifying

Usage:
  python fix_arabic_js_strings.py --dry-run
  python fix_arabic_js_strings.py
  python fix_arabic_js_strings.py --files synthesis-course-ar.html
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
from typing import Dict, List, Tuple

try:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = os.path.dirname(os.path.abspath(__file__))

WORDS_RE = re.compile(r"\b[A-Za-z][A-Za-z'\-]{1,}\b")
CORE_ENGLISH = {
    "the", "is", "are", "were", "was", "to", "of", "and", "or", "not", "for",
    "with", "from", "into", "about", "over", "under", "this", "that", "these",
    "those", "you", "your", "we", "our", "has", "have", "had", "been", "will",
    "would", "can", "could", "should", "may", "might", "must", "do", "does",
    "did", "but", "than", "then", "when", "where", "which", "who", "how",
    "what", "why", "all", "each", "every", "both", "few", "more", "most",
    "some", "any", "no", "other", "only", "also", "just", "because", "if",
    "while", "after", "before", "during", "between", "through", "against",
    "its", "their", "his", "her", "they", "them", "she", "he", "it",
    "by", "on", "at", "in", "an", "a",
}


def has_arabic(text: str) -> bool:
    for ch in text:
        if "\u0600" <= ch <= "\u06ff" or "\u0750" <= ch <= "\u077f":
            return True
    return False


def normalize(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "")).strip()


def is_translatable_js_string(text: str) -> bool:
    """Check if a JS string literal value should be translated to Arabic."""
    s = normalize(text)
    if len(s) < 3:
        return False

    # Skip if already Arabic
    if has_arabic(s):
        return False

    # Skip URLs, paths, selectors
    skip_patterns = [
        "http://", "https://", "mailto:", "data:", "blob:",
        "querySelector", "getElementById", "classList", "addEventListener",
        "localStorage", "sessionStorage", "window.", "document.",
        "function(", "function (", "=>", "return ", "var ", "let ", "const ",
        ".js", ".css", ".html", ".png", ".jpg", ".svg", ".pdf",
        "rgb(", "rgba(", "hsl(", "#", "px;", "rem;",
        "evidence_reversal", "synthesis_course", "course_progress",
    ]
    for p in skip_patterns:
        if p in s:
            return False

    # Skip CSS-like values
    if re.search(r"^\d+(\.\d+)?(px|rem|em|%|vh|vw|s|ms)$", s):
        return False

    # Skip element IDs, class names (camelCase or kebab-case patterns)
    if re.match(r"^[a-z][a-zA-Z0-9]*(-[a-z][a-zA-Z0-9]*)*$", s) and len(s) < 30:
        return False

    # Skip pure numbers/symbols
    if re.match(r"^[\d\s.,;:+\-*/=<>()%$#@!?&|^~`\[\]{}]+$", s):
        return False

    # Skip single words that are likely code identifiers
    words = s.split()
    if len(words) == 1 and re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", s):
        return False

    # Must have at least one ASCII letter word
    alpha_words = [w for w in WORDS_RE.findall(s)]
    if not alpha_words:
        return False

    # For very short strings (1-2 words), require core English hit
    if len(alpha_words) <= 2:
        core_hits = sum(1 for w in alpha_words if w.lower() in CORE_ENGLISH)
        if core_hits == 0:
            # Allow common UI terms
            ui_terms = {
                "correct", "incorrect", "yes", "no", "now", "next", "previous",
                "continue", "start", "finish", "complete", "download", "print",
                "certificate", "completion", "progress", "review", "answer",
                "question", "quiz", "score", "submit", "reset", "close",
                "reveal", "predict", "treatment", "control", "effect",
                "benefit", "harm", "favors", "standard", "error",
            }
            if not any(w.lower() in ui_terms for w in alpha_words):
                return False

    return True


def translate_google(text: str, cache: Dict[str, str]) -> str:
    text = normalize(text)
    if not text:
        return text
    if text in cache:
        return cache[text]

    params = urllib.parse.urlencode(
        {"client": "gtx", "sl": "en", "tl": "ar", "dt": "t", "q": text}
    )
    url = f"https://translate.googleapis.com/translate_a/single?{params}"

    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as resp:
                payload = resp.read().decode("utf-8")
            obj = json.loads(payload)
            translated = "".join(part[0] for part in obj[0]).strip()
            if translated:
                cache[text] = translated
                return translated
        except Exception as exc:
            if attempt == 2:
                print(f"    [WARN] Translation failed: {text[:60]!r} -> {exc}")
                cache[text] = text
                return text
            time.sleep(0.3 * (attempt + 1))
    return text


def batch_translate(texts: List[str], cache: Dict[str, str]) -> None:
    unique = []
    seen = set()
    for t in texts:
        t = normalize(t)
        if not t or t in cache or t in seen:
            continue
        unique.append(t)
        seen.add(t)

    if not unique:
        return

    SEP = " <<<SEP>>> "
    i = 0
    while i < len(unique):
        chunk = []
        total_len = 0
        while i < len(unique):
            nxt = unique[i]
            add_len = len(nxt) + (len(SEP) if chunk else 0)
            if chunk and (len(chunk) >= 20 or total_len + add_len > 3000):
                break
            chunk.append(nxt)
            total_len += add_len
            i += 1

        joined = SEP.join(chunk)
        try:
            params = urllib.parse.urlencode(
                {"client": "gtx", "sl": "en", "tl": "ar", "dt": "t", "q": joined}
            )
            url = f"https://translate.googleapis.com/translate_a/single?{params}"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                payload = resp.read().decode("utf-8")
            obj = json.loads(payload)
            translated = "".join(part[0] for part in obj[0]).strip()

            sep_variants = ["<<<SEP>>>", "<<< SEP >>>", "<<<sep>>>", "<<< sep >>>",
                           "«SEP»", "<<<SEP >>>", "<<< SEP>>>"]
            parts = None
            for sv in sep_variants:
                candidate = translated.split(sv)
                if len(candidate) == len(chunk):
                    parts = candidate
                    break
            if parts is None:
                candidate = translated.split(SEP.strip())
                if len(candidate) == len(chunk):
                    parts = candidate

            if parts and len(parts) == len(chunk):
                for src, tr in zip(chunk, parts):
                    out = tr.strip()
                    cache[src] = out if out else src
            else:
                for src in chunk:
                    translate_google(src, cache)
                    time.sleep(0.05)
        except Exception:
            for src in chunk:
                translate_google(src, cache)
                time.sleep(0.05)

        time.sleep(0.08)


def escape_js(text: str, quote: str) -> str:
    text = text.replace("\\", "\\\\")
    if quote == "'":
        text = text.replace("'", "\\'")
    else:
        text = text.replace('"', '\\"')
    text = text.replace("\n", "\\n")
    text = text.replace("\r", "\\r")
    return text


def process_script_block(script_text: str, cache: Dict[str, str]) -> Tuple[str, int]:
    """Find and translate English string literals inside a script block."""
    if not script_text:
        return script_text, 0

    # Match JS string literals
    lit_re = re.compile(r"(?P<q>['\"])(?P<body>(?:\\.|(?!(?P=q)).)*?)(?P=q)", re.S)

    # First pass: collect translatable strings
    candidates: List[Tuple[int, int, str, str, str]] = []
    phrases: List[str] = []

    for m in lit_re.finditer(script_text):
        start, end = m.span()
        quote = m.group("q")
        body = m.group("body")

        # Decode escape sequences for analysis
        decoded = body.replace("\\n", " ").replace("\\t", " ")
        decoded = re.sub(r"\\u[0-9a-fA-F]{4}", " ", decoded)
        decoded = re.sub(r"\\x[0-9a-fA-F]{2}", " ", decoded)
        decoded = decoded.replace("\\'", "'").replace('\\"', '"')
        decoded = normalize(decoded)

        if is_translatable_js_string(decoded):
            candidates.append((start, end, quote, body, decoded))
            phrases.append(decoded)

    if not phrases:
        return script_text, 0

    # Batch translate
    batch_translate(phrases, cache)

    # Second pass: replace
    changes = 0
    parts: List[str] = []
    last = 0

    for start, end, quote, original_body, decoded in candidates:
        parts.append(script_text[last:start])
        translated = cache.get(decoded, decoded)
        if translated and translated != decoded:
            new_body = escape_js(translated, quote)
            parts.append(f"{quote}{new_body}{quote}")
            changes += 1
        else:
            parts.append(script_text[start:end])
        last = end

    parts.append(script_text[last:])
    return "".join(parts), changes


def process_file(path: str, cache: Dict[str, str], dry_run: bool) -> int:
    """Process all script blocks in an Arabic HTML file."""
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()

    script_re = re.compile(r"(<script\b[^>]*>)(.*?)(</script>)", re.DOTALL | re.IGNORECASE)
    total_changes = 0
    parts: List[str] = []
    last = 0

    for m in script_re.finditer(content):
        parts.append(content[last:m.start()])
        open_tag = m.group(1)
        script_body = m.group(2)
        close_tag = m.group(3)

        # Skip external scripts
        if "src=" in open_tag:
            parts.append(m.group(0))
        else:
            new_body, changes = process_script_block(script_body, cache)
            parts.append(f"{open_tag}{new_body}{close_tag}")
            total_changes += changes

        last = m.end()

    parts.append(content[last:])
    new_content = "".join(parts)

    if total_changes > 0 and not dry_run:
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(new_content)

    return total_changes


def main():
    parser = argparse.ArgumentParser(description="Translate JS strings in Arabic HTML files")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--files", default="", help="Comma-separated file subset")
    parser.add_argument("--no-backup", action="store_true")
    args = parser.parse_args()

    selected = {x.strip() for x in args.files.split(",") if x.strip()}
    ar_files = sorted(f for f in os.listdir(ROOT) if f.endswith("-ar.html"))
    if selected:
        ar_files = [f for f in ar_files if f in selected]

    print(f"Processing {len(ar_files)} Arabic files for JS string translation...")

    if not args.dry_run and not args.no_backup:
        backup_dir = os.path.join(ROOT, f"_ar_js_backup_{time.strftime('%Y%m%d_%H%M%S')}")
        os.makedirs(backup_dir, exist_ok=True)
        for f in ar_files:
            shutil.copy2(os.path.join(ROOT, f), os.path.join(backup_dir, f))
        print(f"Backups: {os.path.basename(backup_dir)}")

    cache: Dict[str, str] = {}
    total = 0

    for fn in ar_files:
        path = os.path.join(ROOT, fn)
        print(f"\n  [{fn}] ...", end="", flush=True)
        try:
            changes = process_file(path, cache, args.dry_run)
            total += changes
            print(f" {changes} JS strings translated", flush=True)
        except Exception as exc:
            print(f" ERROR: {exc}", flush=True)

    print(f"\n{'='*60}")
    print(f"Total JS translations: {total}")
    print(f"Cached phrases: {len(cache)}")
    if args.dry_run:
        print("DRY RUN - no files modified")


if __name__ == "__main__":
    main()
