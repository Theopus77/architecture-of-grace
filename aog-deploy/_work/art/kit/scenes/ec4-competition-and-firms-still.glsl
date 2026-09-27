/* Practice room "Competition, Firms and Market Structure" — pencil still life: two wooden toy
   factories side by side, a big one with a tall chimney and a small one beside it (firms in one
   market), and stacks of coins in front. */
#define CAM_POS vec3(-0.3065,0.3604,-0.7116)
#define CAM_TGT vec3(-0.1847,-0.0318,0.1059)
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
#define F1 vec3(-.02,0.,.07)
#define F2 vec3(.17,0.,.05)
#define COIN vec3(.03,0.,-.1)
/* a factory: body w x h x d (half sizes), n saw-tooth roof bays along x, chimney on the left */
float factoryD(vec3 q,vec3 s,float n,float ch){
  float d=sdRBox(q-vec3(0.,s.y,0.),s,.003);
  float bw=2.*s.x/n; float x=q.x+s.x; float k=clamp(floor(x/bw),0.,n-1.); float u=x-k*bw;
  vec3 t=vec3(u-bw*.5,q.y-2.*s.y,q.z);
  float roof=max(max(-t.y,dot(t.xy,normalize(vec2(s.y*.55/bw*2.,1.)))-s.y*.28),max(abs(t.x)-bw*.5,abs(t.z)-s.z));
  roof=max(roof,t.x-bw*.49); d=min(d,roof);
  d=min(d,sdCylY(q-vec3(-s.x*.7,2.*s.y+ch*.5,s.z*.4),.012,ch*.5)-.001);
  d=min(d,sdTorus(q-vec3(-s.x*.7,2.*s.y+ch,s.z*.4),.012,.003));
  d=max(d,-sdBox(q-vec3(s.x*.3,s.y*.45,-s.z),vec3(s.x*.14,s.y*.45,.004)));   /* a doorway */
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,factoryD(place(p,F1,.2),vec3(.1,.04,.055),3.,.1),3.);
  r=U(r,factoryD(place(p,F2,.35),vec3(.055,.028,.04),2.,.04),4.);
  float c=coinsD(p-COIN,.022,6.,0.); c=min(c,coinsD(p-COIN-vec3(.055,0.,.01),.022,3.,0.));
  c=min(c,coinsD(p-COIN-vec3(-.055,0.,.02),.022,10.,.01));
  r=U(r,c,5.);
  return r; }
float winT(vec3 q,vec3 s){ if(q.z<-s.z+.002&&q.y>s.y*1.1&&q.y<s.y*1.6){ float f=fract((q.x+s.x)/(s.x*.3)); if(f>.25&&f<.75) return .35; }
  if(q.z<-s.z+.002&&abs(q.x-s.x*.3)<s.x*.15&&q.y<s.y*.95) return .25; return -1.; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=place(p,F1,.2); vec3 s=vec3(.1,.04,.055); float w=winT(q,s); if(w>0.) return w; if(q.y>2.*s.y) return .55; return .8; }
  if(id==4.){ vec3 q=place(p,F2,.35); vec3 s=vec3(.055,.028,.04); float w=winT(q,s); if(w>0.) return w; if(q.y>2.*s.y) return .55; return .8; }
  if(id==5.){ if(n.y<.5) return fract(p.y/.0026)<.3?.35:.55; return .65; }
  return .7; }
