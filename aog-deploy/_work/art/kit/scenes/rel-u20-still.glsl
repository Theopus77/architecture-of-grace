/* World Religions Unit 20 "Confucianism and Daoism" (Reading the Analects) — pencil still
   life: a book of bamboo slips half unrolled, the rolled part standing up at one end, a
   writing brush lying on a small rest, and a rectangular ink stone. Slips carry only
   hint-marks, never real script. No figures. */
#define CAM_POS vec3(-0.2348,0.2640,-0.5985)
#define CAM_TGT vec3(-0.1331,-0.0632,0.0831)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define BS vec3(-.02,0.,.06)
#define IS vec3(.21,0.,.0)
#define SW .012
vec3 bq(vec3 p){ return L(p,BS,.18); }
float slips(vec3 q){
  /* flat part: slips side by side along x from -.14 to .08, each long in z */
  float x=q.x; float k=clamp(floor(x/SW+.5),-12.,6.); vec3 s=q-vec3(k*SW,.004,0.);
  float flt=sdRBox(s,vec3(SW*.46,.0035,.1),.0015);
  /* the rolled bundle at the +x end */
  vec3 c=q-vec3(.12,.045,0.); float roll=sdCylZ(c,.043,.1)-.002;
  float a=atan(c.y,c.x); roll+=.0012*abs(sin(a*14.));
  float cord=min(sdTorus((q-vec3(.12,.045,-.055)).xzy,.045,.002),sdTorus((q-vec3(.12,.045,.055)).xzy,.045,.002));
  float cordF=max(abs(q.z-.055)-.002,abs(q.y-.0085)-.0015); cordF=max(cordF,abs(q.x+.03)-.1); cordF=min(cordF,max(abs(q.z+.055)-.002,max(abs(q.y-.0085)-.0015,abs(q.x+.03)-.1)));
  return min(min(flt,roll),min(cord,cordF)); }
float inkstone(vec3 q){ float b=sdRBox(q-vec3(0,.014,0),vec3(.055,.014,.08),.005);
  float well=sdRBox(q-vec3(0,.03,.02),vec3(.04,.01,.045),.01); float pool=length((q-vec3(0,.03,-.05))*vec3(1.,3.,1.6))-.03;
  float stick=sdRBox(q-vec3(-.075,.012,.02),vec3(.012,.012,.045),.003);
  return min(max(b,-min(well,pool*.3)),stick); }
float brush(vec3 q){
  float rest=sdRBox(q-vec3(-.09,.01,0),vec3(.012,.01,.03),.004); rest=max(rest,-(length((q-vec3(-.09,.03,0)).yz)-.012));
  vec3 a=vec3(-.13,.022,0), b=vec3(.1,.013,0);
  float h=sdCapsule(q,a,b,.0055);
  float fer=sdCylX(q-vec3(.1,.013,0),.0065,.01);
  vec3 t=q-vec3(.13,.012,0); float tip=length(t.yz)-.0075*sqrt(clamp(1.-(t.x+.02)/.045,0.,1.)); tip=max(tip,max(-t.x-.02,t.x-.025))*.8;
  return min(rest,min(min(h,fer),tip)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,slips(bq(p)),3.);
  r=U(r,inkstone(L(p,IS,-.35)),4.);
  r=U(r,brush(L(p,vec3(.02,0.,-.13),-.1)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bq(p); float a=.78-.08*grain(q.zyx,40.);
    if(q.y<.009&&q.x<.08){ float f=fract(q.x/SW+.5); if(f<.08||f>.92) a=.4;
      float cz=fract((q.z+.2)/.016); if(abs(q.z)<.075&&cz<.35&&abs(fract(q.x/SW+.5)-.5)<.18&&fract(sin(floor(q.x/SW+.5)*12.9+floor((q.z+.2)/.016)*7.3)*43758.)<.7) a=.35; }
    if(q.x>.075){ vec3 c=q-vec3(.12,.045,0.); if(abs(c.z)>.098) return fract(length(c.xy)/.006)<.3?.4:.7; }
    if(abs(abs(q.z)-.055)<.003) a=.3; return a; }
  if(id==4.){ vec3 q=L(p,IS,-.35); if(q.x<-.06) return .25; if(q.y>.02&&n.y>.7){ return .3; } return .4; }
  if(id==5.){ vec3 q=L(p,vec3(.02,0.,-.13),-.1); if(q.x>.115) return .2; if(q.x>.09) return .35; if(q.x<-.075) return .45;
    return fract(q.x/.04)<.06?.4:.62; }
  return .7; }
