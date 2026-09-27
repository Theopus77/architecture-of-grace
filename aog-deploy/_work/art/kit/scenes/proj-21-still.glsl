/* FACS project 21 "Homemade honey bread" — pencil still life: a tall domed sandwich loaf on a
   wooden board with two slices cut and leaning in front showing a soft, even crumb, a small
   honey jar with a wooden dipper, and a bread knife lying behind. */
#define CAM_POS vec3(-0.4612,0.3556,-0.6918)
#define CAM_TGT vec3(-0.2378,0.0162,0.1390)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "projparts.glsl"
#define BD vec3(.0,0.,.05)
#define BR .18
vec3 bL(vec3 p){ vec3 q=p-BD; q.xz=rot(BR)*q.xz; return q; }
float board(vec3 p){ vec3 q=bL(p); return sdRBox(q-vec3(0.,.009,0.),vec3(.19,.009,.09),.006); }
/* loaf-local: x along the loaf, cut end at x=+.06 */
float loafShape(vec3 l){ float bx=sdRBox(l-vec3(0.,.045,0.),vec3(.1,.045,.055),.012);
  vec3 dm=l-vec3(0.,.09,0.); float dome=sdEll(dm,vec3(.108,.045,.062));
  return max(smin(bx,dome,.012),-l.y); }
float loaf(vec3 p){ vec3 q=bL(p)-vec3(-.03,.018,0.);
  float d=loafShape(q);
  d=max(d,q.x-.06);
  d+=.0012*smoothstep(.1,.13,q.y)*sin(q.x*120.);
  return d; }
float slices(vec3 p){ vec3 q=bL(p)-vec3(-.03,.018,0.); float d=1e5;
  for(int i=0;i<2;i++){ float fi=float(i); vec3 l=q-vec3(.085+fi*.03,0.,-.005*fi); l.xy=rot(-.35-fi*.15)*l.xy;
    vec3 s=vec3(l.x,l.y,l.z); float sh=loafShape(vec3(0.,s.y,s.z)); d=min(d,max(sh,abs(s.x)-.006)); }
  return d; }
#define HJ vec3(.22,0.,.08)
float jar(vec3 p){ vec3 q=p-HJ; float r=length(q.xz);
  float body=sdEll(q-vec3(0.,.04,0.),vec3(.035,.042,.035)); body=max(body,q.y-.07);
  float neck=sdCylY(q-vec3(0.,.072,0.),.022,.006)-.002;
  return min(body,neck); }
float dipper(vec3 p){ vec3 q=p-HJ; vec3 a=vec3(0.,.05,0.), e=vec3(-.06,.15,-.03);
  vec3 h=q-a; float head=sdCylY(h,.012,.013)-.002; head+=.002*step(.5,fract(h.y*120.));
  return min(head,sdCapsule(q,a,e,.004)); }
float knife(vec3 p){ vec3 q=bL(p)-vec3(.02,.021,.075); q.xz=rot(.05)*q.xz;
  float blade=sdRBox(q-vec3(.0,0.,0.),vec3(.1,.0012,.014),.001);
  blade+=.0006*step(.5,fract(q.x*150.))*step(.012,-q.z);
  float hdl=sdRBox(q-vec3(-.14,.004,0.),vec3(.045,.007,.011),.006);
  return min(blade,hdl); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,board(p),3.);
  r=U(r,loaf(p),4.);
  r=U(r,slices(p),5.);
  r=U(r,jar(p),6.);
  r=U(r,dipper(p),7.);
  r=U(r,knife(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .72-.06*grain(p,40.);
  if(id==4.){ vec3 q=bL(p)-vec3(-.03,.018,0.); if(q.x>.057) return .9-.2*step(.8,vn3(q*700.)); return .4-.05*vn3(q*80.); }
  if(id==5.){ vec3 q=bL(p)-vec3(-.03,.018,0.); float e=loafShape(vec3(0.,q.y,q.z)); return e>-.004?.4:.92-.22*step(.8,vn3(p*700.)); }
  if(id==6.){ vec3 q=p-HJ; return q.y>.066?.5:q.y>.045?.8:.45; }
  if(id==7.) return .6;
  if(id==8.){ vec3 q=bL(p)-vec3(.02,.021,.075); return q.x<-.095?.3:.82; }
  return .7; }
