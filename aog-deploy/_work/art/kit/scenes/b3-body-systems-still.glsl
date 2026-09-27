/* Room "Human Body Systems" — pencil still life: a classroom model of the brain on a small
   round stand (two folded halves, the cerebellum, the stem) and a stethoscope lying curled
   on the table in front of it. */
#define CAM_POS vec3(-0.3848,0.3563,-0.7395)
#define CAM_TGT vec3(-0.1272,0.0069,0.0511)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define HC vec3(-.04,.155,.06)
float standD(vec3 p){ vec3 q=p-vec3(HC.x,0.,HC.z);
  float base=sdCylY(q-vec3(0.,.008,0.),.07,.005)-.003;
  float rod=sdCylY(q-vec3(0.,.045,0.),.006,.045);
  return min(base,rod); }
vec3 brainQ(vec3 p){ vec3 q=p-HC; q.xz=rot(.55)*q.xz; return q; }
float brainD(vec3 p){ vec3 q=brainQ(p);
  vec3 h=vec3(abs(q.x)-.028,q.y,q.z);
  float hemi=sdEll(h-vec3(0.,.0,0.),vec3(.036,.05,.075));
  hemi=smin(hemi,sdEll(h-vec3(.0,-.02,.03),vec3(.034,.034,.045)),.02);        /* temporal lobe */
  hemi=max(hemi,-(q.y+.04+.2*q.z*q.z));
  /* folds: winding grooves */
  float g=abs(fract(fbm3(q*24.+vec3(step(0.,q.x)*7.))*4.5)-.5);
  hemi+=.0035*(1.-smoothstep(.0,.14,g));
  float cb=sdEll(q-vec3(0.,-.035,.055),vec3(.045,.022,.028));
  cb+=.0012*abs(sin(q.y*420.));
  float stem=sdCapsule(q,vec3(0.,-.03,.02),vec3(0.,-.075,.0),.011);
  float d=min(min(hemi,cb),stem);
  return d*.8; }
/* the stethoscope: a curled tube on the table */
vec2 steth(float t){ /* centre line in xz for t in 0..1 */
  float a=t*5.2; float r=.11-.03*t; return vec2(.12,-.11)+vec2(cos(a+1.),sin(a+1.)*.7)*r+vec2(t*.06,0.); }
float stethD(vec3 p){ float d=1e5; vec2 prev=steth(0.);
  for(int i=1;i<=18;i++){ vec2 c=steth(float(i)/18.); d=min(d,sdCapsule(p,vec3(prev.x,.0055,prev.y),vec3(c.x,.0055,c.y),.0053)); prev=c; }
  vec2 e=steth(1.);
  /* the Y and the two ear tubes with tips */
  vec3 y0=vec3(e.x,.0045,e.y);
  vec3 l1=y0+vec3(.06,0.,.035), l2=y0+vec3(.075,0.,.005);
  d=min(d,sdCapsule(p,y0,l1,.0032)); d=min(d,sdCapsule(p,y0,l2,.0032));
  d=min(d,length(p-l1)-.006); d=min(d,length(p-l2)-.006);
  return d; }
float chestD(vec3 p){ vec2 s=steth(0.); vec3 q=p-vec3(s.x-.022,.0,s.y-.006);
  float disc=sdCylY(q-vec3(0.,.008,0.),.021,.005)-.003;
  float bell=sdCylY(q-vec3(0.,.018,0.),.011,.004)-.002;
  float stem=sdCapsule(q,vec3(.0,.012,.0),vec3(.022,.0045,.006),.004);
  return min(min(disc,bell),stem); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,standD(p),3.);
  r=U(r,brainD(p),4.);
  r=U(r,stethD(p),5.);
  r=U(r,chestD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .35;
  if(id==4.){ vec3 q=brainQ(p); if(q.y<-.03&&q.z>.03) return .55;
    float g=abs(fract(fbm3(q*24.+vec3(step(0.,q.x)*7.))*4.5)-.5);
    if(abs(q.x)<.004) return .3; return g<.07?.3:.85; }
  if(id==5.) return .25;
  if(id==6.){ vec2 s=steth(0.); vec3 q=p-vec3(s.x-.022,0.,s.y-.006); return q.y>.011&&length(q.xz)<.017?.7:.55; }
  return .7; }
