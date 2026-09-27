/* Room "Algebra I: Quadratics" — pencil still life: a curved dish reflector (a parabola turned
   round) on a little stand with its feed arm, a wooden arch toy shaped like a parabola, and a
   ball at rest. */
#define CAM_POS vec3(-0.4443,0.2957,-0.6801)
#define CAM_TGT vec3(-0.2035,0.0204,0.0768)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define DS vec3(-.06,.12,.08)
#define AR vec3(.14,0.,.06)
vec3 dsQ(vec3 p){ vec3 q=p-DS; q.xz=rot(.4)*q.xz; q.yz=rot(-.8)*q.yz; return q; }   /* dish axis +y tipped toward us */
float dishD(vec3 p){ vec3 q=dsQ(p); float r=length(q.xz);
  float y=r*r/.16;                                  /* the parabola: y = r^2 / (4f), f = .04 */
  float d=max(abs(q.y-y)*.8-.0025,r-.08);
  d=min(d,max(sdTorus(q-vec3(0.,.04,0.),.08,.003),0.));
  /* the feed: an arm from the rim to the focus */
  float arm=sdCapsule(q,vec3(0.,.04,.079),vec3(0.,.04,.0),.0022); arm=min(arm,sdCapsule(q,vec3(0.,.04,.0),vec3(0.,.04,-.079),.0022));
  float feed=sdCylY(q-vec3(0.,.043,0.),.006,.006)-.001;
  return min(d,min(arm,feed)); }
float standD(vec3 p){ vec3 q=p-vec3(DS.x,0.,DS.z);
  float base=sdCylY(q-vec3(0.,.006,0.),.05,.005)-.002;
  float post=sdCylY(q-vec3(0.,.06,0.),.006,.055);
  float yoke=sdCapsule(q,vec3(0.,.1,0.),DS-vec3(DS.x,0.,DS.z)-dsQ(DS)*0.,.006);
  return min(min(base,post),yoke); }
vec3 arQ(vec3 p){ return place(p,AR,-.2); }
float archD(vec3 p){ vec3 q=arQ(p);
  /* a thick band following y = h - k x^2 in the xy plane, standing on the table */
  float h=.13, k=h/(.075*.075);
  float x=clamp(q.x,-.075,.075); float yc=h-k*x*x;
  float dist=1e5; for(int i=0;i<24;i++){ float t=-.075+float(i)*.15/23.; vec2 a=vec2(t,h-k*t*t); float t2=t+.15/23.; vec2 b=vec2(t2,h-k*t2*t2); dist=min(dist,sdSeg2(q.xy,a,b)); }
  float band=max(dist-.009,abs(q.z)-.018);
  band=max(band,-q.y);
  return band-.001; }
float ballD(vec3 p){ return length(p-vec3(.07,.024,-.12))-.024; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,dishD(p),3.);
  r=U(r,standD(p),4.);
  r=U(r,archD(p),5.);
  r=U(r,ballD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=dsQ(p); float r=length(q.xz); if(abs(r-.08)<.004) return .4; return fract(r/.016)<.12?.6:.88; }
  if(id==4.) return .35;
  if(id==5.) return .5+.15*grain(arQ(p).zyx,80.);
  if(id==6.){ vec3 q=p-vec3(.07,.024,-.12); return abs(q.y+q.x*.5)<.005?.3:.75; }
  return .7; }
