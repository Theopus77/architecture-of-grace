/* Practice room "Colors and Counting to Twenty" — pencil still life: a small wooden abacus with
   two rows of ten beads (twenty to count), and an open box of crayons with three loose crayons
   in front, each crayon a different shade of grey. */
#define CAM_POS vec3(-0.2804,0.3085,-0.6571)
#define CAM_TGT vec3(-0.1683,-0.0518,0.0939)
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
#define AB vec3(-.03,0.,.06)
#define CB vec3(.15,0.,-.05)
#define BR .0095
vec3 abQ(vec3 p){ vec3 q=p-AB; q.xz=rot(-.2)*q.xz; return q; }
float frameD(vec3 q){ float d=sdRBox(q-vec3(0.,.006,0.),vec3(.14,.006,.03),.003);
  d=min(d,sdRBox(vec3(abs(q.x)-.13,q.y-.07,q.z),vec3(.008,.07,.012),.003));
  d=min(d,sdRBox(q-vec3(0.,.138,0.),vec3(.14,.006,.012),.003));
  for(int i=0;i<2;i++) d=min(d,sdCylX(q-vec3(0.,.05+float(i)*.045,0.),.0018,.13));
  return d; }
float beadX(int row,int k){ int n=row==0?7:3; float x=k<n?-.115+float(k)*.021:.115-float(9-k)*.021; return x; }
float beadsD(vec3 q){ float d=1e3; for(int row=0;row<2;row++) for(int k=0;k<10;k++){
    vec3 b=q-vec3(beadX(row,k),.05+float(row)*.045,0.); d=min(d,length(b*vec3(1.35,1.,1.))/1.35*1.-BR*.75); } return d; }
vec3 cbQ(vec3 p){ vec3 q=p-CB; q.xz=rot(.35)*q.xz; return q; }
float boxD(vec3 q){ vec3 h=vec3(.05,.035,.018); float d=sdRBox(q-vec3(0.,h.y,0.),h,.002); d=max(d,-sdBox(q-vec3(0.,h.y+.006,0.),h-vec3(.003,0.,.003)));
  d=min(d,max(sdBox(q-vec3(0.,2.*h.y+.012,h.z+.008),vec3(h.x,.015,.001)),-(q.y-2.*h.y)));   /* the flap bent back */
  return d; }
float crayon(vec3 q,float L){ float d=sdCylY(q-vec3(0.,L*.5,0.),.0055,L*.5); d=min(d,sdCone(q-vec3(0.,L+.006,0.),.0055,.0012,.006)); return d; }
float inBox(vec3 q){ float d=1e3; for(int i=0;i<8;i++){ vec3 c=q-vec3(-.042+float(i)*.012,.01,(float(i%2)-.5)*.012); d=min(d,crayon(c,.07+.008*sin(float(i)*2.1))); } return d; }
float loose(vec3 p){ float d=1e3; for(int i=0;i<3;i++){ vec3 q=p-vec3(.0+float(i)*.035,.0055,-.1-float(i)*.012); q.xz=rot(.5+float(i)*.35)*q.xz; q.x+=.04; d=min(d,crayon(q.yxz,.075)); } return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 a=abQ(p);
  r=U(r,frameD(a),3.);
  r=U(r,beadsD(a),4.);
  vec3 c=cbQ(p);
  r=U(r,boxD(c),5.);
  r=U(r,inBox(c),6.);
  r=U(r,loose(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .55+.1*grain(abQ(p),60.);
  if(id==4.){ vec3 q=abQ(p); float x=q.x+.12; return q.y>.07?(fract(x/.105)<.5?.4:.8):(fract(x/.105)<.5?.8:.4); }
  if(id==5.){ vec3 q=cbQ(p); if(abs(q.y-.035)<.012&&q.z<-.017) return .85; return .5; }
  if(id==6.){ vec3 q=cbQ(p); float k=floor((q.x+.048)/.012); return .25+.08*mod(k*3.,8.); }
  if(id==7.){ return .3+.25*fract(p.x*23.); }
  return .7; }
