/* Math Unit 7 "Place Value and Multi-Digit Arithmetic" — pencil still life: base-ten blocks
   at a bigger scale: a thousands cube, a hundreds flat leaning on it, a tens rod and ones. */
#define CAM_POS vec3(-0.5000,0.3582,-0.7428)
#define CAM_TGT vec3(-0.2391,-0.0186,0.1267)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define UN .018
float gridT(vec2 u){ vec2 f=abs(fract(u/UN)-.5); return max(f.x,f.y)>.45?.3:.78; }
vec3 cuQ(vec3 p){ vec3 q=p-vec3(.04,5.*UN,.1); q.xz=rot(.45)*q.xz; return q; }
vec3 flQ(vec3 p){ vec3 q=p-vec3(-.22,0.,.0); q.xz=rot(-.1)*q.xz; q.yz=rot(.18)*q.yz; q.y-=5.*UN; return q; }
vec3 rdQ(vec3 p){ vec3 q=p-vec3(.2,.5*UN,-.03); q.xz=rot(-.35)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,sdRBox(cuQ(p),vec3(5.*UN),.002),3.);
  r=U(r,sdRBox(flQ(p),vec3(5.*UN,5.*UN,.5*UN),.002),4.);
  r=U(r,sdRBox(rdQ(p),vec3(5.*UN,.5*UN,.5*UN),.002),5.);
  vec3 o=p-vec3(-.08,.5*UN,-.1); float ones=sdRBox(o,vec3(.5*UN),.002);
  o=p-vec3(-.055,.5*UN,-.095); o.xz=rot(.4)*o.xz; ones=min(ones,sdRBox(o,vec3(.5*UN),.002));
  o=p-vec3(-.07,.5*UN,-.125); o.xz=rot(-.3)*o.xz; ones=min(ones,sdRBox(o,vec3(.5*UN),.002));
  r=U(r,ones,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=cuQ(p)+5.*UN; vec3 a=abs(n); vec2 u=a.y>.5?q.xz:a.x>.5?q.zy:q.xy; return gridT(u); }
  if(id==4.){ vec3 q=flQ(p)+vec3(5.*UN,5.*UN,0.); return abs(n.z)>.3||true?gridT(q.xy):.78; }
  if(id==5.){ vec3 q=rdQ(p)+5.*UN; return abs(fract(q.x/UN)-.5)>.45?.3:.78; }
  if(id==6.) return .6;
  return .7; }
