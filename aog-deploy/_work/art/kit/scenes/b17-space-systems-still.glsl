/* b17 "Space Systems" — a desk orrery: a round sun on a turned post, a long arm carrying a
   tilted Earth on its axle with a small Moon beside it; a crank at the base. */
#define CAM_POS vec3(-0.5203,0.3684,-0.8320)
#define CAM_TGT vec3(-0.2138,0.0416,0.1283)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
#define C0 vec3(-.05,0.,.08)
#define SUNP (C0+vec3(0.,.23,0.))
#define ARMA -.6
vec3 earthC(){ return C0+vec3(cos(ARMA)*.24,.14,sin(ARMA)*.24); }
mat3 tilt(){ float a=.41; return mat3(cos(a),sin(a),0.,-sin(a),cos(a),0.,0.,0.,1.); }
float base(vec3 p){ vec3 q=p-C0;
  float b=sdCylY(q-vec3(0.,.012,0.),.11,.009)-.004;
  b=min(b,sdCylY(q-vec3(0.,.028,0.),.075,.007)-.003);
  float post=sdCylY(q-vec3(0.,.1,0.),.009+.004*smoothstep(.09,.03,q.y)+.003*sin(q.y*90.)*step(q.y,.05),.08);
  float hub=sdCylY(q-vec3(0.,.14,0.),.018,.008)-.002;
  vec3 k=q-vec3(.1,.03,-.04); float crank=sdCapsule(k,vec3(0.),vec3(.03,.0,-.02),.004);
  crank=min(crank,sdCylY(k-vec3(.03,.012,-.02),.005,.012));
  return min(min(b,post),min(hub,crank)); }
float sun(vec3 p){ vec3 q=p-SUNP; float r=length(q)-.055;
  return r+.0015*sin(atan(q.z,q.x)*16.)*sin(acos(clamp(q.y/length(q),-1.,1.))*16.)*0.; }
float arm(vec3 p){ vec3 e=earthC();
  vec3 a=C0+vec3(0.,.14,0.), b=vec3(e.x,.14,e.z);
  float d=sdCapsule(p,a,b,.005);
  d=min(d,sdCylY(p-vec3(e.x,.1+.016,e.z),.004,.03));            /* earth post */
  d=min(d,sdCylY(p-vec3(e.x,.14,e.z),.01,.004)-.001);            /* cup */
  vec3 m=e+vec3(.06,-.01,-.02);                                   /* moon arm */
  d=min(d,sdCapsule(p,vec3(e.x,.12,e.z),vec3(m.x,.12,m.z),.0028));
  d=min(d,sdCylY(p-vec3(m.x,.12+.012,m.z),.0025,.014));
  vec3 q=tilt()*(p-e); d=min(d,sdCylY(q,.0025,.07));            /* axle */
  return d; }
float earth(vec3 p){ return length(p-earthC())-.05; }
float moon(vec3 p){ vec3 e=earthC()+vec3(.06,.03,-.02); return length(p-e)-.013; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,base(p),3.);
  r=U(r,sun(p),4.);
  r=U(r,arm(p),5.);
  r=U(r,earth(p),6.);
  r=U(r,moon(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .42+.12*grain(p,40.);
  if(id==4.){ vec3 d=normalize(p-SUNP); float f=fbm(vec2(atan(d.z,d.x)*2.,d.y*3.)*2.);
    return .86-.12*smoothstep(.55,.7,f); }
  if(id==5.) return .45;
  if(id==6.){ vec3 d=tilt()*normalize(p-earthC()); d.xz=rot(-.9)*d.xz;
    float lat=asin(d.y), lon=atan(d.z,d.x);
    float land=fbm(vec2(lon*1.6,lat*2.2)+vec2(3.1,1.7))-.5+.12*cos(lat*2.);
    if(abs(land)<.012) return .2; if(abs(lat)<.02) return .45;
    return land>0.?.42:.86; }
  if(id==7.){ return .78-.2*step(.6,fbm((p.xy+p.z)*400.)); }
  return .7; }
