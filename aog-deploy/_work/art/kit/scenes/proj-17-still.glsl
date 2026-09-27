/* FACS project 17 "Mend and upcycle a garment" — pencil still life: a neatly folded shirt with
   its collar and a row of buttons, a square patch stitched on over a mended hole with bold
   visible stitches, a spool of thread with a needle stuck in it, and a spare button. */
#define CAM_POS vec3(-0.3817,0.4255,-0.6242)
#define CAM_TGT vec3(-0.1843,-0.0284,0.1099)
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
#define SC vec3(-.02,0.,.03)
#define SP vec3(.19,0.,.1)
/* shirt-local: x across, z from hem (-z, toward viewer) to collar (+z), y up */
vec3 sL(vec3 p){ vec3 q=p-SC; q.xz=rot(.12)*q.xz; return q; }
float shirt(vec3 p){ vec3 q=sL(p);
  float body=sdRBox(q-vec3(0.,.018,0.),vec3(.12,.018,.14),.012);
  body+=.0015*sin(q.x*40.)*smoothstep(.1,.14,abs(q.z));
  vec3 c=q-vec3(0.,.036,.115);
  float band=max(abs(length(c.xz*vec2(1.,1.3))-.042)-.006,abs(c.y)-.004);
  float wings=1e5;
  for(int k=0;k<2;k++){ float s=k==0?-1.:1.; vec3 w=c-vec3(s*.026,.003,-.03); w.xz=rot(s*.5)*w.xz;
    wings=min(wings,sdRBox(w,vec3(.018,.0028,.03),.004)); }
  float plk=sdRBox(q-vec3(0.,.037,-.02),vec3(.012,.0015,.11),.001);
  return min(min(body,band),min(wings,plk)); }
float buttons(vec3 p){ vec3 q=sL(p); float d=1e5;
  for(int i=0;i<4;i++){ vec3 b=q-vec3(0.,.039,.07-float(i)*.045); d=min(d,sdCylY(b,.0065,.0012)-.0008); }
  return d; }
#define PA vec3(.065,.0,-.075)
float patchD(vec3 p){ vec3 q=sL(p)-PA; return sdRBox(q-vec3(0.,.0375,0.),vec3(.03,.0014,.03),.003); }
float spool(vec3 p){ vec3 q=p-SP;
  float f1=sdCylY(q-vec3(0.,.004,0.),.026,.004)-.0015, f2=sdCylY(q-vec3(0.,.06,0.),.026,.004)-.0015;
  float core=sdCylY(q-vec3(0.,.032,0.),.021,.026)+.0006*abs(sin(q.y*800.));
  float nd=sdCapsule(q,vec3(-.012,.045,-.02),vec3(-.035,.09,-.045),.0013);
  return min(min(min(f1,f2),core),nd); }
float spare(vec3 p){ vec3 q=p-vec3(.2,.003,-.06); float d=sdCylY(q,.013,.0025)-.001;
  vec2 u=abs(q.xz)-vec2(.0035); return max(d,-(length(u)-.0015)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,shirt(p),3.);
  r=U(r,buttons(p),4.);
  r=U(r,patchD(p),5.);
  r=U(r,spool(p),6.);
  r=U(r,spare(p),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=sL(p); return .8-.12*step(.7,fract(q.x/.018))*step(.7,fract(q.z/.018)); }   /* a fine check */
  if(id==4.) return .45;
  if(id==5.){ vec3 q=sL(p)-PA; vec2 a=abs(q.xz);
    float e=abs(max(a.x,a.y)-.025); float along=a.x>a.y?q.z:q.x;
    if(e<.0045&&fract(along/.008)<.3) return .12;                      /* bold stitches round the edge */
    return .4+.1*step(.5,fract((q.x+q.z)/.01)); }                       /* a darker striped patch */
  if(id==6.){ vec3 q=p-SP; return (q.y>.008&&q.y<.056&&length(q.xz)>.015)?.35:.75; }
  return .7; }
