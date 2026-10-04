# The Band's percussion, from VS Chamber Orchestra: Community Edition (CC0): fetch every file of the timpani, the
# three mallet instruments and the unpitched pieces we may use, into raw2perc/ (the names are kept).
import os, subprocess, sys
REPO="/home/user/sgossner/vsco-2-ce"; HERE=os.path.dirname(os.path.abspath(__file__)); OUT=os.path.join(HERE,"raw2perc")
FILES=open(os.path.join(os.path.dirname(HERE),"vsco-files.txt")).read().split("\n")
WANT=("Percussion/Timpani/","Percussion/Xylo/","Percussion/Glock/","Percussion/Marimba/",
      "Percussion/BDrumNewhit_","Percussion/Snare2-HitSN_","Percussion/Snare2-rollSN_","Percussion/susCymb1-hitstick_",
      "Percussion/susCymb1-cresc-","Percussion/Triangle3-Hit_","Percussion/Tamb1-Hit_","Percussion/Tamb1-Shake_","Percussion/cymbal-crash1_")
picked=[f for f in FILES if f.lower().endswith(".wav") and f.startswith(WANT)]
os.makedirs(OUT, exist_ok=True)
for f in picked:
    dst=os.path.join(OUT, f[len("Percussion/"):].replace("/","__"))
    if os.path.exists(dst) and os.path.getsize(dst)>1000: continue
    with open(dst,"wb") as fh: subprocess.run(["git","-C",REPO,"show","HEAD:"+f],stdout=fh,check=True)
print(len(picked),"files in",OUT)
