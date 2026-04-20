"""Selenium test for meta-analysis-methods-course.html"""
import time, json, sys, os, traceback, io
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    ElementClickInterceptedException,
    ElementNotInteractableException,
    NoSuchElementException,
    JavascriptException,
)

FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "meta-analysis-methods-course.html")
URL = "file:///" + FILE.replace("\\", "/").replace(" ", "%20")


def configure_stdout_utf8():
    """Best-effort UTF-8 stdout setup without import-time side effects."""
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        return
    except Exception:
        pass

    buffer = getattr(sys.stdout, "buffer", None)
    if buffer is None:
        return
    try:
        sys.stdout = io.TextIOWrapper(buffer, encoding='utf-8', errors='replace')
    except Exception:
        pass

def get_js_errors(driver):
    """Get console errors from browser."""
    logs = driver.get_log("browser")
    errors = [l for l in logs if l["level"] == "SEVERE"]
    return errors

def safe_click(driver, element):
    """Click element safely, scrolling into view first."""
    try:
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
        time.sleep(0.1)
        element.click()
    except (ElementClickInterceptedException, ElementNotInteractableException):
        driver.execute_script("arguments[0].click();", element)

def run_tests():
    configure_stdout_utf8()
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1400,900")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.set_capability("goog:loggingPrefs", {"browser": "ALL"})

    driver = webdriver.Chrome(options=opts)
    results = {"passed": 0, "failed": 0, "warnings": 0, "details": []}

    def log_pass(msg):
        results["passed"] += 1
        results["details"].append(f"  PASS: {msg}")
        print(f"  PASS: {msg}")

    def log_fail(msg):
        results["failed"] += 1
        results["details"].append(f"  FAIL: {msg}")
        print(f"  FAIL: {msg}")

    def log_warn(msg):
        results["warnings"] += 1
        results["details"].append(f"  WARN: {msg}")
        print(f"  WARN: {msg}")

    def check_errors(context):
        errors = get_js_errors(driver)
        relevant_count = 0
        for e in errors:
            # Skip known non-issues
            msg = e.get("message", "")
            if "favicon" in msg.lower() or "plotly" in msg.lower() or "font" in msg.lower():
                continue
            log_fail(f"JS error at {context}: {msg[:200]}")
            relevant_count += 1
        return relevant_count

    try:
        # ===== TEST 1: Page loads =====
        print("\n=== TEST 1: Page Load ===")
        driver.get(URL)
        time.sleep(2)

        title = driver.title
        if "Meta-Analysis" in title:
            log_pass(f"Page loaded: '{title}'")
        else:
            log_fail(f"Unexpected title: '{title}'")

        # Check for load-time JS errors
        load_errors = check_errors("page load")
        if load_errors == 0:
            log_pass("No JS errors on load")

        # ===== TEST 2: Core elements exist =====
        print("\n=== TEST 2: Core Elements ===")

        for sel, name in [
            (".sidebar", "Sidebar"),
            ("#slideContainer", "Slide container"),
            ("#nextBtn", "Next button"),
            ("#prevBtn", "Previous button"),
            (".module-list", "Module list"),
        ]:
            try:
                el = driver.find_element(By.CSS_SELECTOR, sel)
                if el:
                    log_pass(f"{name} found")
            except NoSuchElementException:
                log_fail(f"{name} NOT found ({sel})")

        # ===== TEST 3: Modules array accessible =====
        print("\n=== TEST 3: JS State ===")

        module_count = driver.execute_script("return typeof modules !== 'undefined' ? modules.length : -1")
        if module_count > 0:
            log_pass(f"modules array: {module_count} modules")
        else:
            log_fail(f"modules array not accessible (returned {module_count})")

        # Check key functions exist
        for fn in ["goToModule", "nextSlide", "prevSlide", "renderSlides",
                    "saveProgress", "loadProgress", "selectQuizOption",
                    "calculateEffect", "generateForest"]:
            exists = driver.execute_script(f"return typeof {fn} === 'function'")
            if exists:
                log_pass(f"Function {fn}() defined")
            else:
                log_fail(f"Function {fn}() NOT defined")

        # ===== TEST 4: Module sidebar rendered =====
        print("\n=== TEST 4: Module Sidebar ===")

        module_items = driver.find_elements(By.CSS_SELECTOR, "[data-module]")
        if len(module_items) == module_count:
            log_pass(f"Sidebar shows all {len(module_items)} modules")
        else:
            log_fail(f"Sidebar shows {len(module_items)} items but {module_count} modules exist")

        # ===== TEST 5: Navigate all modules =====
        print("\n=== TEST 5: Navigate All Modules ===")

        module_ids = driver.execute_script("return modules.map(m => m.id)")
        module_titles = driver.execute_script("return modules.map(m => m.title)")

        for i, mid in enumerate(module_ids):
            mtitle = module_titles[i]
            try:
                driver.execute_script(f"goToModule({mid})")
                time.sleep(0.3)

                # Verify module changed
                current = driver.execute_script("return currentModule")
                if current == mid:
                    log_pass(f"Module {mid}: '{mtitle}' loaded")
                else:
                    log_fail(f"Module {mid}: expected currentModule={mid}, got {current}")

                # Check for errors after module load
                check_errors(f"Module {mid} ({mtitle})")

                # Get slide count for this module
                slide_count = driver.execute_script(f"return modules[{i}].slides.length")

                # Navigate through all slides in this module
                slides_ok = True
                for s in range(slide_count):
                    driver.execute_script(f"currentSlide = {s}; renderSlides();")
                    time.sleep(0.15)

                    actual_slide = driver.execute_script("return currentSlide")
                    if actual_slide != s:
                        log_fail(f"  Module {mid} slide {s}: currentSlide={actual_slide}")
                        slides_ok = False
                        break

                    # Check for errors on each slide
                    errs = get_js_errors(driver)
                    for e in errs:
                        msg = e.get("message", "")
                        if "favicon" not in msg.lower() and "plotly" not in msg.lower() and "font" not in msg.lower():
                            log_fail(f"  Module {mid} slide {s}: JS error: {msg[:150]}")
                            slides_ok = False

                if slides_ok:
                    log_pass(f"  All {slide_count} slides navigated OK")

            except Exception as e:
                log_fail(f"Module {mid} ({mtitle}): {str(e)[:200]}")

        # ===== TEST 6: Next/Prev buttons =====
        print("\n=== TEST 6: Next/Prev Buttons ===")

        driver.execute_script("goToModule(0); currentSlide = 0; renderSlides();")
        time.sleep(0.3)

        # Click next a few times
        next_btn = driver.find_element(By.ID, "nextBtn")
        for i in range(3):
            safe_click(driver, next_btn)
            time.sleep(0.2)

        slide_after = driver.execute_script("return currentSlide")
        if slide_after == 3:
            log_pass(f"Next button works (3 clicks -> slide {slide_after})")
        elif slide_after > 0:
            log_pass(f"Next button works (3 clicks -> slide {slide_after}, may have auto-advanced)")
        else:
            log_fail(f"Next button broken (3 clicks -> still slide {slide_after})")

        # Click prev
        prev_btn = driver.find_element(By.ID, "prevBtn")
        safe_click(driver, prev_btn)
        time.sleep(0.2)
        slide_after_prev = driver.execute_script("return currentSlide")
        if slide_after_prev < slide_after:
            log_pass(f"Prev button works (slide {slide_after} -> {slide_after_prev})")
        else:
            log_fail(f"Prev button may not work (was {slide_after}, now {slide_after_prev})")

        # ===== TEST 7: Keyboard navigation =====
        print("\n=== TEST 7: Keyboard Navigation ===")

        driver.execute_script("goToModule(0); currentSlide = 0; renderSlides();")
        time.sleep(0.3)

        body = driver.find_element(By.TAG_NAME, "body")
        body.send_keys(Keys.ARROW_RIGHT)
        time.sleep(0.3)
        slide_key = driver.execute_script("return currentSlide")
        if slide_key == 1:
            log_pass("Arrow right advances slide")
        else:
            log_warn(f"Arrow right: slide={slide_key} (expected 1)")

        body.send_keys(Keys.ARROW_LEFT)
        time.sleep(0.3)
        slide_key2 = driver.execute_script("return currentSlide")
        if slide_key2 == 0:
            log_pass("Arrow left goes back")
        else:
            log_warn(f"Arrow left: slide={slide_key2} (expected 0)")

        # ===== TEST 8: Quiz interaction =====
        print("\n=== TEST 8: Quiz Interaction ===")

        # Find a module with a quiz
        quiz_found = False
        for i, mid in enumerate(module_ids):
            has_quiz = driver.execute_script(f"""
                var m = modules[{i}];
                for (var s = 0; s < m.slides.length; s++) {{
                    if (m.slides[s].type === 'quiz') return s;
                }}
                return -1;
            """)
            if has_quiz >= 0:
                driver.execute_script(f"goToModule({mid}); currentSlide = {has_quiz}; renderSlides();")
                time.sleep(0.5)

                quiz_options = driver.find_elements(By.CSS_SELECTOR, ".quiz-option")
                visible_options = [opt for opt in quiz_options if opt.is_displayed() and opt.is_enabled()]
                if len(visible_options) > 0:
                    log_pass(f"Quiz found in Module {mid} slide {has_quiz}: {len(visible_options)} visible options")
                    safe_click(driver, visible_options[0])
                    time.sleep(0.3)

                    # Check feedback appeared
                    feedbacks = driver.find_elements(By.CSS_SELECTOR, ".quiz-feedback:not([style*='display: none']), .quiz-feedback.show, [id*='feedback']:not([style*='display: none'])")
                    selected = driver.find_elements(By.CSS_SELECTOR, ".quiz-option.selected, .quiz-option.correct, .quiz-option.incorrect")
                    if len(selected) > 0 or len(feedbacks) > 0:
                        log_pass("Quiz option selection works (visual feedback shown)")
                    else:
                        log_warn("Quiz option clicked but no visual feedback detected")

                    check_errors(f"quiz interaction Module {mid}")
                    quiz_found = True
                    break
                elif len(quiz_options) > 0:
                    log_warn(f"Module {mid} quiz slide {has_quiz} has options but none are interactable")
                else:
                    log_warn(f"Module {mid} quiz slide {has_quiz} has no .quiz-option elements")

        if not quiz_found:
            log_warn("No quiz found to test")

        # ===== TEST 9: Decision tree =====
        print("\n=== TEST 9: Decision Tree ===")

        dt_found = False
        for i, mid in enumerate(module_ids):
            has_dt = driver.execute_script(f"""
                var m = modules[{i}];
                for (var s = 0; s < m.slides.length; s++) {{
                    if (m.slides[s].type === 'decision-tree') return s;
                }}
                return -1;
            """)
            if has_dt >= 0:
                driver.execute_script(f"goToModule({mid}); currentSlide = {has_dt}; renderSlides();")
                time.sleep(0.5)

                branches = driver.find_elements(By.CSS_SELECTOR, ".decision-branch, .tree-branch, [onclick*='selectDecisionBranch']")
                if len(branches) > 0:
                    log_pass(f"Decision tree in Module {mid} slide {has_dt}: {len(branches)} branches")
                    safe_click(driver, branches[0])
                    time.sleep(0.3)
                    check_errors(f"decision tree Module {mid}")
                    dt_found = True
                    break
                else:
                    log_warn(f"Module {mid} decision-tree slide {has_dt} has no branch elements")

        if not dt_found:
            log_warn("No decision tree found to test")

        # ===== TEST 10: Tool library =====
        print("\n=== TEST 10: Tool Library ===")

        try:
            driver.execute_script("openToolLibrary()")
            time.sleep(0.5)

            modal = driver.find_element(By.ID, "toolLibraryModal")
            if modal.is_displayed():
                log_pass("Tool library modal opens")

                tool_items = driver.find_elements(By.CSS_SELECTOR, "#toolLibraryModal .tool-item, #toolLibraryModal .tool-card, #toolLibraryModal [onclick*='goToTool']")
                if len(tool_items) > 0:
                    log_pass(f"Tool library has {len(tool_items)} tools")
                else:
                    log_warn("Tool library is empty or uses different selectors")

                driver.execute_script("closeToolLibrary()")
                time.sleep(0.3)
            else:
                log_fail("Tool library modal not visible")

            check_errors("tool library")
        except Exception as e:
            log_fail(f"Tool library: {str(e)[:150]}")

        # ===== TEST 11: Interactive tools =====
        print("\n=== TEST 11: Interactive Tools ===")

        tool_functions = [
            ("generatePICO", "PICO Builder"),
            ("calculateEffect", "Effect Calculator"),
            ("generateForest", "Forest Plot"),
            ("calculateHeterogeneity", "Heterogeneity Explorer"),
            ("generateFunnel", "Funnel Plot"),
            ("calculateGRADE", "GRADE Assessment"),
        ]

        for fn, name in tool_functions:
            # Find the module with this tool
            for i, mid in enumerate(module_ids):
                has_tool = driver.execute_script(f"""
                    var m = modules[{i}];
                    for (var s = 0; s < m.slides.length; s++) {{
                        if (m.slides[s].type === 'tool') return s;
                    }}
                    return -1;
                """)
                if has_tool >= 0:
                    # Just verify the function exists and is callable
                    exists = driver.execute_script(f"return typeof {fn} === 'function'")
                    if exists:
                        break

            exists = driver.execute_script(f"return typeof {fn} === 'function'")
            if exists:
                log_pass(f"{name} ({fn}) is defined")
            else:
                log_fail(f"{name} ({fn}) is NOT defined")

        # ===== TEST 12: Glossary =====
        print("\n=== TEST 12: Glossary ===")

        try:
            has_glossary = driver.execute_script("return typeof openGlossary === 'function'")
            if has_glossary:
                driver.execute_script("openGlossary()")
                time.sleep(0.5)
                log_pass("Glossary function exists and executes")

                # Try to close it
                try:
                    driver.execute_script("if (typeof closeGlossary === 'function') closeGlossary(); else document.querySelector('.modal-overlay, .glossary-modal, #glossaryModal').style.display = 'none';")
                    time.sleep(0.3)
                except Exception:
                    pass

                check_errors("glossary")
            else:
                log_warn("openGlossary function not found")
        except Exception as e:
            log_fail(f"Glossary: {str(e)[:150]}")

        # ===== TEST 13: Progress/Dashboard =====
        print("\n=== TEST 13: Dashboard ===")

        try:
            has_dashboard = driver.execute_script("return typeof openDashboard === 'function'")
            if has_dashboard:
                driver.execute_script("openDashboard()")
                time.sleep(0.5)
                log_pass("Dashboard opens")

                driver.execute_script("if (typeof closeDashboard === 'function') closeDashboard();")
                time.sleep(0.3)
                check_errors("dashboard")
            else:
                log_warn("openDashboard function not found")
        except Exception as e:
            log_fail(f"Dashboard: {str(e)[:150]}")

        # ===== TEST 14: Save/Load Progress =====
        print("\n=== TEST 14: Save/Load Progress ===")

        try:
            driver.execute_script("goToModule(3); currentSlide = 2; saveProgress();")
            time.sleep(0.3)

            # Check localStorage
            saved = driver.execute_script("return localStorage.getItem('metaAnalysisMethodsProgress') || localStorage.getItem('courseProgress') || 'NOT_FOUND'")
            if saved != "NOT_FOUND":
                log_pass(f"Progress saved to localStorage ({len(saved)} chars)")
            else:
                # Try other possible keys
                all_keys = driver.execute_script("return Object.keys(localStorage)")
                course_keys = [k for k in all_keys if 'meta' in k.lower() or 'course' in k.lower() or 'progress' in k.lower()]
                if course_keys:
                    log_pass(f"Progress saved (keys: {course_keys})")
                else:
                    log_warn(f"Cannot find progress in localStorage (keys: {all_keys[:10]})")

            check_errors("save/load progress")
        except Exception as e:
            log_fail(f"Save/Load: {str(e)[:150]}")

        # ===== TEST 15: Certificate =====
        print("\n=== TEST 15: Certificate ===")

        try:
            has_cert = driver.execute_script("return typeof downloadCertificate === 'function'")
            if has_cert:
                log_pass("downloadCertificate() function defined")
                # Don't actually call it (opens new window)
            else:
                log_fail("downloadCertificate() NOT defined")

            has_close = driver.execute_script("return typeof closeCertificate === 'function'")
            if has_close:
                log_pass("closeCertificate() function defined")
            else:
                log_warn("closeCertificate() not found")
        except Exception as e:
            log_fail(f"Certificate: {str(e)[:150]}")

        # ===== TEST 16: Gamification state =====
        print("\n=== TEST 16: Gamification ===")

        try:
            game_state = driver.execute_script("return typeof gameState !== 'undefined' ? JSON.stringify(Object.keys(gameState)) : 'NOT_FOUND'")
            if game_state != "NOT_FOUND":
                keys = json.loads(game_state)
                log_pass(f"gameState exists with keys: {keys}")
            else:
                log_warn("gameState not found")
        except Exception as e:
            log_warn(f"Gamification: {str(e)[:100]}")

        # ===== TEST 17: Final error sweep =====
        print("\n=== TEST 17: Final Error Sweep ===")

        # Navigate through all modules one more time quickly
        all_errors = []
        for i, mid in enumerate(module_ids):
            driver.execute_script(f"goToModule({mid})")
            time.sleep(0.15)
            errs = get_js_errors(driver)
            for e in errs:
                msg = e.get("message", "")
                if "favicon" not in msg.lower() and "plotly" not in msg.lower() and "font" not in msg.lower():
                    all_errors.append(f"Module {mid}: {msg[:150]}")

        if len(all_errors) == 0:
            log_pass("No JS errors across all modules in final sweep")
        else:
            for err in all_errors:
                log_fail(f"Error: {err}")

    except Exception as e:
        log_fail(f"FATAL: {traceback.format_exc()}")
    finally:
        driver.quit()

    # ===== SUMMARY =====
    print("\n" + "=" * 60)
    print(f"RESULTS: {results['passed']} passed, {results['failed']} failed, {results['warnings']} warnings")
    print("=" * 60)

    if results["failed"] > 0:
        print("\nFAILURES:")
        for d in results["details"]:
            if "FAIL" in d:
                print(d)

    if results["warnings"] > 0:
        print("\nWARNINGS:")
        for d in results["details"]:
            if "WARN" in d:
                print(d)

    return results["failed"]

if __name__ == "__main__":
    sys.exit(run_tests())
