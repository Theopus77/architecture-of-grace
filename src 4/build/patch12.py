#!/usr/bin/env python3
SRC = "index_v11.html"
OUT = "index_v12.html"
with open(SRC, "r", encoding="utf-8") as fh:
    s = fh.read()

def replace_once(hay, old, new, label):
    n = hay.count(old)
    if n != 1:
        raise SystemExit(f"[FAIL] {label}: expected 1 match, found {n}")
    return hay.replace(old, new, 1)

# 1) Calm-jar runtime bugfix already done in patch.py. Here: add Take 5 card
#    (after Paced Breathing) and Body Check card (after the triage lead area).
BOX_CARD = ('      <div class="tool-card" onclick="toolOpen(\'boxbreath\')">'
            '<span class="tool-icon">\U0001fac1</span>'
            '<div class="tool-title" data-i18n="gt_box_t">Paced Breathing</div>'
            '<p class="tool-desc" data-i18n="gt_box_d">Box 4·4·4·4 or 4·7·8 vagal</p>'
            '<button class="btn btn-secondary" style="width:100%" data-i18n="gt_box_b">Start</button></div>')
TAKE5_CARD = ('\n      <div class="tool-card" onclick="toolOpen(\'take5\')">'
              '<span class="tool-icon">\U0001f590️</span>'
              '<div class="tool-title" data-i18n="gt_t5_t">Take 5</div>'
              '<p class="tool-desc" data-i18n="gt_t5_d">Trace your hand, breath by breath</p>'
              '<button class="btn btn-secondary" style="width:100%" data-i18n="gt_t5_b">Start</button></div>')
s = replace_once(s, BOX_CARD, BOX_CARD + TAKE5_CARD, "take5 card")

# Body Check: a router — a prominent full-width card at the top of the grid,
# the calm, reflective sibling of the crisis triage. Inserted before START row.
ANCHOR = '      <div class="tools-row-header">START</div>'
BODY_CARD = ('      <div class="tool-card" onclick="toolOpen(\'bodycheck\')" '
    'style="grid-column:1 / -1; max-width:520px; margin:0 auto 24px; border-color:var(--gold);">'
    '<span class="tool-icon">\U0001f9ed</span>'
    '<div class="tool-title" data-i18n="gt_body_t">Body Check</div>'
    '<p class="tool-desc" data-i18n="gt_body_d">Tell us how your body feels — get the right tool</p>'
    '<button class="btn btn-secondary" style="width:100%" data-i18n="gt_body_b">Check in</button></div>\n'
    + ANCHOR)
s = replace_once(s, ANCHOR, BODY_CARD, "body check card")

with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(s)
print("[OK] wrote", OUT)
