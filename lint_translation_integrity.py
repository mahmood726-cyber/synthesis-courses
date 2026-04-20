"""Lint localized HTML files for translation-induced JS corruption patterns.

Checks include:
1) replacement character (U+FFFD) presence
2) suspicious localized object keys in inline JavaScript
3) non-boolean values assigned to `truth` fields in JS objects

Usage:
  python lint_translation_integrity.py
  python lint_translation_integrity.py --files synthesis-course-fr.html,index-fr.html
"""

from __future__ import annotations

import argparse
import os
import re
from dataclasses import dataclass
from typing import List


LANG_SUFFIX_RE = re.compile(r"-(ar|de|es|fr|hi|it|ja|ko|pt|ru|zh)\.html$", re.IGNORECASE)
SCRIPT_BLOCK_RE = re.compile(r"<script\b[^>]*>(?P<body>.*?)</script>", re.IGNORECASE | re.DOTALL)
SUSPICIOUS_JS_KEY_RE = re.compile(
    r"(?:^|[,{]\s*)(?:texte|cons\u00e9quence|r\u00e9sultat|v\u00e9rit\u00e9|histoire)\s*:",
    re.IGNORECASE,
)
SUSPICIOUS_TRUTH_VALUE_RE = re.compile(
    r"(?:^|[,{]\s*)truth\s*:\s*(?!\s*(?:true|false)\b)",
    re.IGNORECASE,
)


@dataclass
class LintIssue:
    file: str
    line: int
    kind: str
    detail: str


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Lint translation integrity for localized HTML files.")
    p.add_argument("--root", default=os.path.dirname(os.path.abspath(__file__)))
    p.add_argument(
        "--files",
        default="",
        help="Optional comma-separated file subset (e.g., synthesis-course-fr.html,index-fr.html).",
    )
    return p.parse_args()


def line_of(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def lint_file(path: str) -> List[LintIssue]:
    issues: List[LintIssue] = []
    fn = os.path.basename(path)
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        html = fh.read()

    lit_re = re.compile(r"(?P<q>['\"])(?P<body>(?:\\.|(?!\1).)*?)(?P=q)", re.S)

    def mask_js_strings(script_text: str) -> str:
        chars = list(script_text)
        for m in lit_re.finditer(script_text):
            for i in range(m.start(), m.end()):
                if chars[i] != "\n":
                    chars[i] = " "
        return "".join(chars)

    for m in re.finditer("\ufffd", html):
        issues.append(
            LintIssue(
                file=fn,
                line=line_of(html, m.start()),
                kind="replacement-char",
                detail="Contains U+FFFD replacement character",
            )
        )

    for block in SCRIPT_BLOCK_RE.finditer(html):
        script = block.group("body")
        masked = mask_js_strings(script)
        script_start = block.start("body")

        for m in SUSPICIOUS_JS_KEY_RE.finditer(masked):
            issues.append(
                LintIssue(
                    file=fn,
                    line=line_of(html, script_start + m.start()),
                    kind="suspicious-js-key",
                    detail=f"Suspicious localized JS key near: {m.group(0).strip()[:60]}",
                )
            )

        for m in SUSPICIOUS_TRUTH_VALUE_RE.finditer(masked):
            issues.append(
                LintIssue(
                    file=fn,
                    line=line_of(html, script_start + m.start()),
                    kind="truth-non-boolean",
                    detail="`truth` appears to use non-boolean value",
                )
            )

    return issues


def main() -> int:
    args = parse_args()
    root = os.path.abspath(args.root)
    if not os.path.isdir(root):
        print(f"[ERR] Root directory not found: {root}")
        return 1
    selected = {x.strip() for x in args.files.split(",") if x.strip()}
    localized = sorted(
        f for f in os.listdir(root) if f.lower().endswith(".html") and LANG_SUFFIX_RE.search(f)
    )
    if selected:
        missing = sorted(name for name in selected if name not in set(localized))
        if missing:
            for name in missing:
                print(f"[ERR] requested localized file not found: {name}")
            print(f"\nSelection errors: {len(missing)}")
            return 1
    files = sorted(f for f in localized if not selected or f in selected)

    if not files:
        print("No localized HTML files found to lint.")
        return 0

    all_issues: List[LintIssue] = []
    for fn in files:
        all_issues.extend(lint_file(os.path.join(root, fn)))

    if not all_issues:
        print(f"OK: {len(files)} localized files checked, no integrity issues found.")
        return 0

    print(f"FAIL: {len(all_issues)} issue(s) found across localized files.")
    for issue in all_issues:
        print(f"- {issue.file}:{issue.line} [{issue.kind}] {issue.detail}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
