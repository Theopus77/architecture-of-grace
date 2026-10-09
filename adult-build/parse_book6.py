# -*- coding: utf-8 -*-
"""parse_book6.py — cut the twelve sessions (and the facilitator reference matter) out of the
ENHANCED docx into _work/adult/book6.json. Verbatim; nothing is paraphrased here."""
import json, re, sys, os
from docx import Document
from docx.table import Table
from docx.text.paragraph import Paragraph
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(os.path.dirname(HERE))
d=Document(os.path.join(ROOT,'AoG_Book6_Adult_Edition_ENHANCED.docx'))

def cell_paras(c): return [p.text.strip() for p in c.paragraphs if p.text.strip()]
blocks=[]
for ch in d.element.body.iterchildren():
    tag=ch.tag.split('}')[1]
    if tag=='p':
        p=Paragraph(ch,d); t=p.text.strip()
        if not t: continue
        st=p.style.name if p.style is not None else ''
        blocks.append(('p',st,t))
    elif tag=='tbl':
        tb=Table(ch,d); rows=[]
        for r in tb.rows:
            cells=[]; seen=None
            for c in r.cells:
                if c._tc is seen: continue
                seen=c._tc; cells.append(cell_paras(c))
            rows.append(cells)
        blocks.append(('t','',rows))

def box(rows):
    """a one-cell boxed table -> (label, paragraphs)"""
    if len(rows)==1 and len(rows[0])==1:
        ps=rows[0][0]
        return ps[0], ps[1:]
    return None,None

def kind_of(label):
    L=label.upper()
    if L.startswith('FACILITATOR SCRIPT'): return 'script'
    if L.startswith('IN-SESSION SCAN'): return 'scan'
    if L.startswith('PRACTICE'): return 'practice'
    if L.startswith('SCENARIO CARD'): return 'scenario'
    if L.startswith('INTEGRATION'): return 'integration'
    if L.startswith('BETWEEN SESSIONS'): return 'between'
    if L.startswith('FACILITATOR REFLECTION'): return 'reflection'
    if 'CONTRAINDICATION' in L: return 'contra'
    if L.startswith('ANCHOR CONCEPT'): return 'anchor'
    if L.startswith('CONNECTS TO'): return 'connects'
    if L.startswith('▶'): return 'skip'
    return 'box'

def scan_parts(ps):
    """OBSERVE … MAY INDICATE … RESPONSE/ACTION … — split on the uppercase leads if present"""
    txt=' '.join(ps)
    parts={}; cur=None
    for tok in re.split(r'(OBSERVE|MAY INDICATE|RESPONSE|ACTION|DO NOT|DO)\s{2,}', txt):
        if tok in ('OBSERVE','MAY INDICATE','RESPONSE','ACTION','DO NOT','DO'): cur=tok
        elif cur: parts[cur]=(parts.get(cur,'')+' '+tok).strip()
        elif tok.strip(): parts.setdefault('lead',tok.strip())
    return parts if len(parts)>1 else {'lead':txt}

STEP=re.compile(r'^(\d\d)\s+(.+?)\t(\d+(?:[–-]\d+)? min)$')
sessions=[]; cur=None; step=None; phase=None; mode=None
extra={'closing_exit':None,'flags':[],'tiers':[],'touchpoint':[],'documentation':[],'anatomy':[]}
for i,(k,st,v) in enumerate(blocks):
    if k=='p' and st=='Heading 2' and v.startswith('Session ') and re.match(r'Session \d+ —',v):
        n=int(re.match(r'Session (\d+)',v).group(1))
        cur={'n':n,'title':v.split(' — ',1)[1],'phase':phase,'flagline':None,'connects':None,'meta':{},'contra':None,
             'anchor':None,'anchor_title':None,'prep':[],'steps':[],'between':None,'reflection':None,'reflection_title':None}
        sessions.append(cur); step=None; mode='head'; continue
    if k=='p' and st=='Heading 1' and cur and v.startswith('Section VI'): cur=None; mode=None
    if k=='p' and re.match(r'^PHASE (I|II|III|IV) ·',v): phase=v; continue
    if cur is None:
        # reference matter we still want
        if k=='t':
            lab,ps=box(v)
            if lab and lab.startswith('FACILITATOR SCRIPT') and ps and ps[0].startswith('"What we did in this room'): extra['closing_exit']=ps[0]
            if lab and lab.startswith('CRISIS'): extra['crisis']=ps
            if len(v)>1 and v[0] and v[0][0] and v[0][0][0]=='COMPONENT': extra['anatomy']=[[c[0] if c else '' for c in r] for r in v[1:]]
        if k=='p' and re.match(r'^(★|◆)',v) and len(v)<400: extra['flags'].append(v)
        if k=='p' and re.match(r'^Tier \d —',v): extra['tiers'].append(v)
        # Section 3.5, whole: from its heading to RESPONSIBLE SCALING
        if k=='p' and st=='Heading 2' and v.startswith('3.5 Disclosure'): extra['s35']=[]; extra['_in35']=True
        if k=='p' and v=='RESPONSIBLE SCALING': extra['_in35']=False
        if extra.get('_in35'):
            if k=='p': extra['s35'].append({'k':'h' if st.startswith('Heading') else 'p','t':v})
            else:
                lab,ps=box(v)
                if lab: extra['s35'].append({'k':'box','label':lab,'ps':ps})
        continue
    if k=='p':
        if st=='Heading 3':
            if v.startswith('Facilitator Preparation'): mode='prep'
            elif v.startswith('Session Flow'): mode='flow'
            continue
        if re.match(r'^(★|◆)',v) and mode=='head': cur['flagline']=v; continue
        m=STEP.match(v)
        if m and mode=='flow':
            step={'n':m.group(1),'title':m.group(2),'min':m.group(3),'blocks':[]}; cur['steps'].append(step); continue
        if mode=='prep': cur['prep'].append(v)
        elif mode=='flow' and step: step['blocks'].append({'k':'p','t':v})
        continue
    # tables
    lab,ps=box(v)
    if lab is None:
        # the objective/meta table
        if v and v[0] and v[0][0] and v[0][0][0]=='Objective':
            for r in v: 
                if len(r)>=2: cur['meta'][r[0][0]]=' '.join(r[1])
        continue
    kd=kind_of(lab)
    if kd=='skip': continue
    if kd=='connects': cur['connects']=' '.join(ps); continue
    if kd=='contra': cur['contra']={'label':lab,'ps':ps}; continue
    if kd=='anchor': cur['anchor_title']=lab.split('·',1)[1].strip() if '·' in lab else lab; cur['anchor']=ps; continue
    if kd=='between': cur['between']=ps; continue
    if kd=='reflection': cur['reflection_title']=lab; cur['reflection']=ps; continue
    if step is None: continue
    if kd=='script': step['blocks'].append({'k':'script','t':' '.join(ps)})
    elif kd=='scan': step['blocks'].append({'k':'scan','label':lab.split('·',1)[1].strip() if '·' in lab else lab,'parts':scan_parts(ps)})
    elif kd=='practice': step['blocks'].append({'k':'practice','label':lab.split('·',1)[1].strip() if '·' in lab else lab,'ps':ps})
    elif kd=='scenario': step['blocks'].append({'k':'scenario','label':lab,'ps':ps})
    elif kd=='integration': step['blocks'].append({'k':'integration','label':lab,'ps':ps})
    else: step['blocks'].append({'k':'box','label':lab,'ps':ps})

extra.pop('_in35',None)
out={'sessions':sessions,'extra':extra}
json.dump(out,open(os.path.join(HERE,'book6.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
for s in sessions:
    print(s['n'],len(s['steps']),'steps',sum(len(st['blocks']) for st in s['steps']),'blocks',
          'scripts',sum(1 for st in s['steps'] for b in st['blocks'] if b['k']=='script'),
          'scans',sum(1 for st in s['steps'] for b in st['blocks'] if b['k']=='scan'),
          'contra' if s['contra'] else '', s['flagline'] or '', '| meta',len(s['meta']),'| prep',len(s['prep']),'| between' if s['between'] else '| NO between','| refl' if s['reflection'] else '| NO refl','| anchor' if s['anchor'] else '| NO ANCHOR')
print('closing exit:',bool(extra['closing_exit']),'flags:',len(extra['flags']),'tiers:',len(extra['tiers']),'anatomy rows:',len(extra['anatomy']),'crisis:',len(extra.get('crisis',[])))
