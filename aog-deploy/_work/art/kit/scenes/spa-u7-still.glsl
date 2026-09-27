/* Spanish Unit 7 "Who, Where, When, Why" — pencil still life: a desk globe on its stand (where),
   a round alarm clock (when) and a magnifying glass lying on a closed notebook (who, why). */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.06,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define GL vec3(.05,0.,.08)
#define GR .09
/* land masses from noise, fixed to the globe's tilted axis */
vec3 gq(vec3 p){ vec3 q=p-GL-vec3(0.,.14,0.); q.xy=rot(.41)*q.xy; q.xz=rot(.8)*q.xz; return q; }
float land(vec3 q){ return fbm3(normalize(q)*2.4+vec3(3.1,1.,.5))-.52; }
float globe(vec3 p){ vec3 q=gq(p); return length(q)-GR; }
float stand(vec3 p){ vec3 q=p-GL;
  float base=sdCone(q-vec3(0.,.012,0.),.065,.045,.012)-.002;
  float neck=sdCylY(q-vec3(0.,.035,0.),.008,.015);
  vec3 m=q-vec3(0.,.14,0.); m.xy=rot(.41)*m.xy;
  float mer=max(abs(length(m.xy)-GR-.009)-.003,abs(m.z)-.004); mer=max(mer,m.x-.03);
  float pin=sdCylY(m,.0025,GR+.018);
  return min(min(base,neck),min(mer,pin)); }
#define CL vec3(-.16,0.,.0)
float clock(vec3 p){ vec3 q=p-CL; q.xz=rot(.35)*q.xz;
  vec3 f=q-vec3(0.,.075,0.); float body=sdCylZ(f,.055,.02)-.004;
  float glass=sdCylZ(f-vec3(0.,0.,-.022),.047,.002);
  float bells=min(length(q-vec3(-.035,.135,.0))-.022,length(q-vec3(.035,.135,.0))-.022); bells=max(bells,-(q.y-.128));
  float hammer=sdCapsule(q,vec3(0.,.13,0.),vec3(0.,.15,0.),.003);
  float feet=min(sdCapsule(q,vec3(-.03,.03,0.),vec3(-.045,.0,.0),.005),sdCapsule(q,vec3(.03,.03,0.),vec3(.045,.0,0.),.005));
  return min(min(body,glass),min(bells,min(hammer,feet))); }
float lens(vec3 p){ vec3 q=p-vec3(.2,.03,-.07); q.xz=rot(-.5)*q.xz;
  float ring=sdTorus(q,.035,.005); float glass=sdCylY(q,.032,.002);
  float handle=sdCapsule(q,vec3(.04,0.,0.),vec3(.12,-.005,0.),.008);
  return min(min(ring,glass),handle); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,globe(p),3.);
  r=U(r,stand(p),4.);
  r=U(r,clock(p),5.);
  vec2 b=flatBook(p,vec3(.2,.012,-.06),vec3(.08,.012,.055),-.3); r=U(r,b.x,b.y>.5?7.:6.);
  r=U(r,lens(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=gq(p); float l=land(q); if(abs(l)<.008) return .2; if(abs(q.y)<.0015) return .5; return l>0.?.5:.9; }
  if(id==4.) return .35;
  if(id==5.){ vec3 q=p-CL; q.xz=rot(.35)*q.xz; vec2 u=q.xy-vec2(0.,.075);
    if(q.z<-.021){ float r=length(u); float a=atan(u.x,u.y);
      if(sdSeg2(u,vec2(0.),vec2(.0,.034))<.002||sdSeg2(u,vec2(0.),vec2(.024,-.008))<.0025) return .1;
      if(r>.036&&r<.043&&abs(fract(a/(PI/6.)+.5)-.5)<.05) return .2; return .93; }
    return .4; }
  if(id==6.) return .45;
  if(id==7.) return .9;
  if(id==8.){ vec3 q=p-vec3(.2,.03,-.07); q.xz=rot(-.5)*q.xz; if(length(q.xz)<.031) return .96; return length(q.xz)<.045?.35:.5; }
  return .7; }
