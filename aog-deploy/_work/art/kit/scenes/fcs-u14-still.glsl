/* FCS Unit 14 "Fabric, Fibers and Patterns" — pencil still life: a stack of three folded cloths
   (plain, striped and checked), a ball of yarn with two knitting needles through it, and a
   rolled tape measure. */
#define CAM_POS vec3(-0.3085,0.2123,-0.5875)
#define CAM_TGT vec3(-0.1266,-0.0133,0.0895)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define ST vec3(.04,0.,.07)
vec3 fq(vec3 p,int i){ vec3 q=p-ST-vec3(.004*float(i),.016+float(i)*.031,.003*float(i)); q.xz=rot(-.2+float(i)*.12)*q.xz; return q; }
float fold(vec3 q){ float d=sdRBox(q,vec3(.11,.014,.075),.013); d+=.0015*sin(q.x*70.)*smoothstep(.06,.075,abs(q.z)); return d; }
float cloths(vec3 p){ float d=1e5; for(int i=0;i<3;i++) d=min(d,fold(fq(p,i))); return d; }
#define YB vec3(-.16,.05,.0)
float yarn(vec3 p){ vec3 q=p-YB; float d=length(q)-.05; vec3 n=normalize(q);
  float w=sin(dot(q,normalize(vec3(1.,.4,.2)))*260.)*.5+sin(dot(q,normalize(vec3(-.3,1.,.5)))*260.)*.5; return d+.0012*w; }
float needles(vec3 p){ vec3 q=p-YB; float a=sdCapsule(q,vec3(-.04,-.02,.02),vec3(.09,.1,-.03),.0028); float b=sdCapsule(q,vec3(-.03,-.03,-.02),vec3(.1,.08,.035),.0028);
  float ka=length(q-vec3(.09,.1,-.03))-.006, kb=length(q-vec3(.1,.08,.035))-.006; return min(min(a,b),min(ka,kb)); }
float strand(vec3 p){ return sdCapsule(p,YB+vec3(.03,-.04,-.03),vec3(-.05,.002,-.1),.0022); }
float tape(vec3 p){ vec3 q=p-vec3(.2,0.,-.08); float roll=max(abs(length(q.xz)-.018)-.012,abs(q.y-.008)-.008);
  vec3 t=q-vec3(-.07,.0008,-.02); t.xz=rot(.15)*t.xz; float strip=sdBox(t,vec3(.06,.0008,.008)); return min(roll,strip); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,fold(fq(p,0)),3.);
  r=U(r,fold(fq(p,1)),4.);
  r=U(r,fold(fq(p,2)),5.);
  r=U(r,yarn(p),6.);
  r=U(r,needles(p),7.);
  r=U(r,strand(p),6.);
  r=U(r,tape(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .5;
  if(id==4.){ vec3 q=fq(p,1); return fract(q.x/.018)<.45?.3:.85; }
  if(id==5.){ vec3 q=fq(p,2); float c=mod(floor(q.x/.02)+floor(q.z/.02),2.); float l=fract(q.x/.02)<.1||fract(q.z/.02)<.1?.35:0.; return l>0.?l:(c<1.?.62:.9); }
  if(id==6.) return .45;
  if(id==7.) return .3;
  if(id==8.){ vec3 q=p-vec3(.2,0.,-.08); if(q.y<.0018){ vec3 t=q-vec3(-.07,.0008,-.02); t.xz=rot(.15)*t.xz; if(fract(t.x/.006)<.2&&t.z<0.) return .2; return .9; } return .6; }
  return .7; }
