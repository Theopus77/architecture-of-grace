/* Social Studies Unit 23 "Government and Economics" — pencil still life: a model of a
   bank or treasury building with a row of columns and a pediment, beside tall stacks of
   coins and a folded paper bill. */
#define CAM_POS vec3(-0.3199,0.2603,-0.9707)
#define CAM_TGT vec3(-0.1809,0.0161,0.0754)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define TC vec3(.1,0.,.17)
vec3 tq(vec3 p){ vec3 q=p-TC; q.xz=rot(-.25)*q.xz; return q; }
vec2 temple(vec3 p){
  vec3 q=tq(p);
  float s1=sdRBox(q-vec3(0.,.008,0.),vec3(.16,.008,.1),.002);
  float s2=sdRBox(q-vec3(0.,.022,.005),vec3(.15,.006,.09),.002);
  float s3=sdRBox(q-vec3(0.,.034,.01),vec3(.14,.006,.08),.002);
  float cella=sdRBox(q-vec3(0.,.1,.03),vec3(.12,.06,.05),.002);
  float ent=sdRBox(q-vec3(0.,.168,.01),vec3(.142,.01,.083),.002);
  vec3 pd=q-vec3(0.,.178,.01); float ped=max(max(abs(pd.x)*.32+pd.y-.045,-pd.y),abs(pd.z)-.08);
  float cols=1e5;
  for(int i=0;i<6;i++){ float x=-.115+float(i)*.046; vec3 c=q-vec3(x,.099,-.055);
    float a=atan(c.z,c.x); cols=min(cols,sdCylY(c,.011-.0012*(1.-abs(sin(a*8.))),.06)); }
  return vec2(min(min(s1,s2),min(min(s3,cella),min(ent,ped))),cols); }
float coins(vec3 p){
  float a=coinStack(p-vec3(-.19,0.,-.01),.03,.0034,11,1.);
  float b=coinStack(p-vec3(-.25,0.,.05),.03,.0034,7,2.);
  float c=coinStack(p-vec3(-.13,0.,.06),.03,.0034,4,3.);
  return min(min(a,b),c); }
vec3 bq(vec3 p){ vec3 q=p-vec3(.32,.004,-.07); q.xz=rot(-.25)*q.xz; return q; }
float bill(vec3 p){ vec3 q=bq(p); q.y-=.006*smoothstep(.0,.07,q.x); return sdRBox(q,vec3(.08,.0012,.035),.0006)*.9; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 t=temple(p); r=U(r,t.x,3.); r=U(r,t.y,4.);
  r=U(r,coins(p),5.);
  r=U(r,bill(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=tq(p); if(q.z<-.019&&q.y>.04&&q.y<.16&&abs(q.x)<.02) return .25;  /* door */
    if(q.y>.172&&q.z<-.06){ vec3 pd=q-vec3(0.,.178,.01); if(abs(abs(pd.x)*.32+pd.y-.037)<.002||abs(pd.y-.003)<.002) return .45; }
    return .84; }
  if(id==4.) return .88;
  if(id==5.){ if(abs(n.y)>.7) return .72; return fract(p.y/.0012)<.4?.42:.6; }
  if(id==6.){ vec3 q=bq(p); vec2 u=q.xz; if(abs(abs(u.x)-.072)<.002||abs(abs(u.y)-.028)<.002) return .4;
    if(length(u*vec2(1.,1.3))<.02&&length(u*vec2(1.,1.3))>.016) return .35; if(length(u)<.012) return .55; return .8; }
  return .7; }
