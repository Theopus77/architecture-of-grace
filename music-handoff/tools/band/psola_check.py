import os, numpy as np
src=open("pitch3.py").read().split("rows=[]")[0]; ns={"__file__":os.path.abspath("pitch3.py")}; exec(src, ns)
load, yin, SR = ns["load"], ns["yin"], 32000
def analyse(path, m):
    x=load(path); a=int(0.3*SR); seg=x[a:a+int(1.0*SR)]
    if len(seg)<SR//4: seg=x[int(0.02*SR):int(0.4*SR)]
    w=np.hanning(len(seg)); S=np.abs(np.fft.rfft(seg*w)); f=np.fft.rfftfreq(len(seg),1/SR)
    cen=float(np.sum(f*S**2)/np.sum(S**2))
    f0=440*2**((m-69)/12); h=np.zeros_like(S,bool)
    for k in range(1,int(8000/f0)):
        h|=np.abs(f-k*f0)<f0*0.08
    harm=10*np.log10(np.sum(S[h&(f<8000)]**2)/max(1e-12,np.sum(S[(~h)&(f<8000)&(f>f0*0.5)]**2)))
    fr=int(0.01*SR); env=np.array([np.sqrt(np.mean(x[i:i+fr]**2)) for i in range(0,len(x)-fr,fr)])
    pk=env.max(); mid=env[int(0.1*len(env)):int(0.8*len(env))]
    jump=float(np.max(np.abs(np.diff(20*np.log10(mid+pk*1e-3)))))
    c=round((yin(x,m)-m)*100)
    return cen, harm, jump, c, len(x)/SR
print("%-10s %8s %8s %8s %7s %6s"%("file","centroid","harm dB","env jump","cents","secs"))
for f,m in [("57s",57),("60s",60),("63s",63),("66s",66),("70s",70),("74s",74),("77s",77),("57l",57),("60l",60),("63l",63),("66l",66),("57t",57),("60t",60),("63t",63),("66t",66),("70t",70),("74t",74)]:
    r=analyse("out/horn/%s.mp3"%f, m); print("%-10s %8.0f %8.1f %8.2f %7d %6.2f"%(f,)+r if False else "%-10s %8.0f %8.1f %8.2f %7d %6.2f"%((f,)+r))
