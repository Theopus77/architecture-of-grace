/* Science Unit 6 "Matter and Waves" — pencil still life: a kettle (liquid turning to gas),
   a glass of water, and ice cubes on a small dish: the three states of matter. */
#define CAM_POS vec3(-0.5287,0.2811,-0.7627)
#define CAM_TGT vec3(-0.1817,0.0256,0.1505)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define KC vec3(.03,0.,.08)
vec2 kettle(vec3 p){ vec3 q=p-KC; q.xz=rot(-.35)*q.xz;
  float r=length(q.xz); float y=q.y;
  float prof=.085-.03*pow(clamp((y-.05)/.1,0.,1.),1.5)+ .01*smoothstep(.04,0.,y)*0.;
  float body=max(r-prof,abs(y-.075)-.075)-.004;
  body=smin(body,sdCylY(q-vec3(0.,.005,0.),.075,.005),.01);
  float lid=sdEll(q-vec3(0.,.15,0.),vec3(.055,.018,.055));
  float knob=length(q-vec3(0.,.172,0.))-.011;
  float spout=sdCapsule(q,vec3(.06,.05,0.),vec3(.135,.13,0.),.012);
  spout=max(spout,-sdCapsule(q,vec3(.06,.05,0.),vec3(.145,.14,0.),.007));
  vec3 h=q-vec3(0.,.175,0.); float handle=length(vec2(length(h.xy)-.07,h.z))-.008; handle=max(handle,-h.y-.01);
  return vec2(min(min(body,spout),handle),min(lid,knob)); }
#define GL vec3(-.2,0.,.02)
vec2 glass(vec3 p){ vec3 q=p-GL;
  float r=length(q.xz); float R=.036+.006*q.y/.12;
  float cup=max(abs(r-R)-.002,abs(q.y-.06)-.06); cup=min(cup,sdCylY(q-vec3(0.,.005,0.),.036,.005));
  float water=max(r-R+.003,abs(q.y-.045)-.04);
  return vec2(cup,water); }
#define DI vec3(.29,0.,.02)
vec2 ice(vec3 p){ vec3 q=p-DI;
  float r=length(q.xz); float dish=max(abs(length(q-vec3(0.,.12,0.))-.125)-.003,q.y-.02);
  dish=min(dish,sdCylY(q-vec3(0.,.003,0.),.04,.003));
  float c=1e5;
  c=min(c,sdRBox(q-vec3(-.022,.024,.004),vec3(.017),.004));
  vec3 a=q-vec3(.02,.023,-.012); a.xz=rot(.6)*a.xz; c=min(c,sdRBox(a,vec3(.016),.004));
  vec3 b=q-vec3(.0,.053,.0); b.xz=rot(.3)*b.xz; b.xy=rot(.25)*b.xy; c=min(c,sdRBox(b,vec3(.015),.004));
  return vec2(dish,c); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 k=kettle(p); r=U(r,k.x,3.); r=U(r,k.y,4.);
  vec2 g=glass(p); r=U(r,g.x,5.); r=U(r,g.y,6.);
  vec2 i=ice(p); r=U(r,i.x,7.); r=U(r,i.y,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .55; if(id==4.) return .35;
  if(id==5.) return .88; if(id==6.){ return abs(p.y-.084)<.003?.3:.7; }
  if(id==7.) return .8; if(id==8.) return .9;
  return .7; }
