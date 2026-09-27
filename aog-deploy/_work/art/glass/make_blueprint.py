#!/usr/bin/env python3
"""AOG-BLUEPRINT-HERO-V1 (2026-09-27) — Jimmy: "Maybe the drawing in the main hero page should be a blueprint of a
building being built." Replaces the hero's sketched window (#aogHeroRose) with an architect's blueprint: a front
elevation of a school hall — arched windows, a rose window over the door, a bell tower — finished on the left and
still in framing and scaffolding on the right, a tower crane lifting a beam, dimension lines and a title block.
White and pale-blue line on the navy; still and decorative. Run from aog-deploy/: python3 _work/art/glass/make_blueprint.py"""
import re, math
W, H = 1200, 700
L = []  # (d, width, opacity)
def ln(x1, y1, x2, y2, w=1.4, o=.9): L.append('<line x1="%g" y1="%g" x2="%g" y2="%g" stroke-width="%g" opacity="%g"/>' % (x1, y1, x2, y2, w, o))
def rect(x, y, w, h, sw=1.4, o=.9): L.append('<rect x="%g" y="%g" width="%g" height="%g" stroke-width="%g" opacity="%g" fill="none"/>' % (x, y, w, h, sw, o))
def path(d, sw=1.4, o=.9, dash=None): L.append('<path d="%s" stroke-width="%g" opacity="%g" fill="none"%s/>' % (d, sw, o, ' stroke-dasharray="%s"' % dash if dash else ""))
def circ(cx, cy, r, sw=1.4, o=.9): L.append('<circle cx="%g" cy="%g" r="%g" stroke-width="%g" opacity="%g" fill="none"/>' % (cx, cy, r, sw, o))
G = 600  # ground line
# ground and foundation
ln(40, G, 1160, G, 2.2); 
for x in range(60, 1160, 22): ln(x, G + 2, x - 12, G + 14, .8, .45)
# ── the hall: x 240..960 ; left half finished, right half framing
X0, X1, MID = 240, 960, 600
ROOF = 330
# finished left half: wall, cornice, arched windows
path("M%d %d V%d H%d" % (X0, G, ROOF, MID), 2.2)
ln(X0 - 10, ROOF, MID, ROOF, 1.6); ln(X0 - 10, ROOF - 10, MID, ROOF - 10, 1.2, .7)
for i in range(3):
    x = X0 + 40 + i * 105; y = 420
    path("M%d %d V%d A30 30 0 0 1 %d %d V%d Z" % (x, 540, y, x + 60, y, 540), 1.5)
    ln(x + 30, y - 30, x + 30, 540, .8, .6); ln(x, 480, x + 60, 480, .8, .6)
# stone coursing on the finished wall
for y in range(ROOF + 20, G, 26): ln(X0, y, MID - 1, y, .5, .25)
# gable and rose window over the centre door (finished)
path("M%d %d L%d %d L%d %d" % (MID - 150, ROOF, MID, 205, MID + 150, ROOF), 2)
circ(MID, 285, 34, 1.6); circ(MID, 285, 12, 1); 
for k in range(8):
    a = k * math.pi / 4; ln(MID + 12 * math.cos(a), 285 + 12 * math.sin(a), MID + 34 * math.cos(a), 285 + 34 * math.sin(a), .9, .7)
path("M%d %d V%d A40 40 0 0 1 %d %d V%d" % (MID - 40, G, 500, MID + 40, 500, G), 1.8)   # the door arch
ln(MID, 460, MID, G, .9, .6)
# bell tower on the left, finished
path("M%d %d V%d H%d V%d" % (X0 - 70, G, 250, X0, ROOF), 2)
path("M%d %d L%d %d L%d %d" % (X0 - 80, 250, X0 - 35, 175, X0 + 10, 250), 1.8)
path("M%d %d V%d A18 18 0 0 1 %d %d V%d" % (X0 - 53, 330, 290, X0 - 17, 290, 330), 1.3)
# right half: framing — columns, beams, bracing, open window openings dashed
for x in range(MID + 60, X1 + 1, 72):
    ln(x, G, x, ROOF + 6, 1.5, .85)
for y in (ROOF + 6, 440, 520):
    ln(MID + 60, y, X1, y, 1.5, .85)
for x in range(MID + 60, X1 - 71, 72):
    ln(x, 520, x + 72, 440, .8, .5); ln(x, 440, x + 72, ROOF + 6, .8, .5)
for i in range(2):
    x = MID + 190 + i * 110; path("M%d %d V%d A30 30 0 0 1 %d %d V%d" % (x, 540, 420, x + 60, 420, 540), 1, .55, "6 5")
path("M%d %d L%d %d" % (MID, 205, MID + 150, ROOF), 1, .5, "6 5")   # the unbuilt gable half, dashed
# scaffolding in front of the right side
for x in range(MID + 40, X1 + 60, 58): ln(x, G, x, ROOF - 30, 1, .6)
for y in range(G - 60, ROOF - 40, -58): ln(MID + 40, y, X1 + 42, y, 1, .6)
for x in range(MID + 40, X1 + 2, 58):
    for y in range(G, ROOF + 30, -58): ln(x, y, x + 58, y - 58, .6, .35)
# tower crane on the right
CX = 1060
path("M%d %d V%d" % (CX, G, 110), 2); path("M%d %d V%d" % (CX + 16, G, 110), 2)
for y in range(G, 120, -32): ln(CX, y, CX + 16, y - 32, .8, .6); ln(CX + 16, y, CX, y - 32, .8, .6)
ln(CX - 330, 110, CX + 120, 110, 2); ln(CX - 330, 124, CX + 90, 124, 1.2)
for x in range(CX - 330, CX + 90, 30): ln(x, 124, x + 15, 110, .7, .55)
ln(CX + 8, 110, CX + 8, 70, 1.6); ln(CX + 8, 70, CX - 330, 110, .9, .7); ln(CX + 8, 70, CX + 120, 110, .9, .7)
rect(CX + 90, 112, 34, 30, 1.2)                                       # counterweight
ln(CX - 250, 124, CX - 250, 260, .9, .8)                              # hook line
rect(CX - 320, 260, 140, 14, 1.4)                                     # the beam being lifted
ln(CX - 250, 260, CX - 320, 260, .6, .5); ln(CX - 250, 245, CX - 318, 260, .7, .6); ln(CX - 250, 245, CX - 182, 260, .7, .6)
# dimension lines
def dim(x1, x2, y, label):
    ln(x1, y, x2, y, .9, .75); ln(x1, y - 7, x1, y + 7, .9, .75); ln(x2, y - 7, x2, y + 7, .9, .75)
    for x, s in ((x1, 1), (x2, -1)): path("M%g %g L%g %g L%g %g" % (x + 9 * s, y - 4, x, y, x + 9 * s, y + 4), .9, .75)
    L.append('<text x="%g" y="%g" text-anchor="middle" font-size="13" opacity=".75" stroke="none" fill="#DCE8F7" font-family="ui-monospace,Menlo,monospace">%s</text>' % ((x1 + x2) / 2, y - 6, label))
dim(X0, X1, 640, "72' - 0\"")
dim(X0 - 70, X0, 660, "7'")
path("M%d %d V%d" % (1130, ROOF, G), .9, .75); 
# title block, bottom right
rect(930, 618, 230, 66, 1.2, .8); ln(930, 640, 1160, 640, .8, .7); ln(1045, 640, 1045, 684, .8, .7)
for (x, y, t, sz) in ((945, 634, "ARCHITECTURE OF GRACE", 12), (945, 658, "FRONT ELEVATION", 10), (1058, 658, "SHEET A-1", 10), (945, 676, "IN PROGRESS", 10), (1058, 676, "SCALE 1:100", 10)):
    L.append('<text x="%d" y="%d" font-size="%d" letter-spacing="1.5" opacity=".75" stroke="none" fill="#DCE8F7" font-family="ui-monospace,Menlo,monospace">%s</text>' % (x, y, sz, t))
svg = ('<svg id="aogHeroRose" class="aog-fade aog-blueprint" viewBox="0 0 %d %d" aria-hidden="true" focusable="false" role="presentation">'
       '<g stroke="#DCE8F7" stroke-linecap="round" stroke-linejoin="round" fill="none">%s</g></svg>') % (W, H, "".join(L))
css = ('<style id="aog-sketch-glass">\n/* AOG-BLUEPRINT-HERO-V1 — an architect\'s blueprint of a school hall being built, behind the name. Still. */\n'
       '@media screen{ #aogHeroRose.aog-blueprint{ width:min(880px,98vw) !important; height:auto; aspect-ratio:%d/%d; top:-34px !important; opacity:.38 !important;'
       ' -webkit-mask-image:radial-gradient(ellipse 60%% 62%% at 50%% 48%%, #000 55%%, transparent 100%%) !important; mask-image:radial-gradient(ellipse 60%% 62%% at 50%% 48%%, #000 55%%, transparent 100%%) !important; }'
       ' #aogHeroRose.aog-blueprint::after{ display:none; } }\n</style>') % (W, H)
p = "index.html"; s = open(p, encoding="utf-8").read()
s = re.sub(r'<picture id="aogHeroRose".*?</picture>|<svg id="aogHeroRose".*?</svg>', lambda m: svg, s, count=1, flags=re.S)
s = re.sub(r'<style id="aog-sketch-glass">.*?</style>', lambda m: css, s, count=1, flags=re.S)
open(p, "w", encoding="utf-8").write(s); print("blueprint written")
