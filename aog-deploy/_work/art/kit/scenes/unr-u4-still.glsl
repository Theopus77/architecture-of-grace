/* The Unseen Realm Unit 4 "Meeting Michael Heiser and the Divine Council" - a scholar's desk: a stack
   of old language books, an open study book with notes round the text, and a magnifying glass. Objects only. */
#define CAM_POS vec3(-0.6690,0.4035,-1.0451)
#define CAM_TGT vec3(-0.2386,-0.0484,0.1386)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.68,.85,-.32)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "unrparts_a.glsl"
vec3 Q3(vec3 p){ vec3 q=p-vec3(.04,0.,-.02); q.xz=rot(-.1)*q.xz; return q; }
vec3 SB(vec3 p,int i){ vec3 q=p-vec3(-.22,0.,.2); float fi=float(i); q.y-=fi*.056; q.xz=rot(.3+.15*sin(fi*2.))*q.xz; q.x+=.01*sin(fi*3.); return q; }
vec3 Q6(vec3 p){ vec3 q=p-vec3(.2,0.,-.2); q.xz=rot(-.4)*q.xz; return q; }
float stackD(vec3 p){ float d=1e5; for(int i=0;i<3;i++){ vec3 b=vec3(.12-.01*float(i),.028,.09-.006*float(i)); d=min(d,o_codex(SB(p,i),b)); } return d; }
float stackT(vec3 p){ float d=1e5,t=.4; for(int i=0;i<3;i++){ vec3 b=vec3(.12-.01*float(i),.028,.09-.006*float(i)); float e=o_codex(SB(p,i),b); if(e<d){ d=e; t=t_codex(SB(p,i),b,i==1?.55:.35); } } return t; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,o_bookpages(Q3(p)),3.);
  r=U(r,o_bookcover(Q3(p)),4.);
  r=U(r,stackD(p),5.);
  r=U(r,o_magnifier(Q6(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;
  if(id==3.) return t_bookpages(Q3(p),1);
  if(id==4.) return t_bookcover(Q3(p));
  if(id==5.) return stackT(p);
  if(id==6.) return t_magnifier(Q6(p));
  return .7; }
