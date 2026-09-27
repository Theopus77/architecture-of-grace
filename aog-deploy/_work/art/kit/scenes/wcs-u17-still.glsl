/* WCS Unit 17 "World Cultures Today, and Capstone" — pencil still life: a stack of three
   books, an open notebook with ruled hint-lines, a pencil across it and a magnifying glass. */
#define CAM_POS vec3(-0.2390,0.1334,-0.6688)
#define CAM_TGT vec3(-0.0757,-0.0152,0.0658)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define BK vec3(-.02,0.,.12)
vec3 bkQ(vec3 p,int i){ float fi=float(i); vec3 q=p-BK-vec3(.01*sin(fi*2.),.025+fi*.05,0.); q.xz=rot(1.5708+.15*sin(fi*2.3+1.))*q.xz; return q; }
float books(vec3 p){ float d=1e5; for(int i=0;i<3;i++){ vec3 q=bkQ(p,i); float fi=float(i); vec3 s=vec3(.12-fi*.012,.024,.085-fi*.006);
    float c=sdRBox(q,s,.004); c=max(c,-sdBox(q-vec3(.01,0.,0.),vec3(s.x,s.y-.004,s.z-.003))); d=min(d,c); } return d; }
float pages(vec3 p){ float d=1e5; for(int i=0;i<3;i++){ vec3 q=bkQ(p,i); float fi=float(i); vec3 s=vec3(.12-fi*.012,.024,.085-fi*.006);
    d=min(d,sdBox(q-vec3(.008,0.,0.),vec3(s.x-.004,s.y-.005,s.z-.005))); } return d; }
vec3 nQ(vec3 p){ vec3 q=p-vec3(.2,0.,-.04); q.xz=rot(-.25)*q.xz; return q; }
float note(vec3 p){ vec3 q=nQ(p); float x=abs(q.x); float lift=.006*sin(clamp(x/.1,0.,1.)*1.6)+.004;
  float pg=sdBox(vec3(x-.052,q.y-lift,q.z),vec3(.05,.003,.075))-.001;
  float cov=sdRBox(vec3(x-.055,q.y-.002,q.z),vec3(.055,.002,.078),.001);
  return min(pg,cov); }
float pencil(vec3 p){ vec3 q=nQ(p)-vec3(.02,.014,-.02); q.xz=rot(.6)*q.xz; float R=.0055; vec2 h=abs(q.yz);
  float hex=max(h.x*.866+h.y*.5,h.y)-R*.87; float body=max(hex,abs(q.x)-.08);
  float t=clamp((q.x-.08)/.02,0.,1.); float cone=max(length(q.yz)-R*(1.-t),max(.08-q.x,q.x-.1));
  float era=max(length(q.yz)-R*.9,abs(q.x+.088)-.008)-.0005; return min(min(body,cone),era); }
vec3 mgQ(vec3 p){ vec3 q=p-vec3(.12,0.,-.17); q.xz=rot(.4)*q.xz; return q; }
float mgRim(vec3 p){ vec3 q=mgQ(p)-vec3(0.,.008,0.); float d=sdTorus(q,.045,.006);
  d=min(d,sdCapsule(q,vec3(.05,0.,0.),vec3(.065,0.,0.),.006)); d=min(d,sdCapsule(q,vec3(.065,0.,0.),vec3(.15,0.,0.),.0085)); return d; }
float mgLens(vec3 p){ vec3 q=mgQ(p)-vec3(0.,.008,0.); return sdCylY(q,.044,.002); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,books(p),3.);
  r=U(r,pages(p),4.);
  r=U(r,note(p),5.);
  r=U(r,pencil(p),6.);
  r=U(r,mgRim(p),7.);
  r=U(r,mgLens(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ float y=p.y-BK.y; int i=int(clamp(y/.05,0.,2.)); vec3 q=bkQ(p,i); if(abs(q.x)>.105&&abs(abs(q.y)-.012)<.002) return .2; return i==1?.55:.35; }
  if(id==4.) return fract(p.y/.003)<.3?.7:.9;
  if(id==5.){ vec3 q=nQ(p); if(n.y>.8&&abs(q.x)>.012&&abs(q.x)<.095){ if(fract((q.z+.1)/.011)<.14&&q.z<.06) return .6; if(abs(q.x)>.02&&abs(q.x)<.024) return .55; } return .93; }
  if(id==6.){ vec3 q=nQ(p)-vec3(.02,.014,-.02); q.xz=rot(.6)*q.xz; if(q.x>.08) return q.x>.093?.12:.88; if(q.x<-.08) return .5; return .6; }
  if(id==7.) return .35;
  if(id==8.) return .88;
  return .7; }
