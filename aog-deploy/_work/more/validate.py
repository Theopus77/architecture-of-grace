#!/usr/bin/env python3
"""AOG-MORE-V1 — check one unit's Spanish and its three ways in against the English unit.

    python3 _work/more/validate.py <course> <N>        (from aog-deploy/)

Prints OK with counts, or every problem found (exit 1). The rules are in _work/more/SPEC.md."""
import json, re, sys
from pathlib import Path

WORK = Path(__file__).resolve().parent.parent
LV_ONLY = {"spa"}                                    # the Spanish course: levels only, no Spanish
PARA = {"k-2": (60, 300), "3-5": (100, 550), "6-8": (140, 850), "9-10": (180, 950), "11-12": (180, 950), "adult": (180, 950)}
EN_SW = re.compile(r"\b(the|and|of|is|are|was|with|that|this|they|their|from|have|what|which)\b", re.I)
ES_SW = re.compile(r"\b(el|la|los|las|de|del|que|y|es|son|en|un|una|por|para|con|su|sus|se|lo)\b", re.I)
MARK = re.compile(r"\*([^*]+)\*")

errs, warn = [], []
def E(p, m): errs.append("%s: %s" % (p, m))

def txt(v, p, lo=1, hi=100000):
    if not isinstance(v, str) or not v.strip(): E(p, "must be a non-empty string"); return ""
    if re.search(r"<[a-zA-Z/]", v): E(p, "no HTML tags")
    if re.search(r"\b(TODO|TBD)\b", v) or re.search(r"lorem ipsum", v, re.I): E(p, "placeholder text")
    if len(v) < lo: E(p, "too short (%d < %d chars)" % (len(v), lo))
    if len(v) > hi: E(p, "too long (%d > %d chars)" % (len(v), hi))
    return v

def plist(v, p, n=None, lo=1, hi=None, plo=1, phi=100000):
    if not isinstance(v, list): E(p, "must be a list of paragraphs"); return []
    if n is not None and len(v) != n: E(p, "needs exactly %d (has %d)" % (n, len(v)))
    if hi is not None and not (lo <= len(v) <= hi): E(p, "needs %d–%d paragraphs (has %d)" % (lo, hi, len(v)))
    for i, x in enumerate(v): txt(x, "%s[%d]" % (p, i), plo, phi)
    return [x for x in v if isinstance(x, str)]

def marks(paras): return [m.lower() for p in paras for m in MARK.findall(p)]
def fold(s):
    import unicodedata
    return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")
def stem_eq(a, b):
    """a key word and its form in the text: one holds the other, or they share a long start (generación / generaciones)"""
    a, b = fold(a), fold(b)
    if a in b or b in a: return True
    n = 0
    while n < min(len(a), len(b)) and a[n] == b[n]: n += 1
    return n >= 5 and n >= 0.7 * min(len(a), len(b))
def matched(m, words):
    return any(stem_eq(m, w) for w in words)

ES_TEXT = []
def es(v):
    if isinstance(v, str): ES_TEXT.append(v)
    elif isinstance(v, list): [es(x) for x in v]
    elif isinstance(v, dict): [es(x) for x in v.values()]

def mc_es(q, en, p):
    if not isinstance(q, dict): E(p, "must be {q, choices, why}"); return
    txt(q.get("q"), p + ".q", 4, 400)
    ch = q.get("choices")
    if not (isinstance(ch, list) and len(ch) == len(en["choices"])): E(p + ".choices", "needs exactly %d choices, same order as English" % len(en["choices"]))
    else:
        for i, c in enumerate(ch): txt(c, "%s.choices[%d]" % (p, i), 1, 220)
        if len(set(ch)) != len(ch): E(p + ".choices", "two choices are the same")
    txt(q.get("why"), p + ".why", 4, 420)
    if "a" in q and q["a"] != en["a"]: E(p + ".a", "leave out a (the answer stays where English has it)")
    es([q.get("q"), q.get("choices"), q.get("why")])

def words_es(ws, en, p):
    if not (isinstance(ws, list) and len(ws) == len(en)): E(p, "needs exactly %d words, same order" % len(en)); return []
    for i, w in enumerate(ws):
        if not isinstance(w, dict): E("%s[%d]" % (p, i), "must be {w, d}"); continue
        txt(w.get("w"), "%s[%d].w" % (p, i), 1, 80); txt(w.get("d"), "%s[%d].d" % (p, i), 4, 300)
        es([w.get("d")])
    return [w.get("w", "") for w in ws if isinstance(w, dict)]

def ratio(a, b): return sum(map(len, a)) / max(1, sum(map(len, b)))

def check_unit(cid, n):
    lvonly = cid in LV_ONLY
    U = json.load(open(WORK / cid / ("u%d.json" % n), encoding="utf-8"))
    band = U.get("band") or "6-8"
    plo, phi = PARA.get(band, PARA["6-8"])
    out = WORK / "more" / cid
    stats = dict(lessons=0, chapters=0, missing=[])
    if not lvonly:
        hp = out / ("u%d.head.json" % n)
        if not hp.exists(): stats["missing"].append(hp.name)
        else:
            try: H = json.load(open(hp, encoding="utf-8"))
            except Exception as ex: E(hp.name, "not valid JSON: %s" % ex); H = None
            if H is not None:
                txt(H.get("title"), "head.title", 2, 140); txt(H.get("years"), "head.years", 1, 80)
                plist(H.get("intro"), "head.intro", n=len(U["intro"]))
                txt(H.get("bigQuestion"), "head.bigQuestion", 8, 300)
                tl = H.get("timeline")
                if not (isinstance(tl, list) and len(tl) == len(U["timeline"])): E("head.timeline", "needs exactly %d moments" % len(U["timeline"]))
                else:
                    for i, t in enumerate(tl): txt((t or {}).get("t") if isinstance(t, dict) else None, "head.timeline[%d].t" % i, 4, 240)
                W = H.get("wrap") or {}
                words_es(W.get("words"), U["wrap"]["words"], "head.wrap.words")
                tst = W.get("test")
                if not (isinstance(tst, list) and len(tst) == len(U["wrap"]["test"])): E("head.wrap.test", "needs exactly %d questions" % len(U["wrap"]["test"]))
                else:
                    for i, q in enumerate(tst): mc_es(q, U["wrap"]["test"][i], "head.wrap.test[%d]" % i)
                wr = W.get("write") or {}
                txt(wr.get("prompt"), "head.wrap.write.prompt", 8, 700)
                tips = wr.get("tips")
                if not (isinstance(tips, list) and len(tips) == len(U["wrap"]["write"]["tips"])): E("head.wrap.write.tips", "needs exactly %d tips" % len(U["wrap"]["write"]["tips"]))
                es([H.get("title"), H.get("intro"), H.get("bigQuestion"), tl, W.get("write")])
    for c in U["chapters"]:
        cp = out / ("u%d.ch%d.json" % (n, c["n"]))
        if not cp.exists(): stats["missing"].append(cp.name); continue
        try: X = json.load(open(cp, encoding="utf-8"))
        except Exception as ex: E(cp.name, "not valid JSON: %s" % ex); continue
        P = "ch%d" % c["n"]
        stats["chapters"] += 1
        if not lvonly:
            for k in ("title", "years", "bigQuestion"): txt(X.get(k), "%s.%s" % (P, k), 2, 300)
            st = X.get("story") or {}
            txt(st.get("title"), P + ".story.title", 2, 160); txt(st.get("kicker"), P + ".story.kicker", 4, 320)
            plist(st.get("paragraphs"), P + ".story.paragraphs", n=len(c["story"]["paragraphs"]))
            txt(st.get("think"), P + ".story.think", 4, 400)
            es([X.get("title"), X.get("bigQuestion"), st])
            rv = X.get("review")
            if not (isinstance(rv, list) and len(rv) == len(c["review"])): E(P + ".review", "needs exactly %d questions" % len(c["review"]))
            else:
                for i, q in enumerate(rv): mc_es(q, c["review"][i], "%s.review[%d]" % (P, i))
        secs = X.get("sections")
        if not (isinstance(secs, list) and len(secs) == len(c["sections"])): E(P + ".sections", "needs exactly %d sections" % len(c["sections"])); continue
        num = 0
        for si, (s, se) in enumerate(zip(secs, c["sections"])):
            SP = "%s.sections[%d]" % (P, si)
            if not lvonly: txt(s.get("title"), SP + ".title", 2, 140); es([s.get("title")])
            ls = s.get("lessons")
            if not (isinstance(ls, list) and len(ls) == len(se["lessons"])): E(SP + ".lessons", "needs exactly %d lessons" % len(se["lessons"])); continue
            for li, (l, le) in enumerate(zip(ls, se["lessons"])):
                num += 1
                LP = "%s lesson %d.%d" % (P, c["n"], num)
                stats["lessons"] += 1
                orig = le["reading"]
                ew = [w["w"] for w in le.get("words", [])]
                om = [m for m in marks(orig) if matched(m, ew)]   # a starred word with no key word of its own is only emphasis
                # Shorter
                sh = plist(l.get("short"), LP + ".short", lo=1, hi=min(2, len(orig)), plo=min(plo, 40), phi=phi)
                if sh:
                    r = ratio(sh, orig)
                    if not (0.38 <= r <= 0.67): E(LP + ".short", "should be 40–65%% of the original's length (is %d%%)" % round(100 * r))
                    sm = marks(sh)
                    for m in om:
                        if not any(stem_eq(m, x) for x in sm): E(LP + ".short", "mark the key word *%s* as the original does" % m)
                    for m in sm:
                        if not matched(m, ew): E(LP + ".short", "*%s* is not one of this lesson's key words" % m)
                # More
                mo = plist(l.get("more"), LP + ".more", lo=1, hi=2, plo=plo, phi=phi)
                if mo:
                    r = ratio(mo, orig)
                    if not (0.23 <= r <= 0.82): E(LP + ".more", "should be 25–80%% of the original's length (is %d%%)" % round(100 * r))
                    if marks(mo): E(LP + ".more", "no *asterisk* words in More")
                    if mo[0][:60] == orig[0][:60]: E(LP + ".more", "write only the new paragraphs, not the original again")
                if lvonly: continue
                # Spanish
                for k, lo, hi in (("title", 2, 160), ("mainIdea", 4, 400)): txt(l.get(k), "%s.%s" % (LP, k), lo, hi)
                rd = plist(l.get("reading"), LP + ".reading", n=len(orig))
                if rd:
                    r = ratio(rd, orig)
                    if not (0.75 <= r <= 1.7): E(LP + ".reading", "Spanish reading is %d%% of the English; translate it whole, adding nothing" % round(100 * r))
                sw = words_es(l.get("words"), le.get("words", []), LP + ".words")
                if rd:
                    rm = marks(rd)
                    if len(set(rm)) not in (len(set(om)), len(set(marks(orig)))): E(LP + ".reading", "mark the same key words the English marks (%d), with *asterisks*" % len(set(om)))
                    if len([m for m in set(rm) if matched(m, sw)]) < len(set(om)): E(LP + ".reading", "each starred key word must match a Spanish key word in words")
                lk, lke = l.get("look") or {}, le["look"]
                txt(lk.get("title"), LP + ".look.title", 2, 200); txt(lk.get("prompt"), LP + ".look.prompt", 4, 500)
                if lke.get("type") == "data":
                    rows = lk.get("rows")
                    if not (isinstance(rows, list) and len(rows) == len(lke["rows"]) and all(isinstance(x, str) and x.strip() for x in rows)):
                        E(LP + ".look.rows", "needs the %d row labels as a list of strings" % len(lke["rows"]))
                    if lke.get("unit") and not lk.get("unit"): E(LP + ".look.unit", "translate the unit")
                else:
                    txt(lk.get("text"), LP + ".look.text", 4, 2400)
                ck = l.get("check")
                if not (isinstance(ck, list) and len(ck) == len(le["check"])): E(LP + ".check", "needs exactly %d questions" % len(le["check"]))
                else:
                    for i, q in enumerate(ck): mc_es(q, le["check"][i], "%s.check[%d]" % (LP, i))
                she = plist(l.get("short_es"), LP + ".short_es", n=len(sh) or None, plo=min(plo, 40), phi=int(phi * 1.3))
                moe = plist(l.get("more_es"), LP + ".more_es", n=len(mo) or None, plo=plo, phi=int(phi * 1.3))
                if she and marks(sh) and len(set(marks(she))) != len(set(marks(sh))): E(LP + ".short_es", "mark the same key words your English Shorter marks")
                for m in marks(she):
                    if not matched(m, sw): E(LP + ".short_es", "*%s* does not match a Spanish key word" % m)
                es([l.get("title"), l.get("mainIdea"), rd, lk.get("text"), lk.get("prompt"), she, moe])
    if not lvonly and ES_TEXT:
        blob = " ".join(ES_TEXT)
        en_n, es_n = len(EN_SW.findall(blob)), len(ES_SW.findall(blob))
        if es_n < 4 * max(en_n, 1): E("Spanish", "much of the text reads as English (%d English to %d Spanish small words)" % (en_n, es_n))
    return stats

if __name__ == "__main__":
    cid, n = sys.argv[1], int(sys.argv[2])
    st = check_unit(cid, n)
    if st["missing"]: errs.append("still to write: " + ", ".join(st["missing"]))
    if errs:
        print("\n".join(errs[:120]))
        if len(errs) > 120: print("… and %d more" % (len(errs) - 120))
        sys.exit(1)
    print("OK %s u%d: %d chapters, %d lessons" % (cid, n, st["chapters"], st["lessons"]))
