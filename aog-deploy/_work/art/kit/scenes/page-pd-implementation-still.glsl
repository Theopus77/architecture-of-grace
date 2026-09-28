/* Professional Development · Implementation Training — pencil still life: a thick ring binder
   lying closed, a small standing desk calendar ruled into a grid of days, and a pencil. */
#define CAM_POS vec3(-0.3580,0.2485,-0.4816)
#define CAM_TGT vec3(-0.1679,-0.0120,0.0678)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define BD vec3(-.03,0.,.07)
#define CL vec3(.15,0.,.06)
#define PN vec3(.02,.0068,-.1)
float binder(vec3 p){ vec3 q=P(p,BD,.1); vec3 h=vec3(.13,.03,.1);
  float cov=sdRBox(q-vec3(0.,h.y,0.),h,.006);
  float spine=sdCylZ(q-vec3(-h.x,h.y,0.),h.y+.002,h.z);
  float d=min(cov,spine);
  for(int i=0;i<3;i++){ float z=-.06+float(i)*.06; d=min(d,sdTorus((q-vec3(-h.x+.02,h.y*2.+.001,z)).xzy*vec3(1.,1.,1.),.012,.0025)); }
  return d; }
float binderT(vec3 p){ vec3 q=P(p,BD,.1);
  if(q.y>.058&&abs(q.x-.03)<.05&&abs(q.z)<.035) return abs(abs(q.z)-.035)<.002||abs(abs(q.x-.03)-.05)<.002?.35:.9;   /* the label window */
  return .5; }
float cal(vec3 p){ vec3 q=P(p,CL,-.35);
  vec3 a=q; a.yz=rot(.28)*a.yz; float f=sdRBox(a-vec3(0.,.055,0.),vec3(.06,.055,.002),.001);
  vec3 b=q; b.yz=rot(-.28)*b.yz; float bk=sdRBox(b-vec3(0.,.055,0.),vec3(.06,.055,.002),.001);
  float top=sdCylX(q-vec3(0.,.107,0.),.005,.058);
  return min(min(f,bk),top); }
float calT(vec3 p){ vec3 q=P(p,CL,-.35); vec3 a=q; a.yz=rot(.28)*a.yz; float y=a.y-.055;
  if(a.z<-.001&&abs(a.x)<.05&&y<.03&&y>-.045){ if(fract((a.x+.05)/.0143)<.1||fract((y+.045)/.015)<.1) return .45; return .95; }
  if(a.z<-.001&&abs(a.x)<.05&&y>.036&&y<.043) return .4;
  return .85; }
float pen(vec3 p){ vec3 q=p-PN; q.xz=rot(-.25)*q.xz; return pencilL(q,.08); }
float penT(vec3 p){ vec3 q=p-PN; q.xz=rot(-.25)*q.xz; return pencilT(q,.08); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,binder(p),3.);
  r=U(r,cal(p),4.);
  r=U(r,pen(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return binderT(p);
  if(id==4.) return calT(p);
  if(id==5.) return penT(p);
  return .7; }
