# -*- coding: utf-8 -*-
"""build_anchors.py — adult-anchors.html (/adult/anchors), the twelve anchor cards (AOG-ADULT-ANCHORS-V1).

    python3 adult-build/build_anchors.py /path/to/book6.json

The anchor concept of each session, verbatim from the manual, one card each. Front: the
number, the phase and the anchor's name; back: its words. book6.json is NOT kept in this
(public) repo: it is the whole facilitator manual. It travels in the Adult Edition zip.
"""
import json, io, os, sys, html, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
D = json.load(io.open(sys.argv[1], encoding="utf-8"))
E = lambda s: html.escape(s, quote=True)
PH = {1:(1,"Foundation"),2:(1,"Foundation"),3:(1,"Foundation"),4:(2,"Interior"),5:(2,"Interior"),6:(2,"Interior"),
      7:(3,"Repair"),8:(3,"Repair"),9:(3,"Repair"),10:(3,"Repair"),11:(4,"Legacy"),12:(4,"Legacy")}
cards = ""
for s in D["sessions"]:
    n = s["n"]; p, nm = PH[n]
    title = s["anchor_title"].title().replace("Vs.", "vs.").replace(" As ", " as ").replace(" The ", " the ")
    paras = []
    for t in s["anchor"]:
        paras += [x.strip() for x in re.split(r"\s+(?=\d\.\s)", t) if x.strip()]   # the Compact's five clauses, one line each
    body = "".join("<p>%s</p>" % E(t) for t in paras)
    cards += ('<article class="acard p%d" data-n="%d"><button type="button" class="turn" aria-expanded="false" aria-controls="ab%d">'
              '<span class="k p%dc">Session %d · %s</span><span class="t">%s</span><span class="hint no-print">Tap to turn over</span></button>'
              '<div class="back" id="ab%d" hidden>%s</div></article>\n') % (p, n, n, p, n, nm, E(title), n, body)
tpl = io.open(os.path.join(HERE, "anchors_shell.html"), encoding="utf-8").read()
fp = io.open(os.path.join(HERE, "head_firstpaint.txt"), encoding="utf-8").read().rstrip("\n")
out = tpl.replace("@@CARDS@@", cards).replace("@@FIRSTPAINT@@", fp)
io.open(os.path.join(ROOT, "aog-deploy", "adult-anchors.html"), "w", encoding="utf-8").write(out)
print("built adult-anchors.html", len(out))
