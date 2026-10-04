# The Band, more ways to sound: pick and fetch the new players' recordings from VS Chamber Orchestra: Community Edition
# (CC0). For every pitch the library recorded: a soft ("s") and a loud ("l") held note where it has two strengths, and
# one short note ("m") where the player has short notes of its own. Plucked players (pizzicato, harp) keep the pluck as
# their held note. The vibrato players borrow the short notes of the same instrument without vibrato (on the page).
import os, re, subprocess, json, sys
REPO="/home/user/sgossner/vsco-2-ce"; HERE=os.path.dirname(os.path.abspath(__file__)); OUT=os.path.join(HERE,"raw2")
# id: (kind, held folder, soft strength, loud strength, short folder, short strength)
#   kind: "held" (a bowed or blown note), "pluck" (pizzicato or harp: the pluck rings out)
#   a strength of None: the lowest recorded (soft) / none (loud); "mid": the middle one, as fetch.py picks short notes
INST={
 "violins":        ("held",  "Strings/Violin Section/susVib",  1, 2,    "Strings/Violin Section/Spic", 2),
 "violas":         ("held",  "Strings/Viola Section/susvib",   1, 2,    "Strings/Viola Section/spic",  2),
 "cellos":         ("held",  "Strings/Cello Section/susvib",   1, 3,    "Strings/Cello Section/spic",  2),
 "contrabass":     ("held",  "Strings/Solo Contrabass/SusVib", 1, 3,    "Strings/Solo Contrabass/Spic", 1),
 "violins_pizz":   ("pluck", "Strings/Violin Section/Pizz",    1, 2,    None, None),
 "violas_pizz":    ("pluck", "Strings/Viola Section/pizz",     1, 2,    None, None),
 "cellos_pizz":    ("pluck", "Strings/Cello Section/pizzT",    1, 2,    None, None),
 "contrabass_pizz":("pluck", "Strings/Solo Contrabass/Pizz",   1, None, None, None),   # soft takes only: one tone for the whole bass
 "harp":           ("pluck", "Strings/Harp",                   None, None, None, None),
 "trumpet_harmon": ("held",  "Brass/Trumpet/harmonM-sus",      1, 3,    None, None),
 "trumpet_straight":("held", "Brass/Trumpet/straightM-sus",    1, 3,    None, None),
 "horn_mute":      ("held",  "Brass/F Horn/mute",              1, 2,    None, None),
 "piccolo":        ("held",  "Woodwinds/Piccolo/Sus",          None, None, "Woodwinds/Piccolo/Stac", None),
 "trumpet_vib":    ("held",  "Brass/Trumpet/susvib",           1, 2,    None, None),
 "trombone_vib":   ("held",  "Brass/Tenor Trombone/vib",       1, None, None, None),
 "flute_vib":      ("held",  "Woodwinds/Flute/susvib",         1, None, None, None),
 "oboe_vib":       ("held",  "Woodwinds/Oboe/Vib",             1, 3,    None, None),
 "bassoon_vib":    ("held",  "Woodwinds/Bassoon/vib",          1, 2,    None, None),
}
RX=re.compile(r"_([A-G]#?)(-?\d)(?:_v(\d))?(?:_(?:rr)?(\d))?", re.I)
RXP=re.compile(r"_([A-G]#?)(\d)_(?:sustain|staccato)(\d)", re.I)          # the piccolo's names
RXH=re.compile(r"_([A-G]#?)(\d)_(pp|p|mp|mf|f|ff)\.wav$", re.I)             # the harp's names
PC={"C":0,"C#":1,"D":2,"D#":3,"E":4,"F":5,"F#":6,"G":7,"G#":8,"A":9,"A#":10,"B":11}
FILES=open(os.path.join(os.path.dirname(HERE),"vsco-files.txt")).read().split("\n")
def ls(path): return [x for x in FILES if x.startswith(path+"/") and x.lower().endswith(".wav")]
def parse(f):
    b=os.path.basename(f)
    m=RXH.search(b)
    if m: return (int(m.group(2))+1)*12+PC[m.group(1).upper()], 1, 1
    m=RXP.search(b)
    if m: return (int(m.group(2))+1)*12+PC[m.group(1).upper()], 1, int(m.group(3))
    m=RX.search(b)
    if m: return (int(m.group(2))+1)*12+PC[m.group(1).upper()], int(m.group(3) or 1), int(m.group(4) or 1)
    return None
plan=[]
for inst,(kind,held,sv,lv,short,tv) in INST.items():
    for art,path,want in (("sus",held,(sv,lv)),("stac",short,(tv,))):
        if not path: continue
        by={}
        for f in ls(path):
            r=parse(f)
            if not r: print("  cannot read the name", f); continue
            note,v,rr=r; by.setdefault(note,[]).append((v,rr,f))
        for note,lst in sorted(by.items()):
            vs=sorted(set(v for v,rr,f in lst))
            pick=lambda v:[f for vv,rr,f in sorted(lst,key=lambda x:(x[1],x[2])) if vv==v][0]
            layers={}
            if art=="sus":
                s=want[0] if want[0] in vs else vs[0]
                layers["s"]=pick(s)
                if want[1] is not None and want[1] in vs and want[1]!=s: layers["l"]=pick(want[1])
            else:
                t=want[0] if want[0] in vs else (2 if 2 in vs else vs[len(vs)//2])
                layers["m"]=pick(t)
            for lay,f in layers.items():
                plan.append({"inst":inst,"kind":kind if art=="sus" else "short","art":art,"note":note,"layer":lay,"src":f})
# the cleaner take of a pluck or a short note, where the library has two (alts.py)
CH=json.load(open(os.path.join(HERE,"choices.json"))) if os.path.exists(os.path.join(HERE,"choices.json")) else {}
for p in plan:
    alt=CH.get(p["inst"],{}).get(p["art"],{}).get("%d%s"%(p["note"],p["layer"]))
    if alt: p["src"]=alt
json.dump(plan,open(os.path.join(HERE,"plan2.json"),"w"),indent=0)
print(len(plan),"files planned")
for inst in INST:
    ps=[p for p in plan if p["inst"]==inst]
    print("  %-16s held %2d (%2d loud)  short %2d   names %s"%(inst, len([p for p in ps if p["art"]=="sus" and p["layer"]=="s"]), len([p for p in ps if p["layer"]=="l"]),
        len([p for p in ps if p["art"]=="stac"]), sorted(set(p["note"] for p in ps if p["art"]=="sus"))))
if "--fetch" in sys.argv:
    SRCS=os.path.join(OUT,"sources.json"); had=json.load(open(SRCS)) if os.path.exists(SRCS) else {}
    for i,p in enumerate(plan):
        dst=os.path.join(OUT,p["inst"],p["art"],"%d%s.wav"%(p["note"],p["layer"]))
        if os.path.exists(dst) and os.path.getsize(dst)>1000 and had.get(dst,p["src"])==p["src"]: had[dst]=p["src"]; continue
        had[dst]=p["src"]
        os.makedirs(os.path.dirname(dst),exist_ok=True)
        with open(dst,"wb") as fh: subprocess.run(["git","-C",REPO,"show","HEAD:"+p["src"]],stdout=fh,check=True)
        if i%25==0: print("fetched",i+1,"of",len(plan),flush=True)
    json.dump(had,open(SRCS,"w"),indent=0)
    print("all fetched")
