#!/usr/bin/env python3
"""Validate one unit file for its band:  python3 validate.py u3.json
Prints OK with counts, or every problem found (exit 1). Same shape as the
U.S. History validator, with the LEVEL rules from SPEC.md."""
import json, sys, re, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from outline import UNITS, BANDS

LEVELS = {
 "k2":  dict(read=(2,3), para=(80,260),  words=(1,3), choices=3, story=(3,4), sp=(120,400), intro=(120,400), main=120, review=6, test=10, wwords=8),
 "35":  dict(read=(3,3), para=(150,500), words=(2,4), choices=4, story=(4,6), sp=(150,600), intro=(150,600), main=220, review=8, test=15, wwords=12),
 "68":  dict(read=(3,4), para=(180,800), words=(2,5), choices=4, story=(4,6), sp=(200,900), intro=(200,900), main=220, review=8, test=15, wwords=12),
 "hs":  dict(read=(3,4), para=(250,900), words=(3,5), choices=4, story=(4,6), sp=(200,900), intro=(200,900), main=220, review=8, test=15, wwords=12),
 "hs2": dict(read=(3,4), para=(250,900), words=(3,6), choices=4, story=(4,6), sp=(200,900), intro=(200,900), main=220, review=8, test=15, wwords=12),
}

errs = []
def E(path, msg): errs.append(f"{path}: {msg}")

def s(v, path, lo=1, hi=100000):
    if not isinstance(v, str) or not v.strip(): E(path, "must be a non-empty string"); return
    if len(v) < lo: E(path, f"too short ({len(v)} < {lo} chars)")
    if len(v) > hi: E(path, f"too long ({len(v)} > {hi} chars)")
    if re.search(r"<[a-zA-Z/]", v): E(path, "no HTML tags; plain text (use *word* for key words only in reading)")

def mc(q, path, nch):
    if not isinstance(q, dict): E(path, "must be an object"); return
    s(q.get("q"), path + ".q", 10, 300)
    ch = q.get("choices")
    if not (isinstance(ch, list) and len(ch) == nch): E(path, f"choices must be a list of exactly {nch}"); ch = []
    for i, c in enumerate(ch): s(c, f"{path}.choices[{i}]", 1, 160)
    if len(set(ch)) != len(ch): E(path, "duplicate choices")
    a = q.get("a")
    if not (isinstance(a, int) and 0 <= a < max(nch, 1)): E(path, f"a must be the index 0-{nch-1} of the right choice")
    s(q.get("why"), path + ".why", 10, 300)

def words(ws, path, lo, hi):
    if not (isinstance(ws, list) and lo <= len(ws) <= hi): E(path, f"need {lo}-{hi} words"); return
    for i, w in enumerate(ws):
        if not isinstance(w, dict): E(f"{path}[{i}]", "must be {w,d}"); continue
        s(w.get("w"), f"{path}[{i}].w", 2, 60); s(w.get("d"), f"{path}[{i}].d", 10, 220)

u = json.load(open(sys.argv[1]))
n = u.get("n")
U = next((x for x in UNITS if x["n"] == n), None)
if not U: print("unit n not in outline"); sys.exit(1)
L = LEVELS[next(b for b in BANDS if b["id"] == U["band"])["level"]]
nch = L["choices"]
nlessons = 0; nq = 0
s(u.get("title"), "title"); s(u.get("years"), "years")
intro = u.get("intro")
if not (isinstance(intro, list) and 2 <= len(intro) <= 3): E("intro", "2-3 paragraphs")
else:
    for i, p in enumerate(intro): s(p, f"intro[{i}]", *L["intro"])
s(u.get("bigQuestion"), "bigQuestion", 20, 200)
tl = u.get("timeline")
if not (isinstance(tl, list) and 8 <= len(tl) <= 12): E("timeline", "8-12 moments")
else:
    for i, t in enumerate(tl):
        s(t.get("y"), f"timeline[{i}].y", 1, 12); s(t.get("t"), f"timeline[{i}].t", 10, 140)
chs = u.get("chapters") or []
if not chs: E("chapters", "missing")
if [c.get("n") for c in chs] != [c["n"] for c in U["chapters"]]: E("chapters", f"expected chapter numbers {[c['n'] for c in U['chapters']]}")
for ci, c in enumerate(chs):
    P = f"chapters[{ci}]"
    for k, lo, hi in (("title", 3, 80), ("years", 3, 40), ("bigQuestion", 20, 200)): s(c.get(k), f"{P}.{k}", lo, hi)
    st = c.get("story") or {}
    s(st.get("title"), P + ".story.title", 5, 90); s(st.get("kicker"), P + ".story.kicker", 20, 200)
    ps = st.get("paragraphs")
    if not (isinstance(ps, list) and L["story"][0] <= len(ps) <= L["story"][1]): E(P + ".story.paragraphs", f"{L['story'][0]}-{L['story'][1]} paragraphs")
    else:
        for i, p in enumerate(ps): s(p, f"{P}.story.paragraphs[{i}]", *L["sp"])
    s(st.get("think"), P + ".story.think", 20, 250)
    secs = c.get("sections") or []
    if not (3 <= len(secs) <= 4): E(P + ".sections", "3-4 sections")
    for si, sec in enumerate(secs):
        SP = f"{P}.sections[{si}]"
        s(sec.get("title"), SP + ".title", 3, 70)
        ls = sec.get("lessons") or []
        if not (2 <= len(ls) <= 4): E(SP + ".lessons", "2-4 lessons")
        for li, l in enumerate(ls):
            LP = f"{SP}.lessons[{li}]"; nlessons += 1
            s(l.get("title"), LP + ".title", 3, 70)
            s(l.get("mainIdea"), LP + ".mainIdea", 25, L["main"])
            rd = l.get("reading")
            if not (isinstance(rd, list) and L["read"][0] <= len(rd) <= L["read"][1]): E(LP + ".reading", f"{L['read'][0]}-{L['read'][1]} paragraphs")
            else:
                for i, p in enumerate(rd): s(p, f"{LP}.reading[{i}]", *L["para"])
            words(l.get("words"), LP + ".words", *L["words"])
            lk = l.get("look") or {}
            t = lk.get("type")
            if t not in ("source", "data", "think"): E(LP + ".look.type", "source | data | think")
            s(lk.get("title"), LP + ".look.title", 4, 90)
            s(lk.get("prompt"), LP + ".look.prompt", 15, 260)
            if t == "source":
                s(lk.get("text"), LP + ".look.text", 20, 520); s(lk.get("cite"), LP + ".look.cite", 8, 200)
                if lk.get("paraphrase") not in (True, False): E(LP + ".look.paraphrase", "true or false required on sources")
            elif t == "data":
                rows = lk.get("rows")
                if not (isinstance(rows, list) and 3 <= len(rows) <= 8): E(LP + ".look.rows", "3-8 [label, number] rows")
                else:
                    for i, r in enumerate(rows):
                        if not (isinstance(r, list) and len(r) == 2 and isinstance(r[0], str) and isinstance(r[1], (int, float)) and not isinstance(r[1], bool)): E(f"{LP}.look.rows[{i}]", "[label, number]")
                s(lk.get("unit"), LP + ".look.unit", 1, 40); s(lk.get("cite"), LP + ".look.cite", 8, 200)
            elif t == "think":
                s(lk.get("text"), LP + ".look.text", 60, 600)
            chk = l.get("check")
            if not (isinstance(chk, list) and len(chk) == 3): E(LP + ".check", "exactly 3 questions")
            else:
                for i, q in enumerate(chk): mc(q, f"{LP}.check[{i}]", nch); nq += 1
    rv = c.get("review")
    if not (isinstance(rv, list) and len(rv) == L["review"]): E(P + ".review", f"exactly {L['review']} questions")
    else:
        for i, q in enumerate(rv): mc(q, f"{P}.review[{i}]", nch); nq += 1
w = u.get("wrap") or {}
words(w.get("words"), "wrap.words", L["wwords"], L["wwords"])
t = w.get("test")
if not (isinstance(t, list) and len(t) == L["test"]): E("wrap.test", f"exactly {L['test']} questions")
else:
    for i, q in enumerate(t): mc(q, f"wrap.test[{i}]", nch); nq += 1
wr = w.get("write") or {}
s(wr.get("prompt"), "wrap.write.prompt", 40, 400)
tips = wr.get("tips")
if not (isinstance(tips, list) and 3 <= len(tips) <= 5): E("wrap.write.tips", "3-5 tips")
else:
    for i, p in enumerate(tips): s(p, f"wrap.write.tips[{i}]", 10, 200)

from collections import Counter
pos = Counter()
def walk(x):
    if isinstance(x, dict):
        if "choices" in x and isinstance(x.get("a"), int): pos[x["a"]] += 1
        for v in x.values(): walk(v)
    elif isinstance(x, list):
        for v in x: walk(v)
walk(u)
tot = sum(pos.values()) or 1
share = 1 / nch
for k in range(nch):
    if pos[k] / tot > share + 0.11 or pos[k] / tot < share - 0.11: E("answers", f"right-answer positions unbalanced {dict(pos)} — aim for ~{int(share*100)}% each")

if errs:
    print(f"{len(errs)} PROBLEM(S):"); [print(" -", e) for e in errs[:80]]; sys.exit(1)
print(f"OK · unit {u['n']} · {len(chs)} chapters · {nlessons} lessons · {nq} questions · positions {dict(pos)}")
