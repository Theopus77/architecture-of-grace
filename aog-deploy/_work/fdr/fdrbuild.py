# AOG-FDR-V1: two records of Franklin D. Roosevelt's own voice (FDR Library recordings, US government, public domain).
import sys, json, os, numpy as np
sys.path.insert(0,"/tmp/claude-0/sc")
from build3 import load, level, snap, write, SR
A="fdr/a/"
def record(pads, gap=0.55):
    out=[np.zeros(int(0.35*SR),np.float32)]; t=0.35; ph=[]
    for f,s,e,label,ref in pads:
        s2,e2=snap(A+f,s,0.15),snap(A+f,e,0.15)
        a=level(load(A+f,s2-0.03,e2+0.06))
        ph.append([round(t,3),round(len(a)/SR,3),label,ref]); out.append(a); t+=len(a)/SR
        out.append(np.zeros(int(gap*SR),np.float32)); t+=gap
    return np.concatenate(out), ph
# The D-Day Prayer, lines cut where the alignment (al290.json) puts each first and last word
W=json.load(open("fdr/al290.json")); ws=[x[0] for x in W]
def span(first,last,after=0):
    f=first.split(); l=last.split()
    i=next(k for k in range(len(ws)) if ws[k:k+len(f)]==f and W[k][1]>=after)
    j=next(k for k in range(i,len(ws)) if ws[k:k+len(l)]==l)+len(l)-1
    return W[i][1], W[j][2]
LINES=[("almighty god","god","Almighty God"),("our sons","endeavor","Our sons, pride of our Nation"),("lead them","true","Lead them straight and true"),
 ("give strength to","faith","Strength to their arms"),("they will need","blessings","They will need Thy blessings"),("their road","hard","Long and hard"),
 ("for the enemy","strong","For the enemy is strong"),("but we shall return","again and again","Again and again"),("they fight not","conquest","Not for the lust of conquest"),
 ("they fight to end","liberate","They fight to liberate"),("they fight to let","people","Let justice arise"),("embrace these","kingdom","Embrace these, Father"),
 ("and o lord","faith","Give us Faith"),("give us faith in thee","crusade","Faith in each other"),("with thy blessing","enemy","We shall prevail"),
 ("thy will be done","amen","Thy will be done")]
pads=[]; after=0
for a,b,lab in LINES:
    s,e=span(a,b,after); after=e; pads.append(("afdr290.mp3",s,e,lab,"June 6, 1944"))
y,ph=record(pads); cue=[0,2,4,7,9,11,12,15]
meta=[]
size=write("26-the-d-day-prayer",y,"The D-Day Prayer (Franklin D. Roosevelt, June 6, 1944)","Franklin D. Roosevelt")
meta.append({"file":"26-the-d-day-prayer.mp3","title":"The D-Day Prayer","title_es":"La oración del Día D (en inglés)","bpm":0,"kind":"scripture","version":"FDR",
  "style":"Speech (FDR, 1944)","style_es":"Discurso (FDR, 1944)","bars":0,"seconds":round(len(y)/SR,1),"bytes":size,
  "line":"Franklin D. Roosevelt's prayer for the troops, June 6, 1944, in his own voice.","line_es":"La oración de Franklin D. Roosevelt por las tropas, 6 de junio de 1944, en su propia voz (en inglés).",
  "verses":[{"ref":"June 6, 1944","ref_es":"6 de junio de 1944","at":ph[i][0],"text":ph[i][2]} for i in cue],"phrases":ph})
print("d-day",[(p[2],round(p[1],1)) for p in ph])
# Words of Courage
I,P,F="afdr012.mp3","afdr244.mp3","afdr224.mp3"
R1,R2,R3="First Inaugural, March 4, 1933","Address to Congress, December 8, 1941","State of the Union, January 6, 1941"
pads=[(I,140.5,145.45,"This great Nation will endure",R1),(I,145.45,148.35,"Will revive and will prosper",R1),(I,154.3,159.8,"Let me assert my firm belief",R1),
 (I,159.8,163.85,"The only thing we have to fear",R1),(P,798.5,807.2,"Yesterday, December 7, 1941",R2),(P,807.2,811.95,"A date which will live in infamy",R2),
 (P,812.35,828.45,"Suddenly and deliberately attacked",R2),(P,1063.5,1070.9,"No matter how long it may take us",R2),(P,1070.9,1076.6,"In their righteous might",R2),
 (P,1163.5,1170.0,"So help us God",R2),(F,1972.2,1975.5,"Four essential human freedoms",R3),(F,1977.4,1983.1,"Freedom of speech and expression",R3),
 (F,1984.0,1985.9,"Everywhere in the world",R3),(F,1988.2,1996.3,"To worship God in his own way",R3),(F,2000.5,2003.7,"Freedom from want",R3),(F,2024.7,2028.5,"Freedom from fear",R3)]
y,ph=record(pads); cue=[0,2,4,5,7,9,10,13]
size=write("27-fdr-words-of-courage",y,"Words of Courage (Franklin D. Roosevelt, 1933-1941)","Franklin D. Roosevelt")
meta.append({"file":"27-fdr-words-of-courage.mp3","title":"FDR · Words of Courage","title_es":"FDR · Palabras de valor (en inglés)","bpm":0,"kind":"scripture","version":"FDR",
  "style":"Speech (FDR)","style_es":"Discurso (FDR)","bars":0,"seconds":round(len(y)/SR,1),"bytes":size,
  "line":"Franklin D. Roosevelt in his own voice: fear itself, a date of infamy, the four freedoms.","line_es":"Franklin D. Roosevelt en su propia voz (en inglés): el miedo, el día de la infamia, las cuatro libertades.",
  "verses":[{"ref":pads[i][4],"ref_es":pads[i][4],"at":ph[i][0],"text":ph[i][2]} for i in cue],"phrases":ph})
print("courage",[(p[2],round(p[1],1)) for p in ph])
json.dump(meta,open("out/fdr.json","w"),indent=1,ensure_ascii=False)
