/* Practice room "Capstone: An Inquiry from the Sources" — pencil still life: an open file box
   full of tabbed folders (the sources gathered), a stack of index cards held by a binder clip
   (notes, one claim per card, hint-lines only), and three books of different sizes stacked. */
#define CAM_POS vec3(-0.2802,0.3050,-0.6363)
#define CAM_TGT vec3(-0.1711,-0.0468,0.0967)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define FB vec3(0.,0.,.06)
#define CD vec3(.15,0.,-.08)
#define BKS vec3(-.16,0.,-.03)
vec3 fbQ(vec3 p){ vec3 q=p-FB; q.xz=rot(-.3)*q.xz; return q; }
float boxD(vec3 q){ vec3 h=vec3(.08,.05,.06); float d=sdRBox(q-vec3(0.,h.y,0.),h,.003); d=max(d,-sdBox(q-vec3(0.,h.y+.004,0.),h-vec3(.004,0.,.004))); return d; }
float foldersD(vec3 q){ float d=1e3; for(int i=0;i<7;i++){ float z=-.045+float(i)*.015; vec3 f=q-vec3(0.,.072,z); f.yz=rot(-.1)*f.yz;
    float tab=float(i%3)*.045-.045; float fd=sdBox(f,vec3(.074,.045,.0008)); fd=min(fd,sdRBox(f-vec3(tab,.049,0.),vec3(.016,.006,.0008),.001));
    d=min(d,fd); } return d; }
vec3 cdQ(vec3 p){ vec3 q=p-CD; q.xz=rot(.35)*q.xz; return q; }
float cardsD(vec3 q){ float d=1e3; for(int k=0;k<6;k++){ vec3 c=q-vec3(.002*sin(float(k)*2.),.0012+float(k)*.0024,.002*cos(float(k)*3.)); c.xz=rot(.04*sin(float(k)*1.7))*c.xz; d=min(d,sdBox(c,vec3(.06,.0009,.037))); } return d; }
float clipD(vec3 q){ vec3 c=q-vec3(0.,.008,-.037); float d=max(sdBox(c,vec3(.016,.012,.006)),-sdBox(c-vec3(0.,0.,.004),vec3(.02,.009,.006)));
  d=min(d,sdTorus((c-vec3(0.,.018,-.004)).xzy,.01,.0012)); return d; }
float booksD(vec3 p){ float d=1e3; vec3 s=vec3(.075,.012,.055);
  for(int i=0;i<3;i++){ vec3 q=p-BKS-vec3(0.,float(i)*.024,0.); q.xz=rot(.2*float(i)-.15)*q.xz; vec3 ss=s*vec3(1.-.12*float(i),1.,1.-.1*float(i)); d=min(d,bookD(q,ss)); } return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 f=fbQ(p);
  r=U(r,boxD(f),3.);
  r=U(r,foldersD(f),4.);
  vec3 c=cdQ(p);
  r=U(r,cardsD(c),5.);
  r=U(r,clipD(c),6.);
  r=U(r,booksD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 f=fbQ(p); if(f.z<-.058&&abs(f.x)<.03&&abs(f.y-.06)<.01) return .35; return .55; }
  if(id==4.) return .82;
  if(id==5.){ vec3 c=cdQ(p); if(c.y>.013){ float l=fract((c.z+.03)/.011); if(c.z<.02&&c.z>-.03&&abs(c.x)<.05&&l<.16) return .35; if(abs(c.z-.026)<.0012&&abs(c.x)<.055) return .45; } return .94; }
  if(id==6.) return .3;
  if(id==7.){ vec3 q=p-BKS; float k=floor(q.y/.024); if(n.y>.8) return .5+.1*k; return fract(q.y/.024)>.15&&fract(q.y/.024)<.9?.88:.4; }
  return .7; }
