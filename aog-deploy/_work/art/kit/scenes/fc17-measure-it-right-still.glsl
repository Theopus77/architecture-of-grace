/* Room "Measure It Right" — pencil still life: a glass measuring jug with marked lines, a set
   of three metal measuring cups with long flat handles, and two measuring spoons. */
#define CAM_POS vec3(-0.3755,0.2764,-0.6354)
#define CAM_TGT vec3(-0.1536,-0.0169,0.0462)
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
#define JG vec3(-.06,0.,.08)
vec3 jgQ(vec3 p){ return place(p,JG,-.5); }
float jugD(vec3 p){ vec3 q=jgQ(p);
  float outer=sdCylY(q-vec3(0.,.07,0.),.052,.07)-.003;
  float inner=sdCylY(q-vec3(0.,.08,0.),.047,.07);
  float d=max(outer,-inner);
  /* pouring spout on -x */
  vec3 s=q-vec3(-.05,.13,0.); float sp=max(sdEll(s,vec3(.02,.018,.016)),-(s.y+.0)); sp=max(sp,-sdEll(s-vec3(0.,.003,0.),vec3(.016,.016,.012)));
  d=min(d,sp);
  vec3 h=q-vec3(.07,.075,0.); float handle=length(vec2(length(h.xy*vec2(1.,.75))-.035,h.z))-.007; handle=max(handle,.052-q.x);
  return min(d,handle); }
float cupD(vec3 q,float R,float H){ float o=sdCylY(q-vec3(0.,H*.5,0.),R,H*.5)-.0015; float i=sdCylY(q-vec3(0.,H*.5+.003,0.),R-.003,H*.5);
  float d=max(o,-i); float hd=sdRBox(q-vec3(R+.045,H-.004,0.),vec3(.05,.0018,.009),.0012); return min(d,hd); }
float cupsD(vec3 p){ float d=1e5;
  d=min(d,cupD(place(p,vec3(.12,0.,.07),.9),.043,.045));
  d=min(d,cupD(place(p,vec3(.19,0.,-.05),.5),.034,.036));
  d=min(d,cupD(place(p,vec3(.07,0.,-.08),-.2),.027,.03));
  return d; }
float spoonD(vec3 p,vec3 c,float a,float r){ vec3 q=place(p,c,a);
  float bowl=max(length(q-vec3(0.,r,0.))-r,q.y-r*.95); bowl=max(bowl,-(length(q-vec3(0.,r+.0015,0.))-r+.0015));
  float hd=sdRBox(q-vec3(r+.045,r*.9,0.),vec3(.045,.0015,.006),.001);
  return min(bowl,hd); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,jugD(p),3.);
  r=U(r,cupsD(p),4.);
  r=U(r,min(spoonD(p,vec3(-.06,0.,-.12),.3,.017),spoonD(p,vec3(-.02,0.,-.17),.1,.012)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=jgQ(p); if(q.x<.0&&q.z<-.03||(q.z<0.&&abs(q.x)<.035)){ float l=fract(q.y/.02); if(q.y>.02&&q.y<.12&&l<.12&&abs(q.x+.005)<.02+.01*step(.5,fract(q.y/.04))) return .25; }
    if(q.y<.05&&length(q.xz)<.05) return .75; return .93; }
  if(id==4.) return n.y>.6?.85:.55;
  if(id==5.) return .6;
  return .7; }
