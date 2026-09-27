/* Spanish Unit 6 "Soy and Estoy" — pencil still life: a round standing mirror on a wooden foot
   (who I am), a pocket compass lying open (where I am), and a name badge with hint-lines. */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.06,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define MR vec3(.04,0.,.06)
vec3 mq(vec3 p){ vec3 q=p-MR; q.xz=rot(-.3)*q.xz; return q; }
vec2 mirror(vec3 p){ vec3 q=mq(p);
  vec3 f=q-vec3(0.,.17,0.); f.yz=rot(-.12)*f.yz;
  float rim=max(sdTorus(f.xzy,.1,.012),abs(f.z)-.009);
  float disc=sdCylZ(f,.1,.004);
  float back=sdCylZ(f-vec3(0.,0.,.006),.1,.004);
  float pins=min(sdCylX(f-vec3(-.108,0.,0.),.007,.012),sdCylX(f-vec3(.108,0.,0.),.007,.012));
  float yoke=min(sdCapsule(q,vec3(-.118,.17,0.),vec3(-.1,.02,0.),.007),sdCapsule(q,vec3(.118,.17,0.),vec3(.1,.02,0.),.007));
  float foot=sdRBox(q-vec3(0.,.012,0.),vec3(.12,.012,.045),.008);
  float wood=min(min(rim,back),min(pins,min(yoke,foot)));
  return disc<wood?vec2(disc,1.):vec2(wood,0.); }
#define CP vec3(-.17,0.,-.03)
float compass(vec3 p){ vec3 q=p-CP; float c=sdCylY(q-vec3(0.,.01,0.),.045,.009)-.003;
  c=max(c,-sdCylY(q-vec3(0.,.02,0.),.038,.006));
  float face=sdCylY(q-vec3(0.,.012,0.),.038,.002);
  vec3 n=q-vec3(0.,.016,0.); n.xz=rot(.5)*n.xz; float needle=max(sdRBox(n,vec3(.004,.0015,.032),.001),abs(n.x)-.004*(1.-abs(n.z)/.032));
  float bow=sdTorus((q-vec3(0.,.012,.053)).xzy*vec3(1.,1.,1.),.01,.0025);
  return min(min(c,face),min(needle,bow)); }
float badge(vec3 p){ vec3 q=p-vec3(.2,.004,-.06); q.xz=rot(-.25)*q.xz; return sdRBox(q,vec3(.06,.003,.035),.006); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 m=mirror(p); r=U(r,m.x,m.y>.5?4.:3.);
  r=U(r,compass(p),5.);
  r=U(r,badge(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .4+.1*grain(mq(p),40.);
  if(id==4.){ vec3 q=mq(p)-vec3(0.,.17,0.); float s=q.x+q.y*.7; return abs(s+.02)<.012||abs(s-.03)<.006?.97:.62; }  /* glass with two gleams */
  if(id==5.){ vec3 q=p-CP; float r=length(q.xz); if(q.y>.013&&r<.036){ vec2 u=q.xz; u=rot(.5)*u; if(abs(u.x)<.004) return u.y>0.?.1:.8;
      float a=atan(q.z,q.x); if(r>.03&&abs(fract(a/(PI/4.))-.5)>.44) return .2; return .93; } return .45; }
  if(id==6.){ vec3 q=p-vec3(.2,.004,-.06); q.xz=rot(-.25)*q.xz; if(q.y>.001){ if(abs(q.z-.015)<.006&&abs(q.x)<.05) return .3;
      if(abs(q.z+.012)<.003&&abs(q.x)<.035) return .55; } return .9; }
  return .7; }
