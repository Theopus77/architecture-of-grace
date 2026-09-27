/* Daily Drafts page — pencil still life: a small tear-off day calendar standing on its easel
   back, its page carved with a large 1 under a dark header band, a loose fanned stack of lined
   index cards and a sharpened pencil lying across them. */
#define CAM_POS vec3(-0.3192,0.2867,-0.5423)
#define CAM_TGT vec3(-0.1123,0.0031,0.0556)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.6,.8,-.6)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define CL vec3(-.02,0.,.1)
#define CLR -.2
#define CW .06
#define CH .075
#define IC vec3(.1,0.,-.035)
#define ICR .25
/* calendar frame: the pad leans back; local u across, v up the page, w out of the page */
vec3 cq(vec3 p){ vec3 q=P(p,CL,CLR); q.y-=.004; q.yz=rot(-.3)*q.yz; return q; }
float calD(vec3 q){
  float pad=sdRBox(q-vec3(0.,CH,.0),vec3(CW,CH,.012),.002);
  float band=sdRBox(q-vec3(0.,CH*2.-.008,-.001),vec3(CW+.003,.012,.0145),.003);
  /* a few loose sheet edges at the top */
  float d=pad;
  d=carve(d,vec2(q.x,q.y-CH*.9),49,.075,.0055,q.z+.012,.0025);
  return d; }
float bandD(vec3 q){ return sdRBox(q-vec3(0.,CH*2.-.008,-.001),vec3(CW+.003,.012,.0145),.003); }
float calT(vec3 q){
  if(q.y>CH*2.-.021) return .22;                                             /* header band */
  if(q.z<-.0105){ vec2 u=vec2(q.x,q.y-CH*.9);
    if(glyph(u/.075,49)*.075<.0065) return .12;                              /* the carved 1 */
    if(abs(q.y-CH*.3)<.0022&&abs(q.x)<CW*.6) return .45;                     /* a hint-line */
    if(abs(q.y-CH*.18)<.0018&&abs(q.x)<CW*.4) return .5;
    return .95; }
  if(abs(q.x)>CW-.002||q.z>.011) return fract(q.y/.0025)<.3?.7:.9;           /* page edges */
  return .9; }
/* easel leg behind the pad */
float legD(vec3 p){ vec3 q=P(p,CL,CLR); return sdRBox(q-vec3(0.,.055,.075),vec3(.045,.0025,.06),.0015)+0.*q.x; }
vec3 lq(vec3 p){ vec3 q=P(p,CL,CLR)-vec3(0.,.0,.04); q.yz=rot(.62)*q.yz; return q; }
float leg2D(vec3 p){ vec3 q=lq(p); return sdRBox(q-vec3(0.,.07,0.),vec3(.045,.07,.002),.0015); }
/* index cards: a loose stack, each turned a little */
vec3 cardQ(vec3 p,int i){ float f=float(i); vec3 q=P(p,IC,ICR+.16*sin(f*2.3)-.05*f); q.y-=.0012+f*.0024; q.xz+=vec2(.012*sin(f*1.9),.008*cos(f*2.7)); return q; }
float cardsD(vec3 p){ float d=1e3; for(int i=0;i<6;i++) d=min(d,sdRBox(cardQ(p,i),vec3(.076,.001,.0455),.0008)); return d; }
float cardsT(vec3 p){ vec3 q=cardQ(p,5);
  if(q.y>-.0004&&abs(q.x)<.077&&abs(q.z)<.046){
    if(abs(q.z-.029)<.0012) return .3;                                       /* the top rule */
    float f=fract((q.z+.04)/.0115); if(q.z<.02&&f<.12) return .62;           /* ruled lines */
    return .96; }
  return fract(p.y/.0024)<.4?.6:.9; }
/* pencil across the cards */
vec3 pq(vec3 p){ vec3 q=P(p,IC+vec3(.0,.0165,-.052),-.05); return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,calD(cq(p)),3.);
  r=U(r,bandD(cq(p)),7.);
  r=U(r,leg2D(p),4.);
  r=U(r,cardsD(p),5.);
  r=U(r,pencilL(pq(p),.075),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return calT(cq(p));
  if(id==4.) return .4;
  if(id==7.) return .25;
  if(id==5.) return cardsT(p);
  if(id==6.) return pencilT(pq(p),.075);
  return .7; }
