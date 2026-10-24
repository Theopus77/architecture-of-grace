# The Band's folk players (AOG-BAND-FOLK-V1, 2026-10-13). Jimmy: "I would like a Harmonica added to the instruments. The
# fiddle and banjo as well." ... then "DO them all": a mandolin, a Dobro, a pedal steel and a melodica too.
#
# Every source here is CC0 1.0 (public domain). Where no recording of the instrument itself with an open licence could be
# found (the mandolin, the Dobro, the pedal steel, the melodica), the words on the page say how the sound was made.
#
#   harmonica      A real Hohner Special 20 diatonic harmonica in C (a blues harp), from the Versilian Community Sample
#                  Library (VCSL, Versilian Studios, CC0): "Aerophones/Free Aerophones/Harmonica-Hohner-Special20-C",
#                  Sustains/Soft (soft, "s") and Sustains/Normal (loud, "l"). VCSL names a note an octave low (its C3 is
#                  middle C). Ten notes, C4 to C7 (the harp's blow notes, C E G); Normal has no G4, so that note is soft only.
#   fiddle         A real solo violin from VS Chamber Orchestra 2: Community Edition (VSCO 2 CE, Versilian Studios, CC0):
#                  "Strings/Solo Violin", Arco Vib p (soft) and f (loud), G3 to E6 (12 notes), and its spiccato (short,
#                  bouncing bow, "spic", the louder take v2, rr1) for the short notes of a reel. The spiccato files are
#                  named an octave low (spic_G2 sounds G3).
#   banjo          A real banjo: "Ganjo" by itsclipping (sfzinstruments/ganjo, CC0), an SX six-string banjo (a guitar banjo:
#                  a banjo's drum-head body, tuned like a guitar). The first take of every note, E2 to B4 (MIDI 39-71),
#                  as its ganjo.sfz maps them (pitch_keycenter).
#   mandolin       Made here from a real recording: the Martin HD28 steel-string guitar already in the site
#                  (audio/guitar/steel, Jeff Learman, Discord SFZ GM Bank, CC0). A mandolin's strings are in pairs, so each
#                  note is two copies a few cents apart; its small body is brighter and rings shorter (a high-pass, a lift
#                  near 3 kHz, a quicker fade). Notes every three semitones from G3; the top three a guitar never
#                  reaches are the highest guitar note played faster.
#   mandolin_trem  The same notes picked quickly down and up, 12.5 picks a second, as a mandolin player holds a long note
#                  (tremolo). It is held: the page loops its steady part for as long as a key is down.
#   dobro          Made here from the same Martin guitar: a resonator guitar's metal cone gives a nasal, ringing tone (a
#                  lift near 900 Hz and 2.2 kHz, less boom near 300 Hz, a short metal comb). The page slides into each note
#                  (SLIDE in band_script.js), as a bar on the strings does.
#   steel          Made here from a real electric guitar: the green Gretsch hollow-body of "Black And Green Guitars" by
#                  Karoryfer Samples (audio/guitar/green, CC0), recorded straight from the guitar. A pedal steel's notes
#                  swell in with the volume pedal and sing on: a soft 90 ms swell, the decay evened out, the top softened.
#                  It is held (looped) and the page glides into each note.
#   melodica       Made by computer: no recording of a melodica with an open licence was found. Each note is built from
#                  its harmonics as a free reed sounds (a bright, buzzy tone with a little breath), F3 to F6, soft and loud.
#
# What every note gets, as sax2.py and bagpipes.py did:
#   - mono, 32 kHz, MP3: 64 kbps held and plucked, 80 kbps short
#   - the quiet before the note trimmed; held notes keep 5 s (0.4 s fade), short notes up to 0.9 s, plucked notes as
#     they ring (up to 3 s)
#   - every note of a layer brought to one loudness: held notes by 0.25 s to 2.5 s (soft -26 dB, loud -18 dB, one
#     strength -18 dB), short and plucked notes by their loudest 0.15 s (-17 dB). If a peak would pass 0.95, the whole
#     player comes down together (the page's PLAYER level brings it back)
#   - every finished file measured (tune.py) and given a correction in cents when it is 3 cents or more off
#
#   python3 folk.py <aog-deploy/audio/band> <folder with VCSL, VSCO and ganjo checkouts> <aog-deploy/audio/guitar>
# Get the three sources (only the folders needed):
#   git clone --filter=blob:none --sparse --depth 1 https://github.com/sgossner/VCSL
#   git -C VCSL sparse-checkout set "Aerophones/Free Aerophones/Harmonica-Hohner-Special20-C"
#   git clone --filter=blob:none --sparse --depth 1 https://github.com/sgossner/VSCO-2-CE VSCO
#   git -C VSCO sparse-checkout set "Strings/Solo Violin"
#   git clone --filter=blob:none --sparse --depth 1 https://github.com/sfzinstruments/ganjo
#   git -C ganjo sparse-checkout set Common
import os, re, sys, json, shutil, subprocess, numpy as np
from scipy import signal
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import tune, bandio
SR=bandio.SR   # AOG-BAND-HIFI-V1: 44.1 kHz and both microphones when hifi.py runs this (bandio.py)
M=bandio.M     # what is measured: the left microphone, as before
BAND, DL, GUITAR = sys.argv[1], sys.argv[2], sys.argv[3]
ONLY=sys.argv[4].split(",") if len(sys.argv)>4 else None
PC={"C":0,"C#":1,"D":2,"D#":3,"E":4,"F":5,"F#":6,"G":7,"G#":8,"A":9,"A#":10,"B":11}
rng=np.random.default_rng(20261013)

def load(path, left=True):
    """the left microphone (both, left and right, with AOG_BAND_STEREO), or the two averaged"""
    return bandio.load(path, 0) if left else bandio.load(path, None)
def onset(x):
    x=M(x); pk=np.max(np.abs(x)); i=int(np.argmax(np.abs(x)>pk*0.03)); return max(0,i-int(0.005*SR))
def held_level(x): b=M(x)[int(0.25*SR):int(2.5*SR)]; return 20*np.log10(np.sqrt(np.mean(b*b))+1e-12)
def loudest(x, w=0.15):
    x=M(x); n=int(w*SR)
    if len(x)<=n: return 20*np.log10(np.sqrt(np.mean(x*x))+1e-12)
    c=np.concatenate([[0.0],np.cumsum(x*x)]); return 20*np.log10(np.sqrt(np.max(c[n:]-c[:-n])/n)+1e-12)
def speed(x, semis):
    """the recording played faster or slower, as a tape would, so its pitch moves by semis"""
    r=2**(semis/12); n=int(len(x)/r); t=np.arange(n)*r; return np.interp(t, np.arange(len(x)), x)
def peq(x, f, gain_db, q):
    A=10**(gain_db/40); w=2*np.pi*f/SR; al=np.sin(w)/(2*q)
    b=[1+al*A, -2*np.cos(w), 1-al*A]; a=[1+al/A, -2*np.cos(w), 1-al/A]; return signal.lfilter(b, a, x)
def hp(x, f, order=2): b,a=signal.butter(order, f/(SR/2), "high"); return signal.lfilter(b, a, x)
def lp(x, f, order=2): b,a=signal.butter(order, f/(SR/2), "low"); return signal.lfilter(b, a, x)
def mtof(m): return 440*2**((m-69)/12)
def extend(y, n, secs):
    """a held note made longer from its own steady part: the stretch from 0.8 s to 0.45 s before its end is laid again and
    again, each time where its wave lines up best with what came before (searched over one wave), blended over 0.12 s,
    so the note sings on for secs seconds (a high note on the electric guitar is only 2 to 2.4 s long)"""
    A=int(0.8*SR); Z=len(y)-int(0.45*SR); X=int(0.12*SR); P=int(round(SR/mtof(n)))
    if Z-A<3*X or len(y)>=secs*SR: return y
    out=y[:Z].copy()
    while len(out)<secs*SR:
        tail=out[-X:]; best, bk=-2, A
        for k in range(A, A+P+1):
            seg=y[k:k+X]; r=float(np.dot(tail, seg)/np.sqrt(np.dot(tail,tail)*np.dot(seg,seg)+1e-20))
            if r>best: best, bk=r, k
        u=np.linspace(0,1,X); seg=y[bk:Z]
        out=np.concatenate([out[:-X], out[-X:]*(1-u)+seg[:X]*u, seg[X:]])
    return out

plan=[]   # {inst, note, key ("s" "l" "t"), kind ("held" "short" "pluck"), x}
def add(inst, note, key, kind, x): plan.append({"inst":inst, "note":note, "key":key, "kind":kind, "x":x})
def want(inst): return ONLY is None or inst in ONLY

# ── the harmonica ──
if want("harmonica"):
    H=os.path.join(DL,"VCSL","Aerophones","Free Aerophones","Harmonica-Hohner-Special20-C","Sustains")
    for lay,folder in (("s","Soft"),("l","Normal")):
        for f in sorted(os.listdir(os.path.join(H,folder))):
            m=re.search(r"_([A-G]#?)(\d)\.wav$", f); n=(int(m.group(2))+2)*12+PC[m.group(1)]
            x=load(os.path.join(H,folder,f)); add("harmonica", n, lay, "held", x[onset(x):])
# ── the fiddle ──
if want("fiddle"):
    V=os.path.join(DL,"VSCO","Strings","Solo Violin")
    for lay,vl in (("s","p"),("l","f")):
        for f in sorted(os.listdir(os.path.join(V,"Arco Vib"))):
            m=re.search(r"_([A-G]#?)(\d)_([pf])\.wav$", f)
            if not m or m.group(3)!=vl: continue
            n=(int(m.group(2))+1)*12+PC[m.group(1)]
            if n>88: continue                                  # G3 to E6, the fiddle's own reach
            x=load(os.path.join(V,"Arco Vib",f)); add("fiddle", n, lay, "held", x[onset(x):])
    for f in sorted(os.listdir(os.path.join(V,"spic"))):
        m=re.search(r"_([A-G]#?)(\d)_v2_rr1\.wav$", f)
        if not m: continue
        n=(int(m.group(2))+2)*12+PC[m.group(1)]                # named an octave low
        if n>88: continue
        x=load(os.path.join(V,"spic",f)); add("fiddle", n, "t", "short", x[onset(x):])
# ── the banjo ──
# AOG-BANJO-GS-V1 (2026-10-13) — Jimmy: "The g sharp sounds messed up on the banjo." Ganjo's G#3 take rings unlike its
# neighbours, so G#3 is played from the G3 take a half step up (as a missing note is).
BANJO_SKIP={56}
if want("banjo"):
    G=os.path.join(DL,"ganjo"); sfz=open(os.path.join(G,"ganjo.sfz")).read(); seen=set()
    for r in sfz.split("<region>")[1:]:
        d=dict(re.findall(r"(\w+)=([^\n]+)", r)); d={k:v.strip() for k,v in d.items()}
        if d.get("seq_position","1")!="1": continue
        n=int(d.get("pitch_keycenter") or d["lokey"])
        if n in seen or n in BANJO_SKIP: continue
        seen.add(n); x=load(os.path.join(G, d["sample"].replace("\\","/"))); add("banjo", n, "s", "pluck", x[onset(x):])
# ── made from the Martin steel-string guitar: the mandolin, its tremolo, the Dobro ──
def martin(m):
    x=load(os.path.join(GUITAR,"steel","z%d_v1_r1.mp3"%m), left=False); return x[onset(x):]
MARTIN=[40,43,46,49,52,55,58,61,64,68,71,74,77,80,83]
def mandolin_note(n):
    src=max(s for s in MARTIN if s<=n) if n<=83 else 83
    x=speed(martin(src), n-src)
    x=hp(x, 170); x=peq(x, 3000, 5.0, 0.8); x=peq(x, 7000, 2.5, 0.7)
    y=speed(x, 5/100)                                   # the second string of the pair, 5 cents higher
    d=int(0.006*SR); z=np.zeros(max(len(x), len(y)+d)); z[:len(x)]+=x; z[d:d+len(y)]+=0.85*y
    t=np.arange(len(z))/SR; z*=np.exp(-t/0.9)          # a small body rings shorter
    return z[:int(2.6*SR)]
MANDO=[55,58,61,64,67,70,73,76,79,82,85,88]
if want("mandolin"):
    for n in MANDO: add("mandolin", n, "s", "pluck", mandolin_note(n))
if want("mandolin_trem"):
    for n in MANDO:
        one=mandolin_note(n); out=np.zeros(int(5.2*SR)); t=0.0; k=0
        while t<5.0:
            a=int((t+rng.uniform(-0.004,0.004))*SR) if k else 0; a=max(0,a)
            nxt=int((t+0.08)*SR); L=min(len(one), nxt-a+int(0.05*SR), len(out)-a)
            seg=one[:L].copy(); f=int(0.05*SR); seg[-f:]*=np.linspace(1,0,f)   # the next pick stops this one
            g=(1.0 if k%2==0 else 0.82)*(0.75+0.25*min(1,t/0.25))                # down louder than up; a little swell in
            out[a:a+L]+=g*seg; t+=0.08; k+=1
        add("mandolin_trem", n, "s", "held", out[:int(5.0*SR)])
if want("dobro"):
    for n in MARTIN[1:]+[86]:
        src=min(n,83); x=speed(martin(src), n-src)
        x=hp(x, 110); x=peq(x, 300, -4.0, 0.9); x=peq(x, 900, 6.0, 1.2); x=peq(x, 2200, 4.0, 2.0)
        d=int(0.0007*SR); y=x.copy(); y[d:]+=0.3*x[:-d]                     # the cone's short metal ring
        add("dobro", n, "s", "pluck", y[:int(3.0*SR)])
# ── made from the green electric guitar: the pedal steel ──
if want("steel"):
    for n in [46,49,52,55,58,61,64,67,70,73,76,79,82,85]:
        src=min(n,82); x=load(os.path.join(GUITAR,"green","z%d_v2_r1.mp3"%src), left=False); x=x[onset(x):]; x=speed(x, n-src)
        env=np.sqrt(np.maximum(signal.filtfilt(np.ones(int(0.05*SR))/int(0.05*SR), [1], x*x), 1e-12))
        ref=np.max(env[int(0.05*SR):int(0.3*SR)])
        lift=np.clip((ref/env)**0.6, 1, 8)                                   # the decay evened out, as a steel sings on
        lift[:int(0.15*SR)]=np.linspace(1, lift[int(0.15*SR)], int(0.15*SR))
        y=x*lift
        sw=int(0.09*SR); y[:sw]*=0.5-0.5*np.cos(np.linspace(0,np.pi,sw))     # the volume pedal's swell
        y=lp(y, 6500); y=peq(y, 2500, 3.0, 1.0)
        add("steel", n, "s", "held", extend(y, n, 4.2))
# ── made by computer: the melodica ──
def melodica(n, loud):
    f=mtof(n); N=int(5.0*SR); t=np.arange(N)/SR
    def smooth(hz): v=signal.lfilter(*signal.butter(1,hz/(SR/2)), rng.normal(0,1,N)); return v/(np.std(v[N//10:])+1e-12)
    cents=-14*np.exp(-t/0.03)+0.8*smooth(3)                           # it speaks a little flat, then settles; a tiny wander
    ph=2*np.pi*np.cumsum(f*2**(cents/1200))/SR
    tilt=0.8 if loud else 1.3; y=np.zeros(N)
    for k in range(1, 60):
        fk=k*f
        if fk>SR*0.45: break
        a=k**-tilt*(1+0.55*np.cos(2*np.pi*k*0.27))*(1+1.2*np.exp(-((fk-1150)/450)**2))*(1+0.6*np.exp(-((fk-3000)/700)**2))
        y+=a*np.sin(k*ph+rng.uniform(0,2*np.pi))
    br=signal.lfilter(*signal.butter(2,[1800/(SR/2),6000/(SR/2)],"band"), rng.normal(0,1,N))
    wob=1+0.012*smooth(5)                                               # the breath is never quite steady
    att=0.035 if loud else 0.06; env=np.minimum(1, t/att)**1.5
    y=y/np.max(np.abs(y))*wob*env + br*(0.02+0.05*np.exp(-t/0.08))*(1.0 if loud else 0.7)
    return y
if want("melodica"):
    for n in range(53, 90, 3):
        add("melodica", n, "s", "held", melodica(n, False)); add("melodica", n, "l", "held", melodica(n, True))

# ── one loudness, the files ──
INSTS=sorted(set(p["inst"] for p in plan))
one={i:len(set(p["key"] for p in plan if p["inst"]==i and p["kind"]=="held"))==1 for i in INSTS}
for p in plan:
    x=p["x"]
    if p["kind"]=="held": x=x[:int(5.0*SR)]; lev=held_level(x); tgt=-18.0 if (one[p["inst"]] or p["key"]=="l") else -26.0; fo=int(0.4*SR)
    elif p["kind"]=="short": x=x[:int(0.9*SR)]; lev=loudest(x); tgt=-17.0; fo=int(0.1*SR)
    else: x=x[:int(3.0*SR)]; lev=loudest(x); tgt=-17.0; fo=int(0.3*SR)
    p["y"]=x.copy(); p["fo"]=fo; p["g"]=10**((tgt-lev)/20)
    p["room"]=20*np.log10(0.95/max(1e-6, np.max(np.abs(x))*p["g"]))
shift={i:min(0.0, min(q["room"] for q in plan if q["inst"]==i)) for i in INSTS}
for inst in INSTS:
    d=os.path.join(BAND,inst)
    if os.path.isdir(d): shutil.rmtree(d)
    os.makedirs(d)
for p in plan:
    x=p["y"]*p["g"]*10**(shift[p["inst"]]/20)
    bandio.fades(x, p["fo"], int(0.002*SR))
    p["file"]="%d%s"%(p["note"], p["key"])
    bandio.mp3(x, os.path.join(BAND,p["inst"],p["file"]+".mp3"), 80 if p["kind"]=="short" else 64)
# ── the tuning, measured on the finished files, and the manifest ──
man=json.load(open(os.path.join(BAND,"manifest.json")),object_pairs_hook=dict)
for inst in INSTS:
    e={"sus":set(),"susL":set(),"stac":set(),"tune":{}}; rows=[]
    for p in [q for q in plan if q["inst"]==inst]:
        n=p["note"]; k=p["key"]
        (e["stac"] if k=="t" else e["sus"]).add(n)
        if k=="l": e["susL"].add(n)
        y=bandio.load(os.path.join(BAND,inst,p["file"]+".mp3"), 0, stereo=False)   # the left microphone of a stereo note, as it was measured
        if p["kind"]=="held":
            h,sp,cnt=tune.heard(y, n, "held")
            if h is None: h=(tune.finalize_yin(y, n)-n)*100
        else:
            h,sp,cnt=tune.heard(y, n, "short")
            if h is None: h=(tune.finalize_yin(y[:int(0.9*SR)], n)-n)*100
        c=int(round(h))
        if abs(c)>=3: e["tune"][p["file"]]=c
        rows.append((p["file"], round(h,1)))
    man[inst]={"sus":sorted(e["sus"]),"susL":sorted(e["susL"]),"stac":sorted(e["stac"]),"tune":e["tune"]}
    d=os.path.join(BAND,inst); size=sum(os.path.getsize(os.path.join(d,f)) for f in os.listdir(d) if f.endswith(".mp3"))
    print("%-14s %2d files %5.0f KB  notes %s  loud %s  short %s  brought down %.1f dB"%(inst, len(os.listdir(d)), size/1024, man[inst]["sus"], man[inst]["susL"] or "-", man[inst]["stac"] or "-", -shift[inst]))
    print("               as made: %s"%" ".join("%s:%+.0f"%r for r in rows))
with open(os.path.join(BAND,"manifest.json"),"w") as fh: json.dump(man, fh, separators=(",",":"))
print(len(man),"players in the manifest")
