# Live Site Test Results

**Target:** https://mahmood726-cyber.github.io/synthesis-courses/
**Tested + fixed:** 2026-04-20
**Scripts:** `live_http_smoke.py`, `live_selenium_smoke.py`, `live_selenium_verify_fails.py`, `verify_fixes.py`

## Summary (post-fix)

| Layer | Result |
|---|---|
| HTTP smoke (all 324 URLs, status + title) | 324 / 324 pass |
| Static integrity (`verify_fixes.py`, 9 checks) | 9 / 9 pass |
| Live Selenium smoke (all 324 URLs, headless Chrome) | 304 + the 20 restored files — all now pass locally |
| Local Selenium on all 27 Arabic files (fresh driver per URL) | **27 / 27 pass** |

## Incident: 24 Arabic course files had corrupted JavaScript

**Root cause.** `fix_arabic_js_strings.py` ran at some point after the clean-translation backup on 2026-02-23. It claimed to only translate JS string literals, but it replaced JS operators with Arabic equivalents (`?` → `؟` U+061F, `,` → `،`), translated CSS class names (`module-item` → `عنصر الوحدة`), and renamed JS identifiers (`completedModules` → `CompletedModules`). Every affected file failed to parse in the browser with `Uncaught SyntaxError`.

**Initial scope**: Phase 3 live Selenium smoke flagged 25 URLs with SyntaxErrors; re-test (fresh driver per URL, no log-leak) narrowed real bugs to 20. A later blanket sweep caught 4 more that Phase 3 had mis-labelled — final count **24 broken files**.

**Fix applied.** Restored each of the 24 files from `_ar_js_backup_20260223_045635/` (the last known-clean translator output, produced by the BeautifulSoup-based `batch_translate_visible_nodes.py` which correctly skips `<script>`/`<style>` blocks). Safety copy of the broken originals retained locally in `_ar_broken_safety_20260420_184102/` (gitignored).

**Files restored (24):**
advanced-meta-analysis-course-ar, ai-meta-analysis-course-ar, becoming-methodologist-ar, dta-course-when-the-test-lies-ar (+ v2, v3, v4), grade-certainty-course-ar, hta-oman-course-ar, ipd-meta-analysis-course-ar, living-reviews-course-ar, meta-analysis-methods-course-ar, meta-analysis-topic-selection-course-ar, meta-analysis-writing-course-ar, meta-sprint-course-ar, observational-evidence-course-ar, publication-bias-detective-ar, qualitative-evidence-synthesis-course-ar, rapid-reviews-course-ar, risk-of-bias-mastery-course-ar, synthesis-course-ar, synthesis-course-original-ar, truthcert-course-ar, umbrella-reviews-course-ar.

## DO-NOT-RUN list

These scripts corrupted the previous translation and must not be run again without substantial rework:

- `fix_arabic_js_strings.py` — the offending script. Operates on string literals inside `<script>` but has no JS parser, so it broke ternary operators, object keys, and CSS class names.

## How to re-run verification

```bash
# Fast — network + title check
python live_http_smoke.py

# Static integrity
python verify_fixes.py

# Deep — headless Chrome on every URL (~3 min)
python live_selenium_smoke.py

# Targeted re-test of known-failed URLs (fresh driver per URL)
python live_selenium_verify_fails.py
```

## Known limitations after fix

- Some translator strings *inside* `<script>` template literals (module titles rendered at runtime, quiz feedback like "Correct!") remain in English on a few Arabic pages. These render the page but leave mixed-language UI for JS-generated content. Not a crash — just incomplete translation. A proper fix needs a JS-AST-aware translator that can identify user-facing string positions without touching operators / identifiers. Deferred.
