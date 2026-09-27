/* Social Studies Unit 11 "Classical Worlds" — pencil still life: a fluted Greek column on
   a square base, a two-handled amphora with painted bands on a round foot. */
#define CAM_POS vec3(-0.2258,0.2635,-0.7376)
#define CAM_TGT vec3(-0.1171,0.0727,0.0802)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define CC vec3(.02,0.,.18)
float column(vec3 p){
  vec3 q=p-CC;
  float plinth=sdRBox(q-vec3(0.,.012,0.),vec3(.06,.012,.06),.002);
  float torus=sdTorus(q-vec3(0.,.03,0.),.045,.008);
  float t=clamp((q.y-.03)/.2,0.,1.); float R=.042-.006*t;
  float a=atan(q.z,q.x); float fl=.0025*(1.-abs(sin(a*10.)));     /* 20 flutes */
  float shaft=max(length(q.xz)-R+fl,abs(q.y-.13)-.1);
  float echinus=sdCone(q-vec3(0.,.24,0.),.04,.055,.01);
  float abacus=sdRBox(q-vec3(0.,.258,0.),vec3(.062,.008,.062),.002);
  return min(min(plinth,torus),min(shaft*.9,min(echinus,abacus))); }
#define AC vec3(.25,0.,.08)
vec2 amphora(vec3 p){
  vec3 q=p-AC;
  float y=q.y; float t=clamp(y/.22,0.,1.);
  float R=mix(.018,.068,smoothstep(0.,.55,t))*(1.-.62*smoothstep(.6,.9,t))+.004*smoothstep(.95,1.,t);
  R=max(R,.014);
  float d=(length(q.xz)-R)*.75; d=max(d,max(-y,y-.22));
  float foot=sdCylY(q-vec3(0.,.008,0.),.03,.008)-.002;
  d=min(d,foot);
  d=max(d,-sdCylY(q-vec3(0.,.22,0.),.018,.02));
  float lip=sdTorus(q-vec3(0.,.22,0.),.024,.005);
  float h=1e5; vec3 c=q; c.x=abs(c.x);
  h=sdTorus((c-vec3(.042,.175,0.)).xzy,.026,.005); h=max(h,-(c.x-.042)+.0);
  return vec2(min(d,lip),h); }
vec3 wq(vec3 p){ return p-vec3(-.2,.008,-.02); }
float wreath(vec3 p){
  vec3 q=wq(p);
  float ring=sdTorus(q,.065,.004);
  ring=max(ring,-(q.z+.045));                       /* open at the front */
  float lv=1e5;
  for(int i=0;i<18;i++){ float a=float(i)*.29+.9; float side=mod(float(i),2.)*2.-1.;
    vec3 c=vec3(.065*cos(a),.0,.065*sin(a));
    vec3 l=q-c; l.xz=rot(-a+1.5708+side*.5)*l.xz; l.x-=side*.012;
    lv=min(lv,length(l*vec3(2.4,7.,1.))/7.-.0028); }
  return min(ring,lv); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,column(p),3.);
  vec2 a=amphora(p); r=U(r,a.x,4.); r=U(r,a.y,5.);

  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .86;
  if(id==4.){ vec3 q=p-AC; float a=atan(q.z,q.x);
    if(abs(q.y-.1)<.022){ float z=fract(a*8./3.1416); if(abs(q.y-.1)<.018&&(z<.12||abs(z-.5)<.06)) return .2; return .3; }   /* dark figure band with a key */
    if(abs(q.y-.15)<.003||abs(q.y-.065)<.003) return .25;
    if(abs(q.y-.045)<.01&&fract(a*10./3.1416)<.5) return .3;
    return .62; }
  if(id==5.) return .45;
  if(id==6.) return .5;
  return .7; }
