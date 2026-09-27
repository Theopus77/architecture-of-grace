/* Math Unit 24 "Algebra II: Exponential, Logarithmic and Trigonometric Functions" — pencil
   still life: a spiral seashell (a logarithmic spiral that grows by the same factor each
   turn) standing on the table, with a wooden slide rule lying in front of it. */
#define CAM_POS vec3(-0.4240,0.2285,-0.8147)
#define CAM_TGT vec3(-0.3055,0.0215,0.1111)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define SC vec3(.06,.1,.12)
#define SB .18
vec3 shQ(vec3 p){ vec3 q=p-SC; q.xz=rot(.35)*q.xz; return q; }
/* distance to a log-spiral tube r = A e^(SB t) in the xy plane, tube radius .33 r */
float shell(vec3 p){ vec3 q=shQ(p); float r=length(q.xy); float th=atan(q.y,q.x);
  float d=1e5;
  for(int k=-3;k<=1;k++){ float t=th+6.2832*float(k); float rk=.06*exp(SB*t); if(rk<.002) continue;
    float tr=rk*.36; vec2 c=vec2(r-rk,q.z); d=min(d,(length(c/vec2(1.,.8))-tr)*.8); }
  float outer=.06*exp(SB*3.1416)*1.4; d=max(d,r-outer);
  return d; }
vec3 srQ(vec3 p){ vec3 q=p-vec3(-.08,.006,-.02); q.xz=rot(.12)*q.xz; return q; }
float slide(vec3 p){ vec3 q=srQ(p);
  float body=sdRBox(q,vec3(.2,.006,.028),.0015);
  float cursor=sdRBox(q-vec3(.04,.0,.0),vec3(.012,.009,.032),.002);
  cursor=max(cursor,-sdBox(q-vec3(.04,.01,0.),vec3(.009,.005,.026)));
  return min(body,cursor); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,shell(p),3.);
  r=U(r,slide(p),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=shQ(p); float th=atan(q.y,q.x); return fract(th*6./6.2832*1.5)<.12?.45:.82; }
  if(id==4.){ vec3 q=srQ(p); if(q.y>.005){ float x=(q.x+.19)/.38; if(x>0.&&x<1.){
        float L=log(1.+x*9.)/log(10.); float f=fract(x*9.); 
        float m=abs(fract(pow(10.,x)*1.)-.5); if(abs(q.z)>.008&&abs(q.z)<.02&&m>.47) return .15; }
      if(abs(abs(q.z)-.008)<.0008) return .3; }
    return .8; }
  return .7; }
