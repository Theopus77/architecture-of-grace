/* Skateboarding Unit 4 "From Clay Wheels to Urethane" — pencil still life: an old strap-on roller skate
   with a steel plate, toe clamps and four narrow steel wheels, a rough wooden plank behind it (the first
   home-made boards), and in front a narrow old clay wheel beside a wide modern urethane wheel. */
#define CAM_POS vec3(-0.3148,0.2137,-0.5184)
#define CAM_TGT vec3(-0.1261,-0.0316,0.0162)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sktparts_a.glsl"
vec3 skQ(vec3 p){ return sk_place(p,vec3(0.,0.,-.02),-.35); }
vec3 plQ(vec3 p){ return sk_place(p,vec3(.2,0.,.24),-1.2); }
vec3 cwQ(vec3 p){ return sk_place(p,vec3(-.06,0.,-.17),.35); }
vec3 uwQ(vec3 p){ return sk_place(p,vec3(.03,0.,-.19),.2); }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec3 s=skQ(p);
  r=U(r,sk_rskateD(s),3.);
  r=U(r,sk_rskateWheelsD(s),4.);
  r=U(r,sk_rskateStrapD(s),5.);
  r=U(r,sk_plankD(plQ(p)),6.);
  r=U(r,sk_clayWheelD(cwQ(p)),7.);
  r=U(r,sk_looseWheelD(uwQ(p)),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  vec3 s=skQ(p);
  if(id==3.) return sk_rskateT(s);
  if(id==4.) return sk_rskateWheelsT(s);
  if(id==5.) return sk_rskateStrapT(s);
  if(id==6.) return sk_plankT(plQ(p));
  if(id==7.) return sk_clayWheelT(cwQ(p));
  if(id==8.) return sk_looseWheelT(uwQ(p));
  return .7; }
