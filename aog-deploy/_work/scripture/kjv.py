import re
def load(path="/tmp/claude-0/sc/kjv.txt"):
    txt=open(path,encoding="utf-8",errors="replace").read()
    s=txt.find("1:1 In the beginning"); e=txt.rfind("End of the Project Gutenberg")
    body=re.sub(r"\s+"," ",txt[s:e if e>0 else None])
    parts=re.split(r"(?:(?<=\s)|^)(\d+):(\d+) ",body)
    books=[]; cur=None
    for i in range(1,len(parts)-2,3):
        c,v,t=int(parts[i]),int(parts[i+1]),parts[i+2].strip()
        if c==1 and v==1: cur={}; books.append(cur)
        cur[(c,v)]=t
    return books
B=load()
