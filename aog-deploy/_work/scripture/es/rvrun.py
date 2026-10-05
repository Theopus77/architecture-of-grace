import sys, json, subprocess
from rvfind import V, est
from rvtexts import T
i=int(sys.argv[1]); it=V[i]; e0,e1,dur=est(it)
r=subprocess.run(["python3","esfind.py","rv/"+it[4],T[it[0]],str(max(0,e0-70)),str(min(dur,e1+70))],capture_output=True,text=True)
j=json.loads(r.stdout.strip().splitlines()[-1]); j.update(id=it[0],est=[round(e0,1),round(e1,1)]); print(json.dumps(j))
