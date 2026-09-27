/* World Religions Unit 7 "Religion in Our Community" (Three Doors, One Food Drive) — pencil
   still life: an open cardboard food-drive box with its flaps up and tins inside, two more
   tins and a round loaf of bread on the table beside it. No figures, no writing. */
#define CAM_POS vec3(-0.4597,0.4686,-0.9366)
#define CAM_TGT vec3(-0.3021,-0.0385,0.1202)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define BX vec3(-.02,0.,.06)
#define BR .3
vec3 bxq(vec3 p){ return L(p,BX,BR); }
float box(vec3 q){
  vec3 b=vec3(.12,.075,.085);
  float outer=sdRBox(q-vec3(0,b.y,0),b,.002);
  float inner=sdBox(q-vec3(0,b.y+.006,0),b-vec3(.004,0.,.004));
  float d=max(outer,-inner);
  /* four flaps hinged at the top edges, opened outward */
  vec3 f=q-vec3(0,2.*b.y,b.z); f.yz=rot(.9)*f.yz; d=min(d,sdBox(f-vec3(0,.04,0),vec3(b.x,.04,.0015)));
  f=q-vec3(0,2.*b.y,-b.z); f.yz=rot(-.9)*f.yz; d=min(d,sdBox(f-vec3(0,.04,0),vec3(b.x,.04,.0015)));
  f=q-vec3(b.x,2.*b.y,0); f.xy=rot(-.9)*f.xy; d=min(d,sdBox(f-vec3(0,.035,0),vec3(.0015,.035,b.z)));
  f=q-vec3(-b.x,2.*b.y,0); f.xy=rot(.9)*f.xy; d=min(d,sdBox(f-vec3(0,.035,0),vec3(.0015,.035,b.z)));
  return d; }
float tin(vec3 q,float r,float h){
  float d=sdCylY(q-vec3(0,h,0),r,h)-.0015;
  float a=q.y; float rib=abs(fract(a/.012)-.5)*.0012; d+=0.;
  float rim=min(sdTorus(q-vec3(0,2.*h,0),r,.002),sdTorus(q-vec3(0,.002,0),r,.002));
  return min(d,rim); }
float tins(vec3 q){  /* tins standing inside the box, tops showing */
  float d=tin(q-vec3(-.06,.0,-.03),.035,.095);
  d=min(d,tin(q-vec3(.02,.0,-.035),.035,.1));
  d=min(d,tin(q-vec3(.07,.0,.035),.032,.075));
  d=min(d,tin(q-vec3(-.04,.0,.04),.033,.092));
  return d; }
float loaf(vec3 q){
  vec3 c=q-vec3(0,.0,0);
  float d=length(c*vec3(.75,1.3,1.1))-.07; d=max(d*.7,-c.y);
  float cut=abs(fract((c.x-c.z*.8)/.04)-.5)*.04-.003; d+=.004*smoothstep(.004,.0,cut)*step(.03,c.y);
  d+=(fbm(c.xz*40.)-.5)*.002;
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=bxq(p);
  r=U(r,box(q),3.);
  r=U(r,tins(q),4.);
  r=U(r,min(tin(L(p,vec3(.19,0.,-.07),0.),.035,.045),tin(L(p,vec3(.25,0.,.0),0.),.03,.055)),5.);
  r=U(r,loaf(L(p,vec3(-.25,0.,-.06),.4)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bxq(p); if(abs(q.z)<.003&&q.y>.14) return .4; if(abs(q.y-.07)<.035&&abs(q.x)<.05&&q.z<-.083) return .78; return .6; }
  if(id==4.||id==5.){ float y=p.y; vec3 q=id==4.?bxq(p):p; if(abs(n.y)>.8) return .75;
    float l=fract(p.y/.012); if(id==5.&&abs(p.y-.04)<.018) return .88; return l<.2?.4:.55; }
  if(id==6.){ vec3 c=L(p,vec3(-.25,0.,-.06),.4); float cut=abs(fract((c.x-c.z*.8)/.04)-.5)*.04; if(cut<.004&&c.y>.03) return .82; return .45+.12*fbm(p.xz*60.); }
  return .7; }
