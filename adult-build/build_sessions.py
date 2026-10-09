# -*- coding: utf-8 -*-
"""build_sessions.py — the facilitator console, adult-sessions.html (AOG-ADULT-CONSOLE-V2).

    python3 adult-build/build_sessions.py --key "the facilitator key" --gate "workbook word" --book /path/to/book6.json

book6.json is the whole manual and is NOT kept in this public repo; it travels in the Adult
Edition zip. The --gate word must match the one the workbook checks (adult-workbook.html,
GATE = h32(word)); it is shown to facilitators only inside the encrypted console.
V2 (2026-10-09): the site's skin; a Done tick on each timed step with the session's minutes
added up; the workbook card (the gate word + a link maker for the group's own Sheet).

Reads _work/adult/book6.json (parse_book6.py) and renders every session verbatim —
meta, connects, contraindication, anchor concept, preparation, the nine timed steps with
every script / scan / practice / scenario / integration box, between-sessions, reflection —
plus Section 3.5 (the disclosure & distress protocol), the flag legend, the anatomy, the
closing exit and the crisis box. The console HTML is then ENCRYPTED (AES-256-GCM, key from
PBKDF2-SHA256 over the facilitator key, 200,000 rounds) and written into the page as one
base64 payload; the page decrypts it in the browser with WebCrypto. View-source shows
nothing readable. The key is never stored on the device — it is held for the tab only.

Change the key: re-run this script with a new --key and redeploy. There is no key in the
shipped file, only the salt and the ciphertext.
"""
import json, os, io, re, sys, base64, html, argparse, secrets
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
ap = argparse.ArgumentParser(); ap.add_argument("--key", required=True); ap.add_argument("--gate", required=True, help="the word that opens Sessions 7-12 of the participant workbook")
ap.add_argument("--book", default=os.path.join(HERE, "book6.json")); ap.add_argument("-o", default=os.path.join(ROOT, "aog-deploy", "adult-sessions.html"))
A = ap.parse_args()
D = json.load(io.open(A.book, encoding="utf-8"))
E = lambda s: html.escape(s, quote=True)

PHASES = {1:("I","Foundation","p1"),2:("I","Foundation","p1"),3:("I","Foundation","p1"),
          4:("II","Interior","p2"),5:("II","Interior","p2"),6:("II","Interior","p2"),
          7:("III","Repair","p3"),8:("III","Repair","p3"),9:("III","Repair","p3"),10:("III","Repair","p3"),
          11:("IV","Legacy","p4"),12:("IV","Legacy","p4")}

def flags_of(s):
    fl = s.get("flagline") or ""
    out = []
    if "★★" in fl: out.append('<span class="flag">★★</span>')
    elif "★" in fl: out.append('<span class="flag">★</span>')
    if "◆" in fl: out.append('<span class="flag gate">◆</span>')
    return " ".join(out)

def ps(lst, cls=""):
    return "".join('<p%s>%s</p>' % ((' class="%s"' % cls) if cls else "", E(t)) for t in lst)

def script_box(t):
    q = E(t)
    return '<div class="say"><span class="who">Facilitator script · say or paraphrase</span>%s</div>' % q

def scan_box(b):
    parts = b["parts"]
    rows = ""
    order = ["lead", "OBSERVE", "MAY INDICATE", "ACTION", "RESPONSE", "DO", "DO NOT"]
    for k in order:
        if k in parts:
            rows += '<div class="scrow"><b>%s</b><span>%s</span></div>' % ("" if k == "lead" else E(k.title() if k != "MAY INDICATE" else "May indicate"), E(parts[k]))
    return '<div class="scan"><span class="who">In-session scan · %s</span>%s</div>' % (E(b["label"]), rows)

def labeled(cls, who, label, lst):
    return '<div class="%s"><span class="who">%s%s</span>%s</div>' % (cls, E(who), (" · " + E(label)) if label else "", ps(lst))

def step_card(st):
    body = ""
    board = False
    for b in st["blocks"]:
        k = b["k"]
        if k == "p":
            t = b["t"]
            if re.match(r"^(Write (each )?on (the|a) (board|flipchart)|Write on the board)", t):
                body += '<p class="cue">%s</p>' % E(t); board = True; continue
            if board and (re.match(r"^([A-Z][A-Z \-/']{3,}:|\d\.\s|STEP \d\.|SIGN \d\.|MOVE \d\.|THE [A-Z]+:)", t)):
                body += '<p class="board">%s</p>' % E(t); continue
            board = False
            body += '<p>%s</p>' % E(t)
        elif k == "script": body += script_box(b["t"])
        elif k == "scan": body += scan_box(b)
        elif k == "practice": body += labeled("practice", "Practice", b["label"], b["ps"])
        elif k == "scenario": body += labeled("scenario", b["label"].replace("SCENARIO CARD · ", "Scenario card · "), "", b["ps"])
        elif k == "integration": body += labeled("integ", "Integration", "what was done · what was not done", b["ps"])
        else: body += labeled("box", b["label"], "", b["ps"])
    return ('<section class="step" data-step="%s" data-min="%s"><div class="sh"><span class="n">%s</span><span class="t">%s</span><span class="m">%s</span>'
            '<button type="button" class="done no-print" data-done="%s" aria-pressed="false">Done</button></div>%s</section>'
            % (E(st["n"]), E(st["min"]), E(st["n"]), E(st["title"].title()), E(st["min"]), E(st["n"]), body))

def session_html(s):
    n = s["n"]; ph = PHASES[n]
    meta_rows = "".join('<tr><th>%s</th><td>%s</td></tr>' % (E(k), E(v)) for k, v in s["meta"].items())
    out = '<article class="sess %s" id="s%d" data-n="%d" hidden>' % (ph[2], n, n)
    out += '<header class="sh2"><div class="k">Phase %s · %s</div><h2><span class="num">%02d</span> %s</h2><div class="fl">%s</div></header>' % (ph[0], ph[1], n, E(s["title"]), flags_of(s))
    if s.get("connects"): out += '<p class="connects"><b>Connects to the K–12 architecture.</b> %s</p>' % E(s["connects"])
    out += '<table class="meta">%s</table>' % meta_rows
    if s.get("contra"):
        out += '<div class="contra"><b>%s</b>%s</div>' % (E(s["contra"]["label"]), ps(s["contra"]["ps"]))
    if s.get("anchor"):
        out += '<div class="anchor"><span class="who">Anchor concept · post it · %s</span>%s</div>' % (E(s["anchor_title"]), ps(s["anchor"]))
    if s.get("prep"):
        out += '<div class="prep"><h3>Facilitator preparation — read before session</h3>%s</div>' % ps(s["prep"])
    out += '<h3 class="flowh">Session flow</h3><div class="prog no-print stepprog"><span class="bar"><i></i></span><span class="lab"></span><button type="button" class="btn small" data-act="clearsteps">Clear the ticks</button></div>'
    out += "".join(step_card(st) for st in s["steps"])
    if s.get("between"): out += '<div class="between"><span class="who">Between sessions · facilitator actions</span>%s</div>' % ps(s["between"])
    if s.get("reflection"): out += '<div class="refl"><span class="who">%s</span>%s</div>' % (E(s["reflection_title"].replace("FACILITATOR REFLECTION — ", "Facilitator reflection — ").title().replace("Of", "of").replace("End of Session", "End of Session")), ps(s["reflection"]))
    # the reflection log — Appendix E, on this device only
    out += '''<form class="log no-print-form" data-n="%d" onsubmit="return false">
<h3>Facilitator reflection log · Session %d</h3>
<p class="mut small">Appendix E, one entry per session. It saves on this device only, in this browser — nothing is sent anywhere. Bring it to weekly supervision; print it from here.</p>
<div class="lg2"><label>Date<input name="date" type="text" autocomplete="off"></label><label>Cohort #<input name="cohort" type="text" autocomplete="off"></label><label>Facilitator<input name="fac" type="text" autocomplete="off"></label><label>Co-facilitator<input name="cofac" type="text" autocomplete="off"></label></div>
<label>Attendance and any notable absences<textarea name="att"></textarea></label>
<fieldset><legend>Structural fidelity check</legend><div class="chk">%s</div></fieldset>
<label>In-session signals observed (by participant initial or code)<textarea name="signals"></textarea></label>
<label>Tier 2 or Tier 3 events (and resolution)<textarea name="tiers"></textarea></label>
<label>Touchpoints / individual contacts to schedule<textarea name="touch"></textarea></label>
<label>My own activation during this session — what was activated, what I'll do with it<textarea name="self"></textarea></label>
<label>One-sentence reflection: “I am carrying out of this session — ”<textarea name="one"></textarea></label>
<div class="lgact no-print"><span class="saved" aria-live="polite"></span><button type="button" class="btn" data-act="print">Print this session and its log</button><button type="button" class="btn" data-act="clear">Erase this log</button></div>
</form>''' % (n, n, "".join('<label class="cb"><input type="checkbox" name="fid_%d"> %s</label>' % (i, E(x)) for i, x in enumerate(
        ["Arrival & Grounding", "Opening Review", "Anchor Concept", "Direct Instruction", "Practice", "Discussion", "Integration", "Closing Exit", "Anchor Card posted", "Co-facilitator present full session"])))
    out += '</article>'
    return out

def reference_html():
    X = D["extra"]
    out = '<article class="sess ref" id="s0" data-n="0" hidden>'
    out += '<header class="sh2"><div class="k">Before you begin</div><h2>The console, and the rules it keeps</h2></header>'
    out += '<div class="card"><h3>How to read this page</h3><p>One session at a time, in program order — the menu above jumps between them. Everything here is the manual, verbatim: read the preparation before the session, not during; the italic scripts are the language to use or to start from; adapt the surrounding language, never the operative distinctions. The numbered steps are timed; the sequence is the intervention.</p><p>The reflection log at the foot of each session saves on this device only. Nothing on this page is sent anywhere.</p></div>'
    out += '<div class="card"><h3>Reading the risk flags</h3>%s</div>' % ps(X["flags"][:3])
    out += '<div class="card"><h3>Session anatomy — every session, the same order</h3><table class="tbl"><thead><tr><th>Component</th><th>Time</th><th>Purpose</th></tr></thead><tbody>%s</tbody></table><p class="small mut">Total 90 minutes; the co-facilitator debrief follows, 20 minutes minimum.</p></div>' % "".join('<tr><td>%s</td><td class="t">%s</td><td>%s</td></tr>' % tuple(E(c) for c in r) for r in X["anatomy"])
    if X.get("closing_exit"): out += '<div class="say"><span class="who">The closing exit · the same words at every session</span>%s</div>' % E(X["closing_exit"])
    out += ('<div class="card" id="wbcard"><h3>The participant workbook</h3>'
            '<p>Participants write in <b>/adult/workbook</b> on their own phone. It saves on their device. Sessions 7–12 open with a word you give in the room, after the re-screen.</p>'
            '<p class="gateword">The word for Sessions 7–12: <b>%s</b></p>'
            '<p class="small mut">Say it aloud in the room. Do not post it or send it ahead.</p>'
            '<h4>Your group&#8217;s link</h4><p class="small">To let participants send pages to you, paste your Sheet&#8217;s Web App address and its write key. The link carries them; nothing is sent from here. Without them, the workbook simply has no Send button.</p>'
            '<label class="lk">Web App address<input type="text" id="lkUrl" autocomplete="off" placeholder="https://script.google.com/macros/s/&#8230;/exec"></label>'
            '<label class="lk">Write key<input type="text" id="lkKey" autocomplete="off"></label>'
            '<div class="row" style="margin-top:10px"><button type="button" class="btn primary" data-act="mklink">Make the link</button><button type="button" class="btn" data-act="cplink" hidden>Copy</button></div>'
            '<p class="lkout" id="lkOut" aria-live="polite"></p></div>') % E(A.gate)
    # 3.5 whole
    out += '<div class="card" id="protocol"><h3>3.5 Disclosure &amp; distress protocol</h3>'
    for b in X["s35"]:
        if b["k"] == "h":
            if not b["t"].startswith("3.5"): out += '<h4>%s</h4>' % E(b["t"])
        elif b["k"] == "p": out += '<p>%s</p>' % E(b["t"])
        else: out += '<div class="contra"><b>%s</b>%s</div>' % (E(b["label"]), ps(b["ps"]))
    out += '</div>'
    out += '</article>'
    return out

console = reference_html() + "".join(session_html(s) for s in D["sessions"])

# ── encrypt ────────────────────────────────────────────────────────────────
salt = secrets.token_bytes(16); iv = secrets.token_bytes(12)
kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=200000)
key = kdf.derive(A.key.encode("utf-8"))
ct = AESGCM(key).encrypt(iv, console.encode("utf-8"), None)
b64 = lambda b: base64.b64encode(b).decode("ascii")
payload = json.dumps({"v": 1, "salt": b64(salt), "iv": b64(iv), "ct": b64(ct), "it": 200000})

shell = io.open(os.path.join(HERE, "sessions_shell.html"), encoding="utf-8").read()
assert "@@PAYLOAD@@" in shell and shell.count("@@PAYLOAD@@") == 1
page = shell.replace("@@PAYLOAD@@", payload)
io.open(A.o, "w", encoding="utf-8").write(page)
print("built", A.o, len(page), "bytes; console", len(console), "chars ->", len(ct), "bytes encrypted")
