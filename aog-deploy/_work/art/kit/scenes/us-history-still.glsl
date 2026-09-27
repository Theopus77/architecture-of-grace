/* U.S. History, Grades 6-8 — pencil still life of early America: a punched-tin colonial lantern
   with a ring handle, a tricorn hat, its brim turned up into three points, and a brass spyglass drawn out
   (exploration). No flags or emblems. */
#define CAM_POS vec3(-0.3300,0.3977,-0.7805)
#define CAM_TGT vec3(-0.1978,-0.0289,0.1092)
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
#define LN vec3(-.02,0.,.07)
#define HT vec3(.15,0.,.0)
#define SG vec3(-.06,.016,-.1)
float lanternD(vec3 q){ float d=sdCylY(q-vec3(0.,.07,0.),.035,.065)-.001;
  d=min(d,sdCone(q-vec3(0.,.155,0.),.037,.006,.02)-.001);
  d=min(d,sdTorus((q-vec3(0.,.19,0.)).xzy,.014,.0025));
  d=min(d,sdCylY(q-vec3(0.,.004,0.),.038,.004)-.001);
  for(int i=0;i<3;i++) d=min(d,sdTorus(q-vec3(0.,.012+float(i)*.058,0.),.036,.0022));
  return d; }
/* tricorn: a low crown and a brim turned up on three sides */
vec3 htQ(vec3 p){ vec3 q=p-HT; q.xz=rot(.7)*q.xz; return q; }
/* tricorn: a low round crown sitting in a brim folded up into three walls that make a triangle
   in plan, with a point at each corner and the top edge dipping between the points */
float sdEqTri(vec2 p,float r){ const float k=1.7320508; p.x=abs(p.x)-r; p.y=p.y+r/k;
  if(p.x+k*p.y>0.) p=vec2(p.x-k*p.y,-k*p.x-p.y)/2.; p.x-=clamp(p.x,-2.*r,0.); return -length(p)*sign(p.y); }
float hatTop(vec3 q){ float a=atan(q.z,q.x); float c=pow(abs(cos(1.5*(a-PI*.5))),6.); return .02+.04*c; }
float hatD(vec3 q){ float tri=sdEqTri(q.xz,.062)-.012;
  float wall=max(abs(tri+.003)-.0028,max(q.y-hatTop(q),-q.y));
  float floor_=max(tri,abs(q.y-.003)-.003);
  float crown=max(sdEll(q-vec3(0.,.012,0.),vec3(.038,.046,.036)),-q.y);
  return min(min(wall,floor_),crown)*.8; }
vec3 sgQ(vec3 p){ vec3 q=p-SG; q.xz=rot(-.15)*q.xz; return q; }
float sgD(vec3 q){ float d=sdCylX(q-vec3(-.05,0.,0.),.016,.045)-.001; d=min(d,sdCylX(q-vec3(.03,0.,0.),.012,.04)-.001); d=min(d,sdCylX(q-vec3(.09,0.,0.),.009,.028)-.001);
  for(int i=0;i<3;i++){ float x=i==0?-.005:i==1?.07:.117; float r=i==0?.018:i==1?.014:.011; d=min(d,sdCylX(q-vec3(x,0.,0.),r,.003)-.001); }
  d=min(d,sdCylX(q-vec3(-.097,0.,0.),.018,.004)-.001); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,lanternD(p-LN),3.);
  r=U(r,hatD(htQ(p)),4.);
  r=U(r,sgD(sgQ(p)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-LN; if(q.y>.015&&q.y<.13){ float a=atan(q.z,q.x); vec2 g=vec2(a*.035/.012,(q.y-.015)/.012); vec2 f=fract(g+vec2(floor(g.y)*.5,0.))-.5;
      if(length(f)<.18) return .2; }   /* punched holes */
    return .55; }
  if(id==4.){ vec3 q=htQ(p); float tri=sdEqTri(q.xz,.062)-.012; if(abs(tri+.003)<.005&&q.y>hatTop(q)-.005) return .7;   /* braid trim on the edge */
    return .32; }
  if(id==5.){ vec3 q=sgQ(p); if(q.x<-.093) return .3; return .65; }
  return .7; }
