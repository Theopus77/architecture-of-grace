"""AOG-DD-HIST-V1 (2026-09-30) — Daily Drafts banks for the history books (Sports History `spt`,
The Measured Step `mar`), drawn from the books' own reviewed lessons so the drafts never state a
fact the course does not teach. Each band gets ten strands; a strand is one section of the course
(its lesson checks as multiple choice, its key words as vocabulary). K–2 lesson checks have two
wrong choices; the bank needs three, so each K–2 question gets one more plain wrong choice from
the book module (EXTRA). Bands: k2 = the K–2 units, 35 = 3–5, 68 = 6–8, 912 = ten sections spread over 9–12, adult = ten more 11–12 sections."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
BANDMAP = {'k2': 'k-2', '35': '3-5', '68': '6-8', '912': '9-10', 'adult': '11-12'}

def sections(cid, band):
    out = []
    for n in range(1, 40):
        p = os.path.join(HERE, '..', cid, 'u%d.json' % n)
        if not os.path.exists(p): break
        u = json.load(open(p, encoding='utf-8'))
        if u.get('band') != BANDMAP[band]: continue
        for c in u['chapters']:
            for s in c['sections']: out.append(s)
    return out

def pick(secs, k=10):
    if len(secs) <= k: return secs
    return [secs[round(i * (len(secs) - 1) / (k - 1))] for i in range(k)]

def chosen(cid):
    out = {b: pick(sections(cid, b)) for b in ('k2', '35', '68')}
    hs = sections(cid, '912') + sections(cid, 'adult')
    out['912'] = pick(hs)
    used = {x['title'] for x in out['912']}
    out['adult'] = pick([x for x in sections(cid, 'adult') if x['title'] not in used])
    return out

def make(cid, ES, EXTRA):
    bands = {}
    ch = chosen(cid)
    for band in BANDMAP:
        strands, seen = [], set()
        for s in ch[band]:
            items = []
            for l in s['lessons']:
                for c in l['check']:
                    q = c['q'].strip()
                    if q in seen: continue
                    a = c['choices'][c['a']]; w = [x for i, x in enumerate(c['choices']) if i != c['a']]
                    if len(w) == 2:
                        if q not in EXTRA: continue
                        w.append(EXTRA[q])
                    seen.add(q); items.append(['mc', q, a, w])
            for l in s['lessons']:
                for wd in l.get('words', [])[:1]:
                    if wd['w'] in seen: continue
                    seen.add(wd['w']); items.append(['voc', wd['w'], wd['d'][0].upper() + wd['d'][1:] + ('' if wd['d'].endswith('.') else '.')])
            strands.append((s['title'], ES[s['title']], items))
        bands[band] = strands
    return bands

if __name__ == '__main__':
    import sys
    cid = sys.argv[1]
    ch = chosen(cid)
    for band in BANDMAP:
        print('==', band)
        for s in ch[band]:
            print('  ', s['title'])
            if band == 'k2':
                for l in s['lessons']:
                    for c in l['check']: print('      Q', repr(c['q']), '=>', c['choices'][c['a']], [x for i, x in enumerate(c['choices']) if i != c['a']])
