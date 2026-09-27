/* Spanish Unit 20 "Capstone: Present and Defend" — pencil still life: a wooden speaker's lectern
   with a microphone on a gooseneck, a stack of note cards on its slanted top, and a small
   trophy cup on the table beside it. */
#define CAM_POS vec3(-0.7704,0.4740,-1.1966)
#define CAM_TGT vec3(-0.4010,0.0599,0.1783)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define LC vec3(.04,0.,.08)
vec3 lq(vec3 p){ vec3 q=p-LC; q.xz=rot(-.3)*q.xz; return q; }
float lectern(vec3 q){
  float col=sdRBox(q-vec3(0.,.12,0.),vec3(.06,.12,.045),.006);
  float base=sdRBox(q-vec3(0.,.008,0.),vec3(.085,.008,.065),.004);
  vec3 t=q-vec3(0.,.25,0.); t.yz=rot(.3)*t.yz; float top=sdRBox(t,vec3(.1,.008,.07),.004);
  float lip=sdRBox(t-vec3(0.,.012,-.066),vec3(.1,.006,.004),.002);
  float panel=1e5;
  return min(min(min(col,base),min(top,lip)),panel); }
vec3 cardQ(vec3 q){ vec3 t=q-vec3(-.01,.25,0.); t.yz=rot(.3)*t.yz; t.xz=rot(.1)*t.xz; return t-vec3(0.,.013,0.); }
float cards(vec3 q){ vec3 t=cardQ(q); return sdRBox(t,vec3(.06,.004,.04),.001); }
float mic(vec3 q){ vec3 a=vec3(.05,.27,.05), b=vec3(.05,.33,.03), c=vec3(.05,.36,-.02);
  float stem=min(sdCapsule(q,a,b,.0055),sdCapsule(q,b,c-vec3(0.,.005,-.01),.0055));
  float clip=sdCylX(q-c+vec3(0.,.004,-.012),.009,.012);
  vec3 h=q-c; h.yz=rot(.7)*h.yz; float head=min(sdCylY(h-vec3(0.,.0,0.),.016,.02)-.003,length(h-vec3(0.,.024,0.))-.021);
  return min(min(stem,clip),head); }
#define TR vec3(-.17,0.,.0)
float trophy(vec3 p){ vec3 q=p-TR;
  float base=sdRBox(q-vec3(0.,.015,0.),vec3(.035,.015,.035),.003);
  float stem=sdCone(q-vec3(0.,.05,0.),.016,.006,.02);
  float bowl=max(abs(length(q-vec3(0.,.12,0.))-.045)-.003,q.y-.12); bowl=max(bowl,-(length(q-vec3(0.,.12,0.))-.0));
  float rim=sdTorus(q-vec3(0.,.12,0.),.045,.004);
  vec3 h=vec3(abs(q.x)-.05,q.y-.1,q.z); float handles=max(sdTorus(h.xzy,.018,.0035),-(abs(q.x)-.045));
  return min(min(min(base,stem),min(bowl,rim)),handles); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=lq(p);
  r=U(r,lectern(q),3.);
  r=U(r,cards(q),4.);
  r=U(r,mic(q),5.);
  r=U(r,trophy(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=lq(p); if(q.z<-.046&&abs(q.x)<.045&&abs(q.y-.12)<.09){ if(abs(q.y-.17)<.003) return .3; } return .45+.08*grain(q,50.); }
  if(id==4.){ vec3 t=cardQ(lq(p)); if(t.y>.003){ for(int i=0;i<4;i++){ float z=.025-float(i)*.015; if(abs(t.z-z)<.002&&abs(t.x+.005*float(i%2))<.045) return .4; } } return .93; }
  if(id==5.){ vec3 h=lq(p)-vec3(.05,.36,-.02); h.yz=rot(.7)*h.yz; if(h.y>.012) return fract(h.y/.005)<.4?.2:.55; return .25; }
  if(id==6.){ vec3 q=p-TR; if(q.y<.03) return .35; return .8; }
  return .7; }
