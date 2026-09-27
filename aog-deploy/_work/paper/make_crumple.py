# Seamless crumpled-paper texture: flat facets (periodic Voronoi) each tilted a little,
# so light catches them differently and sharp creases appear where they meet. Two
# layers of facets (big folds + small crinkles). Very gentle, mapped onto the cream paper.
import numpy as np
from PIL import Image
N=768; rng=np.random.default_rng(11)
yy,xx=np.mgrid[0:N,0:N].astype(float)
L=np.array([-0.55,-0.65,0.52]); L/=np.linalg.norm(L)
def facets(k,tilt):
    pts=rng.random((k,2))*N
    nrm=rng.normal(0,tilt,(k,2))
    best=np.full((N,N),1e18); idx=np.zeros((N,N),int)
    for dx in (-N,0,N):
        for dy in (-N,0,N):
            for i,(px,py) in enumerate(pts):
                d=(xx-px-dx)**2+(yy-py-dy)**2
                m=d<best; best[m]=d[m]; idx[m]=i
    n=np.dstack([nrm[idx,0],nrm[idx,1],np.ones((N,N))]); n/=np.linalg.norm(n,axis=2,keepdims=True)
    return n@L
s=0.65*facets(26,0.28)+0.35*facets(110,0.18)
s=(s-s.mean())/s.std()
from PIL import ImageFilter
img=Image.fromarray(np.clip(128+s*40,0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
s=(np.array(img).astype(float)-128)/40
base=np.array([247,242,230],float)
out=base[None,None,:]*(1+np.clip(s,-2.5,2.5)[...,None]*0.022)
Image.fromarray(np.clip(out,0,255).astype(np.uint8)).save('../../img/paper-crumple.webp',quality=82,method=6)
a=np.array(Image.open('../../img/paper-crumple.webp')).astype(int); print(a.min(),a.max())
