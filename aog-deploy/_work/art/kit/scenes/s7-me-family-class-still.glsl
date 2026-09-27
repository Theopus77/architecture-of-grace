/* s7-me-family-class "Me, My Family, My Class" — a child's school backpack (my class), a standing
   picture frame holding a child's drawing of a house under a sun (my family's home) and three
   crayons lying in front (me: what I make). No people, no faces, no words. */
#define CAM_POS vec3(-0.4463,0.4758,-0.9358)
#define CAM_TGT vec3(-0.2887,-0.0316,0.1215)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
/* ---- backpack standing, front toward the viewer (-z) ---- */
#define BP vec3(-.13,0.,.07)
vec3 bpQ(vec3 p){ return place(p,BP,-.35); }
float packD(vec3 q){
  float y=q.y; float w=.085-.012*smoothstep(.1,.2,y);
  float body=sdRBox(q-vec3(0.,.1,0.),vec3(w,.1,.045),.03);
  float top=sdEll(q-vec3(0.,.19,0.),vec3(w,.035,.045));
  body=smin(body,top,.02);
  float pock=sdRBox(q-vec3(0.,.065,-.045),vec3(.062,.045,.018),.016);
  float flap=1e5;
  float loop=length(vec2(length((q-vec3(0.,.225,0.)).xy)-.018,q.z))-.0045; loop=max(loop,-(q.y-.222));
  return smin(min(body,loop),min(pock,flap),.006); }
float strapD(vec3 q){ vec3 s=q; s.x=abs(s.x)-.045;
  float st=sdRBox(s-vec3(0.,.1,.052),vec3(.012,.09,.006),.004);
  float buck=1e5;
  vec3 z=q-vec3(0.,.108,-.061); float zip=sdCapsule(z,vec3(-.05,0.,0.),vec3(.05,0.,0.),.0022); zip=min(zip,sdRBox(z-vec3(.05,-.012,-.002),vec3(.004,.011,.002),.0015));
  return min(min(st,buck),zip); }
/* ---- a standing picture frame with a child's drawing ---- */
#define PF vec3(.11,0.,.1)
vec3 pfQ(vec3 p){ vec3 q=place(p,PF,.2); q.yz=rot(-.2)*q.yz; return q; }
float frameD(vec3 q){
  float f=sdRBox(q-vec3(0.,.09,0.),vec3(.07,.09,.007),.003);
  f=max(f,-sdBox(q-vec3(0.,.09,-.006),vec3(.055,.075,.004)));
  return f; }
float picD(vec3 q){ return sdBox(q-vec3(0.,.09,-.001),vec3(.056,.076,.0015)); }
float easelD(vec3 p){ vec3 q=place(p,PF,.2); return sdCapsule(q,vec3(0.,.12,.03),vec3(0.,.003,.085),.004); }
/* ---- three crayons lying in front ---- */
float crayon(vec3 p,vec3 c,float ry,float roll){ vec3 q=place(p,c,ry);
  float body=sdCylX(q-vec3(0.,.0082,0.),.008,.036)-.0004;
  float tip=sdCone((q-vec3(.046,.0082,0.)).yxz,.008,.003,.01);
  return min(body,tip); }
#define CR1 vec3(.04,0.,-.1)
#define CR2 vec3(.06,0.,-.13)
#define CR3 vec3(.08,0.,-.16)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.45-p.z,2.);
  vec3 b=bpQ(p);
  r=U(r,packD(b),3.);
  r=U(r,strapD(b),4.);
  vec3 f=pfQ(p);
  r=U(r,frameD(f),5.);
  r=U(r,picD(f),6.);
  r=U(r,easelD(p),5.);
  r=U(r,crayon(p,CR1,.3,0.),7.);
  r=U(r,crayon(p,CR2,.2,0.),8.);
  r=U(r,crayon(p,CR3,.1,0.),9.);
  return r; }
float cTone(vec3 p,vec3 c,float ry,float base){ vec3 q=place(p,c,ry);
  if(q.x>.036) return base-.05;
  if(abs(abs(q.x+.004)-.024)<.002) return .2;
  if(abs(q.x+.004)<.024) return base+.15;   /* the paper wrapper with two rings */
  return base; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bpQ(p); return .5+.08*fbm(q.xy*300.); }
  if(id==4.) return .3;
  if(id==5.) return .45+.1*grain(pfQ(p).yxz,90.);
  if(id==6.){ vec2 u=pfQ(p).xy-vec2(0.,.09); float a=.95;       /* a child's drawing: house, sun, ground */
    float wall=sdBox2(u-vec2(-.008,-.028),vec2(.026,.022));
    float roof=max(max(-(u.y+.006),(u.y-.028)+abs(u.x+.008)*1.05),-.1);
    if(abs(wall)<.0016) a=.25;
    if(abs(roof)<.0018&&u.y>-.007&&u.y<.03&&abs(u.x+.008)<.034) a=.25;
    if(abs(u.y+.006)<.0016&&abs(u.x+.008)<.032) a=.25;
    if(abs(sdBox2(u-vec2(-.008,-.04),vec2(.006,.011)))<.0014) a=.3;       /* door */
    float sd=length(u-vec2(.035,.048)); if(abs(sd-.009)<.0016) a=.3;
    float ang=atan(u.y-.048,u.x-.035); if(sd>.013&&sd<.02&&abs(fract(ang/.7854+.5)-.5)<.1) a=.35;   /* rays */
    if(abs(u.y+.052+.003*sin(u.x*180.))<.0016) a=.35;                     /* ground */
    return a; }
  if(id==7.) return cTone(p,CR1,.3,.35);
  if(id==8.) return cTone(p,CR2,.2,.6);
  if(id==9.) return cTone(p,CR3,.1,.45);
  return .7; }
