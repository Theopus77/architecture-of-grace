/* sp12 "Capstone — Present and Defend" — the last unit, one short talk: a small wooden
   tabletop lectern with a stack of note cards on its sloped top, and a graduation cap with its
   tassel lying on the table in front.
   @params {"mat":{"3":[0.55,1.3,1.0],"4":[0.93,1.0,0.6],"5":[0.3,1.3,1.0],"6":[0.4,1.2,0.9],"7":[0.25,1.2,0.8]},
            "texlines":{"3":[0.12,0.4,0.5],"4":[0.12,0.4,0.85]}} */
#define CAM_POS vec3(-0.3490,0.5042,-0.9578)
#define CAM_TGT vec3(-0.1889,-0.0113,0.1165)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
#define LC vec3(-.02,0.,.1)
#define LR .32
vec3 lcQ(vec3 p){ vec3 q=p-LC; q.xz=rot(LR)*q.xz; return q; }
/* a lectern box: front lower than back so the top slopes toward the reader (-z is the audience) */
vec3 topQ(vec3 p){ vec3 q=lcQ(p)-vec3(0.,.2,0.); q.yz=rot(-.42)*q.yz; return q; }
float lectern(vec3 p){ vec3 q=lcQ(p);
  float base=sdRBox(q-vec3(0.,.012,0.),vec3(.1,.012,.075),.005);
  float plinth=sdRBox(q-vec3(0.,.03,0.),vec3(.085,.008,.062),.004);
  float y=q.y; float w=mix(.06,.05,clamp((y-.03)/.2,0.,1.));
  float col=max(sdBox2(q.xz,vec2(w,w*.75))-.004,abs(y-.11)-.08);
  col=max(col,-max(sdBox2(q.xz-vec2(0.,-w*.75),vec2(w-.014,.004)),abs(y-.11)-.06));   /* a sunk panel */
  vec3 t=topQ(p);
  float top=sdRBox(t,vec3(.12,.012,.085),.004);
  float lip=sdRBox(t-vec3(0.,.016,-.07),vec3(.105,.006,.004),.002);        /* ledge on the low edge */
  float d=min(min(base,plinth),col);
  d=smin(d,top,.01);
  return min(d,lip); }
float cards(vec3 p){ vec3 t=topQ(p)-vec3(-.005,.016,.0); t.xz=rot(-.08)*t.xz;
  float d=sdRBox(t,vec3(.063,.0045,.042),.0015);
  vec3 t2=topQ(p)-vec3(.012,.022,-.004); t2.xz=rot(.1)*t2.xz;
  return min(d,sdRBox(t2,vec3(.063,.0011,.042),.001)); }
/* a mortarboard: skull cap, square board, button, cord and tassel */
#define MB vec3(.2,0.,-.08)
vec3 mbQ(vec3 p){ vec3 q=p-MB; q.xz=rot(.55)*q.xz; q.xy=rot(.1)*q.xy; return q; }
float capD(vec3 p){ vec3 q=mbQ(p);
  float sk=sdCylY(q-vec3(0.,.03,0.),.058-.006*q.y/.06,.03)-.004;
  sk=max(sk,-(sdCylY(q-vec3(0.,.018,0.),.052,.02)));
  return sk; }
float boardD(vec3 p){ vec3 q=mbQ(p)-vec3(0.,.064,0.);
  return sdRBox(q,vec3(.095,.0035,.095),.0015); }
float tassel(vec3 p){ vec3 q=mbQ(p)-vec3(0.,.07,0.);
  float btn=sdCylY(q,.008,.003)-.002;
  float cord=sdCapsule(q,vec3(0.,.002,0.),vec3(.085,.002,-.085),.0018);
  vec3 e=q-vec3(.092,0.,-.092);
  cord=min(cord,sdCapsule(e,vec3(0.,.0,0.),vec3(.004,-.035,-.004),.0018));
  float fr=sdCone(e-vec3(.004,-.07,-.004),.012,.004,.03);
  return min(btn,min(cord,fr)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,lectern(p),3.);
  r=U(r,cards(p),4.);
  r=U(r,boardD(p),5.);
  r=U(r,capD(p),6.);
  r=U(r,tassel(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return .5+.15*(grain(lcQ(p).zxy,50.)-.5);
  if(id==4.){ vec3 t=topQ(p)-vec3(.012,.022,-.004); t.xz=rot(.1)*t.xz;
    if(n.y>.5||dot(n,vec3(0.,.95,.3))>.5){ float l=fract((t.z+.03)/.011); if(t.z>-.03&&t.z<.03&&abs(t.x)<.048&&l<.14) return .45; }
    return .96; }
  if(id==5.) return .3;
  if(id==6.) return .38;
  if(id==7.){ vec3 q=mbQ(p); return fract(q.x/.003)<.4?.2:.35; }
  return .7; }
