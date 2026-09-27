/* FACS project 11 "Scrambled eggs, cooked to 160°F" — pencil still life: a nonstick pan of soft,
   fluffy scrambled-egg curds with a dial food thermometer standing in them, a spatula resting
   across the rim, and two whole eggs in front, one standing on end and one lying on its side. */
#define CAM_POS vec3(-0.4903,0.5033,-0.8209)
#define CAM_TGT vec3(-0.2341,-0.0103,0.1326)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "projparts.glsl"
#define FP vec3(-.03,0.,.04)
float fpan(vec3 p){ vec3 q=p-FP; float r=length(q.xz);
  float wall=max(abs(r-(.1+q.y*.45))-.004,abs(q.y-.022)-.022); float bot=sdCylY(q-vec3(0.,.003,0.),.1,.003);
  wall=min(wall,sdTorus(q-vec3(0.,.044,0.),.1+.044*.45,.0045));
  vec3 h=q-vec3(.21,.05,-.02); h.xz=rot(.1)*h.xz; h.xy=rot(.14)*h.xy; float handle=sdRBox(h,vec3(.075,.007,.013),.006);
  float neck=sdCapsule(q,vec3(.145,.04,-.01),vec3(.16,.045,-.014),.008);
  return min(min(wall,bot),min(handle,neck)); }
float eggs(vec3 p){ vec3 q=p-FP; float r=length(q.xz);
  float d=sdEll(q-vec3(0.,.016,0.),vec3(.09,.026,.09));
  vec2 v=voro(q.xz*55.).xy;
  d-=.014*smoothstep(.0,.3,v.y-v.x)*smoothstep(.095,.05,r);
  d+=.002*vn3(q*300.);
  return d*.55; }
float thermo(vec3 p){ vec3 q=p-FP-vec3(-.02,.02,.01);
  vec3 s=q; s.xy=rot(.35)*s.xy;
  float stem=sdCapsule(s,vec3(0.,0.,0.),vec3(0.,.13,0.),.0022);
  vec3 dq=s-vec3(0.,.14,0.); float dial=sdCylZ(dq,.024,.006)-.002;
  float clip=sdRBox(s-vec3(.004,.1,-.006),vec3(.0015,.025,.003),.001);
  return min(min(stem,dial),clip); }
float spat(vec3 p){ vec3 q=p-FP-vec3(.03,.05,-.07); q.xz=rot(-.9)*q.xz; q.xy=rot(-.12)*q.xy;
  float blade=sdRBox(q-vec3(-.05,0.,0.),vec3(.035,.002,.025),.004);
  float hdl=sdCapsule(q,vec3(-.015,0.,0.),vec3(.14,.02,0.),.0065);
  return min(blade,hdl); }
/* an egg lying on its side, long axis along x, blunt end at +x */
float wholeEgg(vec3 p,vec3 c,float a){ vec3 q=p-c; q.xz=rot(a)*q.xz;
  float k=q.x>0.?.037:.029; return sdEll(q,vec3(k,.024,.024)); }
/* an egg standing on its blunt end */
float standEgg(vec3 p,vec3 c){ vec3 q=p-c-vec3(0.,.031,0.);
  float k=q.y>0.?.04:.031; return sdEll(q,vec3(.025,k,.025)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,fpan(p),3.);
  r=U(r,eggs(p),4.);
  r=U(r,thermo(p),5.);
  r=U(r,spat(p),6.);
  r=U(r,min(standEgg(p,vec3(-.125,0.,-.115)),wholeEgg(p,vec3(-.03,.024,-.15),.15)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-FP; return q.y>.04?.25:.35; }
  if(id==4.){ vec3 q=p-FP; float v=voro(q.xz*55.).x; return .92-.2*smoothstep(.08,.0,v); }
  if(id==5.){ vec3 q=p-FP-vec3(-.02,.02,.01); q.xy=rot(.35)*q.xy; vec3 dq=q-vec3(0.,.14,0.);
    if(dq.z<-.005&&length(dq.xy)<.021){ float a=atan(dq.x,dq.y); float tk=abs(fract(a*6.)-.5);
      if(length(dq.xy)>.016&&tk<.08) return .3; if(abs(dq.x+.008*dq.y/.02)<.0012&&dq.y>0.) return .2; return .95; }
    return .62; }
  if(id==6.) return .55;
  if(id==7.) return .86;
  return .7; }
