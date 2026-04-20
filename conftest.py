"""Pytest config for Fatiha-course-github-v2.

test_methods_course.py is a Selenium E2E suite for the
meta-analysis-methods-course.html page. Skip collection unless
RUN_BROWSER_TESTS=1.

To run manually:
    $Env:RUN_BROWSER_TESTS = "1"
    python -m pytest test_methods_course.py -v
"""
import os

if not os.environ.get("RUN_BROWSER_TESTS"):
    collect_ignore_glob = ["test_methods_course.py"]
