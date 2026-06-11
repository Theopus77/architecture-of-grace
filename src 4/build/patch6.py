#!/usr/bin/env python3
SRC = "index_v5.html"
OUT = "index_v6.html"
with open(SRC, "r", encoding="utf-8") as fh:
    s = fh.read()

def replace_once(hay, old, new, label):
    n = hay.count(old)
    if n != 1:
        raise SystemExit(f"[FAIL] {label}: expected 1 match, found {n}")
    return hay.replace(old, new, 1)

# 1) CSS before </head>
with open("css6.css", "r", encoding="utf-8") as cf:
    CSS = cf.read().rstrip() + "\n</head>"
s = replace_once(s, "</head>", CSS, "somatic css")

# 2) New tool cards (Paced Breathing after 4-7-8; Tap Pad after Movement)
BREATH = """      <div class="tool-card" onclick="toolOpen('breathing')"><span class="tool-icon">\U0001fac1</span><div class="tool-title">4-7-8 Breathing</div><p class="tool-desc">Animated breath guide</p><button class="btn btn-secondary" style="width:100%">Start</button></div>"""
BREATH_NEW = BREATH + """
      <div class="tool-card" onclick="toolOpen('boxbreath')"><span class="tool-icon">\U0001fac1</span><div class="tool-title" data-i18n="gt_box_t">Paced Breathing</div><p class="tool-desc" data-i18n="gt_box_d">Box 4·4·4·4 or 4·7·8 vagal</p><button class="btn btn-secondary" style="width:100%" data-i18n="gt_box_b">Start</button></div>"""
s = replace_once(s, BREATH, BREATH_NEW, "box breathing card")

MOVE = """      <div class="tool-card" onclick="toolOpen('movement')"><span class="tool-icon">\U0001f3c3</span><div class="tool-title">Movement Break</div><p class="tool-desc">Timed shake-out sequence</p><button class="btn btn-secondary" style="width:100%">Start</button></div>"""
MOVE_NEW = MOVE + """
      <div class="tool-card" onclick="toolOpen('tappad')"><span class="tool-icon">\U0001f446</span><div class="tool-title" data-i18n="gt_tap_t">Tap Pad</div><p class="tool-desc" data-i18n="gt_tap_d">Tap a rhythm to steady your heart</p><button class="btn btn-secondary" style="width:100%" data-i18n="gt_tap_b">Open</button></div>"""
s = replace_once(s, MOVE, MOVE_NEW, "tap pad card")

# 3) "Reset myself (10s)" manual grounding button in the tools header
BANNER = '    <div id="grace-practiced-banner" class="grace-practiced-banner" aria-live="polite"></div>'
BANNER_NEW = ('    <div style="text-align:center;margin:-4px 0 16px;"><button class="btn btn-secondary gg-reset-btn" '
              'onclick="if(typeof graceAdultGrounding===\'function\'){graceAdultGrounding(true);}" data-i18n="gt_ground_btn">Reset myself (10s)</button></div>\n'
              + BANNER)
s = replace_once(s, BANNER, BANNER_NEW, "reset-myself button")

# 4) PECS "Show to Teacher" SOS button (after Speak)
SPEAK = '      <button onclick="pecsSpeakStrip()" class="btn" style="background:var(--gold);color:var(--navy);">\U0001f50a Speak</button>'
SPEAK_NEW = SPEAK + '\n      <button onclick="if(typeof pecsShowToTeacher===\'function\'){pecsShowToTeacher();}" class="btn pecs-sos-trigger" data-i18n="pecs_sos_btn">\U0001f64b Show to Teacher</button>'
s = replace_once(s, SPEAK, SPEAK_NEW, "pecs sos button")

# 5) Inject the somatic tools module before the final </body>
with open("grace-tools.js", "r", encoding="utf-8") as gf:
    GT = gf.read()
SCRIPT = ("<!-- ===== GRACE SOMATIC TOOLS ===== -->\n<script>\n" + GT
          + "\n</script>\n<!-- ===== END GRACE SOMATIC TOOLS ===== -->\n</body>")
idx = s.rfind("</body>")
if idx == -1:
    raise SystemExit("[FAIL] no </body>")
s = s[:idx] + SCRIPT + s[idx + len("</body>"):]

with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(s)
print("[OK] wrote", OUT)
