import sys
from find import wav
from refine import rms
f=sys.argv[1]; a=float(sys.argv[2]); b=float(sys.argv[3]); marks=[float(x) for x in sys.argv[4:]]
r=rms(wav(f)); m=r[int(a*100):int(b*100)].max()
s=list(''.join(' .:-=+*#%@'[min(9,max(0,int((v-m+45)/5)))] for v in r[int(a*100):int(b*100)]))
for x in marks:
    i=int(round((x-a)*100));
    if 0<=i<len(s): s[i]='|'
s=''.join(s); [print(f'{a+i/100:7.2f} '+s[i:i+100]) for i in range(0,len(s),100)]
