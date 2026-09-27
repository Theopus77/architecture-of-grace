/* World Religions Unit 23 "One Question, Many Lenses" (One Question on the Board) — pencil
   still life: a small slate on a wooden easel with one big chalk question mark, a magnifying
   glass and a pair of reading glasses on the table before it. No figures, no words. */
#define CAM_POS vec3(-0.5176,0.5989,-1.1514)
#define CAM_TGT vec3(-0.3260,-0.0178,0.1337)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define EZ vec3(.0,0.,.12)
#define TL .28
vec3 bq(vec3 p){ vec3 q=L(p,EZ,.15)-vec3(0,.16,0); q.yz=rot(TL)*q.yz; return q; }  /* board plane xy, leaning back */
float qmark(vec2 p){ /* a question mark in a unit box, centre-line distance */
  float d=arc(p,vec2(0.,.2),.2,-1.3,3.1416);
  d=min(d,seg(p,vec2(.2*cos(-1.3),.2+.2*sin(-1.3)),vec2(0.,-.12)));
  d=min(d,length(p-vec2(0.,-.36))-.02);
  return d; }
float easel(vec3 p){
  vec3 q=bq(p);
  float frame=sdRBox(q,vec3(.13,.1,.008),.003);
  float slate=sdBox(q-vec3(0,0,-.004),vec3(.115,.085,.006));
  float fr=max(frame,-sdBox(q-vec3(0,0,-.01),vec3(.115,.085,.01)));
  vec3 e=L(p,EZ,.15); float legs=1e5;
  for(int i=0;i<2;i++){ float sx=i==0?-.1:.1; legs=min(legs,sdCapsule(e,vec3(sx,0.,-.02),vec3(sx*.8,.29,.05),.006)); }
  legs=min(legs,sdCapsule(e,vec3(0,0.,.16),vec3(0,.28,.06),.006));
  float ledge=sdRBox(e-vec3(0,.06,-.022),vec3(.13,.004,.014),.002);
  float chalk=sdCapsule(e,vec3(.04,.068,-.028),vec3(.075,.068,-.03),.0045);
  return min(min(fr,slate),min(legs,min(ledge,chalk))); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,easel(p),3.);
  r=U(r,magD(L(p,vec3(-.21,0.,-.08),-.3),1.),4.);
  r=U(r,glassesD(L(p,vec3(.19,0.,-.1),-.3)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bq(p); if(abs(q.x)<.115&&abs(q.y)<.085&&q.z<-.008){
      float g=qmark(q.xy/.16)*.16; if(g<.012) return .97; return .22+.06*fbm(q.xy*60.); }
    vec3 e=L(p,EZ,.15); if(abs(e.y-.068)<.006&&e.z<-.02&&e.x>.035) return .95;
    return .55; }
  if(id==4.){ vec3 q=L(p,vec3(-.21,0.,-.08),-.3)-vec3(0,.006,0); if(length(q.xz)<.045) return .95; return q.x>.06?.35:.45; }
  if(id==5.){ vec3 g=L(p,vec3(.19,0.,-.1),-.3); vec3 h=g-vec3(0,.012,0); if(min(length(h.xy-vec2(-.03,0.)),length(h.xy-vec2(.03,0.)))<.021) return .93; return .3; }
  return .7; }
