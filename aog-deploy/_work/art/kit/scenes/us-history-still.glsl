/* U.S. History, Grades 6-8 — pencil still life of early America: a punched-tin colonial lantern
   with a ring handle, a three-cornered hat lying beside it, and a brass spyglass drawn out
   (exploration). No flags or emblems. */
#define CAM_POS vec3(-0.3263,0.3916,-0.7678)
#define CAM_TGT vec3(-0.1958,-0.0289,0.1089)
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
vec3 htQ(vec3 p){ vec3 q=p-HT; q.xz=rot(.4)*q.xz; return q; }
float hatD(vec3 q){ float crown=sdEll(q-vec3(0.,.018,0.),vec3(.04,.036,.038)); crown=max(crown,-q.y+.0);
  float a=atan(q.z,q.x); float r=length(q.xz);
  float up=1.-pow(abs(sin(a*1.5)),.6);                      /* 1 at the three points, 0 midway */
  float side=smoothstep(.03,.07,r);
  float R=.07+.01*up;
  /* the brim folds up into three walls meeting at points: height grows toward the rim, most at the sides */
  float by=.003+.042*side*(1.-.55*up);
  float brim=max(abs(q.y-by)-.0025,r-R); brim=max(brim,.028-r);
  return min(crown,brim*.6); }
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
  if(id==4.){ vec3 q=htQ(p); if(length(q.xz)>.042&&q.y<.03) return .3; return .35; }
  if(id==5.){ vec3 q=sgQ(p); if(q.x<-.093) return .3; return .65; }
  return .7; }
