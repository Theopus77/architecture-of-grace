/* Science Unit 16 "Biology: Cells and Energy" — pencil still life: a desk lamp shining on a
   leafy plant in a pot (light becomes food), with a beaker of water beside it. */
#define CAM_POS vec3(-0.7554,0.4060,-1.0193)
#define CAM_TGT vec3(-0.2910,0.0638,0.2027)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define PC vec3(.1,0.,.08)
vec2 pot(vec3 p){ vec3 q=p-PC;
  float body=sdCone(q-vec3(0.,.06,0.),.055,.075,.06)-.002;
  body=max(body,-(sdCylY(q-vec3(0.,.13,0.),.066,.02)));
  float rim=sdCylY(q-vec3(0.,.115,0.),.083,.013)-.003; rim=max(rim,-sdCylY(q-vec3(0.,.12,0.),.07,.03));
  float soil=sdCylY(q-vec3(0.,.1,0.),.07,.008)+.002*fbm(q.xz*80.);
  return vec2(min(body,rim),soil); }
float leaf(vec3 q,vec3 base,float ay,float tilt,float L){ float bd=length(q-base)-L*1.2; if(bd>.02) return bd;
  vec3 l=q-base; l.xz=rot(ay)*l.xz; l.xy=rot(tilt)*l.xy; l.y+=.25*l.x*l.x/L;
  return .6*sdEll(l-vec3(L*.5,0.,0.),vec3(L*.5,.005,L*.32)); }
float plant(vec3 p){ vec3 q=p-PC;
  float d=sdCapsule(q,vec3(0.,.1,0.),vec3(.006,.25,-.004),.005);
  for(int i=0;i<9;i++){ float fi=float(i); d=min(d,leaf(q,vec3(.004,.14+fi*.013,0.),fi*2.4,.35+fi*.06,.14-fi*.008)); }
  return d; }
vec3 lq(vec3 p){ vec3 q=p-vec3(-.2,0.,.1); q.xz=rot(.3)*q.xz; return q; }
vec2 lamp(vec3 p){ vec3 q=lq(p);
  float base=sdCylY(q-vec3(0.,.01,0.),.06,.008)-.004;
  vec3 j1=vec3(0.,.02,0.), j2=vec3(-.03,.2,0.), j3=vec3(.12,.3,0.);
  float arm=min(sdCapsule(q,j1,j2,.006),sdCapsule(q,j2,j3,.006));
  float joints=min(length(q-j2)-.012,length(q-j1-vec3(0.,.005,0.))-.012);
  vec3 s=q-j3; s.xy=rot(-.8)*s.xy; s.y-=.035;
  float shade=abs(sdCone(s,.055,.022,.04))-.002; shade=max(shade,s.y-.038); shade=max(shade,-s.y-.04);
  float cap=sdCylY(s-vec3(0.,.04,0.),.022,.006)-.002;
  float bulb=length(s-vec3(0.,-.015,0.))-.025;
  return vec2(min(min(base,arm),min(joints,min(shade,cap))),bulb); }
#define BK vec3(.33,0.,.0)
vec2 beaker(vec3 p){ vec3 q=p-BK; float r=length(q.xz);
  float sh=max(abs(r-.038)-.002,abs(q.y-.05)-.05); sh=min(sh,sdCylY(q-vec3(0.,.002,0.),.038,.002));
  float liq=max(r-.036,abs(q.y-.032)-.03);
  return vec2(sh,liq); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 a=pot(p); r=U(r,a.x,3.); r=U(r,a.y,4.);
  r=U(r,plant(p),5.);
  vec2 l=lamp(p); r=U(r,l.x,6.); r=U(r,l.y,7.);
  vec2 b=beaker(p); r=U(r,b.x,8.); r=U(r,b.y,9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .5; if(id==4.) return .2; if(id==5.) return .45;
  if(id==6.) return .35; if(id==7.) return .95;
  if(id==8.){ vec3 q=p-BK; return (fract(q.y/.02)<.1&&q.y>.015&&q.y<.09&&q.z<0.&&q.x<.0&&q.x>-.02)?.3:.9; }
  if(id==9.) return .7;
  return .7; }
