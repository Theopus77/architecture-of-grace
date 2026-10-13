# The classroom instruments (AOG-BAND-CLASSROOM-V1, 2026-10-13). Jimmy: "DO them all": the ukulele, the recorder and
# boomwhackers, what learners play in school music class. Made the way sax2.py and bagpipes.py made theirs.
#
#   recorder        a Baroque soprano recorder, real, from the Versilian Community Sample Library (VCSL, Versilian
#                   Studios, CC0 1.0): "Aerophones/Edge-blown Aerophones/Baroque Soprano Recorder", held notes (Sustain,
#                   13 notes, C5 to C7, a whole tone apart) and short ones (Staccato, 12 notes)
#   recorder_alto   the Baroque alto recorder from the same folder of VCSL (held 12 notes F4 to E6, short 12)
#   ukulele         NO free ukulele recording could be found that the site may share (CC0 or CC BY): not in VCSL,
#                   VSCO 2 CE, FreePats on GitHub, the SFZ instruments list, the npm registry or archive.org; Freesound
#                   and Wikimedia are not reachable from here. So this ukulele is MADE: from the real nylon strings of
#                   FreePats' "Spanish Classical Guitar" (Roberto, zenvoid.org, CC0 1.0), the notes a soprano ukulele
#                   plays (C4 to C6), shaped to a ukulele's small body: the guitar's deep body taken away (under
#                   220 Hz), the small box's ring (450 Hz) and its brighter plucked tone (2.6 kHz) brought up, and a
#                   shorter ring (a uke's note fades about twice as fast as a guitar's). The page and the credits say so.
#   boomwhackers    NO free recording of tuned plastic tubes could be found either, so each tube is SYNTHESIZED here:
#                   an open tube struck on the hand, its air column ringing at every whole multiple of the note (an open
#                   pipe), the higher ones fading sooner, and the short plastic "whack" of the tube itself. One file per
#                   note, every half step from C2 to E6 (the bass tubes with their octave caps on, closed at one end,
#                   then the bass, the middle and the treble tubes), so no note is re-pitched. The page and the credits say so.
# Get the sources (only the folders needed, never the whole libraries):
#   git clone --filter=blob:none --no-checkout --depth 1 https://github.com/sgossner/VCSL
#   git -C VCSL sparse-checkout set --no-cone "/Aerophones/Edge-blown Aerophones/Baroque Soprano Recorder/" \
#       "/Aerophones/Edge-blown Aerophones/Baroque Alto Recorder/" /LICENSE; git -C VCSL checkout HEAD
#   git clone --depth 1 https://github.com/freepats/spanish-classical-guitar
# - VCSL names a note an octave low (its C3 is middle C): every note is measured, and one that sounds more than half a
#   semitone from its name is renamed. The two microphones are a spaced pair; one, the left, is used (as sax2.py)
# - held notes keep 5 s (0.4 s fade); short notes up to 0.9 s (0.1 s fade); the uke 2.6 s (0.3 s fade), the tubes 1.2 s
# - loudness: held notes by 0.25 s to 2.5 s (-18 dB), short notes by their loudest 0.15 s (-17 dB), the uke and the
#   tubes as short notes are (-17 dB); the page's PLAYER level then matches each player to the others (bandt/level.js)
# - tuning: every finished file is measured (tune.py) and the manifest gets a correction for each 3 cents or more off
# - mono, 32 kHz, MP3: 64 kbps held, 80 kbps short, plucked and struck
#   python3 -I classroom.py <aog-deploy/audio/band> <VCSL folder> <spanish-classical-guitar folder>
import os, re, sys, json, shutil, subprocess, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import tune
SR=32000
BAND=sys.argv[1]; VCSL=sys.argv[2]; FPG=sys.argv[3]
EDGE=os.path.join(VCSL,"Aerophones","Edge-blown Aerophones")
PC={"C":0,"C#":1,"D":2,"D#":3,"E":4,"F":5,"F#":6,"G":7,"G#":8,"A":9,"A#":10,"B":11}
RX=re.compile(r"_([A-G]#?)(\d)_rr\d")

def load(path, left=True):
    af=["-af","pan=mono|c0=c0"] if left else ["-ac","1"]
    pcm=subprocess.run(["ffmpeg","-v","error","-i",path]+af+["-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout
    return np.frombuffer(pcm,dtype=np.float32).astype(np.float64)
def load_mp3(path): return load(path, left=False)
def onset(x):
    pk=np.max(np.abs(x)); i=int(np.argmax(np.abs(x)>pk*0.03)); return max(0,i-int(0.005*SR))
def loudest(x, w):
    n=int(w*SR)
    if len(x)<=n: return float(np.sqrt(np.mean(x*x)+1e-12))
    c=np.concatenate([[0.0],np.cumsum(x*x)]); return float(np.sqrt(np.max(c[n:]-c[:-n])/n+1e-12))
def held_level(x): b=x[int(0.25*SR):int(2.5*SR)]; return float(np.sqrt(np.mean(b*b)+1e-12))
def measured(x, n, kind):
    """how far (cents) the note sounds from n: a held note by its steady part, a short, plucked or struck one from its start"""
    if kind=="held":
        h,sp,cnt=tune.heard(x, n, "held")
        if h is not None: return h
    h,sp,cnt=tune.heard(x, n, "short")
    return h if h is not None else (tune.finalize_yin(x, n)-n)*100
def rbj(kind, f, q, db):
    """one biquad (the RBJ cookbook): (b, a)"""
    A=10**(db/40); w=2*np.pi*f/SR; al=np.sin(w)/(2*q); c=np.cos(w)
    if kind=="peak": b=[1+al*A,-2*c,1-al*A]; a=[1+al/A,-2*c,1-al/A]
    elif kind=="hp": b=[(1+c)/2,-(1+c),(1+c)/2]; a=[1+al,-2*c,1-al]
    elif kind=="lp": b=[(1-c)/2,1-c,(1-c)/2]; a=[1+al,-2*c,1-al]
    elif kind=="bp": b=[al,0,-al]; a=[1+al,-2*c,1-al]
    b=np.array(b)/a[0]; a=np.array(a)/a[0]; return b,a
def biquad(x, ba):
    from scipy.signal import lfilter
    return lfilter(ba[0], ba[1], x)
def write(inst, name, x, fade, kbps):
    x=x.copy(); fo=min(int(fade*SR), len(x)//3); x[-fo:]*=np.linspace(1,0,fo)**2
    fi=int(0.002*SR); x[:fi]*=np.linspace(0,1,fi)
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-codec:a","libmp3lame","-b:a","%dk"%kbps,
        os.path.join(BAND,inst,name+".mp3")],input=x.astype(np.float32).tobytes(),check=True)

plan=[]   # {inst, kind held|short|pluck, note, x (trimmed, unlevelled)}
# the recorders: VCSL's names, each note measured
for inst,folder,prefix in (("recorder","Baroque Soprano Recorder","SopRecorder"),("recorder_alto","Baroque Alto Recorder","AltRecorder")):
    for sub,kind in (("Sustain","held"),("Staccato","short")):
        d=os.path.join(EDGE,folder,sub)
        for f in sorted(os.listdir(d)):
            m=RX.search(f)
            if not m: continue
            n=(int(m.group(2))+2)*12+PC[m.group(1)]                     # VCSL's octave numbers: its C3 is middle C (60)
            x=load(os.path.join(d,f)); x=x[onset(x):]
            x=x[:int((5.0 if kind=="held" else 0.9)*SR)]
            c=measured(x, n, kind)
            if abs(c)>50: print("   rename %s %d (%+.0f cents) -> %d"%(inst,n,c,n+int(np.sign(c)))); n+=int(np.sign(c))
            plan.append({"inst":inst,"kind":kind,"note":n,"x":x})
# the ukulele, made from the classical guitar's real nylon strings, C4 to C6
UKE_LO, UKE_HI = 60, 84
uke_src={}
for f in sorted(os.listdir(os.path.join(FPG,"samples"))):
    x=load(os.path.join(FPG,"samples",f), left=False); x=x[onset(x):]
    m=re.match(r"([A-G]#?)(\d)\.flac$", f)
    if not m: continue
    named=(int(m.group(2))+1)*12+PC[m.group(1)]
    # FreePats names each note as it sounds (its E2 is the low E string, MIDI 40); each is measured, to be sure
    c=measured(x, named, "short")
    if c is None or abs(c)>50: print("   the guitar's %s is %s cents off; left out"%(f, c)); continue
    if UKE_LO-1<=named<=UKE_HI+1: uke_src[named]=x
print("ukulele from the guitar's notes", sorted(uke_src))
UKE_EQ=[rbj("hp",220,0.71,0), rbj("hp",220,0.71,0), rbj("peak",450,1.4,3.0), rbj("peak",2600,0.9,3.5), rbj("peak",130,1.0,-6.0)]
for n,x in sorted(uke_src.items()):
    y=x[:int(2.6*SR)].copy()
    for ba in UKE_EQ: y=biquad(y, ba)
    t=np.arange(len(y))/SR; y*=np.where(t<0.04, 1.0, 10**(-7.5*(t-0.04)/20))    # 7.5 dB a second faster: a small body's shorter ring
    plan.append({"inst":"ukulele","kind":"pluck","note":n,"x":y})
# boomwhackers, synthesized: an open tube, struck
rng=np.random.default_rng(1306)
def tube(n):
    f0=440*2**((n-69)/12); L=int(1.2*SR); t=np.arange(L)/SR; y=np.zeros(L)
    tau1=0.15*(261.6/f0)**0.45                                           # a longer tube rings a little longer
    # an open tube rings at every whole multiple of its note; a bass tube with its octave cap on (C2 to B2) is closed at
    # one end, so it sounds an octave lower and only the odd multiples ring
    modes=list(zip([1,3,5,7],[1.0,0.35,0.15,0.07])) if n<48 else list(zip(range(1,8),[1.0,0.5,0.28,0.16,0.09,0.05,0.03]))
    for k,a in modes:
        fk=f0*k*(1-0.0025*(k-1))                                          # the end correction: each higher mode a hair flat
        if fk>12000: break
        y+=a*np.sin(2*np.pi*fk*t)*np.exp(-t/(tau1/k**0.7))
    y*=np.minimum(1, t/0.0015)                                            # the air starts ringing within 1.5 ms of the hit
    # the plastic tube's own short "whack": a noise burst around 1.5 kHz, and the knock of the hand on the tube
    nz=rng.standard_normal(L)*np.exp(-t/0.005); nz=biquad(nz, rbj("bp",1500,0.9,0)); nz=biquad(nz, rbj("lp",5000,0.7,0))
    knock=np.sin(2*np.pi*(f0*0.5+90)*t)*np.exp(-t/0.012)*np.minimum(1,t/0.001)
    y=y/np.max(np.abs(y)) + 0.25*nz/np.max(np.abs(nz)) + 0.1*knock
    return y
for n in range(36, 89):
    plan.append({"inst":"boomwhackers","kind":"pluck","note":n,"x":tube(n)})

TARGET={"held":-18.0,"short":-17.0,"pluck":-17.0}
for p in plan:
    x=p["x"]; r=held_level(x) if p["kind"]=="held" else loudest(x,0.15)
    p["g"]=10**((TARGET[p["kind"]]-20*np.log10(r))/20)
    p["room"]=20*np.log10(0.95/max(1e-6,np.max(np.abs(x))*p["g"]))
INSTS=["recorder","recorder_alto","ukulele","boomwhackers"]
# where each one comes from, and its licence, kept in the manifest beside its notes
VCSL_URL="https://github.com/sgossner/VCSL"
SOURCE={
 "recorder":{"made":False,"by":"Versilian Studios","from":"VCSL, Baroque Soprano Recorder","url":VCSL_URL,"license":"CC0-1.0"},
 "recorder_alto":{"made":False,"by":"Versilian Studios","from":"VCSL, Baroque Alto Recorder","url":VCSL_URL,"license":"CC0-1.0"},
 "ukulele":{"made":True,"by":"Roberto (zenvoid.org), FreePats","from":"Spanish Classical Guitar, its nylon strings shaped like a ukulele (no ukulele recording was found)","url":"https://github.com/freepats/spanish-classical-guitar","license":"CC0-1.0"},
 "boomwhackers":{"made":True,"by":"Architecture of Grace","from":"synthesized here (no recording was found)","url":"","license":"CC0-1.0"}}
shift={i:min(0.0, min(q["room"] for q in plan if q["inst"]==i)) for i in INSTS}
for inst in INSTS:
    d=os.path.join(BAND,inst)
    if os.path.isdir(d): shutil.rmtree(d)
    os.makedirs(d)
for p in plan:
    x=p["x"]*p["g"]*10**(shift[p["inst"]]/20)
    k={"held":"s","short":"t","pluck":"s"}[p["kind"]]; p["file"]="%d%s"%(p["note"],k)
    fade={"held":0.4,"short":0.1,"pluck":0.3}[p["kind"]]
    write(p["inst"], p["file"], x, fade, 64 if p["kind"]=="held" else 80)
# the tuning, measured on the finished files, and the manifest (the others stay exactly as they were)
man=json.load(open(os.path.join(BAND,"manifest.json")),object_pairs_hook=dict)
for inst in INSTS:
    e={"sus":set(),"stac":set(),"tune":{}}; worst=0
    for p in [q for q in plan if q["inst"]==inst]:
        n=p["note"]; x=load_mp3(os.path.join(BAND,inst,p["file"]+".mp3"))
        if inst=="boomwhackers": h=0.0                                    # made at its exact pitch
        else: h=measured(x, n, "held" if p["kind"]=="held" else "short")
        (e["stac"] if p["file"].endswith("t") else e["sus"]).add(n)
        c=int(round(h))
        if abs(c)>=3: e["tune"][p["file"]]=c
        worst=max(worst, abs(h-c))
    man[inst]={"sus":sorted(e["sus"]),"susL":[],"stac":sorted(e["stac"]),"tune":e["tune"], "source":SOURCE[inst]}
    d=os.path.join(BAND,inst); size=sum(os.path.getsize(os.path.join(d,f)) for f in os.listdir(d))
    print("%-14s %2d held/plucked %2d short, %d corrected, left within %.1f cents, %d KB, level shift %.1f dB"%(inst,len(e["sus"]),len(e["stac"]),len(e["tune"]),worst,size//1024,shift[inst]))
with open(os.path.join(BAND,"manifest.json"),"w") as fh: json.dump(man, fh, separators=(",",":"))
