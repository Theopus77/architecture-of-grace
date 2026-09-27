/* World Religions Unit 19 "Buddhism: The Four Noble Truths" (The Middle Way) — pencil still
   life: an eight-spoked dharma wheel standing on a small base, a singing bowl on its cushion
   with a wooden striker, and an open lotus flower. Objects only; no Buddha image. */
#define CAM_POS vec3(-0.3832,0.4518,-0.8500)
#define CAM_TGT vec3(-0.2384,-0.0148,0.1221)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define WH vec3(-.02,0.,.1)
#define WR .085
#define SB vec3(.19,0.,-.02)
#define LO vec3(-.21,0.,-.06)
vec3 wq(vec3 p){ vec3 q=L(p,WH,-.3); return q-vec3(0,.03+WR+.012,0); }
float dwheel(vec3 q){
  float rim=max(abs(length(q.xy)-WR)-.007,abs(q.z)-.009);
  float a=atan(q.y,q.x); float st=6.2832/8.; float k=floor(a/st+.5)*st; vec2 d2=rot(k)*q.xy;
  float sp=max(max(abs(d2.y)-.004,abs(q.z)-.005),max(-d2.x,d2.x-WR));
  float knob=length(vec3(d2.x-WR-.016,d2.y,q.z))-.008;
  float hub=sdCylZ(q,.02,.011)-.002; float hubr=sdTorus(q.xzy,.022,.004);
  return min(min(rim,sp),min(knob,min(hub,hubr))); }
float wbase(vec3 q){ float b=sdRBox(q-vec3(0,.012,0),vec3(.07,.012,.04),.004);
  float s=sdRBox(q-vec3(0,.028,0),vec3(.025,.008,.02),.003); return min(b,s); }
float sbowl(vec3 q){ vec3 c=q-vec3(0,.085,0); float sh=abs(length(c*vec3(1.,1.2,1.))-.07)-.003; sh=max(sh,c.y-.0); sh=max(sh,.022-q.y);
  float lip=sdTorus(c,.07,.0035);
  float cush=length((q-vec3(0,.013,0))*vec3(1.,2.4,1.))-.065; cush*=.45;
  return min(min(sh,lip),cush); }
float striker(vec3 q){ return sdCapsule(q,vec3(-.09,.008,0),vec3(.06,.008,0),.008); }
float lotus(vec3 q){
  float d=1e5;
  for(int ring=0;ring<2;ring++){ float n=ring==0?8.:7.; float tilt=ring==0?.45:.95; float len=ring==0?.06:.048; float w=ring==0?.02:.017;
    float a=atan(q.z,q.x); float st=6.2832/n; float off=ring==0?0.:st*.5;
    float k=floor((a-off)/st+.5)*st+off; vec3 c=q; c.xz=rot(k)*c.xz;
    c.y-=.012+float(ring)*.004; c.xy=rot(tilt)*c.xy;
    vec3 e=c-vec3(len*.5,0.,0.); e.y-=4.*e.z*e.z;
    e.x/=len*.5; float taper=1.-.55*smoothstep(-.2,1.,e.x);
    float p=(length(vec3(e.x,e.y/.005,e.z/(w*taper)))-1.)*.005*.8;
    d=min(d,p); }
  float seed=sdCylY(q-vec3(0,.024,0),.012,.005)-.002;
  return max(min(d,seed),-q.y); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,min(dwheel(wq(p)),wbase(L(p,WH,-.3))),3.);
  r=U(r,sbowl(L(p,SB,0.)),4.);
  r=U(r,striker(L(p,SB+vec3(-.02,0.,-.1),-.3)),5.);
  r=U(r,lotus(L(p,LO,.3)/1.2)*1.2,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=wq(p); if(abs(length(q.xy)-WR)<.0025&&abs(q.z)>.008) return .35; if(length(q.xy)<.012&&abs(q.z)>.01) return .3; return .52; }
  if(id==4.){ vec3 q=L(p,SB,0.); if(q.y<.03) return fract(atan(q.z,q.x)*4.)<.2?.45:.62; if(abs(q.y-.075)<.002) return .3; return .45; }
  if(id==5.){ vec3 q=L(p,SB+vec3(-.02,0.,-.1),-.3); return q.x>.02?.3:.55; }
  if(id==6.){ vec3 q=L(p,LO,.3)/1.2; if(q.y>.028&&fract(length(q.xz)/.005)<.3) return .5; return .88; }
  return .7; }
