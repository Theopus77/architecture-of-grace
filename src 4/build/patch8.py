#!/usr/bin/env python3
SRC = "index_v7.html"
OUT = "index_v8.html"
with open(SRC, "r", encoding="utf-8") as fh:
    s = fh.read()

def replace_once(hay, old, new, label):
    n = hay.count(old)
    if n != 1:
        raise SystemExit(f"[FAIL] {label}: expected 1 match, found {n}")
    return hay.replace(old, new, 1)

# PECS screen chrome -> data-i18n (keys registered in grace-tools.js)
s = replace_once(s,
    '      <div class="eyebrow">COMMUNICATION SUPPORT</div>',
    '      <div class="eyebrow" data-i18n="pecs_eyebrow">COMMUNICATION SUPPORT</div>',
    "pecs eyebrow")
s = replace_once(s,
    '      <h1 class="display-lg">PECS Cards</h1>',
    '      <h1 class="display-lg" data-i18n="pecs_h1">PECS Cards</h1>',
    "pecs h1")
s = replace_once(s,
    '      <p class="lede">Tap a card to add it to your sequence. Build your message, then share it.</p>',
    '      <p class="lede" data-i18n="pecs_lede">Tap a card to add it to your sequence. Build your message, then share it.</p>',
    "pecs lede")
s = replace_once(s,
    '      <button onclick="pecsClearStrip()" class="btn btn-secondary">\U0001f5d1️ Clear</button>',
    '      <button onclick="pecsClearStrip()" class="btn btn-secondary" data-i18n="pecs_clear">\U0001f5d1️ Clear</button>',
    "pecs clear btn")
s = replace_once(s,
    '      <button onclick="pecsPrintStrip()" class="btn btn-secondary">\U0001f5a8️ Print Strip</button>',
    '      <button onclick="pecsPrintStrip()" class="btn btn-secondary" data-i18n="pecs_print">\U0001f5a8️ Print Strip</button>',
    "pecs print btn")
s = replace_once(s,
    '      <button onclick="pecsSpeakStrip()" class="btn" style="background:var(--gold);color:var(--navy);">\U0001f50a Speak</button>',
    '      <button onclick="pecsSpeakStrip()" class="btn" style="background:var(--gold);color:var(--navy);" data-i18n="pecs_speak">\U0001f50a Speak</button>',
    "pecs speak btn")

with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(s)
print("[OK] wrote", OUT)
