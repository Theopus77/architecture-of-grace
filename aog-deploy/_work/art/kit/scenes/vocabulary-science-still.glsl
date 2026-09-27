/* vocabulary-science "Science words" — a compound microscope with a ring of word cards
   fanned out in front of it (hint-lines only) and a glass slide. */
#define CAM_POS vec3(-0.4786,0.5246,-1.2771)
#define CAM_TGT vec3(-0.2738,0.0201,0.0974)
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
float slideD(vec3 p){ vec3 q=p-vec3(-.1,.0015,-.13); q.xz=rot(.25)*q.xz;
  return sdRBox(q,vec3(.038,.0012,.013),.0006); }
float slideSpec(vec3 p){ vec3 q=p-vec3(-.1,.0035,-.13); q.xz=rot(.25)*q.xz;
  return sdRBox(q-vec3(.008,0.,0.),vec3(.011,.0006,.011),.0004); }   /* cover slip */
/* a stack of index cards on a metal binder ring, fanned open on the table */
#define RC vec3(.1,0.,-.09)
vec3 cardQ(vec3 p,float i){ vec3 q=p-RC; q.xz=rot(.5-i*.3)*q.xz; q.y-=.0022*i+.0012; return q; }
float cardsD(vec3 p){ float d=1e5; for(int i=0;i<4;i++){ vec3 q=cardQ(p,float(i));
  d=min(d,sdRBox(q-vec3(.087,0.,0.),vec3(.09,.0009,.054),.0008)); } return d; }
float ringD(vec3 p){ vec3 q=p-RC-vec3(0.,.012,0.); q.xy=rot(1.5708)*q.xy; return sdTorus(q,.015,.0022); }
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
  r=U(r,cardsD(p),9.);
  r=U(r,ringD(p),10.);
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
  if(id==8.){ vec3 s=p-vec3(-.1,.0035,-.13); s.xz=rot(.25)*s.xz; return length(s.xz-vec2(.008,0.))<.006?.4:.85; }
  if(id==9.){ float a=.95; float bd=1e5; vec3 c=vec3(0.); float kk=0.;
    for(int k=0;k<4;k++){ vec3 ck=cardQ(p,float(k)); float dk=sdRBox(ck-vec3(.087,0.,0.),vec3(.09,.0009,.054),.0008); if(dk<bd){ bd=dk; c=ck; kk=float(k); } }
    vec2 u=vec2(c.x,c.z)/1.5;
    if(c.y>.0004){
      if(u.x>.02&&u.x<.105){ if(abs(u.y-.02)<.0028&&u.x<.075) a=.25;
        else if(u.y<.008&&u.y>-.03&&fract((u.y+.03)/.0095)<.22&&u.x<.105-.03*h1(vec2(floor((u.y+.03)/.0095),kk))) a=.6; }
      if(length(u-vec2(.008,0.))<.004) a=.4; }
    return a; }
  if(id==10.) return .35;
  return .7; }
