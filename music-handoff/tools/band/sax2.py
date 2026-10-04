# The Band's tenor and soprano saxophones (AOG-BAND-SAX2-V1, 2026-10-04). Jimmy's list of influences names John Coltrane
# (tenor) and Wayne Shorter (soprano); the band had only an alto (sax.py, Weresax). These are real players, from the
# Versilian Community Sample Library (VCSL) by Versilian Studios, CC0 1.0 (public domain), folder
# "Aerophones/Reed Aerophones": "Tenor Saxophone" (105 files) and "Saxello" (39 files; a saxello is a curved soprano
# saxophone). Get it with:
#   git clone --filter=blob:none --sparse --depth 1 https://github.com/sgossner/VCSL
#   git -C VCSL sparse-checkout set "Aerophones/Reed Aerophones"
#
# Three players, made the way process2.py and finalize2.py made the others:
#   tenor      held notes without vibrato, soft (vl2) and loud (vl3), every whole tone from A-flat 2 to E6 (23 notes);
#              short notes (staccato, the louder take: vl2), 23 notes
#   tenor_vib  held notes with vibrato, one strength (so it sits at the loud level), 19 notes; its short notes are the
#              tenor's ("stacDir"), as the other vibrato players borrow theirs
#   soprano    the saxello: held notes without vibrato, soft (vl2) and loud (vl3), a major third apart from B-flat 3
#              to B-flat 5, then E6 (8 notes); short notes (vl2, or vl1 where it is the only take), 8 notes
# - VCSL names a note an octave low (its "G#1" sounds A-flat 2, MIDI 44): every note's pitch is measured, and a file
#   that sounds more than half a semitone from its name would be renamed (none does)
# - the two microphones are a spaced pair: added together they cancel each other at some notes (by up to 12 dB, a
#   different tone on every note), so one microphone, the left, is used, as sax.py used Weresax's condenser alone
# - the quiet before the note is trimmed; held notes keep 5 s (0.4 s fade), short notes up to 0.9 s (0.1 s fade)
# - every note of a layer is brought to one loudness: held notes by their loudness from 0.25 s to 2.5 s, past the
#   attack (soft -26 dB, loud -18 dB, one strength -18 dB), short notes by their loudest 0.15 s (-17 dB). A saxophonist
#   often leans into the first moment of a note and then settles (the soprano's loud B-flat 4 by 6 dB, the tenor's
#   vibrato notes by 3 dB on average), and it is the settled part that sounds through a held chord, so it is the part
#   that is matched; process2.py's loudest 0.4 s would leave such a note's held part quieter than its neighbours'.
#   If a note's peak would pass 0.95, the whole player comes down together (the page's PLAYER level brings it back)
# - mono, 32 kHz, MP3: 64 kbps held, 80 kbps short
# - tuning: every finished file is measured as finalize2.py measures it (tune.py: a held note from 0.25 s, past the
#   attack, the middle value with louder windows counted more; a short note by finalize.py's window), and the page is
#   given a correction in cents for each file 3 cents or more off (finalize2.py's line is 5; these players' notes are
#   so steady that 3 costs nothing, and a chord of saxophones then beats less), so every note plays within 3 cents
# - the manifest: the three players are written into audio/band/manifest.json (added at the end, or replaced where
#   they are); every other player stays exactly as it was
#   python3 sax2.py <aog-deploy/audio/band> [VCSL folder]
import os, re, sys, json, shutil, subprocess, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import tune
SR=32000
BAND=sys.argv[1]
VCSL=sys.argv[2] if len(sys.argv)>2 else "/home/user/sgossner/VCSL"
REEDS=os.path.join(VCSL,"Aerophones","Reed Aerophones")
PC={"C":0,"C#":1,"D":2,"D#":3,"E":4,"F":5,"F#":6,"G":7,"G#":8,"A":9,"A#":10,"B":11}
RX=re.compile(r"_([A-G]#?)(\d)_(?:vl(\d)|var\d)")
# player: (held folder, {layer: the library's strength, None for the one take}, short folder, borrows its short notes from)
PLAYERS={
 "tenor":     ("Tenor Saxophone/Non-Vibrato", {"s":"2","l":"3"}, "Tenor Saxophone/Staccato", None),
 "tenor_vib": ("Tenor Saxophone/Vibrato",     {"s":None},        None,                       "tenor"),
 "soprano":   ("Saxello/Non-Vibrato",         {"s":"2","l":"3"}, "Saxello/Staccato",         None),
}
def load(path):
    """the left microphone alone, 32 kHz"""
    pcm=subprocess.run(["ffmpeg","-v","error","-i",path,"-af","pan=mono|c0=c0","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout
    return np.frombuffer(pcm,dtype=np.float32).astype(np.float64)
def load_mp3(path):
    pcm=subprocess.run(["ffmpeg","-v","error","-i",path,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout
    return np.frombuffer(pcm,dtype=np.float32).astype(np.float64)
def onset(x):
    pk=np.max(np.abs(x)); i=int(np.argmax(np.abs(x)>pk*0.03)); return max(0,i-int(0.005*SR))
def loudest(x, w):
    n=int(w*SR)
    if len(x)<=n: return float(np.sqrt(np.mean(x*x)+1e-12))
    c=np.concatenate([[0.0],np.cumsum(x*x)]); return float(np.sqrt(np.max(c[n:]-c[:-n])/n+1e-12))
def named(f):
    m=RX.search(f)
    if not m: raise SystemExit("cannot read the name "+f)
    return (int(m.group(2))+2)*12+PC[m.group(1)], m.group(3)     # VCSL's octave numbers: its C3 is middle C (60)
plan=[]
for inst,(held,layers,short,borrow) in PLAYERS.items():
    files=sorted(os.listdir(os.path.join(REEDS,held)))
    for lay,vl in layers.items():
        for f in files:
            n,v=named(f)
            if v==vl: plan.append({"inst":inst,"kind":"held","layer":lay,"note":n,"src":os.path.join(REEDS,held,f)})
    if short:
        by={}
        for f in sorted(os.listdir(os.path.join(REEDS,short))):
            n,v=named(f); by.setdefault(n,{})[v]=f
        for n,vs in sorted(by.items()):
            f=vs.get("2") or vs[max(vs)]                                    # the louder take, or the only one
            plan.append({"inst":inst,"kind":"short","layer":"m","note":n,"src":os.path.join(REEDS,short,f)})
print(len(plan),"files planned")
for p in plan:
    x=load(p["src"]); x=x[onset(x):]
    if p["kind"]=="held": c,sp,cnt=tune.heard(x[:int(5*SR)], p["note"], "held")
    else: c=(tune.finalize_yin(x[:int(0.9*SR)], p["note"])-p["note"])*100
    if c is not None and abs(c)>50:
        print("   rename %s %d: it sounds %+.0f cents from its name -> %d"%(p["inst"],p["note"],c,p["note"]+int(np.sign(c))))
        p["note"]+=int(np.sign(c))
    p["x"]=x; p["raw_cents"]=None if c is None else round(float(c),1)
TARGET={"held":{"l":-18.0,"s":-26.0},"short":{"m":-17.0}}
one={i:len(PLAYERS[i][1])==1 for i in PLAYERS}
for p in plan:
    x=p["x"]
    if p["kind"]=="held": x=x[:int(5.0*SR)]; b=x[int(0.25*SR):int(2.5*SR)]; r=float(np.sqrt(np.mean(b*b)+1e-12)); fo=int(0.4*SR)
    else: x=x[:int(0.9*SR)]; r=loudest(x,0.15); fo=int(0.1*SR)
    p["y"]=x; p["fo"]=fo
    p["g"]=10**((TARGET[p["kind"]]["l" if one[p["inst"]] and p["kind"]=="held" else p["layer"]]-20*np.log10(r))/20)
    p["room"]=20*np.log10(0.95/max(1e-6,np.max(np.abs(x))*p["g"]))       # dB to spare under the peak limit
shift={i:min(0.0, min(q["room"] for q in plan if q["inst"]==i)) for i in PLAYERS}
for inst in PLAYERS:                                                    # a fresh folder each time, so a second run gives the same
    d=os.path.join(BAND,inst)
    if os.path.isdir(d): shutil.rmtree(d)
    os.makedirs(d)
for p in plan:
    x=p["y"]*p["g"]*10**(shift[p["inst"]]/20)
    fo=min(p["fo"],len(x)//3); x[-fo:]*=np.linspace(1,0,fo)**2
    fi=int(0.002*SR); x[:fi]*=np.linspace(0,1,fi)
    p["file"]="%d%s"%(p["note"],{"s":"s","l":"l","m":"t"}[p["layer"]])
    p["secs"]=len(x)/SR; p["peak"]=float(np.max(np.abs(x)))
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-codec:a","libmp3lame","-b:a","80k" if p["kind"]=="short" else "64k",
        os.path.join(BAND,p["inst"],p["file"]+".mp3")],input=x.astype(np.float32).tobytes(),check=True)
# the tuning, measured on the finished files, and the manifest
man=json.load(open(os.path.join(BAND,"manifest.json")),object_pairs_hook=dict)
rows={}
for inst,(held,layers,short,borrow) in PLAYERS.items():
    e={"sus":set(),"susL":set(),"stac":set(),"tune":{}}; rows[inst]=[]
    for p in [q for q in plan if q["inst"]==inst]:
        n=p["note"]; k=p["file"][-1]
        (e["stac"] if k=="t" else e["sus"]).add(n)
        if k=="l": e["susL"].add(n)
        x=load_mp3(os.path.join(BAND,inst,p["file"]+".mp3"))
        fy=(tune.finalize_yin(x, n)-n)*100
        if k=="t": h,sp=fy,0.0
        else:
            h,sp,cnt=tune.heard(x, n, "held")
            if h is None: h,sp=fy,0.0
        c=int(round(h))
        if abs(c)>=3: e["tune"][p["file"]]=c
        rows[inst].append((p["file"],round(h,1),round(sp,1),e["tune"].get(p["file"],0)))
    entry={"sus":sorted(e["sus"]),"susL":sorted(e["susL"]),"stac":sorted(e["stac"]),"tune":e["tune"]}
    if borrow:
        b=man[borrow]; entry["stac"]=list(b["stac"]); entry["stacDir"]=borrow
        entry["tune"].update({k:v for k,v in b["tune"].items() if k.endswith("t")})
    man[inst]=entry
with open(os.path.join(BAND,"manifest.json"),"w") as fh: json.dump(man, fh, separators=(",",":"))
# what was made
for inst in PLAYERS:
    v=man[inst]; d=os.path.join(BAND,inst); size=sum(os.path.getsize(os.path.join(d,f)) for f in os.listdir(d))
    ps=[p for p in plan if p["inst"]==inst]; held=[p for p in ps if p["kind"]=="held"]
    left=[r[1]-r[3] for r in rows[inst]]
    print("%-10s held %d-%d (%d notes, %d loud) | short %s | %d files, %.0f KB | held %.2f-%.2f s | peak %.2f, brought down %.1f dB"%(inst, v["sus"][0], v["sus"][-1],
        len(v["sus"]), len(v["susL"]), ("%d-%d (%d)%s"%(v["stac"][0],v["stac"][-1],len(v["stac"])," from "+v["stacDir"] if "stacDir" in v else "") if v["stac"] else "none"),
        len(ps), size/1024, min(p["secs"] for p in held), max(p["secs"] for p in held), max(p["peak"] for p in ps), -shift[inst]))
    print("           tuning as recorded: %+.1f to %+.1f cents; corrections %d %s; after them: %+.1f to %+.1f cents; widest vibrato spread %.1f cents"%(
        min(r[1] for r in rows[inst]), max(r[1] for r in rows[inst]), len([r for r in rows[inst] if r[3]]), {r[0]:r[3] for r in rows[inst] if r[3]},
        min(left), max(left), max(r[2] for r in rows[inst])))
print(len(json.dumps(man,separators=(",",":"))),"bytes of manifest,",len(man),"players")
