/* Math Unit 17 "Statistics and Probability" — pencil still life: a bar graph built from
   wooden blocks standing on a base board (bars of different heights), with a pair of dice
   in front. */
#define CAM_POS vec3(-0.3338,0.2485,-0.7904)
#define CAM_TGT vec3(-0.2189,0.0480,0.1058)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define BW .04
vec3 bgQ(vec3 p){ vec3 q=p-vec3(-.02,0.,.1); q.xz=rot(.25)*q.xz; return q; }
float hgt(int i){ return i==0?.06:i==1?.14:i==2?.22:i==3?.17:.09; }
vec2 graph(vec3 p){ vec3 q=bgQ(p);
  float base=sdRBox(q-vec3(0.,.008,0.),vec3(.16,.008,.05),.003);
  float back=sdRBox(q-vec3(0.,.13,.045),vec3(.16,.13,.005),.003);
  float bars=1e5; for(int i=0;i<5;i++){ float h=hgt(i); bars=min(bars,sdRBox(q-vec3(-.12+float(i)*.06,.016+h*.5,0.),vec3(BW*.5,h*.5,BW*.5),.003)); }
  return vec2(min(base,back),bars); }
float die(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; float d=sdRBox(q,vec3(.022),.005); return d; }
float pips(vec3 q){ /* pips on top(5), front(2), right(3) — as painted dots */
  vec3 a=abs(q); float s=.022; float r=.0045; float d=1e5;
  if(q.y>s-.002){ vec2 u=q.xz; d=min(d,length(u)); d=min(d,length(abs(u)-vec2(.011))); }
  else if(q.z<-s+.002){ vec2 u=q.xy; d=min(d,length(u-vec2(.011,.011))); d=min(d,length(u+vec2(.011,.011))); }
  else if(q.x>s-.002){ vec2 u=q.zy; d=min(d,length(u)); d=min(d,length(u-vec2(.011,.011))); d=min(d,length(u+vec2(.011,.011))); }
  return d-r; }
#define D1 vec3(.17,.022,.0)
#define D2 vec3(.225,.022,.045)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 g=graph(p); r=U(r,g.x,3.); r=U(r,g.y,4.);
  r=U(r,die(p,D1,.3),5.); r=U(r,die(p,D2,-.4),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bgQ(p); if(q.z<.041&&q.y>.02&&fract((q.y-.016)/.04)<.06) return .45; return .82; }
  if(id==4.){ vec3 q=bgQ(p); int i=int(floor((q.x+.15)/.06)); return mod(float(i),2.)<.5?.42:.55; }
  if(id==5.){ vec3 q=p-D1; q.xz=rot(.3)*q.xz; return pips(q)<0.?.1:.9; }
  if(id==6.){ vec3 q=p-D2; q.xz=rot(-.4)*q.xz; return pips(q)<0.?.1:.9; }
  return .7; }
