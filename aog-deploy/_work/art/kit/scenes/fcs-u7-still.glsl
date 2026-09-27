/* FCS Unit 7 "Money and Choices" — pencil still life: a round piggy bank with a coin slot, two
   stacks of coins of different heights, and a single coin standing on its edge. */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.05,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define PG vec3(.05,0.,.06)
vec3 pgq(vec3 p){ vec3 q=p-PG; q.xz=rot(.45)*q.xz; return q; }   /* pig faces -x, turned toward us */
float pig(vec3 p){ vec3 q=pgq(p);
  float body=(length((q-vec3(0.,.085,0.))/vec3(.11,.075,.075))-1.)*.075;
  float snout=sdCylX(q-vec3(-.112,.09,0.),.024,.012)-.004;
  float ears=min(sdCone(q-vec3(-.06,.155,-.03),.017,.004,.012),sdCone(q-vec3(-.06,.155,.03),.017,.004,.012));
  float legs=1e5; for(int i=0;i<4;i++){ vec2 o=vec2(i<2?-.05:.05,(i%2==0)?-.035:.035); legs=min(legs,sdCylY(q-vec3(o.x,.017,o.y),.014,.017)-.002); }
  vec3 t=q-vec3(.115,.1,0.); float tail=sdTorus(t.xzy*vec3(1.,1.,1.),.008,.0022);
  float d=smin(body,snout,.012); d=smin(d,ears,.006); d=smin(d,legs,.01); d=min(d,tail);
  d=max(d,-sdRBox(q-vec3(0.,.16,0.),vec3(.022,.01,.003),.001));   /* coin slot */
  return d; }
float coin(vec3 q,float r){ return sdCylY(q,r,.0028)-.0008; }
float stackD(vec3 p,vec3 c,int n){ float d=1e5; for(int i=0;i<9;i++){ if(i>=n) break; float fi=float(i);
  d=min(d,coin(p-c-vec3(.0015*sin(fi*2.1),.0036+fi*.0072,.0015*cos(fi*1.3)),.024)); } return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pig(p),3.);
  r=U(r,stackD(p,vec3(-.15,0.,-.03),9),4.);
  r=U(r,stackD(p,vec3(-.09,0.,-.08),5),4.);
  vec3 c=p-vec3(.19,.024,-.05); c.xz=rot(-.4)*c.xz; r=U(r,sdCylZ(c,.024,.0028)-.0008,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=pgq(p); if(q.x<-.11&&length(q.yz-vec2(.09,0.))<.022){ if(length(q.yz-vec2(.09,-.008))<.005||length(q.yz-vec2(.09,.008))<.005) return .15; return .6; }
    if(length(q-vec3(-.085,.11,-.045))<.007||length(q-vec3(-.085,.11,.045))<.007) return .1;   /* eyes */
    return .72; }
  if(id==4.){ return abs(n.y)>.7?.62:(fract(atan(p.z,p.x)*40.)<.5?.4:.55); }                      /* milled edges */
  if(id==5.){ vec3 c=p-vec3(.19,.024,-.05); c.xz=rot(-.4)*c.xz; float r=length(c.xy); if(abs(r-.019)<.0015) return .35; return .62; }
  return .7; }
