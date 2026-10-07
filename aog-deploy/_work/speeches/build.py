# AOG-SPEECHES-V1 (2026-10-06): four records of John F. Kennedy's and Ronald Reagan's own voices, US government recordings.
# Run from the scratch folder that holds jr/a/ (see README.md for where each recording comes from).
import sys, json, os, subprocess, numpy as np
sys.path.insert(0,"/tmp/claude-0/sc")
from build3 import load, level, snap, SR
A="jr/a/"
def record(pads, gap=0.55):
    out=[np.zeros(int(0.35*SR),np.float32)]; t=0.35; ph=[]
    for f,s,e,label,ref in pads:
        s2,e2=snap(A+f,s,0.12),snap(A+f,e,0.12)
        a=level(load(A+f,s2-0.03,e2+0.06))
        ph.append([round(t,3),round(len(a)/SR,3),label,ref]); out.append(a); t+=len(a)/SR
        out.append(np.zeros(int(gap*SR),np.float32)); t+=gap
    return np.concatenate(out), ph
def write(fn, y, title, artist):
    out=f"out/{fn}.mp3"
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-c:a","libmp3lame","-b:a","64k","-id3v2_version","3",
        "-metadata",f"title={title}","-metadata",f"artist={artist}","-metadata","comment=US government recording, public domain.",out],input=y.tobytes(),check=True)
    return os.path.getsize(out)
meta=[]
def make(fn, pads, cue, title, title_es, artist, style, style_es, line, line_es, ref_es):
    y,ph=record(pads)
    size=write(fn,y,title+" ("+artist+")",artist)
    meta.append({"file":fn+".mp3","title":title,"title_es":title_es,"bpm":0,"kind":"speech","version":"JFK" if artist=="John F. Kennedy" else artist.split()[-1],
      "style":style,"style_es":style_es,"bars":0,"seconds":round(len(y)/SR,1),"bytes":size,"line":line,"line_es":line_es,
      "verses":[{"ref":pads[i][4],"ref_es":ref_es.get(pads[i][4],pads[i][4]),"at":ph[i][0],"text":ph[i][2]} for i in cue],"phrases":ph})
    print(fn, round(len(y)/SR,1), "s", [(p[2],round(p[1],1)) for p in ph])

# 28 · JFK's Inaugural Address, January 20, 1961 (JFK Library recording)
R="Inaugural Address, January 20, 1961"; F="inaug.mp3"
make("28-jfk-ask-not", [(F,19.0,26.1,"A celebration of freedom",R),(F,77.98,86.10,"From the hand of God",R),(F,94.75,102.24,"Let the word go forth",R),
 (F,102.54,107.36,"The torch has been passed",R),(F,151.01,160.22,"Pay any price, bear any burden",R),(F,161.42,168.28,"Support any friend, oppose any foe",R),
 (F,285.49,293.59,"If a free society cannot help the many",R),(F,477.89,483.85,"Never fear to negotiate",R),(F,598.08,604.20,"But let us begin",R),
 (F,710.65,719.62,"The hour of maximum danger",R),(F,720.51,724.52,"I welcome it",R),(F,750.81,755.63,"Truly light the world",R),
 (F,756.44,766.55,"Ask not what your country can do for you",R),(F,774.75,786.91,"For the freedom of man",R),(F,819.06,822.21,"Lead the land we love",R),
 (F,826.93,833.74,"God's work must truly be our own",R)], [0,2,3,4,8,12,13,15],
 "JFK · Ask Not","JFK · No preguntes (en inglés)","John F. Kennedy","Speech (JFK, 1961)","Discurso (JFK, 1961)",
 "John F. Kennedy's inaugural address, January 20, 1961, in his own voice.","El discurso inaugural de John F. Kennedy, 20 de enero de 1961, en su propia voz (en inglés).",
 {R:"Discurso inaugural, 20 de enero de 1961"})

# 29 · JFK at Rice University, September 12, 1962 (the Moon speech)
R="Rice University, September 12, 1962"; F="moon.mp3"
make("29-jfk-we-choose-the-moon", [(F,88.93,100.14,"We stand in need of all three",R),(F,101.57,104.30,"An hour of change and challenge",R),
 (F,111.83,116.03,"Knowledge increases, ignorance unfolds",R),(F,243.44,247.61,"Reached the stars before midnight",R),(F,284.81,289.34,"Not built by those who waited",R),
 (F,339.08,344.03,"Space will go ahead",R),(F,345.44,348.17,"One of the great adventures",R),(F,469.42,477.17,"We set sail on this new sea",R),
 (F,562.67,567.03,"But why, some say, the Moon?",R),(F,576.73,578.08,"Why does Rice play Texas?",R),(F,578.92,580.49,"We choose to go to the Moon",R),
 (F,589.68,593.52,"In this decade",R),(F,594.13,597.28,"Not because they are easy",R),(F,605.60,613.73,"One we are unwilling to postpone",R),
 (F,1095.98,1099.60,"Because it is there",R),(F,1100.59,1108.41,"We're going to climb it",R)], [1,3,7,8,10,12,14,15],
 "JFK · We Choose the Moon","JFK · Elegimos ir a la Luna (en inglés)","John F. Kennedy","Speech (JFK, 1962)","Discurso (JFK, 1962)",
 "John F. Kennedy at Rice University, September 12, 1962: we choose to go to the Moon.","John F. Kennedy en la Universidad Rice, 12 de septiembre de 1962: elegimos ir a la Luna (en inglés).",
 {R:"Universidad Rice, 12 de septiembre de 1962"})

# 30 · Reagan's address on the Challenger, January 28, 1986 (Reagan Library recording)
R="Address on the Challenger, January 28, 1986"; F="challenger.mp3"
make("30-reagan-challenger", [(F,11.60,13.89,"A day for mourning and remembering",R),(F,23.41,25.51,"Truly a national loss",R),(F,36.34,38.33,"Never had a tragedy like this",R),
 (F,43.42,49.37,"Aware of the dangers",R),(F,50.45,63.05,"We mourn seven heroes",R),(F,78.80,80.56,"Daring and brave",R),(F,81.77,86.02,"Give me a challenge",R),
 (F,106.67,111.77,"We've only just begun",R),(F,112.43,117.95,"We're still pioneers",R),(F,134.03,137.87,"Expanding man's horizons",R),
 (F,138.93,143.11,"The future belongs to the brave",R),(F,147.30,149.12,"We'll continue to follow them",R),(F,180.56,183.65,"Nothing ends here",R),
 (F,236.85,240.89,"We will never forget them",R),(F,241.72,248.00,"Slipped the surly bonds of earth",R),(F,249.00,250.33,"To touch the face of God",R)], [0,4,6,8,10,12,14,15],
 "Reagan · Challenger","Reagan · Challenger (en inglés)","Ronald Reagan","Speech (Reagan, 1986)","Discurso (Reagan, 1986)",
 "Ronald Reagan's words to the nation after the Challenger, January 28, 1986, in his own voice.","Las palabras de Ronald Reagan a la nación tras el Challenger, 28 de enero de 1986, en su propia voz (en inglés).",
 {R:"Discurso sobre el Challenger, 28 de enero de 1986"})
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"berlin.py")).read())
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"trump.py")).read())
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"quotables.py")).read())
json.dump(meta,open("out/speeches.json","w"),indent=1,ensure_ascii=False)
