#!/usr/bin/env python3
SRC = "index_v9.html"
OUT = "index_v10.html"
with open(SRC, "r", encoding="utf-8") as fh:
    s = fh.read()

def replace_once(hay, old, new, label):
    n = hay.count(old)
    if n != 1:
        raise SystemExit(f"[FAIL] {label}: expected 1 match, found {n}")
    return hay.replace(old, new, 1)

# 1) Dyslexia font: prefer a LOCAL copy (works offline / never-online), fall back
#    to the CDN if the local file isn't present. Drop the .woff2 files in /fonts
#    to activate the local path; otherwise behaviour is unchanged.
s = replace_once(s,
  '  src:url("https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5.0.0/files/opendyslexic-latin-400-normal.woff2") format("woff2");',
  '  src:url("fonts/opendyslexic-400.woff2") format("woff2"), url("https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5.0.0/files/opendyslexic-latin-400-normal.woff2") format("woff2");',
  "dyslexia font 400 local-first")
s = replace_once(s,
  '  src:url("https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5.0.0/files/opendyslexic-latin-700-normal.woff2") format("woff2");',
  '  src:url("fonts/opendyslexic-700.woff2") format("woff2"), url("https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5.0.0/files/opendyslexic-latin-700-normal.woff2") format("woff2");',
  "dyslexia font 700 local-first")

# 2) Build-version stamp — meta tag (machine-readable) + discreet footer line.
#    build.py replaces __AOG_BUILD__ with the build version on every build.
s = replace_once(s,
  '<meta charset="UTF-8">',
  '<meta charset="UTF-8">\n<meta name="aog-build" content="__AOG_BUILD__">',
  "build meta")
s = replace_once(s,
  '    <div class="sf-made" data-i18n="foot_made">Made with care in Illinois.</div>',
  '    <div class="sf-made" data-i18n="foot_made">Made with care in Illinois.</div>\n'
  '    <div class="sf-build" style="margin-top:10px;font-size:10.5px;color:#5f6e80;letter-spacing:.04em;">Build __AOG_BUILD__</div>',
  "build footer stamp")

with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(s)
print("[OK] wrote", OUT)
