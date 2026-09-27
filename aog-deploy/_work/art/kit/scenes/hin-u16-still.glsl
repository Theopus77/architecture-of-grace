/* Hindu Texts Unit 16 "Comparison and Critique" — pencil still life: a brass balance scale
   with a palm-leaf bundle in one pan and a small closed book in the other, the beam level.
   Objects only. */
#define CAM_POS vec3(-0.4095,0.3997,-1.0156)
#define CAM_TGT vec3(-0.2784,0.0941,0.0762)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define SC vec3(.07,0.,.12)
float scale(vec3 p){ vec3 q=p-SC;
  float base=sdCone(q-vec3(0.,.015,0.),.07,.05,.015)-.002;
  float post=sdCylY(q-vec3(0.,.17,0.),.008,.16);
  float top=length(q-vec3(0.,.34,0.))-.013;
  float beam=sdCapsule(q,vec3(-.19,.32,0.),vec3(.19,.32,0.),.0055);
  float ends=min(length(q-vec3(-.19,.32,0.))-.009,length(q-vec3(.19,.32,0.))-.009);
  float d=min(min(base,post),min(min(top,beam),ends));
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 c=q-vec3(s*.19,0.,0.);
    vec3 pn=c-vec3(0.,.12,0.); float pan=max(abs(sdEll(pn,vec3(.085,.03,.085)))-.002,pn.y);
    d=min(d,pan);
    for(int k=0;k<3;k++){ float a=float(k)*2.094+.5; vec3 e=vec3(cos(a)*.075,.12,sin(a)*.075);
      d=min(d,sdCapsule(c,e,vec3(0.,.31,0.),.0012)); } }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,scale(p),3.);
  r=U(r,palmBundle(ry(p-SC-vec3(-.19,.1,0.),.2)*1.,.075,.02,.01),4.);
  r=U(r,bookD(ry(p-SC-vec3(.19,.098,0.),-.3),vec3(.052,.014,.04)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .5;
  if(id==4.) return palmBundleTone(ry(p-SC-vec3(-.19,.1,0.),.2)-vec3(0.,.008,0.),.075,.02,.01);
  if(id==5.) return bookTone(ry(p-SC-vec3(.19,.098,0.),-.3),vec3(.052,.014,.04),.35);
  return .7; }
