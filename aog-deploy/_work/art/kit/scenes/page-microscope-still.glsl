/* Microscope Lab page — pencil still life: a brass compound microscope, a glass slide on the
   table in front of it and a small stoppered specimen jar beside it. */
#define CAM_POS vec3(-0.5265,0.5198,-1.2564)
#define CAM_TGT vec3(-0.3237,0.0201,0.1049)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* microscope local frame: turned a little toward the viewer */
vec3 mq(vec3 p){ vec3 q=p-vec3(-.05,0.,.05); q.xz=rot(-1.25)*q.xz; return q; }
/* the tube leans forward (toward -z) from its pivot */
vec3 tq(vec3 q){ vec3 t=q-vec3(0.,.2,.035); t.yz=rot(.38)*t.yz; return t; }
float baseD(vec3 q){ /* horseshoe foot */
  float d=sdRBox(q-vec3(0.,.012,.04),vec3(.075,.012,.07),.008);
  d=max(d,-(sdCylY(q-vec3(0.,.012,-.05),.035,.03)));
  float plinth=sdRBox(q-vec3(0.,.028,.075),vec3(.03,.008,.03),.004);
  return min(d,plinth); }
float armD(vec3 q){ /* pillar, curved arm and focus knobs */
  float pil=sdRBox(q-vec3(0.,.075,.085),vec3(.018,.045,.016),.005);
  vec3 a=q-vec3(0.,.12,.03); float ang=atan(a.y,a.z);
  float arc=length(vec2(length(a.yz)-.075,a.x))-.0;
  float arm=max(sdRBox(vec3(a.x,length(a.yz)-.075,0.),vec3(.014,.012,1.),.004),-(a.y+.01));
  arm=max(arm,-a.z+.0);
  float kn=sdCylX(q-vec3(0.,.14,.075),.022,.04)-.002;
  kn=min(kn,sdCylX(q-vec3(0.,.14,.075),.013,.052)-.001);
  return min(min(pil,arm),kn); }
float stageD(vec3 q){
  float s=sdRBox(q-vec3(0.,.1,.0),vec3(.058,.005,.052),.003);
  s=max(s,-sdCylY(q-vec3(0.,.1,0.),.008,.02));
  float clip=sdRBox(q-vec3(-.035,.107,-.012),vec3(.004,.0015,.022),.001);
  clip=min(clip,sdRBox(q-vec3(.035,.107,-.012),vec3(.004,.0015,.022),.001));
  float mir=sdCylY(q-vec3(0.,.055,0.),.022,.003)-.002;       /* mirror under the stage */
  float mfork=sdRBox(q-vec3(0.,.06,.04),vec3(.004,.004,.04),.002);
  return min(min(s,clip),min(mir,mfork)); }
float tubeD(vec3 q){ vec3 t=tq(q);
  float body=sdCylY(t-vec3(0.,.02,0.),.017,.075)-.001;
  float collar=sdCylY(t-vec3(0.,.098,0.),.02,.006)-.001;
  float eye=sdCylY(t-vec3(0.,.125,0.),.012,.025)-.001;
  float cup=sdCylY(t-vec3(0.,.152,0.),.016,.006)-.002;
  float tur=sdCylY(t-vec3(0.,-.06,0.),.028,.008)-.003;        /* nosepiece */
  float o1=sdCone(t-vec3(0.,-.085,0.),.007,.011,.018);
  vec3 t2=t-vec3(.02,-.08,0.); t2.xy=rot(-.35)*t2.xy; float o2=sdCone(t2,.006,.01,.014);
  vec3 t3=t-vec3(-.02,-.08,0.); t3.xy=rot(.35)*t3.xy; float o3=sdCone(t3,.006,.01,.011);
  return min(min(min(body,collar),min(eye,cup)),min(tur,min(o1,min(o2,o3)))); }
float slideD(vec3 p){ vec3 q=p-vec3(.06,.0015,-.15); q.xz=rot(.25)*q.xz;
  return sdRBox(q,vec3(.038,.0012,.013),.0006); }
float slideSpec(vec3 p){ vec3 q=p-vec3(.06,.0035,-.15); q.xz=rot(.25)*q.xz;
  return sdRBox(q-vec3(.008,0.,0.),vec3(.011,.0006,.011),.0004); }   /* cover slip */
vec3 jq(vec3 p){ return p-vec3(.2,0.,.0); }
float jarD(vec3 p){ vec3 q=jq(p);
  float body=sdCylY(q-vec3(0.,.04,0.),.03,.036)-.004;
  float neck=sdCylY(q-vec3(0.,.083,0.),.017,.01)-.002;
  float lip=sdTorus(q-vec3(0.,.092,0.),.018,.003);
  return min(min(body,neck),lip); }
float stopD(vec3 p){ vec3 q=jq(p); return sdCone(q-vec3(0.,.103,0.),.014,.017,.012)-.002; }
float leafD(vec3 p){ vec3 q=jq(p)-vec3(.0,.03,0.); /* a sprig of pond weed inside */
  q.xz=rot(.5)*q.xz; return sdCapsule(q,vec3(-.01,-.02,0.),vec3(.008,.035,0.),.004); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=mq(p);
  r=U(r,baseD(q),3.);
  r=U(r,armD(q),4.);
  r=U(r,stageD(q),5.);
  r=U(r,tubeD(q),6.);
  r=U(r,slideD(p),7.);
  r=U(r,slideSpec(p),8.);
  r=U(r,jarD(p),9.);
  r=U(r,stopD(p),10.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  vec3 q=mq(p);
  if(id==3.) return .3;
  if(id==4.) return .45;
  if(id==5.) return .25;
  if(id==6.){ vec3 t=tq(q);
    if(abs(t.y-.05)<.003||abs(t.y+.0)<.002) return .25;   /* brass bands */
    return t.y<-.07?.35:.6; }
  if(id==7.) return .92;
  if(id==8.){ vec3 s=p-vec3(.06,.0035,-.15); s.xz=rot(.25)*s.xz; return length(s.xz-vec2(.008,0.))<.006?.4:.85; }
  if(id==9.){ vec3 j=jq(p); if(j.y<.045&&j.y>.01&&abs(fract(j.y/.012)-.5)<.1) return .6; return .82; }
  if(id==10.) return .45;
  return .7; }
