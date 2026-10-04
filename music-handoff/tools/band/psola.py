# The Band: fill the French horn's missing octave. VSCO 2 CE has no horn notes, held or short, between middle C (60)
# and D5 (74). Three notes are made from the nearest real ones by TD-PSOLA, which moves the pitch but keeps the horn's
# tone colour (its formants) and its timing: 63 and 66 from middle C, 70 from D5. Same levels, fades and MP3s as
# process.py. Run after process.py and before finalize.py.
import os, sys, json, subprocess, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); RAW=os.path.join(HERE,"raw"); OUT=os.path.join(HERE,"out"); SR=32000
UP=4; SRU=SR*UP          # the work is done four times finer than the files, so every cycle lands within a quarter sample
def load(path, sr=SR):
    pcm=subprocess.run(["ffmpeg","-v","error","-i",path,"-ac","1","-ar",str(sr),"-f","f32le","-"],capture_output=True,check=True).stdout
    return np.frombuffer(pcm,dtype=np.float32).astype(np.float64)
def down(y):
    pcm=subprocess.run(["ffmpeg","-v","error","-f","f32le","-ar",str(SRU),"-ac","1","-i","-","-ar",str(SR),"-f","f32le","-"],input=y.astype(np.float32).tobytes(),capture_output=True,check=True).stdout
    return np.frombuffer(pcm,dtype=np.float32).astype(np.float64)
def onset(x, sr=SR):
    pk=np.max(np.abs(x)); i=int(np.argmax(np.abs(x)>pk*0.03)); return max(0,i-int(0.005*sr))
def period_track(x, m, hop=256):
    """the length of one cycle, in samples, every hop samples (YIN, searched within 1.5 semitones of the note)"""
    P=SR/(440*2**((m-69)/12)); lo=int(P*2**(-1.5/12))-1; hi=int(P*2**(1.5/12))+2; W=3*hi
    n=max(1,(len(x)-W-hi)//hop); out=np.full(n, P); pk=np.max(np.abs(x))
    for k in range(n):
        a=k*hop; seg=x[a:a+W+hi]
        if np.max(np.abs(seg))<pk*0.02: continue
        d=np.array([np.sum((seg[:W]-seg[t:t+W])**2) for t in range(lo,hi+1)])
        cm=d*np.arange(1,len(d)+1)/np.maximum(np.cumsum(d),1e-12)       # YIN's normalised difference
        i=int(np.argmin(cm)); t=lo+i
        if 0<i<len(d)-1:
            den=d[i-1]-2*d[i]+d[i+1]
            if den!=0: t+=0.5*(d[i-1]-d[i+1])/den
        out[k]=t
    return out, hop
def marks(x, track, hop):
    """one mark per cycle: the first on the cycle's highest point, each next one where its cycle best matches the one
    before (so every mark sits at the same point of its cycle)"""
    T=lambda i: track[min(len(track)-1, int(i//hop))]
    P0=T(0); w=max(3,int(P0/6)); sm=np.convolve(x[:int(40*P0)], np.ones(w)/w, "same")
    first=int(np.argmax(np.abs(x)>np.max(np.abs(x))*0.05))
    i=first+int(np.argmax(sm[first:first+int(2*T(first))])); M=[i]
    while True:
        p=T(M[-1]); h=int(p//2); c=int(round(M[-1]+p)); r=max(2,int(p/5))
        if c+r+h+int(p)+2>=len(x): break
        ref=x[M[-1]-h:M[-1]+h] if M[-1]-h>=0 else None
        if ref is None: M.append(c); continue
        cc=np.correlate(x[c-r-h:c+r+h], ref, "valid")
        M.append(c-r+int(np.argmax(cc)))
    return np.array(M)
def psola(x, m, semis):
    t32,hop=period_track(x[::UP], m); track=t32*UP; hop*=UP; M=marks(x, track, hop); ratio=2**(semis/12)
    T=lambda i: track[min(len(track)-1, int(i//hop))]
    y=np.zeros(len(x)+4*int(track.max())); ws=np.zeros_like(y)
    t=float(M[0]);
    while t<M[-1]:
        k=int(np.argmin(np.abs(M-t))); a=M[k]; p=int(round(T(a)))
        if a-p<0 or a+p+1>len(x): t+=T(t)/ratio; continue
        g=np.hanning(2*p+1); ts=int(round(t))
        y[ts-p:ts+p+1]+=x[a-p:a+p+1]*g; ws[ts-p:ts+p+1]+=g
        t+=T(a)/ratio
    y[:M[0]]=x[:M[0]]*np.clip(ws[:M[0]]*0+1,0,1)                 # the breath before the first cycle, as it was
    y/=ratio                                                     # the windows overlap ratio times, on average
    return y[:len(x)]
TARGET={"l":-18.0,"s":-26.0,"m":-17.0}
def rms(x,a,b): s=x[int(a*SR):int(b*SR)]; return float(np.sqrt(np.mean(s*s)+1e-12))
def write(x, art, layer, midi, inst="horn"):
    if art=="sus": x=x[:int(5.0*SR)]; r=rms(x,0.05,min(0.8,len(x)/SR))
    else:
        x=x[:int(0.9*SR)]; w=int(0.15*SR); c=np.convolve(x*x,np.ones(w)/w,"valid"); r=float(np.sqrt(np.max(c)+1e-12))
    g=10**((TARGET[layer]-20*np.log10(r))/20); g=min(g,0.95/max(1e-6,np.max(np.abs(x))))
    x=x*g
    fo=int((0.4 if art=="sus" else 0.1)*SR); fo=min(fo,len(x)//3); x[-fo:]*=np.linspace(1,0,fo)**2
    fi=int(0.002*SR); x[:fi]*=np.linspace(0,1,fi)
    d=os.path.join(OUT,inst); os.makedirs(d,exist_ok=True)
    name="%d%s.mp3"%(midi, {"s":"s","l":"l","m":"t"}[layer])
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-codec:a","libmp3lame","-b:a","64k" if art=="sus" else "80k",os.path.join(d,name)],input=x.astype(np.float32).tobytes(),check=True)
    return name
# raw files carry the library's names (an octave under the true pitch for the horn): raw 48 is middle C, raw 62 is D5
MAKE=[("sus","s",48,60,63),("sus","l",48,60,63),("sus","s",48,60,66),("sus","l",48,60,66),("sus","s",62,74,70),
      ("stac","m",48,60,63),("stac","m",48,60,66),("stac","m",62,74,70)]
if __name__=="__main__":
    for art,layer,raw,src,dst in MAKE:
        x=load(os.path.join(RAW,"horn",art,"%d%s.wav"%(raw,layer)), SRU); x=x[onset(x, SRU):]
        y=down(psola(x, src, dst-src))
        print("horn", art, layer, src, "->", dst, write(y, art, layer, dst))
