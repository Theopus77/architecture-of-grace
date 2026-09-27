/* World Religions Unit 17 "Islam: The Qur'an and the Five Pillars" (Ramadan in Room 214) —
   pencil still life of breaking the fast at sunset: a pierced brass Ramadan lantern with a
   candle inside, a bowl of dates, and a glass of water. No people, no writing. */
#define CAM_POS vec3(-0.4159,0.5462,-0.9848)
#define CAM_TGT vec3(-0.2491,0.0088,0.1350)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define LN vec3(-.03,0.,.1)
#define LS 1.3
#define BW vec3(.17,0.,-.02)
#define GL vec3(-.19,0.,-.04)
float dates(vec3 q){ float d=1e5;
  for(int i=0;i<9;i++){ float f=float(i); float a=f*2.4; float rr=.012+.028*fract(f*.618);
    vec3 c=vec3(cos(a)*rr,.03+.01*step(5.,f)+.004*sin(f*3.),sin(a)*rr);
    vec3 k=q-c; k.xz=rot(f*1.3)*k.xz; k.xy=rot(.3*sin(f))*k.xy;
    d=min(d,length(k*vec3(1.,1.8,1.8))-.02); }
  return d*.5; }
float glass(vec3 q){ float y=q.y; float r=.03+.006*y/.1;
  float sh=max(abs(length(q.xz)-r)-.0015,max(-y,y-.1));
  float base=sdCylY(q-vec3(0,.004,0),r-.001,.004);
  float water=max(length(q.xz)-r+.0015,max(-y,y-.07));
  return min(min(sh,base),water); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,lanternD(L(p,LN,.35),LS),3.);
  r=U(r,lanternCandle(L(p,LN,.35),LS),4.);
  vec3 b=L(p,BW,0.);
  r=U(r,bowlD(b,.09,.035),5.);
  r=U(r,dates(b),6.);
  r=U(r,glass(L(p,GL,0.)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return lanternT(L(p,LN,.35),LS);
  if(id==4.) return .95;
  if(id==5.){ vec3 q=L(p,BW,0.); if(abs(q.y-.02)<.002) return .35; return .6; }
  if(id==6.) return .28+.1*fbm(p.xz*200.);
  if(id==7.){ vec3 q=L(p,GL,0.); if(abs(q.y-.07)<.0015) return .45; return .9; }
  return .7; }
