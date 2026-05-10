from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
from urllib.request import urlopen

import pytest


REPO_ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(REPO_ROOT), **kwargs)

    def log_message(self, format, *args):
        pass


@pytest.fixture(scope="module")
def base_url():
    for port in (8000, 0):
        try:
            server = ThreadingHTTPServer(("127.0.0.1", port), QuietHandler)
            break
        except OSError:
            continue
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_address[1]}"
    finally:
        server.shutdown()
        server.server_close()


def _fetch_text(url: str) -> str:
    with urlopen(url, timeout=30) as response:
        return response.read().decode("utf-8", errors="ignore")


def test_main_course_page_loads(base_url):
    text = _fetch_text(f"{base_url}/meta-analysis-methods-course.html")
    assert "Meta-Analysis Methods: From Question to Conclusion" in text
    assert text.count("<button") > 10 or text.count("id=\"btn") > 5


def test_localized_variant_loads(base_url):
    text = _fetch_text(f"{base_url}/advanced-meta-analysis-course-fr.html")
    assert "<title>" in text
    assert text.count("<section") > 5 or text.count("<div") > 20
