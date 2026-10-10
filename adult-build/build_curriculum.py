# -*- coding: utf-8 -*-
"""build_curriculum.py — adult-curriculum.html (/adult/curriculum), the whole curriculum (AOG-ADULT-CURRICULUM-V2).

    python3 adult-build/build_curriculum.py /path/to/book6.json

Jimmy (2026-10-10): "This has ABSOLUTELY no curriculum behind it." Then: "ITS ALL FREE. Provide the direct
instruction lessons as well just like the SEL. Nothing is locked."

So this page is the manual, verbatim, open to anyone, the way a K-12 room's curriculum is: before you begin
(the care flags, the session anatomy, the disclosure & distress protocol), then each of the twelve sessions
with its objective, time, key words, prerequisites, materials, care level, K-12 connection, the
do-not-proceed box, facilitator preparation, the anchor idea, every timed step with its script (the direct
instruction), facilitator notes, in-session safety checks, practice, scenario cards and integration, the
between-session actions and the facilitator reflection. Then the closing words.

book6.json is never committed; it travels in the Adult Edition zip.
"""
import json, io, os, re, sys, html
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
D = X = None
def load(path):
    """Read book6.json; build_lessons.py and build_charts.py import this module and call it."""
    global D, X
    D = json.load(io.open(path, encoding="utf-8")); X = D["extra"]
    return D
E = lambda s: html.escape(s, quote=True)

PH = {1:(1,"I","Foundation"),2:(1,"I","Foundation"),3:(1,"I","Foundation"),4:(2,"II","Interior"),5:(2,"II","Interior"),
      6:(2,"II","Interior"),7:(3,"III","Repair"),8:(3,"III","Repair"),9:(3,"III","Repair"),10:(3,"III","Repair"),
      11:(4,"IV","Legacy"),12:(4,"IV","Legacy")}

def care(fl):
    fl = fl or ""; out = []
    if "★★" in fl: out.append('<span class="flag">★★</span> high care')
    elif "★" in fl: out.append('<span class="flag">★</span> extra care')
    if "◆" in fl: out.append('<span class="flag gate">◆</span> safety check-in first')
    return " · ".join(out) or "Standard care"

def title_case(t):
    t = t.title()
    for a, b in ((" And ", " and "), (" Of ", " of "), (" The ", " the "), (" To ", " to "), (" A ", " a "), (" In ", " in "),
                 (" Vs. ", " vs. "), (" For ", " for "), (" As ", " as "), (" On ", " on ")):
        t = t.replace(a, b)
    return t

def ps(lst): return "".join("<p>%s</p>" % E(t) for t in lst)

def scan_box(b):
    rows = ""
    for k in ["lead", "OBSERVE", "MAY INDICATE", "ACTION", "RESPONSE", "DO", "DO NOT"]:
        if k in b["parts"]:
            lab = "" if k == "lead" else ("May indicate" if k == "MAY INDICATE" else k.title())
            rows += '<div class="scrow"><b>%s</b><span>%s</span></div>' % (E(lab), E(b["parts"][k]))
    return '<div class="scan"><span class="who">In-session check · %s</span>%s</div>' % (E(title_case(b["label"])), rows)

def step_html(st):
    body, board = "", False
    for b in st["blocks"]:
        k = b["k"]
        if k == "p":
            t = b["t"]
            if re.match(r"^(Write (each )?on (the|a) (board|flipchart)|Write on the board)", t):
                body += '<p class="cue">%s</p>' % E(t); board = True; continue
            if board and re.match(r"^([A-Z][A-Z \-/']{3,}:|\d\.\s|STEP \d\.|SIGN \d\.|MOVE \d\.|THE [A-Z]+:)", t):
                body += '<p class="board">%s</p>' % E(t); continue
            board = False
            body += '<p class="note">%s</p>' % E(t)
        elif k == "script": body += '<div class="say"><span class="who">The lesson · say it or adapt it</span>%s</div>' % E(b["t"])
        elif k == "scan": body += scan_box(b)
        elif k == "practice": body += '<div class="practice"><span class="who">The practice · %s</span>%s</div>' % (E(title_case(b["label"])), ps(b["ps"]))
        elif k == "scenario": body += '<div class="scenario"><span class="who">%s</span>%s</div>' % (E(b["label"].replace("SCENARIO CARD · ", "Scenario card · ")), ps(b["ps"]))
        elif k == "integration": body += '<div class="integ"><span class="who">Integration · what was done · what was not done</span>%s</div>' % ps(b["ps"])
        else: body += '<div class="box"><span class="who">%s</span>%s</div>' % (E(b.get("label", "")), ps(b.get("ps", [])))
    return ('<li class="step"><div class="sh"><span class="n">%s</span><span class="t">%s</span><span class="m">%s</span></div>%s</li>'
            % (E(st["n"]), E(title_case(st["title"])), E(st["min"]), body))

def session_html(s):
    n = s["n"]; p, rom, nm = PH[n]
    m = s["meta"]
    rows = ""
    for key, lab in (("Objective", "Objective"), ("Duration", "Time"), ("Key Vocabulary", "Key words"),
                     ("Prerequisites", "Before this session"), ("Materials", "Materials"), ("Risk Profile", "Care")):
        if m.get(key): rows += "<tr><th>%s</th><td>%s</td></tr>" % (lab, E(m[key]))
    out = '<section class="sess p%d" id="s%d" data-n="%d">' % (p, n, n)
    out += ('<header class="shd"><div class="k p%dc">Session %d · Phase %s · %s</div><h2>%s</h2><p class="care">%s</p></header>'
            % (p, n, rom, nm, E(s["title"]), care(s.get("flagline"))))
    if s.get("connects"): out += '<p class="connects"><b>From the K–12 rooms.</b> %s</p>' % E(s["connects"])
    out += '<table class="meta">%s</table>' % rows
    if s.get("contra"): out += '<div class="contra"><b>%s</b>%s</div>' % (E(s["contra"]["label"]), ps(s["contra"]["ps"]))
    if s.get("anchor"):
        out += ('<div class="anchor"><span class="who">Anchor idea · post it · %s</span>%s</div>'
                % (E(title_case(s.get("anchor_title") or "")), ps(s["anchor"])))
    if s.get("prep"): out += '<div class="prep"><h3>Before the session · facilitator preparation</h3>%s</div>' % ps(s["prep"])
    out += '<h3 class="flowh">The ninety minutes</h3><ol class="steps">%s</ol>' % "".join(step_html(st) for st in s["steps"])
    if s.get("between"): out += '<div class="between"><span class="who">Between sessions · facilitators</span>%s</div>' % ps(s["between"])
    if s.get("reflection"):
        rt = (s.get("reflection_title") or "").replace("FACILITATOR REFLECTION — ", "")
        out += '<div class="refl"><span class="who">Facilitator reflection · %s</span>%s</div>' % (E(title_case(rt)), ps(s["reflection"]))
    out += '<p class="tofac no-print"><a href="/adult/sessions?s=%d">Run Session %d in the facilitator console →</a></p>' % (n, n)
    out += "</section>"
    return out

def before_html():
    out = '<section class="sess" id="before"><header class="shd"><div class="k">Before you begin</div><h2>Care levels, the session shape, and the protocol</h2></header>'
    out += '<div class="card"><h3>Reading the care flags</h3>%s</div>' % ps(X["flags"][:3])
    out += ('<div class="card"><h3>Every session, the same order</h3><table class="tbl"><thead><tr><th>Part</th><th>Time</th><th>Purpose</th></tr></thead><tbody>%s</tbody></table>'
            '<p class="small mut">90 minutes in all; the co-facilitators debrief afterward for at least 20 minutes.</p></div>'
            % "".join('<tr><td>%s</td><td class="t">%s</td><td>%s</td></tr>' % tuple(E(c) for c in r) for r in X["anatomy"]))
    out += '<div class="card" id="protocol"><h3>3.5 Disclosure &amp; distress protocol</h3>'
    for b in X["s35"]:
        if b["k"] == "h":
            if not b["t"].startswith("3.5"): out += "<h4>%s</h4>" % E(b["t"])
        elif b["k"] == "p": out += "<p>%s</p>" % E(b["t"])
        else: out += '<div class="contra"><b>%s</b>%s</div>' % (E(b["label"]), ps(b["ps"]))
    out += "</div></section>"
    return out

def crosswalk():
    rows = ""
    for s in D["sessions"]:
        n = s["n"]; p, rom, nm = PH[n]
        pr = [b["label"] for st in s["steps"] for b in st["blocks"] if b["k"] == "practice"]
        rows += ('<tr class="p%d"><td class="n"><a href="#s%d">%02d</a></td><td><a href="#s%d">%s</a></td><td>%s</td><td>%s</td><td>%s</td></tr>'
                 % (p, n, n, n, E(s["title"]), E(title_case(s.get("anchor_title") or "")), E(title_case(pr[0]) if pr else "—"), care(s.get("flagline"))))
    return rows

def main(path):
    load(path)
    opts = '<option value="before">Before you begin · care, shape, protocol</option>'
    for s in D["sessions"]:
        n = s["n"]
        if n in (1, 4, 7, 11): opts += ("</optgroup>" if n > 1 else "") + '<optgroup label="Phase %s · %s">' % (PH[n][1], PH[n][2])
        opts += '<option value="s%d">%d · %s</option>' % (n, n, E(s["title"]))
    opts += "</optgroup>"

    tpl = io.open(os.path.join(HERE, "curriculum_shell.html"), encoding="utf-8").read()
    fp = io.open(os.path.join(HERE, "head_firstpaint.txt"), encoding="utf-8").read().rstrip("\n")
    out = (tpl.replace("@@FIRSTPAINT@@", fp).replace("@@OPTIONS@@", opts).replace("@@CROSSWALK@@", crosswalk())
              .replace("@@SESSIONS@@", before_html() + "\n" + "\n".join(session_html(s) for s in D["sessions"]))
              .replace("@@CLOSING@@", E(X.get("closing_exit") or "")))
    io.open(os.path.join(ROOT, "aog-deploy", "adult-curriculum.html"), "w", encoding="utf-8").write(out)
    print("built adult-curriculum.html", len(out), "bytes")

if __name__ == "__main__":
    main(sys.argv[1])
