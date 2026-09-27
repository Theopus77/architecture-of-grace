/* Room ec2 "Supply, Demand and the Market" — pencil still life: a slatted wooden market crate
   heaped with apples (the supply), a blank price tag on a string hanging from its corner, one
   apple set out in front, and two small stacks of coins (what buyers will pay). */
#define CAM_POS vec3(-0.3127,0.3691,-0.7397)
#define CAM_TGT vec3(-0.1869,-0.0359,0.1044)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
vec3 crQ(vec3 p){ return place(p,vec3(0.,0.,.08),-.3); }
#define CS vec3(.13,.055,.09)
float crateD(vec3 q){
  float o=sdRBox(q-vec3(0.,CS.y,0.),CS,.003);
  float i=sdBox(q-vec3(0.,CS.y+.008,0.),CS-vec3(.008,0.,.008));
  float d=max(o,-i);
  float gy=q.y-CS.y; float slot=abs(fract(q.y/.037)-.5)*.037;       /* gaps between the side slats */
  d=max(d,-max(max(slot-.0035,abs(gy)-CS.y+.006),-(abs(q.x)-CS.x+.02)));
  float posts=1e5; for(int i=0;i<4;i++){ vec2 s=vec2(i<2?-1.:1.,mod(float(i),2.)<1.?-1.:1.);
    posts=min(posts,sdRBox(q-vec3(s.x*(CS.x-.009),CS.y,s.y*(CS.z-.009)),vec3(.009,CS.y,.009),.002)); }
  return min(d,posts); }
float applesD(vec3 q){ float d=1e5;
  for(int i=0;i<7;i++){ float fi=float(i); vec3 c=vec3(-.085+.058*mod(fi,4.),.1+.012*sin(fi*2.)+(i<4?0.:.018),i<4?-.035:.035);
    if(i>=4) c.x+=.03; vec3 a=q-c; a.xz=rot(fi*1.7)*a.xz; d=min(d,appleD(a,.035)); }
  return d; }
vec3 loneQ(vec3 p){ vec3 a=p-vec3(-.17,.033,-.1); a.xz=rot(.6)*a.xz; return a; }
vec3 tagQ(vec3 p){ vec3 q=crQ(p)-vec3(-CS.x+.035,.108,-CS.z-.004); q.xy=rot(.15)*q.xy; return q; }
float tagD(vec3 q){ float t=sdRBox(q-vec3(.0,-.03,-.001),vec3(.017,.024,.0012),.001);
  t=max(t,-sdCylZ(q-vec3(0.,-.012,0.),.0035,.01));
  float str=sdCapsule(q,vec3(0.,-.012,0.),vec3(.002,.008,.004),.001);
  return min(t,str); }
float coinsD(vec3 p){ return min(coinStack(p-vec3(.19,0.,-.08),.022,.004,7),coinStack(p-vec3(.14,0.,-.13),.022,.004,4)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=crQ(p);
  r=U(r,crateD(q),3.);
  r=U(r,applesD(q),4.);
  r=U(r,appleD(loneQ(p),.034),5.);
  r=U(r,appleLeaf(loneQ(p),.034),6.);
  r=U(r,tagD(tagQ(p)),7.);
  r=U(r,coinsD(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .6+.1*grain(p,70.);
  if(id==4.||id==5.){ return .5+.08*sin(atan(p.z,p.x)*9.+p.y*60.); }
  if(id==6.) return .4;
  if(id==7.){ vec3 q=tagQ(p); if(abs(q.x)<.011&&abs(fract((q.y+.05)/.009)-.5)<.1&&q.y<-.022) return .55; return .95; }
  if(id==8.) return .62;
  return .7; }
