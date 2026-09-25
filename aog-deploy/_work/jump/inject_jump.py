#!/usr/bin/env python3
"""inject_jump.py — wire aog-jump.js into every unit page and add the U.S. History
course to the "Social Studies · Grades 6–8" band of the jump menu.

For every aog-deploy/*.html that contains id="jumpSel" (or the file paths given
as argv):

  (a) insert  <script src="/aog-jump.js" defer></script>  before the last </body>
      if the page does not already load /aog-jump.js;
  (b) rewrite the <optgroup label="Social Studies · Grades 6–8">…</optgroup>
      block so the U.S. History course (hub + Units 1–10) comes FIRST, then the
      page's existing options unchanged — including its own
      <option value="" selected>… line wherever it sits. A new option that would
      duplicate the page's own selected entry (same text after the last "·") is
      skipped, so a ush-uN page keeps its one marked row.

Idempotent: run it twice and the second run reports 0 / 0.
Stdlib only. Python 3.
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEPLOY = os.path.abspath(os.path.join(HERE, "..", ".."))

SCRIPT_TAG = '<script src="/aog-jump.js" defer></script>'
GROUP_RE = re.compile(
    r'<optgroup label="Social Studies · Grades 6–8">(.*?)</optgroup>', re.S
)
NBSP4 = "&nbsp;&nbsp;&nbsp;&nbsp;"

USH_TITLES = [
    "Early Encounters",
    "English Settlement",
    "A New Nation",
    "The Early Republic",
    "Pushing National Boundaries",
    "Civil War and Reconstruction",
    "America on the Move",
    "Twentieth-Century Crises",
    "Postwar America",
    "America in a Changing World",
]

NEW_OPTIONS = [('us-history.html', 'U.S. History · Course contents')] + [
    ('ush-u%d.html' % n, '%sUnit %d · %s' % (NBSP4, n, title))
    for n, title in enumerate(USH_TITLES, start=1)
]

SELECTED_RE = re.compile(r'<option value="" selected>([^<]*)</option>')
OPTION_TAG_RE = re.compile(r'<option value="([^"]*)"')


def tail(text):
    """Text after the last "·", whitespace/nbsp trimmed — the duplicate key."""
    t = text.replace("&nbsp;", " ")
    if "·" in t:
        t = t.rsplit("·", 1)[1]
    return " ".join(t.split()).strip().lower()


def add_script(html):
    if "/aog-jump.js" in html:
        return html, False
    i = html.rfind("</body>")
    if i < 0:
        return html, False
    return html[:i] + SCRIPT_TAG + "\n" + html[i:], True


def add_course(html):
    m = GROUP_RE.search(html)
    if not m:
        return html, False
    body = m.group(1)
    present = set(OPTION_TAG_RE.findall(body))
    # the page's own selected entry (value="") — never duplicate it
    own = [tail(s) for s in SELECTED_RE.findall(body)]
    lines = []
    for value, text in NEW_OPTIONS:
        if value in present:
            continue
        if tail(text) in own:
            continue
        lines.append('<option value="%s">%s</option>' % (value, text))
    if not lines:
        return html, False
    new_body = "\n" + "\n".join(lines) + body if body.startswith("\n") else "\n" + "\n".join(lines) + "\n" + body
    start, end = m.span(1)
    return html[:start] + new_body + html[end:], True


def process(path):
    with open(path, encoding="utf-8") as f:
        html = f.read()
    if 'id="jumpSel"' not in html:
        return False, False
    html2, did_a = add_script(html)
    html3, did_b = add_course(html2)
    if did_a or did_b:
        with open(path, "w", encoding="utf-8") as f:
            f.write(html3)
    return did_a, did_b


def main(argv):
    if argv:
        files = [os.path.abspath(p) for p in argv]
    else:
        files = sorted(
            os.path.join(DEPLOY, n) for n in os.listdir(DEPLOY) if n.endswith(".html")
        )
    n_a = n_b = n_seen = 0
    for p in files:
        if not os.path.isfile(p):
            print("skip (not a file):", p)
            continue
        with open(p, encoding="utf-8") as f:
            if 'id="jumpSel"' not in f.read():
                continue
        n_seen += 1
        did_a, did_b = process(p)
        n_a += did_a
        n_b += did_b
    print("pages with #jumpSel: %d" % n_seen)
    print("(a) script tags inserted: %d" % n_a)
    print("(b) U.S. History course added to SS 6–8 group: %d" % n_b)


if __name__ == "__main__":
    main(sys.argv[1:])
