/* The Drum Machine page — pencil still life: an old drum machine box with wooden end cheeks,
   a four-by-four grid of square rubber pads, two rows of knobs, a blank little screen and a
   row of step buttons along the front, with a pair of drumsticks crossed on the table in
   front, one resting on the other. No names or logos. */
#define CAM_POS vec3(-0.5573,0.2802,-0.7585)
#define CAM_TGT vec3(-0.1841,-0.0927,0.0288)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* ---- the drum machine ---- */
#define MC vec3(0.,0.,.02)
#define MRY -.32
#define MW .16   /* half width of the panel between the cheeks */
#define MD .13   /* half depth */
#define MT .046  /* top of the front deck */
#define RT .074  /* top of the raised back console */
vec3 mq(vec3 p){ vec3 q=p-MC; q.xz=rot(MRY)*q.xz; return q; }
float riser(vec3 q){ /* the console along the back, its front face sloped back */
  vec3 r=q-vec3(0.,RT*.5,.098);
  float d=sdRBox(r,vec3(MW,RT*.5,.032),.005);
  return smax(d,dot(q-vec3(0.,RT,.066),normalize(vec3(0.,1.,-.8))),.004); }
float shell(vec3 q){
  float b=sdRBox(q-vec3(0.,MT*.5,0.),vec3(MW,MT*.5,MD),.006);
  b=min(b,riser(q));
  /* a shallow recess for the screen, on the console's left */
  b=max(b,-sdRBox(q-vec3(-.075,RT,.1),vec3(.062,.0025,.02),.002));
  return b; }
float cheeks(vec3 q){
  vec3 c=vec3(abs(q.x)-MW-.011,q.y,q.z);
  float h=mix(.052,.082,smoothstep(-MD,MD*.4,q.z));      /* cheeks rise toward the back */
  float d=sdRBox(c-vec3(0.,.041,0.),vec3(.011,.041,MD+.004),.005);
  return smax(d,c.y-h,.006); }
/* pads: a 4 x 4 grid on the front deck, left of centre */
#define PADC vec2(-.06,-.02)
float pads(vec3 q){
  vec2 g=q.xz-PADC;
  vec2 cell=clamp(floor(g/.036+2.),0.,3.);
  vec2 c=(cell-1.5)*.036;
  vec3 r=vec3(g.x-c.x,q.y-MT-.002,g.y-c.y);
  return sdRBox(r,vec3(.0145,.0045,.0145),.0035); }
/* knobs: a row of four on the console's right, each with a pointer ridge,
   and two big ones on the front deck right of the pads */
float knob(vec3 r,float a,float rad){
  float d=sdCylY(r-vec3(0.,.008,0.),rad,.008)-.0015;
  d=min(d,sdCylY(r-vec3(0.,.0015,0.),rad+.003,.0015)-.0008);          /* skirt */
  vec3 s=r; s.xz=rot(a)*s.xz;
  d=min(d,sdRBox(s-vec3(0.,.0175,rad*.55),vec3(.0012,.0012,rad*.5),.0006));  /* pointer */
  return d; }
float knobs(vec3 q){
  float gx=q.x-.095; float cx=clamp(floor(gx/.026+2.),0.,3.);
  float d=knob(vec3(gx-(cx-1.5)*.026,q.y-RT,q.z-.1),h1(vec2(cx,1.)+3.)*4.-2.,.0085);
  vec2 g=q.xz-vec2(.1,-.02); float cz=clamp(floor(g.y/.042+1.),0.,1.);
  d=min(d,knob(vec3(g.x,q.y-MT,g.y-(cz-.5)*.042),cz*2.-1.2,.0135));
  return d; }
float screen(vec3 q){ return sdRBox(q-vec3(-.075,RT-.003,.1),vec3(.059,.0012,.017),.001); }
/* sixteen step buttons along the front edge */
float steps(vec3 q){
  float x=q.x+.0075; float i=clamp(floor(x/.0195+8.),0.,15.);
  float cx=(i-7.5)*.0195-.0075;
  return sdRBox(vec3(q.x-cx,q.y-MT-.001,q.z+.105),vec3(.0068,.0035,.0055),.0022); }
/* ---- drumsticks ---- */
float stick(vec3 p,vec3 a,vec3 b){
  vec3 ba=b-a; float L=length(ba); vec3 u=ba/L;
  float h=clamp(dot(p-a,u),0.,L); float t=h/L;
  float r=mix(.0072,.0072,smoothstep(0.,.6,t));
  r=mix(r,.0036,smoothstep(.62,.95,t));
  float d=length(p-a-u*h)-r;
  d=smin(d,length(p-b-u*.004)-.0056,.004);                 /* bead tip */
  return max(d,dot(p-a,-u)-.0);                            /* flat butt */ }
#define SA0 vec3(-.28,.0072,-.18)
#define SA1 vec3(.10,.0072,-.31)
#define SB0 vec3(-.24,.0072,-.31)
#define SB1 vec3(.14,.0382,-.19)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=mq(p);
  float bb=sdBox(q-vec3(0.,.05,0.),vec3(.2,.08,.16));
  if(bb<.05){
    r=U(r,shell(q),3.);
    r=U(r,cheeks(q),4.);
    r=U(r,pads(q),5.);
    r=U(r,knobs(q),6.);
    r=U(r,screen(q),7.);
    r=U(r,steps(q),10.);
  } else r=U(r,bb,3.);
  r=U(r,stick(p,SA0,SA1),8.);
  r=U(r,stick(p,SB0,SB1),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  vec3 q=mq(p);
  if(id==3.){
    /* panel: a thin groove frames the pad field and the knob field */
    if(q.y>MT-.001){
      vec2 g=q.xz-PADC;
      float e=abs(max(abs(g.x),abs(g.y))-.078);
      if(e<.0012&&q.y<MT+.001) return .3;
      if(abs(q.z+.091)<.0009&&abs(q.x)<.15) return .35;
      return .62; }
    return .5; }
  if(id==4.) return .55+.12*grain(vec3(q.z,q.y,q.x)*1.,30.);
  if(id==5.) return .86;
  if(id==6.) return .28;
  if(id==7.) return .3;
  if(id==10.){ float i=floor((q.x+.0075)/.0195+8.); return mod(floor(i/4.),2.)<.5?.82:.55; }
  if(id==8.||id==9.) return .78;
  return .7; }
