#!/usr/bin/env python3
"""inject_cards.py — put the shared Study Cards script on every lesson page.

For every aog-deploy/*.html that contains id="cardHost", insert

    <script src="/aog-cards.js" defer></script>

immediately before the LAST </body>, unless the page already loads it.
Idempotent: run it twice and the second run changes nothing.

    python3 _work/cards/inject_cards.py                 # every page
    python3 _work/cards/inject_cards.py a.html b.html   # a subset

Stdlib only. Prints one line per changed file and a count at the end.
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEPLOY = os.path.abspath(os.path.join(HERE, "..", ".."))
TAG = '<script src="/aog-cards.js" defer></script>'
HAS = re.compile(r'<script[^>]*\bsrc\s*=\s*["\']/?aog-cards\.js["\']', re.I)


def targets(argv):
    if argv:
        return [os.path.abspath(p) for p in argv]
    return sorted(
        os.path.join(DEPLOY, f) for f in os.listdir(DEPLOY) if f.lower().endswith(".html")
    )


def inject(path):
    """Returns 'added', 'present', 'skip' (no cardHost) or 'nobody' (no </body>)."""
    with open(path, "r", encoding="utf-8") as fh:
        html = fh.read()
    if 'id="cardHost"' not in html:
        return "skip"
    if HAS.search(html):
        return "present"
    at = html.rfind("</body>")
    if at < 0:
        return "nobody"
    # keep the page's own indentation habit: the tag sits on its own line
    before = html[:at]
    nl = "" if before.endswith("\n") else "\n"
    out = before + nl + TAG + "\n" + html[at:]
    with open(path, "w", encoding="utf-8", newline="") as fh:
        fh.write(out)
    return "added"


def main(argv):
    counts = {"added": 0, "present": 0, "skip": 0, "nobody": 0}
    for path in targets(argv):
        if not os.path.isfile(path):
            print("missing:", path)
            continue
        r = inject(path)
        counts[r] += 1
        if r == "added":
            print("added   ", os.path.relpath(path, DEPLOY))
        elif r == "nobody":
            print("NO </body>", os.path.relpath(path, DEPLOY))
    print(
        "aog-cards.js: %d added, %d already present, %d pages without cards, %d without </body>"
        % (counts["added"], counts["present"], counts["skip"], counts["nobody"])
    )


if __name__ == "__main__":
    main(sys.argv[1:])
