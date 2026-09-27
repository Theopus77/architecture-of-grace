#!/usr/bin/env python3
"""Daily Drafts: Hindu Texts, Buddhist Texts, Chinese Classics.
Writes the banks into aog-deploy/daily-drops.html between the AOG-DD-EASTTEXTS markers,
just before `var SUBJ={`. Same shape as bible/quran/talmud: bands k2, 35, 68, 912, adult;
ten strands per band; items [mc|tf|voc|open]. Re-run after editing hin.py / bud.py / chn.py."""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import hin, bud, chn
PAGE = os.path.join(HERE, '..', '..', 'daily-drops.html')
SUBJECTS = [('hin', 'HIN', hin), ('bud', 'BUD', bud), ('chn', 'CHN', chn)]
GRADES = [('K', 'k2'), ('1', 'k2'), ('2', 'k2'), ('3', '35'), ('4', '35'), ('5', '35'),
          ('6', '68'), ('7', '68'), ('8', '68'), ('9-10', '912'), ('11-12', '912'), ('adult', 'adult')]
BEGIN, END = '/* ══ AOG-DD-EASTTEXTS-V1 BEGIN', '/* ══ AOG-DD-EASTTEXTS-V1 END ══ */'

def check(pref, band, strands):
    errs = []
    if len(strands) != 10: errs.append(f'{pref}.{band}: {len(strands)} strands')
    seen = set()
    for i, (en, es, items) in enumerate(strands):
        if not en.strip() or not es.strip(): errs.append(f'{pref}.{band}.{i+1}: empty strand name')
        for it in items:
            k = it[0]
            if any(isinstance(x, str) and not x.strip() for x in it): errs.append(f'empty text {it}')
            if k == 'mc':
                if it[2] in it[3] or len(set(it[3])) != 3: errs.append(f'bad choices {it}')
            if it[1] in seen: errs.append(f'duplicate {it[1]}')
            seen.add(it[1])
    return errs

def js(o): return json.dumps(o, ensure_ascii=False)

out = [BEGIN + ' ══ (2026-09-27) Hindu Texts, Buddhist Texts, Chinese Classics, K–12 and Adult.',
       '   Built by _work/ddfaith/build.py from hin.py, bud.py, chn.py. Edit those, not this block.',
       '   Studied, never preached: items say what a text SAYS or what its readers believe. Exact',
       '   quotations only from U.S.-public-domain translations (Müller, Griffith, Arnold, Rhys Davids,',
       '   Legge). Same bands as Talmud Study: K–2, 3–5, 6–8, 9–12, Adult. */']
errs = []
for pref, var, mod in SUBJECTS:
    out.append(f'var {var}={{}};')
    for band, strands in mod.BANDS.items():
        errs += check(pref, band, strands)
        for i, (en, es, items) in enumerate(strands):
            out.append(f"NB['{pref}.{band}.{i+1:02d}']={js(items)};")
    for g, band in GRADES:
        row = ','.join(f"S({js(en)},{js(es)},Nx('{pref}.{band}.{i+1:02d}'))"
                       for i, (en, es, _) in enumerate(mod.BANDS[band]))
        out.append(f"{var}['{g}']=[{row}];")
out.append(END)
if errs:
    print('\n'.join(errs)); sys.exit(1)
block = '\n'.join(out) + '\n'
h = open(PAGE, encoding='utf-8').read()
if BEGIN in h:
    h = re.sub(re.escape(BEGIN) + r'.*?' + re.escape(END) + r'\n', lambda m: block, h, flags=re.S)
else:
    i = h.index('var SUBJ={math:')
    h = h[:i] + block + h[i:]
open(PAGE, 'w', encoding='utf-8').write(h)
for pref, var, mod in SUBJECTS:
    print(pref, {b: sum(len(s[2]) for s in st) for b, st in mod.BANDS.items()})
