/* Room "Ecosystems and Human Impact" — pencil still life: a round log section with rings,
   bark and three small mushrooms growing on it, a pinecone, and an empty glass bottle lying
   on its side (what people leave behind). */
#define CAM_POS vec3(-0.2722,0.2316,-0.4748)
#define CAM_TGT vec3(-0.1039,0.0031,0.0421)
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
#define LOG vec3(-.04,0.,.07)
#define PC vec3(.13,.028,-.08)
float logD(vec3 p){ vec3 q=p-LOG; float a=atan(q.z,q.x);
  float r=.1+.003*sin(a*23.+fbm(vec2(a*3.,q.y*40.))*3.)+.002*fbm(vec2(a*12.,q.y*80.));
  float d=sdCylY(q-vec3(0.,.035,0.),r,.035)-.002;
  return d*.9; }
float mushD(vec3 p){ float d=1e5;
  for(int i=0;i<3;i++){ vec3 c=LOG+vec3(-.03+float(i)*.035,.07,.02-float(i)*.02); float s=1.-float(i)*.22;
    vec3 q=p-c; float stem=sdCapsule(q,vec3(0.),vec3(.0,.03*s,0.),.006*s);
    vec3 k=q-vec3(0.,.03*s,0.); float cap=max(sdEll(k,vec3(.022,.016,.022)*s),-k.y-.002*s);
    d=min(d,min(stem,cap)); }
  return d; }
vec3 pcQ(vec3 p){ vec3 q=p-PC; q.xz=rot(-.5)*q.xz; q.xy=rot(1.45)*q.xy; return q; }   /* lying down: axis along x */
float pineD(vec3 p){ vec3 q=pcQ(p);
  float d=sdEll(q,vec3(.028,.05,.028));
  float a=atan(q.z,q.x); float y=q.y;
  vec2 g=vec2(a*8./6.2832+y*36., -a*8./6.2832+y*36.);   /* two crossing spirals */
  vec2 f=abs(fract(g)-.5);
  d-=.006*smoothstep(.0,.35,min(f.x,f.y))*smoothstep(.055,.03,abs(y));
  float stalk=sdCapsule(q,vec3(0.,-.048,0.),vec3(0.,-.062,0.),.004);
  return min(d*.7,stalk); }
vec3 btQ(vec3 p){ vec3 q=p-vec3(.2,.028,.15); q.xz=rot(-.25)*q.xz; return q.yxz; }   /* lying along x */
float bottleL(vec3 p){ vec3 q=btQ(p);
  float body=sdCylY(q-vec3(0.,-.02,0.),.027,.05)-.001;
  float sh=sdCone(q-vec3(0.,.045,0.),.027,.011,.015);
  float neck=sdCylY(q-vec3(0.,.075,0.),.0105,.02);
  float lip=sdTorus(q-vec3(0.,.095,0.),.0105,.0025);
  float d=min(smin(body,sh,.008),min(neck,lip));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,logD(p),3.);
  r=U(r,mushD(p),4.);
  r=U(r,pineD(p),5.);
  r=U(r,bottleL(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-LOG; if(n.y>.7){ float r=length(q.xz); if(r>.092) return .3; return fract(r/.009+.3*fbm(q.xz*30.))<.25?.5:.85; }
    return .35+.2*fbm(vec2(atan(q.z,q.x)*20.,q.y*60.)); }
  if(id==4.) return .82;
  if(id==5.){ vec3 q=pcQ(p); float a=atan(q.z,q.x); vec2 g=vec2(a/6.2832*8.+q.y*36.,-a/6.2832*8.+q.y*36.); vec2 f=abs(fract(g)-.5); return min(f.x,f.y)<.08?.2:.45; }
  if(id==6.){ vec3 q=btQ(p); return abs(q.x)<.008&&q.z<0.?.95:.7; }
  return .7; }
