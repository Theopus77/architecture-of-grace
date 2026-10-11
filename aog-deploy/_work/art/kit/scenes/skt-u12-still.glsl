/* skt-u12 "Balance, Turning and Spin" — pencil still life: a painted wooden spinning top standing
   on its steel tip, a skateboard truck with its two wheels lying baseplate-down (how trucks steer),
   and a stick of chalk. Objects only. */
#define CAM_POS vec3(-0.4657,0.2275,-0.7350)
#define CAM_TGT vec3(-0.1444,0.0164,0.0451)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sktparts_b.glsl"
#define TS 1.5
vec3 Qtop(vec3 p){ vec3 q=p-vec3(-.03,0.,.0); q.xy=rot(.1)*q.xy; q.yz=rot(-.06)*q.yz; q.xz=rot(.6)*q.xz; return q/TS; }
vec3 Qtr(vec3 p){ vec3 q=p-vec3(.22,0.,0.); q.xz=rot(1.25)*q.xz; return vec3(q.x,.0702-q.y,-q.z)/1.35; }
vec3 Qcd(vec3 p){ vec3 q=p-vec3(-.12,0.,-.13); q.xz=rot(.3)*q.xz; return q; }
float chalk(vec3 p){ vec3 q=p-vec3(-.02,.0075,-.17); q.xz=rot(-.3)*q.xz; return sdCylX(q,.0075,.04)-.0012; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,sb_top(Qtop(p))*TS,3.);
  vec3 t=Qtr(p); r=U(r,sb_truck(t)*1.35,4.);
  r=U(r,sb_wheel(vec3(t.x,t.y,abs(t.z)-.088),.027,.016)*1.35,5.);
  r=U(r,chalk(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return sbt_top(Qtop(p));
  if(id==4.) return sbt_truck(Qtr(p));
  if(id==5.){ vec3 t=Qtr(p); return sbt_wheel(vec3(t.x,t.y,abs(t.z)-.088),.027,.016); }
  if(id==6.) return sbt_cord(Qcd(p));
  if(id==7.) return .95;
  return .7; }
