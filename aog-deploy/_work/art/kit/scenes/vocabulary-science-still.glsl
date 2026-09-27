/* Room "Science" (vocabulary) — pencil still life: a wooden rack holding three test tubes filled
   to different levels, a glass thermometer lying in front, and a ring of word cards on a metal
   binder ring (hint-lines only). */
#define CAM_POS vec3(-0.3590,0.2553,-0.5951)
#define CAM_TGT vec3(-0.1529,0.0047,0.0532)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define RK vec3(-.04,0.,.07)
#define TR .014
vec3 rkQ(vec3 p){ return place(p,RK,.2); }
float rackD(vec3 p){ vec3 q=rkQ(p);
  float base=sdRBox(q-vec3(0.,.006,0.),vec3(.1,.006,.035),.003);
  float shelf=sdRBox(q-vec3(0.,.07,0.),vec3(.1,.005,.03),.003);
  for(int i=0;i<3;i++){ float x=-.05+float(i)*.05; shelf=max(shelf,-sdCylY(q-vec3(x,.07,0.),TR+.002,.01)); }
  float ends=sdRBox(vec3(abs(q.x)-.095,q.y-.04,q.z),vec3(.005,.04,.03),.002);
  return min(min(base,shelf),ends); }
float tubesD(vec3 p,out float lvl){ vec3 q=rkQ(p); float d=1e5; lvl=0.;
  for(int i=0;i<3;i++){ float x=-.05+float(i)*.05; vec3 t=q-vec3(x,0.,0.);
    float tube=max(abs(sdCapsule(t,vec3(0.,.02,0.),vec3(0.,.16,0.),TR))-.0012,t.y-.16);
    tube=min(tube,sdTorus(t-vec3(0.,.16,0.),TR,.0018));
    if(tube<d){ d=tube; lvl=.06+float(i)*.03-t.y; lvl=t.y<.05+float(i)*.035?1.:0.; } }
  return d; }
float liquidD(vec3 p){ vec3 q=rkQ(p); float d=1e5;
  for(int i=0;i<3;i++){ float x=-.05+float(i)*.05; vec3 t=q-vec3(x,0.,0.); float top=.06+float(i)*.035;
    d=min(d,max(sdCapsule(t,vec3(0.,.02,0.),vec3(0.,.16,0.),TR-.0015),t.y-top)); }
  return d; }
vec3 thQ(vec3 p){ vec3 q=p-vec3(.06,.005,-.12); q.xz=rot(-.15)*q.xz; return q; }
float thermoD(vec3 p){ vec3 q=thQ(p); float tube=sdCapsule(q,vec3(-.09,0.,0.),vec3(.08,0.,0.),.0045); float bulb=length(q-vec3(-.093,0.,0.))-.0065; return min(tube,bulb); }
vec3 cdQ(vec3 p){ return place(p,vec3(.16,0.,.0),-.4)/1.4; }
float cardsD(vec3 p){ vec3 q=cdQ(p); float d=1e5;
  for(int i=0;i<4;i++){ vec3 c=q-vec3(0.,.002+float(i)*.0035,0.); c.xz=rot(float(i)*.12)*c.xz; d=min(d,sdBox(c-vec3(.02,0.,0.),vec3(.045,.0012,.028))); }
  float ring=sdTorus((q-vec3(-.02,.008,0.)).xzy.yxz,.012,.002); ring=length(vec2(length((q-vec3(-.02,.008,0.)).xy)-.012,q.z))-.002;
  return min(d,ring); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,rackD(p),3.);
  float l; r=U(r,tubesD(p,l),4.);
  r=U(r,liquidD(p),5.);
  r=U(r,thermoD(p),6.);
  r=U(r,cardsD(p)*1.4,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45+.15*grain(rkQ(p),70.);
  if(id==4.){ vec3 q=rkQ(p); float i=clamp(floor((q.x+.075)/.05),0.,2.); float top=.06+i*.035; if(q.y<top&&q.y>.02) return abs(q.y-top)<.003?.3:.55; return .93; }
  if(id==5.) return .45;
  if(id==6.){ vec3 q=thQ(p); if(q.x<-.085) return .3; if(abs(q.z)<.0012&&q.x<.02) return .3; if(fract(q.x/.008)<.12&&q.z<-.002) return .45; return .9; }
  if(id==7.){ vec3 q=cdQ(p); if(n.y>.6&&q.y>.012){ vec2 u=q.xz-vec2(.02,0.); u=rot(.36)*u; if(abs(u.x)<.032&&abs(u.y)<.018&&fract(u.y/.009)<.2) return .5; } return .93; }
  return .7; }
