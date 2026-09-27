/* Practice room "Human Geography" — pencil still life: two square wooden boards of the same
   size, one crowded with little wooden houses (a dense town), the other holding just two houses
   and a tree (a spread-out place). Density is how many share the same space. */
#define CAM_POS vec3(-0.2542,0.3002,-0.7281)
#define CAM_TGT vec3(-0.1347,-0.0843,0.0732)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define B1 vec3(-.1,0.,.05)
#define B2 vec3(.16,0.,-.05)
#define BH .1
float boardD(vec3 q){ return sdRBox(q-vec3(0.,.006,0.),vec3(BH,.006,BH),.003); }
/* a little house: box body with a pitched roof, base at y=0, ridge along x */
float house(vec3 q,float s,float ry){ q.xz=rot(ry)*q.xz; q/=s;
  float b=sdRBox(q-vec3(0.,.012,0.),vec3(.012,.012,.01),.001);
  vec3 r=q-vec3(0.,.024,0.); float roof=max(max(abs(r.z)*.9+r.y-.012,-r.y),abs(r.x)-.014);
  return min(b,roof-.0005)*s; }
vec2 cell(int i){ return vec2(float(i%4)-1.5,float(i/4)-1.5)*.048+vec2(.006*sin(float(i)*3.1),.006*cos(float(i)*2.3)); }
float townD(vec3 q){ float d=1e3; for(int i=0;i<16;i++){ vec2 c=cell(i); float s=.9+.35*fract(float(i)*.61);
    d=min(d,house(q-vec3(c.x,.012,c.y),s,float(i)*.4)); } return d; }
float villD(vec3 q){ float d=house(q-vec3(-.04,.012,.03),1.1,.3); d=min(d,house(q-vec3(.05,.012,-.04),1.,-.5)); return d; }
float treeD(vec3 q){ vec3 t=q-vec3(.03,.012,.05); return min(sdCylY(t-vec3(0.,.01,0.),.003,.01),length(t-vec3(0.,.03,0.))-.014); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 a=place(p,B1,.15), b=place(p,B2,.15);
  r=U(r,min(boardD(a),boardD(b)),3.);
  r=U(r,townD(a),4.);
  r=U(r,villD(b),4.);
  r=U(r,treeD(b),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .62+.1*grain(p,50.);
  if(id==4.){ if(n.y>.3&&n.y<.95) return .45; return .85; }
  if(id==5.) return .45;
  return .7; }
