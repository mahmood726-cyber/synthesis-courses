# Live Site Test Results

**Target:** https://mahmood726-cyber.github.io/synthesis-courses/
**Tested:** 2026-04-20
**Scripts:** `live_http_smoke.py`, `live_selenium_smoke.py`, `live_selenium_verify_fails.py`, `verify_fixes.py`

## Summary

| Layer | Result |
|---|---|
| HTTP smoke (all 324 URLs, status + title) | 324 / 324 pass |
| Static integrity (`verify_fixes.py`, 9 checks) | 9 / 9 pass |
| Live Selenium smoke (all 324 URLs, headless Chrome) | 276 pass initial → 304 after re-test (fresh driver per URL) |
| **Real JS bugs (live site)** | **20 Arabic course files** |
| Selector-only harness false positives | ~22 (page renders, non-standard markup) |

## 20 Broken Arabic Course Files (SEVERE console errors)

All show `Uncaught SyntaxError` because the translator corrupted the JavaScript inside `<script>` tags — translating CSS class names, variable names, and operators (notably Arabic `؟` U+061F where `?` was needed, Arabic `،` where `,` was needed).

| File | Line:Col | Error |
|---|---|---|
| advanced-meta-analysis-course-ar.html | 1229:15 | Unexpected token ':' |
| ai-meta-analysis-course-ar.html | 2305:76 | Missing } in template expression |
| becoming-methodologist-ar.html | 3026:81 | Missing } in template expression |
| dta-course-when-the-test-lies-ar.html | 2489:76 | Missing } in template expression |
| dta-course-when-the-test-lies-v2-ar.html | 1569:76 | Missing } in template expression |
| dta-course-when-the-test-lies-v3-ar.html | 2805:76 | Missing } in template expression |
| dta-course-when-the-test-lies-v4-ar.html | 2857:76 | Missing } in template expression |
| grade-certainty-course-ar.html | 2784:41 | Missing } in template expression |
| hta-oman-course-ar.html | 2642:81 | Missing } in template expression |
| ipd-meta-analysis-course-ar.html | 3821:81 | Unexpected token ')' |
| living-reviews-course-ar.html | 2021:41 | Missing } in template expression |
| meta-analysis-topic-selection-course-ar.html | 1853:41 | Missing } in template expression |
| meta-analysis-writing-course-ar.html | 3249:76 | Missing } in template expression |
| meta-sprint-course-ar.html | 3456:35 | Missing } in template expression |
| qualitative-evidence-synthesis-course-ar.html | 2817:38 | Missing } in template expression |
| rapid-reviews-course-ar.html | 4136:81 | Missing } in template expression |
| risk-of-bias-mastery-course-ar.html | 1699:41 | Missing } in template expression |
| synthesis-course-ar.html | 12078:82 | Unexpected token '{' |
| truthcert-course-ar.html | 2476:76 | Missing } in template expression |
| umbrella-reviews-course-ar.html | 2160:41 | Missing } in template expression |

## 3 Arabic files that ARE clean

- `meta-analysis-methods-course-ar.html`
- `observational-evidence-course-ar.html`
- `synthesis-course-original-ar.html`

(Likely because these had no JS template literals for the translator to break.)

## How to re-run

```bash
# Fast — network + title check
python live_http_smoke.py

# Static integrity
python verify_fixes.py

# Deep — headless Chrome on every URL (~3 min)
python live_selenium_smoke.py

# Targeted re-test of known-failed URLs with fresh driver per URL
python live_selenium_verify_fails.py
```

## Next actions (not done — testing scope only)

- Fix the 20 Arabic files. Likely options: regenerate with a JS-aware translator, surgically replace Arabic operators/punctuation back to ASCII inside `<script>` blocks, or restore from pre-translation backup.
- Non-Arabic course files (Chinese, Hindi, Japanese, Korean, Russian, etc.) all load without JS errors on this run — the bug is Arabic-specific.
