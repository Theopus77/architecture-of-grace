/* Social Studies Unit 19 "Civics: Rights, Power and Participation" — pencil still life: a
   brass balance scale of justice with two hanging pans, a judge's gavel on its block and a
   rolled charter tied with a ribbon. */
#define CAM_POS vec3(-0.3296,0.2707,-1.0066)
#define CAM_TGT vec3(-0.1858,0.0179,0.0765)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define SC vec3(.08,0.,.16)
vec3 sq(vec3 p){ vec3 q=p-SC; q.xz=rot(-.15)*q.xz; return q; }
vec2 scales(vec3 p){
  vec3 q=sq(p);
  float base=sdCone(q-vec3(0.,.012,0.),.06,.045,.012)-.002;
  float post=sdCylY(q-vec3(0.,.13,0.),.006,.12);
  float knob=length(q-vec3(0.,.262,0.))-.012;
  float beam=sdCapsule(q,vec3(-.11,.235,0.),vec3(.11,.235,0.),.0045);
  float pivot=sdCylZ(q-vec3(0.,.235,0.),.012,.006);
  float chains=1e5, pans=1e5;
  for(int i=0;i<2;i++){ float s=float(i)*2.-1.; vec3 c=q-vec3(s*.105,0.,0.);
    for(int k=0;k<3;k++){ float a=float(k)*2.094+.3; vec3 e=vec3(.032*cos(a),.1,.032*sin(a));
      chains=min(chains,sdCapsule(c,vec3(0.,.232,0.),e,.0012)); }
    vec3 pn=c-vec3(0.,.1,0.);
    float pan=max(abs(length(pn*vec3(1.,2.2,1.)+vec3(0.,.036,0.))-.04)-.0025,pn.y);
    pans=min(pans,pan); }
  return vec2(min(min(base,post),min(knob,min(beam,pivot))),min(chains,pans)); }
vec3 gq(vec3 p){ vec3 q=p-vec3(-.2,0.,-.03); q.xz=rot(.5)*q.xz; return q; }
vec2 gavel(vec3 p){
  vec3 q=gq(p);
  float blk=sdCylY(q-vec3(0.,.01,0.),.05,.01)-.002;
  vec3 h=q-vec3(.0,.042,.0); h.xz=rot(-.3)*h.xz;
  float head=sdCylX(h,.022,.042)-.002;
  head=min(head,sdCylX(h-vec3(.047,0.,0.),.025,.006)-.001);
  head=min(head,sdCylX(h-vec3(-.047,0.,0.),.025,.006)-.001);
  float han=sdCapsule(h,vec3(0.,0.,-.02),vec3(.0,-.02,-.17),.007);
  return vec2(blk,min(head,han)); }
vec3 rq(vec3 p){ vec3 q=p-vec3(.35,.022,-.03); q.xz=rot(-.4)*q.xz; return q; }
vec2 scroll(vec3 p){ vec3 q=rq(p); return vec2(sdCylX(q,.022,.1)-.001,sdCylX(q,.0235,.006)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 s=scales(p); r=U(r,s.x,3.); r=U(r,s.y,4.);
  vec2 g=gavel(p); r=U(r,g.x,5.); r=U(r,g.y,6.);
  vec2 c=scroll(p); r=U(r,c.x,7.); r=U(r,c.y,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .55;
  if(id==4.) return .5;
  if(id==5.) return .45;
  if(id==6.){ vec3 q=gq(p); vec3 h=q-vec3(.0,.042,.0); h.xz=rot(-.3)*h.xz; if(abs(abs(h.x)-.03)<.003&&h.z>-.03) return .25; return .4; }
  if(id==7.){ vec3 q=rq(p); if(q.x>.098) return fract(length(q.yz)/.004)<.4?.5:.85; return .86; }
  if(id==8.) return .35;
  return .7; }
