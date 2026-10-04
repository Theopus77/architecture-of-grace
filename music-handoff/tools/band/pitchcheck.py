# a second, sturdier pitch check of the processed notes: harmonic sum over the spectrum (60-2600 Hz), and the result
# compared with the note number each file carries
import os, sys, json, subprocess, numpy as np
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"out"); SR=32000
def load(p): return np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout,dtype=np.float32)
def pitch(x, guess):
    a=int(0.08*SR); seg=x[a:a+int(0.4*SR)]
    if len(seg)<2048: seg=x[:int(0.4*SR)]
    seg=seg*np.hanning(len(seg)); N=1<<18; S=np.abs(np.fft.rfft(seg,N)); fr=np.arange(len(S))*SR/N
    best=None
    for m10 in range(int((guess-14)*10), int((guess+14)*10)+1):
        f=440*2**((m10/10-69)/12); sc=0
        for h in range(1,7):
            k=int(round(f*h*N/SR))
            if k+3<len(S): sc+=np.max(S[k-3:k+4])/h**0.5
        if best is None or sc>best[0]: best=(sc,m10/10)
    # refine around the best tenth with the fundamental peak itself (or the 2nd harmonic for weak fundamentals)
    f=440*2**((best[1]-69)/12); k=int(round(f*N/SR)); w=max(3,k//40); j=k-w+int(np.argmax(S[k-w:k+w+1]))
    if 0<j<len(S)-1:
        y0,y1,y2=np.log(S[j-1]+1e-12),np.log(S[j]+1e-12),np.log(S[j+1]+1e-12); off=0.5*(y0-y2)/(y0-2*y1+y2)
        return 69+12*np.log2(((j+off)*SR/N)/440)
    return best[1]
rows=[]
for inst in sorted(os.listdir(OUT)):
    d=os.path.join(OUT,inst)
    if not os.path.isdir(d): continue
    for f in sorted(os.listdir(d)):
        m=int(f[:-5]); x=load(os.path.join(d,f)); p=pitch(x,m)
        rows.append((inst,f,m,round(p,2),round((p-m)*100)))
bad=[r for r in rows if abs(r[4])>30]
print(len(rows),"files checked;", len(bad), "off by more than 30 cents:")
for r in bad: print("  ",r)
worst=sorted(rows,key=lambda r:-abs(r[4]))[:12]
print("largest deviations:", [(r[0],r[1],r[4]) for r in worst])
