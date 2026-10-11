/* skt-u10 "Street, Video and the World Stage" — pencil still life: a home video camcorder, two VHS
   tapes (one in its sleeve) and a bare popsicle deck lying behind them. Objects only. */
#define CAM_POS vec3(-0.6929,0.4390,-0.9253)
#define CAM_TGT vec3(-0.3296,-0.0452,0.1038)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sktparts_b.glsl"
vec3 Qc(vec3 p){ vec3 q=p-vec3(-.04,0.,-.03); q.xz=rot(.25)*q.xz; return q; }
vec3 Qd(vec3 p){ vec3 q=p-vec3(-.02,0.,.17); q.xz=rot(-.5)*q.xz; return q; }
vec3 Qv1(vec3 p){ vec3 q=p-vec3(.16,0.,-.15); q.xz=rot(.3)*q.xz; return q; }
vec3 Qv2(vec3 p){ vec3 q=p-vec3(.165,.029,-.155); q.xz=rot(.12)*q.xz; return q; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,sb_camcorder(Qc(p)),3.);
  r=U(r,sb_deck(Qd(p),.4,.1,1.),4.);
  r=U(r,sb_vhs(Qv1(p),1.),5.);
  r=U(r,sb_vhs(Qv2(p),0.),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return sbt_camcorder(Qc(p));
  if(id==4.) return sbt_deck(Qd(p),.4,.1,1.,0.);
  if(id==5.) return sbt_vhs(Qv1(p),1.);
  if(id==6.) return sbt_vhs(Qv2(p),0.);
  return .7; }
