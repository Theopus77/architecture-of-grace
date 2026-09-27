/* Math Unit 16 "Geometry" — pencil still life: a tin can with a piece of string wound once
   round it (measuring a circle), a cone and a flat paper net of a cube lying in front. */
#define CAM_POS vec3(-0.2767,0.1952,-0.7329)
#define CAM_TGT vec3(-0.1711,0.0109,0.0915)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define CN vec3(.02,0.,.1)
vec3 cnQ(vec3 p){ return p-CN; }
vec2 can(vec3 p){ vec3 q=cnQ(p);
  float body=sdCylY(q-vec3(0.,.1,0.),.07,.1)-.002;
  float rims=min(sdTorus(q-vec3(0.,.198,0.),.069,.004),sdTorus(q-vec3(0.,.004,0.),.069,.004));
  float ribs=length(vec2(length(q.xz)-.071,mod(q.y-.03,.035)-.0175))-.0025;
  ribs=max(ribs,max(.03-q.y,q.y-.17));
  body=min(min(body,rims),ribs+.0015);
  float lid=max(q.y-.197,-(sdCylY(q-vec3(0.,.198,0.),.062,.004)));
  body=max(body,-max(sdCylY(q-vec3(0.,.2,0.),.063,.004),0.)); 
  /* the string: once round the can, then trailing onto the table */
  float s=sdTorus(q-vec3(0.,.12,0.),.0735,.0022);
  vec3 t=q-vec3(-.02,.0022,-.1); float tail=sdCapsule(t,vec3(-.04,0.,-.02),vec3(.06,0.,.03),.0022);
  float drop=sdCapsule(q,vec3(-.06,.12,-.04),vec3(-.06,.004,-.12),.0022);
  return vec2(body,s); }
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 c=can(p); r=U(r,c.x,3.); r=U(r,c.y,4.);
  vec3 k=p-vec3(-.15,.08,.1); r=U(r,sdCone(k,.06,.0015,.08)-.001,5.);
  /* cube net: six squares in a cross, lying flat, slightly lifted edges */
  vec3 n=p-vec3(.17,.0015,-.02); n.xz=rot(.4)*n.xz; float S=.035; vec2 u=n.xz;
  float net=1e5;
  net=min(net,sdBox2(u-vec2(0.,0.),vec2(S*3.,S)));
  net=min(net,sdBox2(u-vec2(-S,2.*S*0.),vec2(S,S*3.)));
  r=U(r,max(net,abs(n.y)-.0012),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .6+.25*pow(abs(n.x),6.);
  if(id==4.) return .2;
  if(id==5.) return .74;
  if(id==6.){ vec3 q=p-vec3(.17,.0015,-.02); q.xz=rot(.4)*q.xz; vec2 f=abs(fract(q.xz/.07+.5)-.5); return min(f.x,f.y)<.03?.3:.92; }
  return .7; }
