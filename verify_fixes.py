"""Verify all review fixes were applied correctly."""
import io, os, sys, glob, re
try:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
except Exception:
    pass

os.chdir(os.path.dirname(os.path.abspath(__file__)))
ar_files = sorted(f for f in os.listdir(".") if f.endswith("-ar.html"))

print("=== CHECK 1: lang/dir attributes ===")
correct = 0
for fn in ar_files:
    with open(fn, "r", encoding="utf-8", errors="replace") as f:
        head = f.read(500)
    if 'lang="ar"' in head and 'dir="rtl"' in head:
        correct += 1
    else:
        print(f"  WRONG: {fn}")
print(f"  Correct: {correct}/{len(ar_files)}")

print("\n=== CHECK 2: CSS selector in index-ar.html ===")
with open("index-ar.html", "r", encoding="utf-8") as f:
    idx = f.read()
good = ".course-card:not(.card-hidden)" in idx
bad = "\u0628\u0637\u0627\u0642\u0629" in idx  # بطاقة
print(f"  Correct selector: {'YES' if good else 'NO'}")
print(f"  Arabic selector gone: {'YES' if not bad else 'NO'}")

print("\n=== CHECK 3: Zero-width spaces (U+200B) ===")
total_zwsp = 0
for fn in ar_files:
    with open(fn, "r", encoding="utf-8") as f:
        total_zwsp += f.read().count("\u200b")
print(f"  Total remaining: {total_zwsp}")

print("\n=== CHECK 4: Course Library links ===")
wrong_links = []
for fn in ar_files:
    if fn == "index-ar.html":
        continue
    with open(fn, "r", encoding="utf-8") as f:
        content = f.read()
    if 'href="index.html"' in content:
        wrong_links.append(fn)
print(f"  Files still pointing to index.html: {len(wrong_links)}")
if wrong_links:
    for f in wrong_links[:5]:
        print(f"    - {f}")

print("\n=== CHECK 5: errors='ignore' in Python scripts ===")
has_ignore = []
_bad_pattern = 'errors="igno' + 're"'
for py in sorted(glob.glob("*.py")):
    with open(py, "r", encoding="utf-8") as f:
        if _bad_pattern in f.read():
            has_ignore.append(py)
if has_ignore:
    for f in has_ignore:
        print(f"  STILL HAS: {f}")
else:
    print("  All fixed (0 files with errors='ignore')")

print("\n=== CHECK 6: Wildcard import in test script ===")
with open("test_methods_course.py", "r", encoding="utf-8") as f:
    tc = f.read()
if "from selenium.common.exceptions import *" in tc:
    print("  STILL HAS wildcard import")
else:
    print("  Fixed (explicit imports)")

print("\n=== CHECK 7: NavigableString in replace_with ===")
for py in ["complete_arabic_translations.py", "complete_existing_course_translations.py",
           "batch_translate_visible_nodes.py", "sync_translate_from_source.py"]:
    with open(py, "r", encoding="utf-8") as f:
        content = f.read()
    has_safe = "NavigableString(" in content and "replace_with" in content
    has_unsafe = re.search(r"replace_with\([^N]", content)
    print(f"  {py}: {'SAFE' if has_safe else 'UNSAFE'}")

print("\n=== CHECK 8: Hardcoded path in audit_arabic_gaps.py ===")
with open("audit_arabic_gaps.py", "r", encoding="utf-8") as f:
    ag = f.read()
if r"C:\Users" in ag:
    print("  STILL hardcoded")
else:
    print("  Fixed (uses __file__)")

print("\n=== CHECK 9: JS string translation coverage ===")
# Check a few key files for remaining English in JS
for fn in ["synthesis-course-ar.html", "rapid-reviews-course-ar.html", "becoming-methodologist-ar.html"]:
    with open(fn, "r", encoding="utf-8") as f:
        content = f.read()
    # Count English "Correct!" in script blocks
    correct_en = len(re.findall(r'"Correct!', content))
    yes_labels = len(re.findall(r'>YES<', content))
    no_labels = len(re.findall(r'>NO<', content))
    print(f"  {fn}: 'Correct!' in JS={correct_en}, YES labels={yes_labels}, NO labels={no_labels}")

print("\n=== SUMMARY ===")
issues = []
if correct < len(ar_files):
    issues.append(f"lang/dir: {len(ar_files)-correct} files wrong")
if not good:
    issues.append("CSS selector not fixed")
if total_zwsp > 0:
    issues.append(f"{total_zwsp} ZWSP remaining")
if wrong_links:
    issues.append(f"{len(wrong_links)} wrong Course Library links")
if has_ignore:
    issues.append(f"{len(has_ignore)} scripts with errors='ignore'")
if issues:
    print(f"REMAINING ISSUES: {len(issues)}")
    for i in issues:
        print(f"  - {i}")
else:
    print("ALL CHECKS PASSED")
