/* sp20 "First, Then, Last — Telling a Day" — a twin-bell alarm clock (morning), a toothbrush
   standing in a cup, and a metal lunch pail with its handle up (the middle of the day). */
#define CAM_POS vec3(-0.3125,0.2551,-0.5148)
#define CAM_TGT vec3(-0.1166,0.0462,0.0989)
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
#define CK vec3(-.05,0.,.1)
vec3 kQ(vec3 p){ vec3 q=place(p,CK,-.3)-vec3(0.,.075,0.); return q; }
float clock(vec3 p){ vec3 q=kQ(p);
  float body=sdCylZ(q,.055,.02)-.004;
  float bez=sdTorus(q.xzy-vec3(0.,-.024,0.),.052,.004);
  float d=min(body,bez);
  for(int s=0;s<2;s++){ float sx=s==0?-1.:1.; vec3 b=q-vec3(sx*.035,.058,0.); b.xy=rot(-sx*.5)*b.xy;
    float bell=max(length(b)-.022,-b.y); d=min(d,bell); d=min(d,sdCylY(b,.003,.01)); }
  d=min(d,sdCapsule(q,vec3(-.035,.082,0.),vec3(.035,.082,0.),.003));
  d=min(d,length(q-vec3(0.,.085,0.))-.006);
  for(int s=0;s<2;s++){ float sx=s==0?-1.:1.; d=min(d,sdCapsule(q,vec3(sx*.03,-.045,0.),vec3(sx*.045,-.074,-.005),.0045)); }
  return d; }
#define CP vec3(.12,0.,.02)
float cup(vec3 p){ return cupD(p-CP,.028,.075,0.); }
float brush(vec3 p){ vec3 q=p-CP-vec3(.004,.01,0.); q.xy=rot(-.25)*q.xy; q.zy=rot(.1)*q.zy; return brushD(q); }
#define LP vec3(.14,0.,.19)
vec3 lQ(vec3 p){ return place(p,LP,-.4); }
float pail(vec3 p){ vec3 q=lQ(p);
  float b=sdRBox(q-vec3(0.,.04,0.),vec3(.07,.04,.04),.012);
  float lid=sdRBox(q-vec3(0.,.085,0.),vec3(.071,.006,.041),.006);
  float h=max(length(vec2(length(q.xy-vec2(0.,.09))-.045,q.z))-.0035,-(q.y-.09));
  return min(min(b,lid),h); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,clock(p),3.);
  r=U(r,cup(p),4.);
  r=U(r,brush(p),5.);
  r=U(r,pail(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=kQ(p); if(q.z<-.02&&length(q.xy)<.048){ float r=length(q.xy); float a=atan(q.y,q.x);
      if(r>.04&&fract(a/6.2832*12.)<.08) return .2;
      if(sdSeg2(q.xy,vec2(0.),vec2(0.,.03))<.0022) return .15;
      if(sdSeg2(q.xy,vec2(0.),vec2(-.022,-.004))<.0026) return .15;
      if(r<.004) return .2; return .93; }
    return .45; }
  if(id==4.) return .78;
  if(id==5.){ vec3 q=p-CP-vec3(.004,.01,0.); q.xy=rot(-.25)*q.xy; return q.y>.155&&q.z>.004?.9:.5; }
  if(id==6.){ vec3 q=lQ(p); if(abs(q.y-.078)<.002||abs(q.y-.02)<.002) return .35; return .6; }
  return .7; }
