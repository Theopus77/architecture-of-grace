/* Novel cover, Book Four "The Year We Looked Up" (Room 104): a small telescope on its tripod,
   pointing up at a paper star hung on a thread, beside a stack of books with a sketchbook and
   Grandfather's brush. */
#define CAM_POS vec3(-0.0903,0.6444,-2.0382)
#define CAM_TGT vec3(0.0530,0.3579,0.1109)
#define SUN_DIR vec3(-.65,.8,-.35)
#define CAM_FOV 30.
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
  r=U(r,telescope(pl(p,vec3(-.08,0,.05),-.5),.65),3.);
  r=U(r,bookStack(pl(p,vec3(.22,0,.05),.3)),4.);
  vec3 s=p-vec3(.2,.52,.12); s.xz=rot(.3)*s.xz; r=U(r,min(star5(s,.07),sdCapsule(p,vec3(.2,.59,.12),vec3(.2,.75,.12),.0015)),5.);
  r=U(r,notebook(pl(p,vec3(.02,0,-.22),.1),vec2(.1,.07)),6.);
  r=U(r,brush(pl(p,vec3(.03,.016,-.23),-.2)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.){ vec3 q=pl(p,vec3(.22,0,.05),.3); if(abs(fract(q.y/.036)-.5)>.38) return .92; return .5+.15*step(.5,fract(q.y/.072)); }
  if(id==5.) return .97;
  if(id==6.) return .92;
  if(id==7.){ vec3 q=pl(p,vec3(.03,.016,-.23),-.2); return q.x>.06?.2:.55; }
  return .7; }
