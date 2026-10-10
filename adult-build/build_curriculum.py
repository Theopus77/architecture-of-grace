# -*- coding: utf-8 -*-
"""build_curriculum.py — adult-curriculum.html (/adult/curriculum), the open curriculum (AOG-ADULT-CURRICULUM-V1).

    python3 adult-build/build_curriculum.py /path/to/book6.json [--scripts]

Jimmy (2026-10-10): "This has ABSOLUTELY no curriculum behind it." He chose: the twelve sessions open to
anyone, laid out like a K-12 room's curriculum, with the safety material kept behind the facilitator key.

PUBLIC, verbatim from the manual: objective, duration, phase, care level, key vocabulary, prerequisites,
materials, the K-12 connection, the anchor concept, every timed step (title + minutes) with the
facilitator's notes, the practice, the scenario cards, the integration box, and the between-session
actions.
KEPT IN THE CONSOLE: word-for-word scripts (unless --scripts), in-session safety scans, contraindication
("do not proceed") boxes, the disclosure & distress protocol, facilitator preparation, the reflection,
and any note or between-session line that is about risk, escalation or safety (SAFE_RE below).

book6.json is never committed (the repo is public); it travels in the Adult Edition zip.
"""
import json, io, os, re, sys, html
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
args = [a for a in sys.argv[1:] if not a.startswith("--")]
SCRIPTS = "--scripts" in sys.argv
D = json.load(io.open(args[0], encoding="utf-8"))
E = lambda s: html.escape(s, quote=True)

# a note or a between-session line that is about risk or safety stays in the console
SAFE_RE = re.compile(r"tier\s*[123]|flag|re-?screen|activat|escalat|suicid|protocol|clinic|crisis|disclos|distress|"
                     r"scan|fragil|dissociat|self-harm|harm to|emergency|safety|watch carefully|steps? out|consult|risk", re.I)

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
                 (" Vs. ", " vs. "), (" For ", " for "), (" As ", " as "), (" On ", " on "), ("→", "→")):
        t = t.replace(a, b)
    return t

def ps(lst): return "".join("<p>%s</p>" % E(t) for t in lst)

def step_html(st):
    body, held = "", 0
    bl = st["blocks"]
    for i, b in enumerate(bl):
        k = b["k"]
        if k == "p":
            if SAFE_RE.search(b["t"]): held += 1; continue
            nxt = bl[i + 1]["k"] if i + 1 < len(bl) else None
            # a lead-in ("After seven minutes:") whose script is held in the console would dangle
            if b["t"].rstrip().endswith(":") and nxt in ("script", "scan") and not SCRIPTS: held += 1; continue
            body += '<p class="note">%s</p>' % E(b["t"])
        elif k == "script":
            if SCRIPTS: body += '<div class="say"><span class="who">Facilitator</span>%s</div>' % E(b["t"])
            else: held += 1
        elif k == "scan": held += 1
        elif k == "practice": body += '<div class="practice"><span class="who">The practice · %s</span>%s</div>' % (E(title_case(b["label"])), ps(b["ps"]))
        elif k == "scenario": body += '<div class="scenario"><span class="who">%s</span>%s</div>' % (E(b["label"].replace("SCENARIO CARD · ", "Scenario card · ")), ps(b["ps"]))
        elif k == "integration": body += '<div class="integ"><span class="who">Integration · what was done · what was not done</span>%s</div>' % ps(b["ps"])
        else: held += 1
    if held:
        body += '<p class="held">%s</p>' % ("The facilitator&#8217;s words and safety checks for this step are in the facilitator sessions." if not SCRIPTS
                                            else "The safety checks for this step are in the facilitator sessions.")
    return ('<li class="step"><div class="sh"><span class="n">%s</span><span class="t">%s</span><span class="m">%s</span></div>%s</li>'
            % (E(st["n"]), E(title_case(st["title"])), E(st["min"]), body))

def session_html(s):
    n = s["n"]; p, rom, nm = PH[n]
    m = s["meta"]
    rows = ""
    for key, lab in (("Objective", "Objective"), ("Duration", "Time"), ("Key Vocabulary", "Key words"),
                     ("Prerequisites", "Before this session"), ("Materials", "Materials")):
        if m.get(key): rows += "<tr><th>%s</th><td>%s</td></tr>" % (lab, E(m[key]))
    rows += "<tr><th>Care</th><td>%s</td></tr>" % care(s.get("flagline"))
    out = '<section class="sess p%d" id="s%d" data-n="%d">' % (p, n, n)
    out += ('<header class="shd"><div class="k p%dc">Session %d · Phase %s · %s</div><h2>%s</h2></header>'
            % (p, n, rom, nm, E(s["title"])))
    if s.get("connects"): out += '<p class="connects"><b>From the K–12 rooms.</b> %s</p>' % E(s["connects"])
    out += '<table class="meta">%s</table>' % rows
    if s.get("anchor"):
        out += ('<div class="anchor"><span class="who">Anchor idea · %s</span>%s</div>'
                % (E(title_case(s.get("anchor_title") or "")), ps(s["anchor"])))
    out += '<h3 class="flowh">The ninety minutes</h3><ol class="steps">%s</ol>' % "".join(step_html(st) for st in s["steps"])
    # each between-session paragraph keeps its own sentences together; a sentence about risk or safety
    # stays in the console, and so does a short tail that only finished it ("Required.")
    btw = []
    for t in s.get("between") or []:
        keep, dropped = [], False
        for sent in re.split(r"(?<=[.!?])\s+(?=[A-Z0-9])", t):
            sent = sent.strip()
            if not sent: continue
            if SAFE_RE.search(sent) or (dropped and len(sent) < 11): dropped = True; continue
            dropped = False; keep.append(sent)
        if keep: btw.append(" ".join(keep))
    if btw:
        out += '<div class="between"><span class="who">Between sessions · facilitators</span>%s</div>' % "".join("<p>%s</p>" % E(x) for x in btw)
    out += '<p class="tofac no-print"><a href="/adult/sessions?s=%d">Facilitators: open Session %d with the key →</a></p>' % (n, n)
    out += "</section>"
    return out

def crosswalk():
    rows = ""
    for s in D["sessions"]:
        n = s["n"]; p, rom, nm = PH[n]
        pr = [b["label"] for st in s["steps"] for b in st["blocks"] if b["k"] == "practice"]
        rows += ('<tr class="p%d"><td class="n"><a href="#s%d">%02d</a></td><td><a href="#s%d">%s</a></td><td>%s</td><td>%s</td><td>%s</td></tr>'
                 % (p, n, n, n, E(s["title"]), E(title_case(s.get("anchor_title") or "")), E(title_case(pr[0]) if pr else "—"), care(s.get("flagline"))))
    return rows

opts = ""
for s in D["sessions"]:
    n = s["n"]
    if n in (1, 4, 7, 11): opts += ("</optgroup>" if n > 1 else "") + '<optgroup label="Phase %s · %s">' % (PH[n][1], PH[n][2])
    opts += '<option value="s%d">%d · %s</option>' % (n, n, E(s["title"]))
opts += "</optgroup>"

tpl = io.open(os.path.join(HERE, "curriculum_shell.html"), encoding="utf-8").read()
fp = io.open(os.path.join(HERE, "head_firstpaint.txt"), encoding="utf-8").read().rstrip("\n")
out = (tpl.replace("@@FIRSTPAINT@@", fp).replace("@@OPTIONS@@", opts).replace("@@CROSSWALK@@", crosswalk())
          .replace("@@SESSIONS@@", "\n".join(session_html(s) for s in D["sessions"]))
          .replace("@@CLOSING@@", E(D["extra"].get("closing_exit") or "")))
io.open(os.path.join(ROOT, "aog-deploy", "adult-curriculum.html"), "w", encoding="utf-8").write(out)
print("built adult-curriculum.html", len(out), "bytes; scripts", "public" if SCRIPTS else "kept in the console")
