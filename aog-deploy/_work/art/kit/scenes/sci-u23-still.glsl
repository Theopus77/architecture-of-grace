/* Science Unit 23 "Chemistry: Stoichiometry, Solutions and Energy" — pencil still life: a
   pan balance weighing a heap of powder against brass weights, and a graduated cylinder. */
#define CAM_POS vec3(-0.6664,0.2829,-0.7483)
#define CAM_TGT vec3(-0.3075,0.0185,0.1963)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define BC vec3(.03,0.,.08)
#define BRY .2
vec2 balance(vec3 p){ vec3 q=p-BC; q.xz=rot(BRY)*q.xz;
  float base=sdRBox(q-vec3(0.,.01,0.),vec3(.12,.01,.05),.005);
  float post=sdCylY(q-vec3(0.,.12,0.),.008,.11);
  float tilt=.08; vec3 b=q-vec3(0.,.235,0.); b.xy=rot(tilt)*b.xy;
  float beam=sdRBox(b,vec3(.15,.005,.006),.002);
  float piv=sdCylZ(q-vec3(0.,.235,0.),.012,.01)-.001;
  float point=sdCone(q-vec3(0.,.2,0.)- vec3(0.,0.,-.012),.0,.004,.03);
  float pans=1e5, ch=1e5;
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec2 e=rot(-tilt)*vec2(s*.145,0.); vec3 top=vec3(e.x,.235+e.y,0.);
    vec3 pc=top-vec3(0.,.14,0.); vec3 w=q-pc;
    float pan=max(abs(length(w-vec3(0.,.07,0.))-.075)-.002,w.y-.012); pan=max(pan,-w.y-.01);
    pans=min(pans,pan);
    for(int k=0;k<3;k++){ float a=float(k)*2.094+.5; vec3 r=pc+vec3(cos(a)*.052,.012,sin(a)*.052); ch=min(ch,sdCapsule(q,r,top,.001)); } }
  return vec2(min(min(base,post),min(beam,piv)),min(pans,ch)); }
vec2 loads(vec3 p){ vec3 q=p-BC; q.xz=rot(BRY)*q.xz; float tilt=.08;
  vec2 e=rot(-tilt)*vec2(-.145,0.); vec3 L=vec3(e.x,.235+e.y-.14+.002,0.);
  vec2 f=rot(-tilt)*vec2(.145,0.); vec3 R=vec3(f.x,.235+f.y-.14+.002,0.);
  float heap=sdCone(q-L-vec3(0.,.015,0.),.042,.006,.015)-.004+.002*fbm(q.xz*80.);
  float w1=sdCylY(q-R-vec3(-.012,.014,.0),.02,.012)-.002; w1=min(w1,sdCylY(q-R-vec3(-.012,.032,.0),.006,.006)-.001);
  float w2=sdCylY(q-R-vec3(.022,.01,.01),.013,.008)-.002; w2=min(w2,sdCylY(q-R-vec3(.022,.022,.01),.004,.004)-.001);
  return vec2(heap,min(w1,w2)); }
#define GC vec3(-.28,0.,.02)
vec2 cyl(vec3 p){ vec3 q=p-GC;
  float foot=sdCylY(q-vec3(0.,.006,0.),.035,.005)-.002;
  float tb=max(abs(length(q.xz)-.018)-.0018,abs(q.y-.12)-.11);
  float lip=sdTorus(q-vec3(0.,.23,0.),.018,.003);
  float liq=max(length(q.xz)-.016,abs(q.y-.09)-.078);
  return vec2(min(min(foot,tb),lip),liq); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 b=balance(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  vec2 l=loads(p); r=U(r,l.x,5.); r=U(r,l.y,6.);
  vec2 c=cyl(p); r=U(r,c.x,7.); r=U(r,c.y,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .4; if(id==4.) return .6; if(id==5.) return .88; if(id==6.) return .45;
  if(id==7.){ vec3 q=p-GC; return (fract(q.y/.015)<.12&&q.y>.03&&q.y<.22&&q.z<0.&&abs(q.x)<.008)?.25:.9; }
  if(id==8.) return .62;
  return .7; }
