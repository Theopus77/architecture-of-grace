/* The Mixing Desk page — pencil still life: a mixing desk seen from the front left: twelve channel strips (a long
   fader, two buttons and six knobs each), a master section with two faders, and a raised meter bridge with a light
   ladder per channel and two needle meters; a studio speaker stands behind it on the right and a pair of
   headphones lies on the table in front. No names or logos. */
#define CAM_POS vec3(-2.5006,1.5410,-1.9998)
#define CAM_TGT vec3(-0.8982,0.0407,0.5493)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 40.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "musicparts.glsl"
#define DYAW .32
#define SIG .245
vec3 dq(vec3 p){ vec3 q=p; q.xz=rot(DYAW)*q.xz; return q; }
/* the sloped work surface: u across, v up the slope from the front edge, w out of the surface */
vec3 surf(vec3 q){ vec3 o=q-vec3(0.,.10,-.30); return vec3(q.x,dot(o,vec3(0.,cos(SIG),-sin(SIG))),dot(o,vec3(0.,sin(SIG),cos(SIG)))); }
float body(vec3 q){
  float b=sdRBox(q-vec3(0.,.15,0.),vec3(.5,.15,.3),.012);
  b=smax(b,surf(q).y,.006);
  float mb=sdRBox(q-vec3(0.,.17,.255),vec3(.5,.17,.045),.01);          /* the meter bridge */
  mb=smax(mb,dot(q-vec3(0.,.34,.21),normalize(vec3(0.,1.,-.55))),.006);
  b=min(b,mb);
  /* needle meter windows, sunk into the bridge face */
  vec3 m=q-vec3(.37,.27,.205); m.yz=rot(-.5)*m.yz; m.x=abs(m.x)-.045;
  b=max(b,-sdRBox(m,vec3(.036,.028,.008),.003));
  return b; }
#define CH 12.
#define CW .057
float chanU(float u,out float k){ k=clamp(floor((u+.46)/CW),0.,CH-1.); return u-(-.46+(k+.5)*CW); }
float knob(vec3 r,float a,float rad){
  float d=sdCylY(r-vec3(0.,.007,0.),rad,.007)-.0015;
  d=min(d,sdCylY(r-vec3(0.,.001,0.),rad+.0025,.0012)-.0006);
  vec3 s=r; s.xz=rot(a)*s.xz;
  d=min(d,sdRBox(s-vec3(0.,.0155,rad*.5),vec3(.0011,.001,rad*.45),.0005));
  return d; }
float controls(vec3 q){
  vec3 s=surf(q);
  float bb=sdBox(q-vec3(0.,.2,0.),vec3(.5,.2,.3));
  if(bb>.01||s.y>.05) return max(bb,s.y-.03);
  float d=1e3, k;
  if(s.x<.245){
    float du=chanU(s.x,k);
    /* fader cap at its own height in the travel */
    float fv=.05+.10*h1(vec2(k,3.));
    d=min(d,sdRBox(vec3(du,s.y-.009,s.z-fv),vec3(.013,.008,.0065),.003));
    /* mute and solo */
    float bv=clamp(floor((s.z-.20)/.026+.5),0.,1.)*.026+.20;
    d=min(d,sdRBox(vec3(du,s.y-.003,s.z-bv),vec3(.009,.004,.007),.0025));
    /* six knobs up the strip */
    float kv=clamp(floor((s.z-.26)/.04+.5),0.,5.)*.04+.26;
    d=min(d,knob(vec3(du,s.y,s.z-kv),h1(vec2(k,kv*50.))*4.-2.,.0115));
  } else {
    /* master: two faders, four big knobs, a row of buttons */
    float mu=s.x-.355, mx=abs(mu)-.03;
    d=min(d,sdRBox(vec3(mx,s.y-.009,s.z-.09),vec3(.015,.0085,.007),.003));
    vec2 g=vec2(abs(mu)-.045,s.z-.36); float gz=clamp(floor(g.y/.07+.5),-1.,0.)*.07;
    d=min(d,knob(vec3(g.x,s.y,g.y-gz),.5+gz*20.,.018));
    float bu=clamp(floor((mu+.06)/.03+.5),0.,4.)*.03-.06;
    d=min(d,sdRBox(vec3(mu-bu,s.y-.003,s.z-.22),vec3(.01,.004,.008),.0025));
  }
  return d; }
/* a studio speaker: a cabinet with a woofer cone and a tweeter dome */
#define SPK vec3(.78,0.,.42)
vec3 sk(vec3 p){ vec3 q=p-SPK; q.xz=rot(-.75)*q.xz; return q; }
float speaker(vec3 p){
  vec3 q=sk(p);
  float d=sdRBox(q-vec3(0.,.21,0.),vec3(.125,.21,.15),.012);
  vec3 w=q-vec3(0.,.15,-.15);
  float cone=length(w-vec3(0.,0.,.06))-.11;                              /* the cone, sunk */
  d=max(d,-max(cone,length(w.xy)-.085));
  d=min(d,length(w-vec3(0.,0.,.015))-.032);                             /* dust cap */
  d=min(d,max(sdTorus(vec3(w.x,w.z+.003,w.y),.092,.008),-(w.z+.0)));     /* surround */
  vec3 t=q-vec3(0.,.33,-.15);
  d=max(d,-max(length(t.xy)-.042,abs(t.z)-.012));                      /* tweeter recess */
  d=min(d,length(t-vec3(0.,0.,.02))-.026);
  return d; }
/* headphones lying on the table */
#define HP vec3(-.70,0.,-.38)
vec3 hk(vec3 p){ vec3 q=p-HP; q.xz=rot(-.5)*q.xz; return q; }
float phones(vec3 p){
  vec3 q=hk(p);
  vec3 c=vec3(abs(q.x)-.1,q.y-.056,q.z);
  float d=sdCylX(c,.052,.018)-.005;                                       /* ear cups, standing on their rims */
  d=min(d,sdTorus(vec3(c.y,c.x+.026,c.z).yxz*vec3(1.,1.,1.),.044,.012));   /* cushions, toward each other */
  vec3 b=q-vec3(0.,.056,0.);
  float band=length(vec2(length(b.xy)-.112,b.z))-.011;                  /* the band, arching over */
  band=max(band,-b.y+.02);
  d=min(d,band);
  d=min(d,segD(q,vec3(-.1,.02,.0),vec3(-.1,.03,.0))-.003);
  return d; }
float cable(vec3 p){ vec3 q=hk(p); return min(segD(q,vec3(-.1,.012,0.),vec3(-.16,.006,-.08)),segD(q,vec3(-.16,.006,-.08),vec3(-.42,.006,-.12)))-.005; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,60.-p.z,2.);
  vec3 q=dq(p);
  r=U(r,body(q),3.);
  r=U(r,controls(q),4.);
  r=U(r,speaker(p),5.);
  r=U(r,phones(p),6.);
  r=U(r,cable(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  vec3 q=dq(p);
  if(id==3.){
    vec3 s=surf(q);
    if(abs(s.y)<.003){
      float k; float du=chanU(s.x,k);
      if(s.x<.245&&s.x>-.46){
        if(abs(du)<.0018&&s.z>.035&&s.z<.17) return .1;                  /* fader slots */
        if(abs(abs(du)-CW*.5)<.0009) return .4;                          /* strip lines */
        if(s.z<.025&&abs(du)<.016) return .85;                           /* the scribble strip */
      } else if(s.x>.245){
        if(abs(abs(s.x-.355)-.03)<.0018&&s.z>.035&&s.z<.17) return .1;
        if(abs(s.x-.245)<.001) return .35; }
      return .5; }
    /* the meter bridge face: a ladder of lights per channel, the needle meters */
    vec3 m=q-vec3(.37,.27,.205); m.yz=rot(-.5)*m.yz;
    if(q.z>.2&&q.y>.2){
      vec3 mm=vec3(abs(m.x)-.045,m.y,m.z);
      if(abs(mm.x)<.036&&abs(mm.y)<.028){
        float an=atan(mm.x,mm.y+.04), rr=length(vec2(mm.x,mm.y+.04));
        if(abs(rr-.05)<.0012&&abs(an)<.8) return .2;
        if(abs(an-.25*sign(m.x))<.012&&rr<.058) return .1;               /* the needles */
        return .9; }
      float k; float du=chanU(q.x,k);
      if(q.x<.245&&q.x>-.46&&abs(du)<.006&&abs(q.y-.27)<.04){ float t=fract((q.y-.23)/.008); if(t<.55) return (q.y-.23)/.08<h1(vec2(k,9.))?.18:.7; }
      return .4; }
    return .35; }
  if(id==4.){ vec3 s=surf(q); if(s.x<.245&&s.y>.012&&s.z<.18) return .85; return .2; }   /* fader caps light, knobs dark */
  if(id==5.){
    vec3 w=sk(p)-vec3(0.,.15,-.15);
    if(length(w.xy)<.1&&w.z>-.02) return .15;
    vec3 t=sk(p)-vec3(0.,.33,-.15); if(length(t.xy)<.045) return .25;
    return .45; }
  if(id==6.) return .2;
  return .7; }
