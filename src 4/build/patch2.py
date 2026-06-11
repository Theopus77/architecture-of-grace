#!/usr/bin/env python3
import re

SRC = "index_integrated.html"
OUT = "index_final.html"
with open(SRC, "r", encoding="utf-8") as fh:
    s = fh.read()

def replace_once(hay, old, new, label):
    n = hay.count(old)
    if n != 1:
        raise SystemExit(f"[FAIL] {label}: expected 1 match, found {n}")
    return hay.replace(old, new, 1)

# ---------------------------------------------------------------------------
# 1) STRUCTURAL FIX: remove the orphaned </div> at line 3998.
#    It was the closing tag of a removed "Four Pillars" block (see the comment
#    above it). That single stray tag closed .hyb-welcome early, which closed
#    #screen-welcome early, which cascaded to close .stage/<main>, ejecting every
#    other screen out to <body> below the min-height:100vh stage -> the huge gap.
# ---------------------------------------------------------------------------
STRAY_OLD = (
    '          </a>\n'
    '        </div>\n'
    '      </div>\n'
    '\n'
    '      <!-- P2 (2026-06-06): 60-second burnout'
)
STRAY_NEW = (
    '          </a>\n'
    '        </div>\n'
    '\n'
    '      <!-- P2 (2026-06-06): 60-second burnout'
)
s = replace_once(s, STRAY_OLD, STRAY_NEW, "remove stray </div>")

# ---------------------------------------------------------------------------
# 2) i18n attributes on the new static Feelings Wheel card
# ---------------------------------------------------------------------------
CARD_OLD = ('<div class="tool-card" onclick="toolOpen(\'feelwheel\')">'
            '<span class="tool-icon">\U0001f3a1</span>'
            '<div class="tool-title">Feelings Wheel</div>'
            '<p class="tool-desc">Tap a feeling, hear it named</p>'
            '<button class="btn btn-secondary" style="width:100%">Spin</button></div>')
CARD_NEW = ('<div class="tool-card" onclick="toolOpen(\'feelwheel\')">'
            '<span class="tool-icon">\U0001f3a1</span>'
            '<div class="tool-title" data-i18n="gw_card_t">Feelings Wheel</div>'
            '<p class="tool-desc" data-i18n="gw_card_d">Tap a feeling, hear it named</p>'
            '<button class="btn btn-secondary" style="width:100%" data-i18n="gw_card_btn">Spin</button></div>')
s = replace_once(s, CARD_OLD, CARD_NEW, "feelwheel card i18n")

# ---------------------------------------------------------------------------
# 3) i18n on the static triage lead paragraph
# ---------------------------------------------------------------------------
LEAD_OLD = '<p class="triage-lead">In a hard moment right now? Start here.</p>'
LEAD_NEW = '<p class="triage-lead" data-i18n="gw_triage_lead">In a hard moment right now? Start here.</p>'
s = replace_once(s, LEAD_OLD, LEAD_NEW, "triage-lead i18n")

# ---------------------------------------------------------------------------
# 4) Swap the engine runtime block for the localized engine
# ---------------------------------------------------------------------------
with open("engine2.js", "r", encoding="utf-8") as ef:
    ENGINE_JS = ef.read()
NEW_BLOCK = ("<!-- ===== GRACE REGULATION ENGINE runtime ===== -->\n<script>\n"
             + ENGINE_JS + "\n</script>\n<!-- ===== END GRACE REGULATION ENGINE runtime ===== -->")
pat = re.compile(r"<!-- ===== GRACE REGULATION ENGINE runtime ===== -->.*?<!-- ===== END GRACE REGULATION ENGINE runtime ===== -->", re.S)
matches = pat.findall(s)
if len(matches) != 1:
    raise SystemExit(f"[FAIL] runtime block: found {len(matches)}")
s = pat.sub(lambda m: NEW_BLOCK, s, count=1)

with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(s)
print("[OK] wrote", OUT)
