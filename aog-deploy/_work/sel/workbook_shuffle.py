#!/usr/bin/env python3
"""The companion workbooks keyed the right answer as A on nearly every question. This moves
the right answer to a varying slot (a fixed rotation, so the result is stable), relabels the
letters, and re-letters the "why" note and the printed answer key to match. Words unchanged.
Usage: python3 _work/sel/workbook_shuffle.py room-18-workbook.html [more files]  (or --dry)"""
import re, sys
ROT = "BACADBACDBADCABD"      # where the right answer lands, question by question
def shuffle(html):
    out = []; pos = 0; qi = 0; keyfix = []
    for m in re.finditer(r'<div class="q" id="([^"]+)">(.*?)<div class="why" hidden><b>([A-D])\.</b>', html, flags=re.S):
        qid, body, oldl = m.groups()
        om = re.search(r'<div class="opts">(.*?)</div>', body, flags=re.S)
        opts = re.findall(r'<button type="button" class="opt" data-ok="([01])"><span class="ol">([A-D])</span>(.*?)</button>', om.group(1), flags=re.S)
        if len(opts) < 2 or sum(o[0] == "1" for o in opts) != 1: continue
        right = [i for i, o in enumerate(opts) if o[0] == "1"][0]
        target = min("ABCD".index(ROT[qi % len(ROT)]), len(opts) - 1); qi += 1
        order = list(range(len(opts)))
        order.remove(right); order.insert(target, right)
        new = "\n".join('<button type="button" class="opt" data-ok="%s"><span class="ol">%s</span>%s</button>' % (opts[i][0], "ABCD"[k], opts[i][2]) for k, i in enumerate(order))
        newl = "ABCD"[target]
        nbody = body[:om.start(1)] + new + body[om.end(1):]
        out.append(html[pos:m.start()]); out.append('<div class="q" id="%s">%s<div class="why" hidden><b>%s.</b>' % (qid, nbody, newl)); pos = m.end()
        keyfix.append((qid, newl))
    out.append(html[pos:]); html = "".join(out)
    # the printed answer key: one <ol class="key"> per unit, <li><b>X</b> in question order
    blocks = list(re.finditer(r'<ol class="key">(.*?)</ol>', html, flags=re.S)); i = 0; res = []; p = 0
    for b in blocks:
        lis = re.findall(r'<li><b>[A-D]</b>', b.group(1)); seg = b.group(1)
        def rep(mm):
            nonlocal i
            l = keyfix[i][1] if i < len(keyfix) else mm.group(1); i += 1
            return '<li><b>%s</b>' % l
        seg2 = re.sub(r'<li><b>([A-D])</b>', rep, seg)
        res.append(html[p:b.start(1)]); res.append(seg2); p = b.end(1)
    res.append(html[p:]); html = "".join(res)
    return html, keyfix, i
if __name__ == "__main__":
    dry = "--dry" in sys.argv
    for f in [a for a in sys.argv[1:] if not a.startswith("--")]:
        s = open(f, encoding="utf8").read(); t, kf, nk = shuffle(s)
        from collections import Counter
        print(f, len(kf), "questions re-keyed", Counter(l for _, l in kf), "key entries re-lettered:", nk)
        if not dry: open(f, "w", encoding="utf8").write(t)
