/* The Pad Machine page — pencil still life: a modern pad controller, flat and wide, its sixteen big square pads in a
   four-by-four grid filling the right of its top, a small screen at the back left with four bank buttons under it and
   a row of knobs along the back, a record lying flat beside it on the left (its label and grooves), and a pair of
   headphones resting on the right: every sound in one box. No names or logos. (AOG-PADS-DOOR-V1) */
#define CAM_POS vec3(-0.6521,0.7594,-0.6600)
#define CAM_TGT vec3(-0.4009,-0.0777,0.1143)
#define CAM_FOV 32.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* ---- the pad controller ---- */
#define MC vec3(0.02,0.,.02)
#define MRY -.18
#define MW .20   /* half width */
#define MD .16   /* half depth */
#define MT .034  /* top */
vec3 mq(vec3 p){ vec3 q=p-MC; q.xz=rot(MRY)*q.xz; return q; }
float shell(vec3 q){
  float b=sdRBox(q-vec3(0.,MT*.5,0.),vec3(MW,MT*.5,MD),.008);
  b=max(b,-sdRBox(q-vec3(-.115,MT,.085),vec3(.068,.003,.04),.002));   /* the screen's recess */
  return b; }
/* sixteen big pads, right of centre */
#define PADC vec2(.06,-.025)
#define PP .058
float pads(vec3 q){
  vec2 g=q.xz-PADC;
  vec2 cell=clamp(floor(g/PP+2.),0.,3.);
  vec2 c=(cell-1.5)*PP;
  vec3 r=vec3(g.x-c.x,q.y-MT-.003,g.y-c.y);
  return sdRBox(r,vec3(.0245,.005,.0245),.005); }
float screen(vec3 q){ return sdRBox(q-vec3(-.115,MT-.0015,.085),vec3(.064,.0012,.036),.0015); }
/* four bank buttons under the screen, and four small ones down the left edge */
float buttons(vec3 q){
  float x=q.x+.115; float i=clamp(floor(x/.032+2.),0.,3.);
  float d=sdRBox(vec3(x-(i-1.5)*.032,q.y-MT-.001,q.z-.02),vec3(.011,.0035,.0085),.003);
  float z=q.z+.02; float j=clamp(floor(z/.03+2.),0.,3.);
  d=min(d,sdRBox(vec3(q.x+.155,q.y-MT-.001,z-(j-1.5)*.03),vec3(.012,.0035,.009),.003));
  return d; }
float knob(vec3 r,float a,float rad){
  float d=sdCylY(r-vec3(0.,.008,0.),rad,.008)-.0015;
  d=min(d,sdCylY(r-vec3(0.,.0015,0.),rad+.003,.0015)-.0008);
  vec3 s=r; s.xz=rot(a)*s.xz;
  d=min(d,sdRBox(s-vec3(0.,.0175,rad*.55),vec3(.0012,.0012,rad*.5),.0006));
  return d; }
float knobs(vec3 q){
  float gx=q.x-.06; float cx=clamp(floor(gx/.058+2.),0.,3.);
  return knob(vec3(gx-(cx-1.5)*.058,q.y-MT,q.z-.128),h1(vec2(cx,4.)+1.)*4.-2.,.0105); }
/* ---- a record lying flat on the left ---- */
#define RC vec3(-.31,0.,.05)
float record(vec3 p){ vec3 r=p-RC; return sdCylY(r-vec3(0.,.0016,0.),.15,.0016)-.0004; }
/* ---- headphones resting flat on the right, as they lie on a desk: the cups face down, the band lies in a curve ---- */
#define HC vec3(.34,0.,.13)
#define HRY .45
vec3 hq(vec3 p){ vec3 q=p-HC; q.xz=rot(HRY)*q.xz; return q; }
float cups(vec3 q){
  vec3 a=vec3(abs(q.x)-.09,q.y,q.z);
  float d=sdCylY(a-vec3(0.,.026,0.),.042,.014)-.005;                 /* the shell */
  d=smin(d,sdSphere(a-vec3(0.,.012,0.),.044)+.0,.01);
  d=max(d,-a.y+.0);
  d=min(d,sdTorus(a-vec3(0.,.008,0.),.04,.008));                      /* the cushion under */
  return d; }
float band(vec3 q){
  vec3 b=q-vec3(0.,.012,-.0);
  float r=length(b.xz)-.095;                                         /* a ring through both cups */
  float d=sdRBox(vec3(r,b.y,0.),vec3(.006,.008,1.),.004);
  return max(d,-b.z+.01); }                                          /* only the half behind them */
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,1.1-p.z,2.);
  vec3 q=mq(p);
  r=U(r,shell(q),3.);
  r=U(r,pads(q),5.);
  r=U(r,knobs(q),6.);
  r=U(r,screen(q),7.);
  r=U(r,buttons(q),10.);
  r=U(r,record(p),8.);
  vec3 h=hq(p);
  r=U(r,cups(h),9.);
  r=U(r,band(h),11.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  vec3 q=mq(p);
  if(id==3.){
    if(q.y>MT-.001){
      vec2 g=q.xz-PADC;
      float e=abs(max(abs(g.x),abs(g.y))-.124);
      if(e<.0012) return .3;
      return .6; }
    return .48; }
  if(id==5.) return .88;
  if(id==6.) return .28;
  if(id==7.){ return .3+.05*step(.5,fract(q.z*90.)); }
  if(id==10.) return .55;
  if(id==8.){ float rr=length((p-RC).xz);
    if(rr<.05) return rr<.006?.25:.82;                    /* the label and its hole */
    return .2+.08*step(.5,fract(rr*160.))+.06*step(.135,rr); }
  if(id==9.) return .32;
  if(id==11.) return .4;
  return .7; }
