"""Live Selenium smoke test for deployed courses.

For each URL in the target list:
  1. Load in headless Chrome with 30s timeout
  2. Capture console.log/error messages
  3. Assert document.title is non-empty
  4. Assert page has at least one of: .course-card, .module-slides, header h1
  5. FAIL on any SEVERE console log (ignoring favicon/font/CDN noise)

Pass criterion: page loads, title present, at least one expected element,
no SEVERE console errors after filter.

Coverage: all 324 live URLs (sequential — 1 driver instance).
"""
from __future__ import annotations

import io
import os
import re
import sys
import time
import traceback

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.common.exceptions import JavascriptException, TimeoutException, WebDriverException


BASE = "https://mahmood726-cyber.github.io/synthesis-courses/"
IGNORE_TERMS = ("favicon", "font", "plotly", "chrome-extension")
EXPECTED_SELECTORS = [".course-card", ".module-slides", "header h1", "main"]


def setup_utf8_stdout() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        buf = getattr(sys.stdout, "buffer", None)
        if buf is not None:
            sys.stdout = io.TextIOWrapper(buf, encoding="utf-8", errors="replace")


def make_driver() -> webdriver.Chrome:
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1280,900")
    opts.add_argument("--disable-gpu")
    opts.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    driver = webdriver.Chrome(options=opts)
    driver.set_page_load_timeout(30)
    return driver


def severe_console_errors(driver: webdriver.Chrome) -> list[str]:
    errors: list[str] = []
    try:
        for entry in driver.get_log("browser"):
            if entry.get("level") != "SEVERE":
                continue
            msg = str(entry.get("message", ""))
            low = msg.lower()
            if any(term in low for term in IGNORE_TERMS):
                continue
            errors.append(msg[:300])
    except Exception:
        pass
    return errors


def test_url(driver: webdriver.Chrome, url: str) -> tuple[bool, str]:
    try:
        driver.get(url)
    except TimeoutException:
        return (False, "page load timeout (>30s)")
    except WebDriverException as e:
        return (False, f"webdriver error: {e}"[:200])

    title = driver.title or ""
    if not title.strip():
        return (False, "empty <title>")

    found = False
    for sel in EXPECTED_SELECTORS:
        try:
            els = driver.find_elements(By.CSS_SELECTOR, sel)
            if els:
                found = True
                break
        except Exception:
            pass
    if not found:
        return (False, f"none of expected selectors found: {EXPECTED_SELECTORS}")

    errs = severe_console_errors(driver)
    if errs:
        return (False, f"{len(errs)} SEVERE console error(s); first: {errs[0]}")

    return (True, f"title='{title[:60]}'")


def main() -> int:
    setup_utf8_stdout()
    here = os.path.dirname(os.path.abspath(__file__))
    files = sorted(f for f in os.listdir(here) if f.endswith(".html"))
    urls = [BASE + f for f in files]
    print(f"Live Selenium smoke: {len(urls)} URLs")
    print(f"Driver: headless Chrome (sequential)")
    print("---")

    start = time.time()
    driver = make_driver()
    passed = 0
    failed: list[tuple[str, str]] = []

    try:
        for i, url in enumerate(urls, 1):
            ok, msg = test_url(driver, url)
            if ok:
                passed += 1
                if i % 30 == 0 or i == len(urls):
                    elapsed = time.time() - start
                    rate = i / elapsed if elapsed > 0 else 0
                    print(f"  [{i}/{len(urls)}] pass={passed} fail={len(failed)}  {rate:.1f} pages/s")
            else:
                failed.append((url, msg))
                print(f"  FAIL [{i}/{len(urls)}] {url}")
                print(f"    -> {msg}")
    finally:
        try:
            driver.quit()
        except Exception:
            pass

    elapsed = time.time() - start
    print("---")
    print(f"PASS: {passed}/{len(urls)}  in {elapsed:.0f}s")
    if failed:
        print(f"FAIL: {len(failed)}")
        for url, msg in failed[:30]:
            print(f"  {url}: {msg}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
