/* Chinese Classics Unit 13 "Close Reading the Daodejing" — pencil still life of chapter 11:
   a wooden cart wheel with its spokes round an empty hub, standing in a low wooden cradle,
   and a round clay jar, both useful because of the empty space in them; a small cup of water. */
#define CAM_POS vec3(-0.5001,0.2654,-0.9839)
#define CAM_TGT vec3(-0.2554,0.0429,0.1175)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define WC vec3(-.03,.16,.2)
#define WR .15
vec3 wQ(vec3 p){ vec3 q=p-WC; q.xz=rot(-.35)*q.xz; return q; }
float wheel(vec3 p){ vec3 q=wQ(p); float r=length(q.xy);
  float rim=max(abs(r-WR+.012)-.012,abs(q.z)-.013)-.002;
  float hub=sdCylZ(q,.024,.03)-.002; hub=max(hub,-sdCylZ(q,.009,.05));
  hub=min(hub,max(sdCylZ(q,.03,.012)-.002,-sdCylZ(q,.009,.05)));
  float a=atan(q.y,q.x); float n=15.; float sa=(floor(a/(6.2832/n)+.5))*(6.2832/n);
  vec2 u=rot(sa)*q.xy;   /* u.x along the spoke */
  float sp=max(length(vec2(u.y,q.z))-.0045,max(.02-u.x,u.x-(WR-.02)));
  return min(min(rim,hub),sp); }
float cradle(vec3 p){ vec3 q=p-vec3(WC.x,0.,WC.z); q.xz=rot(-.35)*q.xz;
  float d=sdRBox(q-vec3(0.,.012,0.),vec3(.11,.012,.045),.004);
  d=max(d,-(length(q.xy-vec2(0.,WC.y))-WR-.001));
  return d; }
#define JC vec3(.24,0.,.02)
float jar(vec3 p){ vec3 q=p-JC;
  vec3 b=q-vec3(0.,.085,0.);
  float body=(length(b/vec3(.085,.08,.085))-1.)*.08;
  float neck=sdCylY(q-vec3(0.,.17,0.),.035,.02);
  float lip=sdTorus(q-vec3(0.,.188,0.),.038,.006);
  float d=smin(body,neck,.02); d=min(d,lip);
  d=max(d,-sdCylY(q-vec3(0.,.2,0.),.03,.2));
  d=max(d,-(q.y-.0015));
  return d; }
float cup(vec3 p){ vec3 q=p-vec3(.12,0.,-.12);
  float d=sdCone(q-vec3(0.,.022,0.),.02,.03,.022)-.002; d=max(d,-sdCone(q-vec3(0.,.03,0.),.016,.027,.02));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,wheel(p),3.);
  r=U(r,cradle(p),4.);
  r=U(r,jar(p),5.);
  r=U(r,cup(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=wQ(p); float r=length(q.xy); if(r<.034) return .38; if(r>WR-.026&&abs(fract(atan(q.y,q.x)*6./6.2832)-.5)<.01) return .3; return .52+.12*grain(vec3(r*3.,q.z,atan(q.y,q.x)),20.); }
  if(id==4.) return .4+.12*grain(p,40.);
  if(id==5.){ vec3 q=p-JC; if(abs(q.y-.12)<.012&&abs(fract(atan(q.z,q.x)*10./6.2832+q.y*20.)-.5)<.1) return .35;
    if(abs(q.y-.135)<.0015||abs(q.y-.105)<.0015) return .35; return .62; }
  if(id==6.) return .85;
  return .7; }
