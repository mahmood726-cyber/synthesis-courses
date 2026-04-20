"""Live HTTP smoke test for all course files deployed on GitHub Pages.

Checks every HTML file from the repo returns 200 on the live URL AND has a
non-empty <title>. Not a browser test — just network + minimal HTML parsing.
Runs concurrently via ThreadPoolExecutor.

Pass criterion: all files return 200 with a <title>.
Failure modes surfaced: 404 (missing file), 5xx (Pages build glitch),
empty title (likely corrupted upload).
"""
from __future__ import annotations

import concurrent.futures as cf
import io
import os
import re
import sys
import urllib.request

BASE = "https://mahmood726-cyber.github.io/synthesis-courses/"
TITLE_RE = re.compile(r"<title>([^<]*)</title>", re.IGNORECASE)


def setup_utf8_stdout() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        buf = getattr(sys.stdout, "buffer", None)
        if buf is not None:
            sys.stdout = io.TextIOWrapper(buf, encoding="utf-8", errors="replace")


def check(url: str) -> tuple[str, int, str]:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "smoke/1.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            status = r.status
            body = r.read(4096).decode("utf-8", errors="replace")
        m = TITLE_RE.search(body)
        title = (m.group(1).strip() if m else "")
        return (url, status, title)
    except Exception as e:
        return (url, 0, f"ERROR: {type(e).__name__}: {e}")


def main() -> int:
    setup_utf8_stdout()
    here = os.path.dirname(os.path.abspath(__file__))
    files = sorted(f for f in os.listdir(here) if f.endswith(".html"))
    print(f"Testing {len(files)} HTML files on {BASE}")

    urls = [BASE + f for f in files]
    fails: list[tuple[str, int, str]] = []
    ok = 0

    with cf.ThreadPoolExecutor(max_workers=16) as pool:
        for (url, status, title) in pool.map(check, urls):
            if status == 200 and title:
                ok += 1
            else:
                fails.append((url, status, title))

    print(f"PASS: {ok}/{len(files)}")
    if fails:
        print(f"FAIL: {len(fails)}")
        for url, status, title in fails[:20]:
            print(f"  [{status}] {url}  {title[:80]}")
        return 1
    print("All live URLs OK (HTTP 200 + <title> present)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
