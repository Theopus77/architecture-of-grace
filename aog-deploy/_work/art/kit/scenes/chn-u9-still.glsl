/* Chinese Classics Unit 9 "The Confucian Classics" — pencil still life: a cloth-covered book
   case (a tao) standing open, showing its stitched volumes, with two bone pegs on the flap; a
   second closed case lying beside it; and one volume lying open in front. Hint-lines only. */
#define CAM_POS vec3(-0.3983,0.4132,-0.6874)
#define CAM_TGT vec3(-0.1140,-0.0435,0.1224)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* case A: lying flat, lid-flap folded back, volumes visible from above */
#define CA vec3(-.02,0.,.16)
#define CRY .12
vec3 aQ(vec3 p){ vec3 q=p-CA; q.xz=rot(CRY)*q.xz; return q; }
float caseA(vec3 q){
  float d=sdRBox(q-vec3(0.,.045,0.),vec3(.13,.045,.095),.004);
  d=max(d,-sdBox(q-vec3(0.,.07,0.),vec3(.124,.04,.089)));       /* open top */
  /* the flap, lying on the table to the front */
  float flap=sdRBox(q-vec3(0.,.003,-.14),vec3(.13,.003,.05),.002);
  float peg=sdCapsule(q,vec3(-.06,.008,-.18),vec3(-.06,.008,-.2),.004); peg=min(peg,sdCapsule(q,vec3(.06,.008,-.18),vec3(.06,.008,-.2),.004));
  return min(d,min(flap,peg)); }
float volsA(vec3 q){ float d=1e5; for(int i=0;i<4;i++){ vec3 c=q-vec3(0.,.012+float(i)*.022,0.);
    d=min(d,sdRBox(c,vec3(.122,.0105,.087),.002)); } return d; }
/* case B: closed, lying at an angle to the right, a little back */
#define CB vec3(.3,0.,.2)
vec3 bQ(vec3 p){ vec3 q=p-CB; q.xz=rot(-.35)*q.xz; return q; }
float caseB(vec3 q){ float d=sdRBox(q-vec3(0.,.04,0.),vec3(.11,.04,.08),.004);
  float peg=sdCapsule(q,vec3(-.05,.04,-.08),vec3(-.05,.04,-.093),.004); peg=min(peg,sdCapsule(q,vec3(.05,.04,-.08),vec3(.05,.04,-.093),.004));
  return min(d,peg); }
/* an open volume lying at the front right */
vec3 oQ(vec3 p){ vec3 q=p-vec3(.25,.004,-.1); q.xz=rot(-.2)*q.xz; return q; }
vec2 openBook(vec3 p){ vec3 q=oQ(p); float x=abs(q.x);
  float lift=.012*sin(clamp(x/.09,0.,1.)*1.9)-.008*exp(-x*60.)+.004;
  float pages=sdBox(vec3(x-.045,q.y-lift*.5,q.z),vec3(.044,max(lift*.5,.002),.06))-.001;
  float cover=sdRBox(vec3(x-.047,q.y-.0,q.z),vec3(.048,.0025,.064),.001);
  return vec2(pages,cover); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,caseA(aQ(p)),3.);
  r=U(r,volsA(aQ(p)),4.);
  r=U(r,caseB(bQ(p)),5.);
  vec2 o=openBook(p); r=U(r,o.x,6.); r=U(r,o.y,7.);
  return r; }
float cloth(vec3 p){ return .42+.08*step(.5,fract((p.x+p.z)*260.)); }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=aQ(p); if(q.z<-.17&&q.y<.012) return .85; return cloth(p); }
  if(id==4.){ vec3 q=aQ(p); if(n.y>.6){ if(q.x<-.105){ for(int k=0;k<4;k++){ if(abs(q.z+.06-float(k)*.04)<.0016) return .25; } }
      if(abs(q.x+.06)<.012&&abs(q.z)<.06) return .92; if(abs(abs(q.x+.06)-.012)<.0012&&abs(q.z)<.06) return .35; return .4; }
    return fract(q.y/.0024)<.4?.7:.9; }
  if(id==5.){ vec3 q=bQ(p); if(q.z<-.08&&abs(abs(q.x)-.05)<.006) return .85;
    if(n.y>.6&&abs(q.x+.055)<.012&&abs(q.z)<.055) return .92; return cloth(p)-.04; }
  if(id==6.){ vec3 q=oQ(p); float x=abs(q.x); float a=.94;
    if(x>.012&&x<.08&&abs(q.z)<.05){ float l=fract(q.x/.009); if(l<.22) a=.62; }   /* vertical hint columns */
    if(x<.004) a=.7; return a; }
  if(id==7.) return .38;
  return .7; }
