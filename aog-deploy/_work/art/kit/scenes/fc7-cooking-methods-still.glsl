/* Room fc7 "Cooking Methods and Heat" — pencil still life: a saucepan with its lid on (moist
   heat: boiling and simmering), a shallow frying pan in front (dry heat: sauteing), and a
   wooden spoon resting across the frying pan's handle. */
#define CAM_POS vec3(-0.3051,0.3399,-0.8072)
#define CAM_TGT vec3(-0.1732,-0.0852,0.0786)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
vec3 spQ(vec3 p){ return place(p,vec3(-.02,0.,.1),-.35); }
float panD(vec3 q){ float R=.075,H=.085;
  float outer=sdCylY(q-vec3(0.,H*.5,0.),R,H*.5)-.003;
  float inner=sdCylY(q-vec3(0.,H*.5+.005,0.),R-.004,H*.5);
  float d=max(outer,-inner);
  d=min(d,sdTorus(q-vec3(0.,H,0.),R-.001,.003));
  float hd=sdCapsule(q,vec3(R-.004,H-.018,0.),vec3(R+.15,H+.005,0.),.0085);
  hd=min(hd,sdRBox(q-vec3(R+.008,H-.02,0.),vec3(.012,.01,.012),.004));
  return min(d,hd); }
float lidD(vec3 q){ float H=.085; vec3 l=q-vec3(0.,H+.002,0.);
  float dome=max(abs(sdEll(l,vec3(.079,.028,.079)))-.0015,-l.y);
  float rim=sdTorus(l,.078,.0025);
  float knob=sdCylY(l-vec3(0.,.034,0.),.012,.005)-.004;
  float stem=sdCylY(l-vec3(0.,.028,0.),.005,.006);
  return min(min(dome,rim),min(knob,stem)); }
vec3 fpQ(vec3 p){ return place(p,vec3(.12,0.,-.1),.35); }
float fryD(vec3 q){ float r=length(q.xz); float R=.085+.35*(q.y);
  float outer=max(r-R,abs(q.y-.018)-.018)-.0025;
  float inner=max(r-R+.005,abs(q.y-.023)-.018);
  float d=max(outer,-inner);
  d=min(d,sdTorus(q-vec3(0.,.036,0.),.085+.35*.036,.003));
  float hd=sdCapsule(q,vec3(-.1,.03,0.),vec3(-.25,.05,0.),.008);
  return min(d,hd); }
vec3 wsQ(vec3 p){ vec3 q=p-vec3(-.12,.012,-.2); q.xz=rot(-.55)*q.xz; return q; }
float woodSpoonD(vec3 q){ float h=sdCapsule(q,vec3(-.11,.0,0.),vec3(.06,.002,0.),.0055);
  vec3 b=q-vec3(.09,.006,0.); float bw=sdEll(b,vec3(.032,.009,.022)); bw=max(bw,-sdEll(b-vec3(0.,.006,0.),vec3(.028,.007,.018)));
  return smin(h,bw,.008); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 s=spQ(p);
  r=U(r,panD(s),3.);
  r=U(r,lidD(s),4.);
  r=U(r,fryD(fpQ(p)),5.);
  r=U(r,woodSpoonD(wsQ(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=spQ(p); if(length(q.xz)>.085) return .3; return .72; }
  if(id==4.){ vec3 q=spQ(p); if(q.y>.11) return .35; return .8; }
  if(id==5.){ vec3 q=fpQ(p); if(q.x<-.105) return .3; if(n.y>.8&&q.y<.01) return .35; return .5; }
  if(id==6.) return .65+.08*grain(p,90.);
  return .7; }
