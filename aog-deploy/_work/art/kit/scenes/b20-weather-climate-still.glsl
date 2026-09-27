/* b20 "Weather and Climate" — a cup anemometer on a pole, a rain gauge with its funnel and
   level marks, and a wall-style thermometer on a wooden board leaning on the gauge. */
#define CAM_POS vec3(-0.4758,0.3353,-0.7127)
#define CAM_TGT vec3(-0.2074,0.0489,0.1288)
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
#define AN vec3(-.08,0.,.1)
#define TOP .22
float anemo(vec3 p){ vec3 q=p-AN;
  float b=sdCylY(q-vec3(0.,.01,0.),.06,.006)-.004;
  float pole=sdCylY(q-vec3(0.,TOP*.5,0.),.006,TOP*.5);
  float hub=sdCylY(q-vec3(0.,TOP+.006,0.),.014,.008)-.003;
  hub=min(hub,length(q-vec3(0.,TOP+.02,0.))-.008);
  float d=min(min(b,pole),hub);
  for(int i=0;i<3;i++){ float a=float(i)*2.0944+.5; vec2 dir=vec2(cos(a),sin(a));
    vec3 e=vec3(dir.x*.085,TOP+.006,dir.y*.085);
    d=min(d,sdCapsule(q,vec3(0.,TOP+.006,0.),e,.0028));
    vec3 c=q-e; vec2 t=vec2(-dir.y,dir.x);            /* cup opening faces along the tangent */
    float along=dot(c.xz,t); vec3 cl=vec3(dot(c.xz,dir),c.y,along);
    float sh=abs(length(cl)-.027)-.002; sh=max(sh,cl.z);
    d=min(d,sh); }
  return d; }
#define RG vec3(.13,0.,.02)
float gauge(vec3 p){ vec3 q=p-RG;
  float o=sdCylY(q-vec3(0.,.09,0.),.03,.09)-.002;
  float i=sdCylY(q-vec3(0.,.1,0.),.026,.09);
  float d=max(o,-i);
  vec3 f=q-vec3(0.,.19,0.); float fun=abs(sdCone(f,.028,.045,.02))-.002; fun=max(fun,abs(f.y)-.02);
  d=min(d,fun);
  d=min(d,sdCylY(q-vec3(0.,.006,0.),.036,.006)-.002);
  return d; }
vec3 thQ(vec3 p){ vec3 q=p-vec3(.19,.0,-.06); q.xz=rot(-.35)*q.xz; q.yz=rot(.25)*q.yz; return q; }
float thermo(vec3 p){ vec3 q=thQ(p)-vec3(0.,.1,0.);
  float bd=sdRBox(q,vec3(.022,.1,.005),.004);
  float tube=sdCapsule(q,vec3(0.,-.07,-.007),vec3(0.,.085,-.007),.003);
  float bulb=length(q-vec3(0.,-.075,-.008))-.008;
  return min(bd,min(tube,bulb)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,anemo(p),3.);
  r=U(r,gauge(p),4.);
  r=U(r,thermo(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .5;
  if(id==4.){ vec3 q=p-RG; float a=atan(q.z,q.x);
    if(q.y>.02&&q.y<.17&&abs(a+1.9)<.5){ float m=fract(q.y/.02); if(m<.12) return .2; if(fract(q.y/.01)<.12&&abs(a+1.9)<.25) return .35; }
    if(q.y>.02&&q.y<.07&&length(q.xz)>.028) return .62;            /* the water inside, seen through */
    return .82; }
  if(id==5.){ vec3 q=thQ(p)-vec3(0.,.1,0.);
    if(q.z<-.004){ if(length(q-vec3(0.,-.075,-.008))<.009) return .2;
      if(abs(q.x)<.0035&&q.y<.02) return .22;
      if(abs(q.x)>.007&&abs(q.x)<.016&&fract(q.y/.012)<.14&&q.y>-.06&&q.y<.09) return .3; }
    return .6+.1*grain(q,50.); }
  return .7; }
