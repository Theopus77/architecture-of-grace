/* WCS Unit 5 "Rich and Poor, Then and Now" — a jewelled king's crown on a soft cushion,
   beside a plain wooden bowl with a few coins spilled on the table. */
#define CAM_POS vec3(-0.2061,0.3058,-0.6431)
#define CAM_TGT vec3(-0.0973,-0.0445,0.0869)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define KC vec3(-.02,0.,.05)
float cushion(vec3 p){ vec3 q=p-KC; float d=sdRBox(q-vec3(0.,.03,0.),vec3(.1,.028,.1),.028);
  d-=.008*(1.-smoothstep(0.,.1,max(abs(q.x),abs(q.z))))-.01*smoothstep(.08,.1,max(abs(q.x),abs(q.z))); return d; }
float crown(vec3 p){ vec3 q=p-KC-vec3(0.,.062,0.); float r=length(q.xz); float a=atan(q.z,q.x);
  float sp=pow(abs(cos(a*3.)),6.); float top=.035+.04*sp;
  float d=max(abs(r-.065)-.004,max(-q.y,q.y-top));
  d=min(d,sdTorus(q-vec3(0.,.004,0.),.066,.005));
  for(int i=0;i<6;i++){ float b=float(i)*1.0472; d=min(d,length(q-vec3(cos(b)*.066,top*0.+.077,sin(b)*.066))-.007); }
  for(int i=0;i<6;i++){ float b=float(i)*1.0472+.5236; d=min(d,length(q-vec3(cos(b)*.07,.018,sin(b)*.07))-.006); }
  return d; }
#define WB vec3(.23,0.,-.01)
float bowl(vec3 p){ vec3 q=p-WB; float d=max(abs(length(q-vec3(0.,.09,0.))-.085)-.005,q.y-.045);
  d=min(d,max(-(length(q-vec3(0.,.09,0.))-.08),max(length(q-vec3(0.,.09,0.))-.085,q.y-.045)));
  return d; }
float coins(vec3 p){ float d=1e5; vec3 c[4]; c[0]=vec3(.14,.003,-.12); c[1]=vec3(.17,.003,-.1); c[2]=vec3(.15,.009,-.115); c[3]=vec3(.2,.003,-.14);
  for(int i=0;i<4;i++) d=min(d,sdCylY(p-c[i],.018,.0025)-.0006); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,cushion(p),3.);
  r=U(r,crown(p),4.);
  r=U(r,bowl(p),5.);
  r=U(r,coins(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-KC; if(abs(max(abs(q.x),abs(q.z))-.085)<.003) return .3; return .5; }
  if(id==4.){ vec3 q=p-KC-vec3(0.,.062,0.); if(q.y<.03&&q.y>.008&&length(q.xz)>.069) return .25; if(q.y>.07) return .35; return .72; }
  if(id==5.) return .45+.14*grain(p,50.);
  if(id==6.) return n.y>.7?(fract(length(p.xz)*300.)<.2?.5:.8):.55;
  return .7; }
