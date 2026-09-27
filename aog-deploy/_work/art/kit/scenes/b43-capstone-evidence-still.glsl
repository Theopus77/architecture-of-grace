/* b43 "Capstone: Argue From Evidence" — a pan balance with a weight in one pan, a graduated
   cylinder with level marks, and a data notebook open to a scatter plot. */
#define CAM_POS vec3(-0.4579,0.2890,-0.7345)
#define CAM_TGT vec3(-0.1893,0.0025,0.1071)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
#define BL vec3(-.04,0.,.12)
#define TIP .1
vec3 bQ(vec3 p){ return place(p,BL,-.1); }
float balance(vec3 p){ vec3 q=bQ(p);
  float base=sdRBox(q-vec3(0.,.01,0.),vec3(.09,.01,.04),.004);
  float post=sdCylY(q-vec3(0.,.1,0.),.006,.09);
  float top=length(q-vec3(0.,.195,0.))-.01;
  vec3 b=q-vec3(0.,.19,0.); b.xy=rot(TIP)*b.xy;
  float beam=sdRBox(b,vec3(.14,.004,.004),.002);
  float ptr=sdCapsule(q,vec3(0.,.19,0.),vec3(-sin(TIP)*.0,.14,0.),.0018);
  float d=min(min(base,post),min(top,min(beam,ptr)));
  for(int s=0;s<2;s++){ float sx=s==0?-1.:1.;
    vec3 e=vec3(0.,.19,0.)+vec3(cos(TIP)*.135*sx,sin(TIP)*.135*sx,0.);
    vec3 pc=e-vec3(0.,.1,0.);
    d=min(d,sdCapsule(q,e,pc+vec3(.03,.005,0.),.0009));
    d=min(d,sdCapsule(q,e,pc+vec3(-.03,.005,0.),.0009));
    d=min(d,sdCapsule(q,e,pc+vec3(0.,.005,.03),.0009));
    vec3 k=q-pc; float pan=abs(length(k-vec3(0.,.04,0.))-.046)-.0015; pan=max(pan,k.y-.012);
    d=min(d,pan); }
  return d; }
float weight(vec3 p){ vec3 q=bQ(p); float sx=-1.;
  vec3 e=vec3(0.,.19,0.)+vec3(cos(TIP)*.135*sx,sin(TIP)*.135*sx,0.); vec3 k=q-(e-vec3(0.,.1,0.))-vec3(0.,.002,0.);
  float w=sdCylY(k-vec3(0.,.012,0.),.014,.012)-.002;
  w=min(w,sdCylY(k-vec3(0.,.028,0.),.005,.005)); w=min(w,length(k-vec3(0.,.037,0.))-.007);
  return w; }
#define GC vec3(.2,0.,.12)
float cyl(vec3 p){ vec3 q=p-GC;
  float o=sdCylY(q-vec3(0.,.1,0.),.017,.09)-.0012; o=max(o,-sdCylY(q-vec3(0.,.11,0.),.0145,.09));
  float lip=sdTorus(q-vec3(0.,.19,0.),.0175,.002);
  float ft=sdCylY(q-vec3(0.,.005,0.),.03,.004)-.002;
  return min(min(o,lip),ft); }
float liquid(vec3 p){ vec3 q=p-GC; return sdCylY(q-vec3(0.,.06,0.),.0145,.05); }
vec3 nbQ(vec3 p){ vec3 q=p-vec3(.14,.006,-.1); q.xz=rot(-.35)*q.xz; return q; }
float notebook(vec3 p){ vec3 q=nbQ(p);
  float c=sdRBox(q,vec3(.08,.004,.06),.002);
  float rings=1e5; for(int i=0;i<7;i++){ vec3 r=q-vec3(-.078,.004,(float(i)-3.)*.016); rings=min(rings,sdTorus(r.xzy*vec3(1.,1.,1.),.006,.0012)); }
  return min(c,rings); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,balance(p),3.);
  r=U(r,weight(p),4.);
  r=U(r,cyl(p),5.);
  r=U(r,liquid(p),6.);
  r=U(r,notebook(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .5;
  if(id==4.) return .35;
  if(id==5.){ vec3 q=p-GC; float a=atan(q.z,q.x); if(q.y>.02&&q.y<.18&&abs(a+1.9)<.45&&fract(q.y/.016)<.12) return .2; return .88; }
  if(id==6.){ vec3 q=p-GC; return q.y>.105?.4:.7; }
  if(id==7.){ vec3 q=nbQ(p); if(q.y<.003) return .5; vec2 u=q.xz;
    float a=.95;
    if(abs(u.x+.05)<.0018&&u.y>-.045&&u.y<.045) a=.3;
    if(abs(u.y+.045)<.0018&&u.x>-.05&&u.x<.07) a=.3;
    for(int i=0;i<11;i++){ float fi=float(i); vec2 c=vec2(-.04+fi*.01,-.035+fi*.007+.012*(h1(vec2(fi,3.))-.5));
      if(length(u-c)<.0042) a=.15; }
    if(abs(u.y-(-.035+(u.x+.04)*.7))<.0008&&u.x>-.045&&u.x<.07) a=.5;
    if(fract(u.y/.01)<.08) a=min(a,.85);
    return a; }
  return .7; }
