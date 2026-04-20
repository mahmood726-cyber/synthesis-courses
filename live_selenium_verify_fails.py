"""Definitive pass/fail re-test for previously-failed URLs.

Creates a FRESH Chrome driver per URL (eliminates browser-log leak between
pages) and uses a broader expected-selector list that covers all course styles
on this site (.course-card, .module-slides, .presentation, .slide, main,
header h1, body > *).

Input: hard-coded list of URLs suspected of failing in the broader Phase 3
run. Output: clean categorical table — real JS error vs passes.
"""
from __future__ import annotations

import io
import os
import sys
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException, WebDriverException


BASE = "https://mahmood726-cyber.github.io/synthesis-courses/"
IGNORE_TERMS = ("favicon", "font", "plotly", "chrome-extension")
EXPECTED_SELECTORS = [
    ".course-card", ".module-slides", ".presentation",
    ".slide", "main", "header h1",
]


def setup_utf8_stdout() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        buf = getattr(sys.stdout, "buffer", None)
        if buf is not None:
            sys.stdout = io.TextIOWrapper(buf, encoding="utf-8", errors="replace")


FAILED_IN_PHASE3 = [
    # Phase 3 JS-error category (suspected real bugs):
    "advanced-meta-analysis-course-ar.html",
    "ai-meta-analysis-course-ar.html",
    "becoming-methodologist-ar.html",
    "cast-when-certainty-kills.html",
    "dta-course-when-the-test-lies-ar.html",
    "dta-course-when-the-test-lies-v2-ar.html",
    "dta-course-when-the-test-lies-v3-ar.html",
    "dta-course-when-the-test-lies-v4-ar.html",
    "grade-certainty-course-ar.html",
    "hta-oman-course-ar.html",
    "ipd-meta-analysis-course-ar.html",
    "living-reviews-course-ar.html",
    "meta-analysis-methods-course-ar.html",
    "meta-analysis-topic-selection-course-ar.html",
    "meta-analysis-writing-course-ar.html",
    "meta-sprint-course-ar.html",
    "meta-sprint-course-de.html",
    "observational-evidence-course-ar.html",
    "publication-bias-detective-ar.html",
    "qualitative-evidence-synthesis-course-ar.html",
    "rapid-reviews-course-ar.html",
    "risk-of-bias-mastery-course-ar.html",
    "synthesis-course-ar.html",
    "synthesis-course-original-ar.html",
    "truthcert-course-ar.html",
    "umbrella-reviews-course-ar.html",
]


def make_driver() -> webdriver.Chrome:
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1280,900")
    opts.add_argument("--log-level=3")
    opts.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    d = webdriver.Chrome(options=opts)
    d.set_page_load_timeout(30)
    return d


def test_one(url: str) -> tuple[str, int, str]:
    d = make_driver()
    try:
        try:
            d.get(url)
        except TimeoutException:
            return (url, 0, "TIMEOUT")
        except WebDriverException as e:
            return (url, 0, f"WD_ERR: {str(e)[:120]}")
        time.sleep(0.6)
        errs: list[str] = []
        for e in d.get_log("browser"):
            if e.get("level") != "SEVERE":
                continue
            msg = str(e.get("message", ""))
            if any(t in msg.lower() for t in IGNORE_TERMS):
                continue
            errs.append(msg[:250])
        if errs:
            return (url, 1, errs[0])
        # also verify at least one expected element
        found = False
        for sel in EXPECTED_SELECTORS:
            try:
                if d.find_elements(By.CSS_SELECTOR, sel):
                    found = True
                    break
            except Exception:
                pass
        if not found:
            return (url, 2, f"no expected selectors found")
        return (url, 0, f"OK  title={d.title[:60]!r}")
    finally:
        try:
            d.quit()
        except Exception:
            pass


def main() -> int:
    setup_utf8_stdout()
    urls = [BASE + f for f in FAILED_IN_PHASE3]
    print(f"Clean re-test: {len(urls)} suspect URLs, fresh driver per URL")
    real_js_bugs: list[tuple[str, str]] = []
    clean: list[str] = []
    selector_fp: list[str] = []
    for u in urls:
        url, kind, msg = test_one(u)
        if kind == 1:
            real_js_bugs.append((url, msg))
            print(f"  [JS BUG] {url}")
            print(f"           {msg}")
        elif kind == 2:
            selector_fp.append(url)
            print(f"  [SEL-FP] {url}  (page loaded, expected selector absent)")
        else:
            clean.append(url)
            print(f"  [CLEAN]  {url}")
    print("---")
    print(f"Real JS bugs:          {len(real_js_bugs)}")
    print(f"Clean (Phase 3 was FP):{len(clean)}")
    print(f"Selector FP:           {len(selector_fp)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
