/* Social Studies Unit 3 "Maps and Places" — pencil still life: a folded paper map with
   roads, a river and a star, a brass pocket compass on top of it, and a magnifying glass. */
#define CAM_POS vec3(-0.4446,0.7273,-0.5457)
#define CAM_TGT vec3(-0.1963,-0.0546,0.1166)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define MC vec3(.12,0.,.1)
#define MRY -.12
vec3 mq(vec3 p){ vec3 q=p-MC; q.xz=rot(MRY)*q.xz; return q; }
/* map: four panels folded like a zigzag fan, lying mostly flat */
float mapY(float x){ float f=fract((x+.24)/.12); return .004+.03*abs(f-.5)*2.; }
float mapD(vec3 p){
  vec3 q=mq(p);
  if(abs(q.x)>.26||abs(q.z)>.17) return max(sdBox(q,vec3(.24,.03,.15)),.02);
  float y=mapY(q.x);
  return max(abs(q.y-y)-.0012,max(abs(q.x)-.24,abs(q.z)-.15))*.9; }
#define CC vec3(.08,.05,.06)
float compassD(vec3 p){
  vec3 q=p-CC;
  float body=sdCylY(q,.06,.011)-.003;
  body=max(body,-sdCylY(q-vec3(0.,.013,0.),.05,.006));               /* glass well */
  float bezel=sdTorus(q-vec3(0.,.013,0.),.054,.004);
  float ring=sdTorus((q-vec3(0.,.013,-.072)).yxz,.012,.003);           /* hanging ring at north */
  float bow=sdCylZ(q-vec3(0.,.013,-.062),.006,.006);
  return min(min(body,bezel),min(ring,bow)); }
float needleD(vec3 p){
  vec3 q=p-CC-vec3(0.,.009,0.); q.xz=rot(.35)*q.xz;
  float t=clamp(abs(q.z)/.042,0.,1.);
  float nd=max(abs(q.x)-.007*(1.-t),abs(q.z)-.042);
  return max(nd,abs(q.y)-.0015); }
vec3 gq(vec3 p){ vec3 q=p-vec3(-.2,.0,.02); q.xz=rot(.6)*q.xz; return q; }
vec2 glassD(vec3 p){
  vec3 q=gq(p);
  vec3 c=q-vec3(0.,.012,0.);
  float rim=sdTorus(c,.05,.007);
  float lens=max(length(c*vec3(1.,6.,1.))-.048,-1.)*.16;
  lens=sdCylY(c,.046,.003);
  float handle=sdCapsule(q,vec3(.06,.012,0.),vec3(.17,.02,0.),.01);
  float coll=sdCylX(q-vec3(.06,.012,0.),.009,.008);
  return vec2(min(rim,coll),min(lens,handle)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,mapD(p),3.);
  r=U(r,compassD(p),4.);
  r=U(r,needleD(p),5.);
  vec2 g=glassD(p); r=U(r,g.x,6.); r=U(r,g.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=mq(p); vec2 u=q.xz; float a=.9;
    float river=abs(u.y-.04*sin(u.x*14.)-.02*sin(u.x*31.)+.03)-.006; if(river<0.) a=.5;
    float road=min(abs(u.x*.5+u.y-.06),abs(u.x-.09+u.y*.3)); if(road<.003) a=.3;
    float road2=abs(u.y-.1+u.x*.15); if(road2<.0022&&u.x<.1) a=.35;
    if(fract(u.x*40.+.5)<.03||fract(u.y*40.+.5)<.03) a=min(a,.75);
    vec2 s=u-vec2(-.15,-.08); float st=length(s)-.012; if(st<0.) a=.3;
    if(abs(q.x)>.235||abs(q.z)>.145) a=.6;
    return a; }
  if(id==4.){ vec3 q=p-CC; float r=length(q.xz);
    if(q.y>.0&&r<.05){ float an=atan(q.z,q.x); float t=fract(an/6.2832*16.); if(r>.04&&t<.12) return .25; return .95; }
    return .5; }
  if(id==5.){ vec3 q=p-CC; q.xz=rot(.35)*q.xz; return q.z<0.?.15:.8; }
  if(id==6.) return .45;
  if(id==7.){ vec3 q=gq(p); if(q.x>.05) return .35; return .96; }
  return .7; }
