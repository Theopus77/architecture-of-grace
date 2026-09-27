/* Social Studies Unit 1 "Me, My Family, My School" — pencil still life: a little wooden
   schoolhouse with a bell tower, a red apple for the teacher and two stacked books. */
#define CAM_POS vec3(-0.3150,0.4679,-0.8454)
#define CAM_TGT vec3(-0.1708,0.0040,0.1210)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define HC vec3(.08,0.,.12)
#define HRY -.35
vec3 hq(vec3 p){ vec3 q=p-HC; q.xz=rot(HRY)*q.xz; return q; }
/* schoolhouse: body 0.24 wide, 0.14 deep, walls 0.12 high, gable roof ridge along x */
vec2 house(vec3 p){
  vec3 q=hq(p);
  float body=sdRBox(q-vec3(0.,.06,0.),vec3(.12,.06,.07),.003);
  float gab=max(abs(q.x)-.118,max(abs(q.z)*.6+(q.y-.12)*.8-.07*.6,.12-q.y));      /* gable fill */
  body=min(body,gab);
  body=max(body,-sdBox(q-vec3(0.,.035,-.07),vec3(.018,.035,.006)));            /* door recess */
  body=min(body,sdRBox(q-vec3(0.,.004,-.085),vec3(.03,.004,.014),.002));          /* step */
  /* roof: two slabs from the ridge (y .162) down over the eaves */
  float az=abs(q.z);
  float roof=max(abs(.6*az+.8*(q.y-.12)-.047)-.005,max(abs(q.x)-.132,az-.09))-.001;
  /* bell tower on the ridge: a small box, a pyramid cap and a bell */
  vec3 t=q-vec3(0.,.19,0.);
  float tw=sdRBox(t,vec3(.024,.032,.024),.002);
  tw=max(tw,-sdBox(t-vec3(0.,.008,0.),vec3(.03,.014,.014)));                     /* open belfry */
  tw=max(tw,-sdBox(t-vec3(0.,.008,0.),vec3(.014,.014,.03)));
  vec3 c=t-vec3(0.,.032,0.); float cap=max(abs(c.x)*.7+c.y*.7-.03*.7,max(abs(c.z)*.7+c.y*.7-.03*.7,-c.y));
  float bell=sdCone(t-vec3(0.,.008,0.),.009,.005,.007);
  roof=min(roof,min(tw,min(cap,bell)));
  return vec2(body,roof); }
vec2 apple(vec3 p){
  vec3 q=p-vec3(-.19,.045,-.02);
  float r=length(q*vec3(1.,1.08,1.))-.046;
  r+= .01*exp(-length(q.xz)*60.)*step(0.,q.y);     /* dimple at the top */
  float stem=sdCapsule(q,vec3(0.,.03,0.),vec3(.004,.058,.002),.0028);
  vec3 l=q-vec3(.014,.05,0.); l.xy=rot(-.5)*l.xy;
  float leaf=max(length(l*vec3(1.,6.,2.2))-.016,-1.);
  leaf=sdRBox(l,vec3(.015,.0012,.007),.001);
  return vec2(r*.9,min(stem,leaf)); }
float books(vec3 p){
  vec3 q=p-vec3(.33,0.,.02); q.xz=rot(.25)*q.xz;
  float b1=sdRBox(q-vec3(0.,.018,0.),vec3(.09,.018,.065),.003);
  vec3 q2=q-vec3(-.005,.049,.005); q2.xz=rot(-.18)*q2.xz;
  float b2=sdRBox(q2,vec3(.078,.013,.056),.003);
  return min(b1,b2); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 h=house(p); r=U(r,h.x,3.); r=U(r,h.y,4.);
  vec2 a=apple(p); r=U(r,a.x,5.); r=U(r,a.y,6.);
  r=U(r,books(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=hq(p);
    if(q.z<-.066){ /* front windows with cross bars, and clapboard lines */
      vec2 u=vec2(abs(q.x)-.068,q.y-.07);
      if(abs(u.x)<.024&&abs(u.y)<.026){ if(abs(u.x)<.0022||abs(u.y)<.0022||abs(u.x)>.021||abs(u.y)>.023) return .75; return .25; }
      if(abs(q.x)<.02&&q.y<.072) return .3; }
    if(abs(q.x)>.116&&q.y<.12){ vec2 u=vec2(q.z,q.y-.07);
      if(abs(u.x)<.022&&abs(u.y)<.024){ if(abs(u.x)<.002||abs(u.y)<.002) return .75; return .28; } }
    return fract(q.y/.016)<.12?.5:.72; }
  if(id==4.){ vec3 q=hq(p); if(q.y>.172) return .45; return fract((abs(q.z)*.8-(q.y-.12)*.6)/.012)<.25?.3:.5; }   /* shingle rows */
  if(id==5.){ vec3 q=p-vec3(-.19,.045,-.02); return .42; }
  if(id==6.) return .35;
  if(id==7.){ vec3 q=p-vec3(.33,0.,.02); q.xz=rot(.25)*q.xz;
    if(q.y<.036) return (abs(q.x)<.086&&abs(q.z)<.062&&abs(n.y)<.5)? (fract(q.y/.004)<.4?.8:.92) : .3;
    return (abs(n.y)<.5&&abs(abs(q.x)-.0)<.07)?.9:.62; }
  return .7; }
