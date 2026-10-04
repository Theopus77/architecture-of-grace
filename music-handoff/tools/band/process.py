# The Band: turn the raw VSCO 2 CE recordings into small MP3s for the page, with a manifest.
#   - the true pitch of every note is measured (the library's octave names differ by instrument)
#   - silence before the note is trimmed; held notes keep 5 s, short notes up to 0.9 s, each faded out
#   - every note of a layer is brought to one loudness; soft notes sit 8 dB under loud ones
#   - mono, 32 kHz, MP3 (64 kbps held, 80 kbps short)
import os, sys, json, subprocess, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); RAW=os.path.join(HERE,"raw")
OUT=sys.argv[1] if len(sys.argv)>1 else os.path.join(HERE,"out")
SR=32000
def load(path):
    pcm=subprocess.run(["ffmpeg","-v","error","-i",path,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout
    return np.frombuffer(pcm,dtype=np.float32).copy()
def f0_of(x):
    # autocorrelation over a steady stretch, 50-1400 Hz
    a=int(0.25*SR); seg=x[a:a+int(0.5*SR)]
    if len(seg)<4000: seg=x[:int(0.5*SR)]
    seg=seg-seg.mean()
    n=len(seg); F=np.fft.rfft(seg,2*n); ac=np.fft.irfft(F*np.conj(F))[:n]
    lo,hi=int(SR/1400),int(SR/50); k=lo+np.argmax(ac[lo:hi])
    # prefer the shortest lag whose peak is nearly as strong (octave errors)
    for d in (2,3):
        k2=int(round(k/d))
        if k2>=lo:
            w=max(1,k2//20); j=k2-w+np.argmax(ac[k2-w:k2+w+1])
            if ac[j]>0.86*ac[k]: k=j
    y0,y1,y2=ac[k-1],ac[k],ac[k+1]; off=0.5*(y0-y2)/(y0-2*y1+y2) if (y0-2*y1+y2)!=0 else 0
    return SR/(k+off)
def onset(x):
    pk=np.max(np.abs(x)); i=int(np.argmax(np.abs(x)>pk*0.03)); return max(0,i-int(0.005*SR))
def rms(x,a,b): s=x[int(a*SR):int(b*SR)]; return float(np.sqrt(np.mean(s*s)+1e-12))
plan=json.load(open(os.path.join(HERE,"plan.json")))
notes={}
for p in plan:
    src=os.path.join(RAW,p["inst"],p["art"],"%d%s.wav"%(p["note"],p["layer"]))
    x=load(src); x=x[onset(x):]
    f=f0_of(x); midi=69+12*np.log2(f/440.0)
    p.update(x=x, f0=f, measured=midi)
# the octave offset of each instrument's names: the most common rounded difference between measured and named
for inst in sorted(set(p["inst"] for p in plan)):
    ps=[p for p in plan if p["inst"]==inst]
    diffs=[round((p["measured"]-p["note"])/12)*12 for p in ps]
    off=max(set(diffs),key=diffs.count)
    bad=[p for p,d in zip(ps,diffs) if abs(p["measured"]-(p["note"]+off))>0.6]
    print("%-9s octave offset %+d; notes %d; off-pitch by more than 0.6 semitone: %d %s"%(inst,off,len(ps),len(bad),[(p["art"],p["note"]+off,round(p["measured"],2)) for p in bad][:6]))
    for p in ps: p["midi"]=p["note"]+off; p["cents"]=round((p["measured"]-p["midi"])*100,1)
# levels: one loudness per layer and instrument (held: 0.05-0.8 s; short: its loudest 0.15 s); soft 8 dB under loud
TARGET={"l":-18.0,"s":-26.0,"m":-17.0}
man={}
for p in plan:
    x=p["x"]
    if p["art"]=="sus":
        x=x[:int(5.0*SR)]; r=rms(x,0.05,min(0.8,len(x)/SR))
    else:
        x=x[:int(0.9*SR)]; w=int(0.15*SR); c=np.convolve(x*x,np.ones(w)/w,"valid"); r=float(np.sqrt(np.max(c)+1e-12))
    g=10**((TARGET[p["layer"]]-20*np.log10(r))/20); g=min(g,0.95/max(1e-6,np.max(np.abs(x)))*1.0)
    x=x*g
    fo=int((0.4 if p["art"]=="sus" else 0.1)*SR); fo=min(fo,len(x)//3)
    x[-fo:]*=np.linspace(1,0,fo)**2
    fi=int(0.002*SR); x[:fi]*=np.linspace(0,1,fi)
    d=os.path.join(OUT,p["inst"]); os.makedirs(d,exist_ok=True)
    name="%d%s.mp3"%(p["midi"], {"s":"s","l":"l","m":"t"}[p["layer"]])
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-codec:a","libmp3lame","-b:a","64k" if p["art"]=="sus" else "80k",os.path.join(d,name)],input=x.astype(np.float32).tobytes(),check=True)
    m=man.setdefault(p["inst"],{"sus":{},"stac":{}})
    m[p["art"]].setdefault(str(p["midi"]),[]).append({"s":"s","l":"l","m":"t"}[p["layer"]])
json.dump({i:{"sus":sorted(int(k) for k in v["sus"]),"susL":sorted(int(k) for k,l in v["sus"].items() if "l" in l),"stac":sorted(int(k) for k in v["stac"])} for i,v in man.items()},open(os.path.join(OUT,"manifest.json"),"w"))
tot=0
for root,ds,fs in os.walk(OUT):
    for f in fs: tot+=os.path.getsize(os.path.join(root,f))
print("written to",OUT,"total %.1f MB"%(tot/1e6))
for i,v in json.load(open(os.path.join(OUT,"manifest.json"))).items(): print("  %-9s held %d-%d (%d notes, %d loud) short %d-%d (%d)"%(i,v["sus"][0],v["sus"][-1],len(v["sus"]),len(v["susL"]),v["stac"][0],v["stac"][-1],len(v["stac"])))
