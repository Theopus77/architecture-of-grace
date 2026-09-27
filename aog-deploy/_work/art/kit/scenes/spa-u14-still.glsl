/* Spanish Unit 14 "Tener, Gustar and Stem Changes" — pencil still life of favourite things: a
   round fruit bowl holding oranges with a banana laid over them, and a glass of juice beside it. */
#define CAM_POS vec3(-0.4089,0.2574,-0.7202)
#define CAM_TGT vec3(-0.1870,-0.0176,0.1043)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define BW vec3(.03,0.,.06)
float bowl(vec3 p){ vec3 q=p-BW; q.y-=.075; float s=max(abs(length(q)-.12)-.004,q.y); s=max(s,-q.y-.07);
  float foot=sdCylY(p-BW-vec3(0.,.006,0.),.05,.006)-.002; float rim=sdTorus(q,.12,.005); return min(min(s,foot),rim); }
vec3 oc(int i){ return BW+(i==0?vec3(-.05,.085,.01):i==1?vec3(.05,.085,-.01):i==2?vec3(.0,.09,.06):i==3?vec3(.0,.14,.01):vec3(-.2,.04,-.07)); }
float oranges(vec3 p){ float d=1e5; for(int i=0;i<5;i++){ vec3 q=p-oc(i); d=min(d,length(q)-(i==4?.04:.045)+.0006*vn3(q*600.)); } return d; }
float banana(vec3 p){ vec3 q=p-vec3(-.02,.019,-.13); q.xz=rot(.15)*q.xz; q=vec3(q.x,-q.z+.0,q.y); q.y+=.0;
  vec2 c=vec2(0.,.14); vec2 u=q.xy-c; float a=atan(u.x,-u.y); float t=clamp(a/.75,-1.,1.);
  float R=.019*(1.-t*t*.75); float d=length(vec2(length(u)-.14,q.z))-R; d=max(d,abs(a)-.78)*.8;
  float stem=sdCapsule(q,vec3(.14*sin(.78),.14-.14*cos(.78),0.),vec3(.14*sin(.9),.14-.14*cos(.9),0.),.005);
  return min(d,stem); }
#define GJ vec3(.2,0.,.0)
float glassD(vec3 p){ vec3 q=p-GJ; float r=.034+q.y*.06; return min(max(abs(length(q.xz)-r)-.002,abs(q.y-.06)-.06),sdCylY(q-vec3(0.,.005,0.),r,.005)); }
float juice(vec3 p){ vec3 q=p-GJ; return sdCylY(q-vec3(0.,.045,0.),.034+.04*.06-.002,.04); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bowl(p),3.);
  r=U(r,oranges(p),4.);
  r=U(r,banana(p),5.);
  r=U(r,glassD(p),6.);
  r=U(r,juice(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BW; return abs(q.y-.04)<.005?.35:.78; }
  if(id==4.){ int k=0; float b=1e5; for(int i=0;i<5;i++){ float d=length(p-oc(i)); if(d<b){b=d;k=i;} } vec3 q=normalize(p-oc(k)); return q.y>.95?.2:.5; }
  if(id==5.){ return .82; }
  if(id==6.) return .92;
  if(id==7.) return .6;
  return .7; }
