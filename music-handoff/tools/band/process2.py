# The Band, more ways to sound: turn the new raw VSCO 2 CE recordings into small MP3s, the way process.py made the
# first ones.
#   - the true pitch of every note is measured (the library's octave names differ by instrument)
#   - the quiet before the note is trimmed
#   - held notes keep 5 s (0.4 s fade); short notes up to 0.9 s (0.1 s fade); a pluck (pizzicato, harp) keeps its own
#     ring until it has died away by 50 dB, at most 3 s (harp 5 s), and fades over its last 0.3 s
#   - every note of a layer is brought to one loudness: held notes by their loudest 0.4 s in the first 2.5 s (a bow or
#     a breath can take a moment to swell), short notes and plucks by their loudest 0.15 s; soft notes sit 8 dB under
#     loud ones; a player recorded at one strength only sits at the loud level. If a note's peak would pass 0.95, the
#     whole player comes down together (the page's PLAYER level brings it back), so its notes stay even
#   - mono, 32 kHz, MP3 (64 kbps held and plucked, 80 kbps short)
import os, sys, json, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tune
HERE=os.path.dirname(os.path.abspath(__file__)); RAW=os.path.join(HERE,"raw2")
OUT=sys.argv[1] if len(sys.argv)>1 else os.path.join(HERE,"out2")
ONLY=sys.argv[2].split(",") if len(sys.argv)>2 else None
SR=32000
def load(path):
    pcm=subprocess.run(["ffmpeg","-v","error","-i",path,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout
    return np.frombuffer(pcm,dtype=np.float32).astype(np.float64)
def onset(x):
    pk=np.max(np.abs(x)); i=int(np.argmax(np.abs(x)>pk*0.03)); return max(0,i-int(0.005*SR))
def cmndf(seg, lo, hi):
    W=len(seg)-hi-1
    d=np.array([np.sum((seg[:W]-seg[t:t+W])**2) for t in range(0,hi+1)])
    c=np.ones_like(d); cs=np.cumsum(d[1:]); c[1:]=d[1:]*np.arange(1,len(d))/np.maximum(cs,1e-12)
    return c
def octave_of(x, named):
    """which octave the note really sounds in: YIN's normalised difference at the period of the named note and of the
    notes one and two octaves either side; the highest one whose dip is (nearly) the deepest wins"""
    a=int(0.12*SR); seg=x[a:a+int(0.35*SR)]
    if len(seg)<int(0.25*SR): seg=x[:int(0.35*SR)]
    seg=seg-seg.mean()
    cands=[named+12*k for k in (-2,-1,0,1,2)]
    per=[SR/(440*2**((m-69)/12)) for m in cands]
    hi=int(min(len(seg)//3, max(per)*2**(0.7/12)+2)); c=cmndf(seg, 2, hi)
    score=[]
    for m,P in zip(cands,per):
        l=int(P*2**(-0.6/12)); h=int(np.ceil(P*2**(0.6/12)))
        if l<2 or h>=len(c): score.append(9.0); continue
        score.append(float(np.min(c[l:h+1])))
    best=min(score)
    ok=[m for m,s in zip(cands,score) if s<=best+0.08 and s<0.45]
    return (max(ok) if ok else cands[int(np.argmin(score))]), dict(zip(cands,[round(s,3) for s in score]))
def loudest(x, w=0.15):
    n=int(w*SR)
    if len(x)<=n: return float(np.sqrt(np.mean(x*x)+1e-12))
    c=np.concatenate([[0.0],np.cumsum(x*x)]); return float(np.sqrt(np.max(c[n:]-c[:-n])/n+1e-12))   # the same as a moving average, quicker
def ring_end(x, maxs):
    """where a pluck has died away by 50 dB (20 ms steps), at most maxs seconds"""
    fr=int(0.02*SR); n=min(len(x), int(maxs*SR))//fr
    env=np.array([np.sqrt(np.mean(x[i*fr:(i+1)*fr]**2)+1e-15) for i in range(n)])
    pk=env.max(); quiet=np.where(env<pk*10**(-50/20))[0]; quiet=quiet[quiet>int(0.1/0.02)]
    return int(min(len(x), (quiet[0]+1)*fr if len(quiet) else n*fr))
plan=json.load(open(os.path.join(HERE,"plan2.json")))
if ONLY: plan=[p for p in plan if p["inst"] in ONLY]
for p in plan:
    src=os.path.join(RAW,p["inst"],p["art"],"%d%s.wav"%(p["note"],p["layer"]))
    x=load(src); x=x[onset(x):]
    oc,sc=octave_of(x, p["note"])
    p.update(x=x, oct=oc-p["note"], scores=sc)
# each player's octave offset: the most common one; a note whose own differs is reported
for inst in sorted(set(p["inst"] for p in plan)):
    ps=[p for p in plan if p["inst"]==inst]
    diffs=[p["oct"] for p in ps]; off=max(set(diffs),key=diffs.count)
    odd=[(p["art"],p["layer"],p["note"],p["oct"]) for p in ps if p["oct"]!=off]
    print("%-17s octave offset %+d over %d files; differing: %s"%(inst,off,len(ps),odd[:8]))
    for p in ps:
        p["midi"]=p["note"]+off
        c,sp,n=tune.heard(p["x"][:int(5*SR)], p["midi"], p["kind"])
        if c is not None and abs(c)>50:     # recorded a semitone from its name (as the clarinet's top note was)
            print("   relabel %s %s %s: %d sounds %+.0f cents from it -> %d"%(inst,p["art"],p["layer"],p["midi"],c,p["midi"]+int(np.sign(c))))
            p["midi"]+=int(np.sign(c))
TARGET={"held":{"l":-18.0,"s":-26.0},"pluck":{"l":-21.0,"s":-29.0},"short":{"m":-17.0}}
one={i:not any(q["layer"]=="l" for q in plan if q["inst"]==i) for i in set(p["inst"] for p in plan)}
for p in plan:
    x=p["x"]; kind=p["kind"]
    if kind=="held":
        x=x[:int(5.0*SR)]; r=loudest(x[:int(2.5*SR)], 0.4); fo=int(0.4*SR)
    elif kind=="pluck":
        x=x[:ring_end(x, 5.0 if p["inst"]=="harp" else 3.0)]; r=loudest(x); fo=int(0.3*SR)
    else:
        x=x[:int(0.9*SR)]; r=loudest(x); fo=int(0.1*SR)
    p["y"]=x; p["fo"]=fo
    p["tgt"]=TARGET[kind]["l" if (one[p["inst"]] and p["layer"]=="s") else p["layer"]]
    p["g"]=10**((p["tgt"]-20*np.log10(r))/20)
    p["room"]=20*np.log10(0.95/max(1e-6,np.max(np.abs(x))*p["g"]))      # dB to spare under the peak limit
shift={i:min(0.0, min(q["room"] for q in plan if q["inst"]==i)) for i in set(p["inst"] for p in plan)}
stats={}
for p in plan:
    x=p["y"]*p["g"]*10**(shift[p["inst"]]/20)
    fo=min(p["fo"],len(x)//3); x[-fo:]*=np.linspace(1,0,fo)**2
    fi=int(0.002*SR); x[:fi]*=np.linspace(0,1,fi)
    d=os.path.join(OUT,p["inst"]); os.makedirs(d,exist_ok=True)
    name="%d%s.mp3"%(p["midi"], {"s":"s","l":"l","m":"t"}[p["layer"]])
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-codec:a","libmp3lame","-b:a","80k" if p["kind"]=="short" else "64k",os.path.join(d,name)],input=x.astype(np.float32).tobytes(),check=True)
    st=stats.setdefault(p["inst"],{"n":0,"secs":[],"peak":0}); st["n"]+=1; st["secs"].append(len(x)/SR); st["peak"]=max(st["peak"],float(np.max(np.abs(x))))
kinds={p["inst"]:("pluck" if p["kind"]=="pluck" else "held") for p in plan if p["art"]=="sus"}
json.dump({"kinds":kinds,"shift_db":{i:round(v,2) for i,v in shift.items()},"layers":{i:("one" if one[i] else "two") for i in one}}, open(os.path.join(OUT,"players.json"),"w"), indent=1)
tot=0
for root,ds,fs in os.walk(OUT):
    for f in fs:
        if f.endswith(".mp3"): tot+=os.path.getsize(os.path.join(root,f))
print("written to",OUT,"total %.2f MB"%(tot/1e6))
for i,st in sorted(stats.items()):
    sz=sum(os.path.getsize(os.path.join(OUT,i,f)) for f in os.listdir(os.path.join(OUT,i)))
    print("  %-17s %3d files %6.0f KB  %.2f-%.2f s  peak %.2f  brought down %.1f dB to keep every peak under 0.95"%(i,st["n"],sz/1e3,min(st["secs"]),max(st["secs"]),st["peak"],-shift[i]))
