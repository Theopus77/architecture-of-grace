#!/usr/bin/env python3
"""AOG-FAST-BUILD-V1 (2026-10-11) — Jimmy: "make this website FLASH SPEED, LIGHTING BOLT SPEED!"

The front page (index.html) and the eight Studio rooms (music-*.html) carry their code written into the page. Every
visit read it again on the phone's main thread, and every update to the site sent all of it again. This makes the
pages visitors get: the same page, word for word, with each larger block of code moved into a file of its own in
aog-deploy/front/, named after what is in it. A phone keeps those files (aog-deploy/_headers, sw.js), fetches only the
blocks that changed after an update, and makes their code ready off the page's main thread. The code runs exactly as
before: the same blocks, in the same order, at the same places, with the same ids. Small blocks (the light-or-dark and
first-paint lines at the top of a page) stay in the page, so nothing waits before the first paint.

The source files are still the ones to edit, as always. aog-deploy/_redirects serves the made page at the same
address (index.html is served as front.html at /; a room as fast/music-*.html at /music-*.html and its short names).

  python3 tools/build-fast.py           (from the repo root) after any change to index.html or a room
  python3 tools/build-fast.py --check   is every made page up to date? (the site's checks ask this and stop if not)

Files no longer used are removed, except those of the build before (a phone that opened an old page while the site
was updating still finds them).
"""
import hashlib, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "aog-deploy")
DIR = os.path.join(ROOT, "front")
MARK = "AOG-FAST-BUILD-V1"
MIN = 2048   # bytes: a smaller block stays in the page (it gains nothing, and the first paint would wait on it)
PAGES = [("index.html", "front.html")] + [("music-%s.html" % r, "fast/music-%s.html" % r)
         for r in ("pads", "kit", "piano", "guitar", "bass", "band", "decks", "studio")]

SCRIPT = re.compile(r"<script\b([^>]*)>(.*?)</script>", re.S | re.I)
NOT_CODE = re.compile(r'type\s*=\s*"(?!text/javascript"|module")', re.I)   # templates and data stay in the page
TEMPLATE = re.compile(r"<template\b.*?</template>", re.S | re.I)


def source_sum(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


def used_by(path):
    try:
        with open(path, encoding="utf-8") as f:
            return set(re.findall(r'src="/front/([0-9a-f]+\.js)"', f.read()))
    except OSError:
        return set()


def build_one(src_name, out_name, made):
    src_path, out_path = os.path.join(ROOT, src_name), os.path.join(ROOT, out_name)
    with open(src_path, encoding="utf-8") as f:
        src = f.read()
    moved = [0]
    # Code inside a <template> runs only when a page puts it in by hand (AOG-CLASSIC-LATER-V1 in index.html). A
    # file put in that way loads out of turn, so that code stays in the page.
    held = [t.span() for t in TEMPLATE.finditer(src)]

    def out(m):
        attrs, body = m.group(1), m.group(2)
        if any(a <= m.start() < b for a, b in held):
            return m.group(0)
        if re.search(r"\bsrc\s*=", attrs) or NOT_CODE.search(attrs) or len(body.encode("utf-8")) < MIN:
            return m.group(0)
        if re.search(r"\b(defer|async)\b", attrs):   # an inline block ignores these; a file would not, so it stays
            return m.group(0)
        name = hashlib.sha1(body.encode("utf-8")).hexdigest()[:12] + ".js"
        path = os.path.join(DIR, name)
        if not os.path.exists(path):
            with open(path, "w", encoding="utf-8") as f:
                f.write(body)
        made.add(name); moved[0] += 1
        return '<script%s src="/front/%s"></script>' % (attrs, name)

    page = SCRIPT.sub(out, src)
    note = "<!-- %s source:%s · MADE BY tools/build-fast.py from %s: edit %s, then run it. -->" % (MARK, source_sum(src), src_name, src_name)
    page, n = re.subn(r"(<!DOCTYPE html>\s*)", lambda m: m.group(1) + note + "\n", page, count=1, flags=re.I)
    if not n:
        sys.exit("%s has no <!DOCTYPE html>: not built" % src_name)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(page)
    print("  %-18s -> %-24s %3d blocks moved, page %5d KB (was %5d KB)" % (src_name, out_name, moved[0],
          len(page.encode("utf-8")) // 1024, len(src.encode("utf-8")) // 1024))


def build():
    os.makedirs(DIR, exist_ok=True)
    before, made = set(), set()
    for _, out_name in PAGES:
        before |= used_by(os.path.join(ROOT, out_name))
    for src_name, out_name in PAGES:
        build_one(src_name, out_name, made)
    gone = 0
    for name in os.listdir(DIR):
        if name.endswith(".js") and name not in made and name not in before:
            os.remove(os.path.join(DIR, name)); gone += 1
    print("front/: %d files in use, %d old files removed" % (len(made), gone))


def stale():
    """The made pages that do not match their source now (the site's checks ask this)."""
    out = []
    for src_name, out_name in PAGES:
        try:
            with open(os.path.join(ROOT, src_name), encoding="utf-8") as f:
                want = source_sum(f.read())
            with open(os.path.join(ROOT, out_name), encoding="utf-8") as f:
                head = f.read(4000)
            m = re.search(MARK + r" source:([0-9a-f]+)", head)
            if not (m and m.group(1) == want):
                out.append(src_name)
        except OSError:
            out.append(src_name)
    return out


if __name__ == "__main__":
    if sys.argv[1:] == ["--check"]:
        old = stale()
        print("every made page is up to date" if not old else
              "older than its source: %s. Run:  python3 tools/build-fast.py" % ", ".join(old))
        sys.exit(1 if old else 0)
    build()
