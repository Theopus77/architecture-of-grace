/* Room b39 "Stoichiometry and Solutions" — pencil still life: a two-pan balance with brass
   gram weights on one pan and a heap of crystals on the other (grams in), a round volumetric
   flask filled to the line on its neck, and a lab spatula. */
#define CAM_POS vec3(-0.4225,0.5085,-0.9429)
#define CAM_TGT vec3(-0.2627,-0.0063,0.1298)
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
vec3 bQ(vec3 p){ return place(p,vec3(-.03,0.,.02),.12); }
float balD(vec3 q){
  float base=sdRBox(q-vec3(0.,.012,0.),vec3(.12,.012,.045),.006);
  float post=sdCylY(q-vec3(0.,.055,0.),.008,.035);
  float beam=sdRBox(q-vec3(0.,.094,0.),vec3(.11,.005,.006),.002);
  float piv=sdCylZ(q-vec3(0.,.094,0.),.012,.009);
  float needle=sdRBox(q-vec3(0.,.13,0.),vec3(.0022,.035,.002),.001);
  float stems=min(sdCylY(q-vec3(-.1,.105,0.),.004,.01),sdCylY(q-vec3(.1,.105,0.),.004,.01));
  return min(min(min(base,post),min(beam,piv)),min(needle,stems)); }
float panD(vec3 q,float x){ vec3 t=q-vec3(x,.115,0.); float r=length(t.xz);
  float d=max(abs(t.y-r*r*1.8)-.002,r-.058)-.0008;
  return min(d,sdTorus(t-vec3(0.,.058*.058*1.8,0.),.058,.0025)); }
float pansD(vec3 q){ return min(panD(q,-.1),panD(q,.1)); }
float weightD(vec3 q,vec3 c,float R,float H){ vec3 t=q-c;
  float b=sdCylY(t-vec3(0.,H*.5,0.),R,H*.5)-.002;
  float neck=sdCylY(t-vec3(0.,H+.004,0.),R*.35,.004);
  float knob=length(t-vec3(0.,H+.011,0.))-R*.55;
  return min(min(b,neck),knob); }
float weightsD(vec3 q){ return min(weightD(q,vec3(-.115,.118,.01),.019,.026),weightD(q,vec3(-.08,.118,-.012),.013,.018)); }
float heapD(vec3 q){ vec3 t=q-vec3(.1,.117,0.); float r=length(t.xz);
  return max((t.y-.03*exp(-r*r/.0009)+.0015*vn3(q*400.))*.6,max(r-.045,-t.y-.001)); }
#define VF vec3(.25,0.,.1)
float vflaskD(vec3 p){ return volFlaskD(p-VF,.055,.011,.23); }
float vliqD(vec3 p){ vec3 q=p-VF; float b=length(q-vec3(0.,.055,0.))-.051; float n=sdCylY(q-vec3(0.,.12,0.),.008,.07);
  return max(min(b,n),q.y-.19); }
float stopD(vec3 p){ vec3 q=p-VF; return min(sdCylY(q-vec3(0.,.24,0.),.0085,.012),sdCylY(q-vec3(0.,.255,0.),.014,.004)-.002); }
vec3 spQ(vec3 p){ vec3 q=p-vec3(.0,.003,-.085); q.xz=rot(-.25)*q.xz; return q; }
float spatD(vec3 q){ float h=sdRBox(q,vec3(.075,.0012,.004),.0008);
  float blade=sdRBox(q-vec3(.085,0.,0.),vec3(.018,.0012,.009),.001);
  float grip=sdRBox(q-vec3(-.05,.002,0.),vec3(.03,.004,.006),.003);
  return min(min(h,blade),grip); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 b=bQ(p);
  r=U(r,balD(b),3.);
  r=U(r,pansD(b),4.);
  r=U(r,weightsD(b),5.);
  r=U(r,heapD(b),6.);
  r=U(r,vflaskD(p),7.);
  r=U(r,vliqD(p),8.);
  r=U(r,stopD(p),9.);
  r=U(r,spatD(spQ(p)),10.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .42;
  if(id==4.) return .78;
  if(id==5.) return .5;
  if(id==6.) return .85+.1*vn3(p*500.);
  if(id==7.){ vec3 q=p-VF; if(abs(q.y-.19)<.0018) return .15; return .93; }
  if(id==8.){ vec3 q=p-VF; if(q.y>.186) return .4; return .72; }
  if(id==9.) return .45;
  if(id==10.) return .6;
  return .7; }
