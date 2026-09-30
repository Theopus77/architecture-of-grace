/* The Unseen Realm Unit 5 "Three Rebellions" - Genesis 3, 6 and 11: an apple with a leaf (Eden),
   five mud bricks stacked like a small tower (Babel's bricks) and a rolled scroll (the Genesis text). Objects only. */
#define CAM_POS vec3(-0.45,0.45,-1.0)
#define CAM_TGT vec3(-0.05,0.03,0.1)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.68,.85,-.32)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "unrparts_a.glsl"
#define BB vec3(.075,.028,.038)
vec3 BQ(vec3 p,int i){ vec3 q=p-vec3(-.1,0.,.12);
  if(i<2){ q-=vec3(0.,0.,(float(i)-.5)*.084); q.xz=rot(.05*sin(float(i)*3.))*q.xz; }
  else if(i<4){ q-=vec3((float(i)-2.5)*.08,2.*BB.y+.001,0.); q.xz=rot(1.57+.04*sin(float(i)*5.))*q.xz; }
  else { q-=vec3(.004,4.*BB.y+.002,0.); q.xz=rot(.08)*q.xz; }
  return q; }
float bricksD(vec3 p){ float d=1e5; for(int i=0;i<5;i++) d=min(d,o_brick(BQ(p,i),BB)); return d; }
float bricksT(vec3 p){ float d=1e5,t=.6; for(int i=0;i<5;i++){ float e=o_brick(BQ(p,i),BB); if(e<d){ d=e; t=t_brick(BQ(p,i)); } } return t; }
vec3 Q3(vec3 p){ return p-vec3(.13,.06,-.05); }
vec3 Q5(vec3 p){ vec3 q=p-vec3(.05,0.,-.2); q.xz=rot(-.25)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,appleD(Q3(p),.06),3.);
  r=U(r,appleLeaf(Q3(p),.06),4.);
  r=U(r,bricksD(p),5.);
  r=U(r,o_roll(Q5(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;
  if(id==3.) return Q3(p).y>.045?.3:.52+.06*(fbm(Q3(p).xz*90.)-.5);
  if(id==4.) return .45;
  if(id==5.) return bricksT(p);
  if(id==6.) return t_roll(Q5(p));
  return .7; }
