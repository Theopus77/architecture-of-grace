#!/usr/bin/env python3
"""AOG-R36-NOVEL-V1 — Book 3 (Room 36) for the reader, one chapter at a time, in English and Spanish.

    python3 _work/sel/r36/build_novel.py        (from aog-deploy/; after the novel, its Spanish or the pairings change)

Reads novels/room-36.json (the book, unchanged), novels/room-36.es/s<i>.json (the Spanish sections, made by the
translators and checked by novel_es_check.py) and _work/sel/r36/pairs.json (which lessons each chapter goes with), and
writes novels/room-36/index.json (titles, the Spanish titles that exist, the heavy-chapter notes, the lessons) and
novels/room-36/s<i>.json (one section's English blocks). aog-novel.js reads them when the page's <main> carries
data-split; a phone then loads one chapter (about 25 KB) instead of the whole book."""
import json, re
from pathlib import Path

D = Path(__file__).resolve().parents[3]
SRC = D / "novels" / "room-36.json"
ES = D / "novels" / "room-36.es"
OUT = D / "novels" / "room-36"
PAIRS = Path(__file__).resolve().parent / "pairs.json"

# The chapters the curriculum flags (room-36-curriculum.html: ★ HIGH RISK / ★★ HIGHEST RISK), by section index.
NOTE = {
    14: ("Ch. 12 · Rewriting the Script", "Cap. 12 · Reescribir el guion"),
    18: ("Ch. 15 · Forgiveness ≠ Trust", "Cap. 15 · Perdonar no es confiar"),
    19: ("Ch. 16 · The Letter of Release", "Cap. 16 · La Carta de Liberación"),
}
NOTE_EN = ("This chapter touches heavy feelings. Read it with a trusted adult nearby, and take a break whenever you need one. "
           "If you are having a hard time, talk to a trusted adult, call or text 988, or text HOME to 741741.")
NOTE_ES = ("Este capítulo toca sentimientos difíciles. Léelo con un adulto de confianza cerca y toma un descanso cuando lo necesites. "
           "Si estás pasando un momento difícil, habla con un adulto de confianza, llama o envía un mensaje al 988, o escribe HOME al 741741.")

def lesson_titles():
    """u1l1 → (code, English title) from the lessons page's own headings."""
    s = (D / "room-36-lessons.html").read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r'UNIT (\d) · LESSON (\d)[^<]*</[^>]+>\s*<h[23][^>]*>([^<]+)<', s):
        out["u%sl%s" % (m.group(1), m.group(2))] = ("U%s·L%s" % (m.group(1), m.group(2)), m.group(3).strip())
    return out

def main():
    book = json.load(open(SRC, encoding="utf-8"))
    OUT.mkdir(exist_ok=True)
    pairs = json.load(open(PAIRS, encoding="utf-8")) if PAIRS.exists() else {}
    titles = lesson_titles()
    with_ = {}
    for lid, v in pairs.items():
        for ch in (v.get("ch") or []):
            with_.setdefault(int(ch), []).append(lid)
    secs, es_secs, nch = [], [], 0
    for i, s in enumerate(book["sections"]):
        e = {"kind": s["kind"], "title": s["title"], "kicker": s.get("kicker", "")}
        if s["kind"] == "chapter":
            nch += 1
            ls = sorted(with_.get(nch, []))
            if ls:
                e["with"] = [{"id": l, "code": titles.get(l, (l.upper(), ""))[0], "t": titles.get(l, ("", ""))[1]} for l in ls]
        if i in NOTE: e["note"] = {"en": NOTE_EN, "es": NOTE_ES}
        secs.append(e)
        (OUT / ("s%d.json" % i)).write_text(json.dumps({"blocks": s["blocks"]}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        ep = ES / ("s%d.json" % i)
        if ep.exists():
            x = json.load(open(ep, encoding="utf-8"))
            es_secs.append({"title": x.get("title", ""), "kicker": x.get("kicker", "")})
        else:
            es_secs.append(None)
    idx = {k: book[k] for k in ("key", "room", "title", "band", "author", "pdf")}
    idx["sections"] = secs
    idx["es"] = {"title": "El año de las dos voces", "room": "Salón 36", "sections": es_secs}
    (OUT / "index.json").write_text(json.dumps(idx, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("index: %d sections, %d in Spanish, %d chapters paired with lessons" % (len(secs), sum(1 for x in es_secs if x), len(with_)))

if __name__ == "__main__":
    main()
