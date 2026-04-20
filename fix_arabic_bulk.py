"""Bulk fix script for Arabic HTML course files.

Fixes:
1. P0-A: <html lang="en"> -> <html lang="ar" dir="rtl"> (26 files)
2. P0-B: Translated CSS selector in index-ar.html
3. P1-I: Strip U+200B zero-width spaces
4. P1-H: Course Library links -> index-ar.html
5. P1-A/B/C/D/E: CSS RTL fixes (border, text-align, padding/margin, arrows, translateX)

Usage:
  python fix_arabic_bulk.py --dry-run
  python fix_arabic_bulk.py
"""

from __future__ import annotations

import io
import os
import re
import sys

try:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = os.path.dirname(os.path.abspath(__file__))


def get_ar_files():
    return sorted(f for f in os.listdir(ROOT) if f.endswith("-ar.html"))


def fix_file(path: str, dry_run: bool) -> dict:
    """Apply all fixes to a single file. Returns fix counts."""
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()

    original = content
    fixes = {}
    fn = os.path.basename(path)

    # === FIX 1: lang="ar" dir="rtl" ===
    # Match <html lang="en"> or <html lang="en" ...> without dir
    if '<html lang="en">' in content:
        content = content.replace('<html lang="en">', '<html lang="ar" dir="rtl">', 1)
        fixes["lang_dir"] = 1
    elif '<html lang="en" ' in content:
        # Handle cases like <html lang="en" class="...">
        content = re.sub(
            r'<html lang="en"',
            '<html lang="ar" dir="rtl"',
            content,
            count=1
        )
        fixes["lang_dir"] = 1

    # === FIX 2: Translated CSS selector (index-ar.html only) ===
    if fn == "index-ar.html":
        bad_selector = ".بطاقة الدورة: ليست (.البطاقة مخفية)"
        good_selector = ".course-card:not(.card-hidden)"
        if bad_selector in content:
            content = content.replace(bad_selector, good_selector)
            fixes["css_selector"] = 1

    # === FIX 3: Strip U+200B zero-width spaces ===
    zwsp_count = content.count("\u200b")
    if zwsp_count > 0:
        content = content.replace("\u200b", "")
        fixes["zwsp_stripped"] = zwsp_count

    # === FIX 4: Course Library link -> index-ar.html ===
    # Pattern: href="index.html" in navigation/back links
    # Be careful: only replace in navigation contexts, not in language switcher
    # The language switcher has links like index-de.html, index-es.html etc.
    # The Course Library back-link is typically: href="index.html" with text like
    # "مكتبة الدورات" or "Course Library" or a home icon

    # Strategy: replace href="index.html" but NOT when it's part of a language
    # switcher (which has lang="en" or similar nearby). We'll target the specific
    # pattern used for back-links: standalone href="index.html" not followed by
    # lang= attribute on the same element.
    # Most reliable: replace all href="index.html" with href="index-ar.html"
    # EXCEPT in the language switcher which uses a different pattern.

    # In index-ar.html: the EN link in language switcher should stay as index.html
    # In course files: the only href="index.html" is the Course Library back-link
    if fn != "index-ar.html":
        # Course files: replace all occurrences
        idx_count = content.count('href="index.html"')
        if idx_count > 0:
            content = content.replace('href="index.html"', 'href="index-ar.html"')
            fixes["library_link"] = idx_count

    # === FIX 5: CSS RTL fixes ===
    # These need to be applied carefully - only in <style> blocks and inline styles,
    # NOT in JavaScript code that might reference CSS properties programmatically.

    rtl_fixes = 0

    # 5a: Fix text-align: left -> text-align: right in CSS style blocks
    # Match inside <style> tags
    def fix_style_block(match):
        nonlocal rtl_fixes
        style = match.group(0)
        orig = style

        # text-align: left -> text-align: right
        style = re.sub(r'text-align:\s*left', 'text-align: right', style)

        # border-left for decorative accents -> border-right
        # Pattern: border-left: Npx solid color (decorative, not layout)
        style = re.sub(r'border-left:\s*(\d+px\s+solid)', r'border-right: \1', style)
        # border-left-color -> border-right-color
        style = re.sub(r'border-left-color:', 'border-right-color:', style)
        # border-left: 3px solid transparent -> border-right: 3px solid transparent
        style = re.sub(r'border-left:\s*(3px\s+solid\s+transparent)', r'border-right: \1', style)

        # padding-left -> padding-right (for indentation)
        style = re.sub(r'padding-left:', 'padding-right:', style)

        # margin-left: auto -> margin-right: auto (for flex alignment)
        style = re.sub(r'margin-left:\s*auto', 'margin-right: auto', style)

        # Sidebar border-right (divider) -> border-left
        # The sidebar in LTR has border-right as divider; in RTL it should be border-left
        if '.sidebar' in style and 'border-right:' in style:
            # Only for sidebar-specific border-right declarations (the divider)
            style = re.sub(
                r'(\.sidebar\s*\{[^}]*?)border-right:',
                r'\1border-left:',
                style
            )

        # Mobile menu toggle: left -> right
        if 'mobile-menu' in style and 'left:' in style:
            style = re.sub(r'left:\s*12px', 'right: 12px', style)

        # translateX(-100%) for sidebar -> translateX(100%)
        if 'sidebar' in style.lower() and 'translateX(-100%)' in style:
            style = style.replace('translateX(-100%)', 'translateX(100%)')

        # Hover translateX(4px) -> translateX(-4px) for RTL
        style = re.sub(r'translateX\(4px\)', 'translateX(-4px)', style)

        if style != orig:
            rtl_fixes += 1
        return style

    content = re.sub(r'<style\b[^>]*>.*?</style>', fix_style_block, content, flags=re.DOTALL | re.IGNORECASE)

    # 5b: Fix inline styles
    def fix_inline_style(match):
        nonlocal rtl_fixes
        full = match.group(0)
        orig = full

        full = re.sub(r'text-align:\s*left', 'text-align: right', full)
        full = re.sub(r'padding-left:', 'padding-right:', full)
        full = re.sub(r'margin-left:\s*(\d)', r'margin-right: \1', full)
        full = re.sub(r'margin-left:\s*auto', 'margin-right: auto', full)
        full = re.sub(r'border-left:', 'border-right:', full)

        if full != orig:
            rtl_fixes += 1
        return full

    content = re.sub(r'style="[^"]*"', fix_inline_style, content)

    # 5c: Fix ArrowRight/ArrowLeft swap in JavaScript
    # We need to swap them: ArrowRight -> prevSlide, ArrowLeft -> nextSlide
    # The typical pattern is:
    #   case 'ArrowRight': nextSlide(); break;
    #   case 'ArrowLeft': prevSlide(); break;
    # We want:
    #   case 'ArrowRight': prevSlide(); break;
    #   case 'ArrowLeft': nextSlide(); break;
    # Or the if/else pattern

    # Strategy: use a two-pass swap with temporary placeholder
    arrow_swaps = 0

    # Pattern 1: case 'ArrowRight': nextSlide / case 'ArrowLeft': prevSlide
    if "ArrowRight" in content and "nextSlide" in content:
        # Check if ArrowRight is currently mapped to nextSlide (LTR default)
        if re.search(r"'ArrowRight'.*?nextSlide|ArrowRight.*?nextSlide", content):
            content = content.replace("'ArrowRight'", "'__ARROW_TEMP_R__'")
            content = content.replace("'ArrowLeft'", "'ArrowRight'")
            content = content.replace("'__ARROW_TEMP_R__'", "'ArrowLeft'")
            arrow_swaps += 1

    # Pattern 2: e.key === 'ArrowRight' with nextSlide in if blocks
    # Already handled by the string swap above

    if arrow_swaps:
        fixes["arrow_swap"] = arrow_swaps

    # 5d: Fix skip-link positioning
    content = re.sub(
        r'(<a[^>]*class="skip-link"[^>]*style="[^"]*?)left:\s*0',
        r'\1right: 0',
        content
    )

    if rtl_fixes:
        fixes["rtl_css"] = rtl_fixes

    # Write if changed
    if content != original:
        if not dry_run:
            with open(path, "w", encoding="utf-8", newline="\n") as f:
                f.write(content)
        return fixes

    return fixes


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    ar_files = get_ar_files()
    print(f"Processing {len(ar_files)} Arabic files...")

    total_fixes = {}
    files_changed = 0

    for fn in ar_files:
        path = os.path.join(ROOT, fn)
        fixes = fix_file(path, args.dry_run)
        if fixes:
            files_changed += 1
            print(f"  [{fn}] {fixes}")
            for k, v in fixes.items():
                total_fixes[k] = total_fixes.get(k, 0) + v

    print(f"\n{'='*60}")
    print(f"Files changed: {files_changed}/{len(ar_files)}")
    print(f"Fix summary: {total_fixes}")
    if args.dry_run:
        print("DRY RUN - no files modified")


if __name__ == "__main__":
    main()
