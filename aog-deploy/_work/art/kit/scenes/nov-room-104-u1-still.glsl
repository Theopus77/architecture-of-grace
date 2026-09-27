/* Novel scene room-104-u1: a dressing-table mirror reflecting a lit window, a plain half mask resting beside it */
#define CAM_POS vec3(-0.1996,0.3039,-1.2774)
#define CAM_TGT vec3(-0.0031,0.2055,0.0972)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.6,.7,-.4)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "novlib.glsl"
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);

  r=U(r,.9-p.z,2.);
  r=U(r,sdRBox(p-vec3(0,.02,.15),vec3(.45,.02,.2),.005),3.);
  vec3 m=p-vec3(.05,.04,.28);
  r=U(r,max(sdRBox(m-vec3(0,.2,0),vec3(.15,.2,.015),.005),-sdBox(m-vec3(0,.2,-.02),vec3(.13,.18,.01))),4.);
  r=U(r,sdBox(m-vec3(0,.2,-.014),vec3(.13,.18,.003)),5.);
  vec3 k=pl(p-vec3(-.22,.07,.05),vec3(0),-.4); k.yz=rot(-1.25)*k.yz; r=U(r,mask(k),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==3.) return .5+.1*grain(p,30.); if(id==4.) return .45;
  if(id==5.){ vec2 w=p.xy-vec2(.09,.28); if(abs(w.x)<.05&&abs(w.y)<.07){ if(abs(w.x)<.004||abs(w.y)<.004) return .4; return .98; } return .65; }
  if(id==6.) return .9;
  return .6; }
