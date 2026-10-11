/* Skateboarding Unit 2 "Safe and Steady" — pencil still life: a vented skate helmet with its chin
   strap and buckle lying open in front, a knee pad and a smaller elbow pad. Objects only. */
#define CAM_POS vec3(-0.3693,0.2533,-0.6985)
#define CAM_TGT vec3(-0.1077,-0.0229,0.0113)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sktparts_a.glsl"
vec3 helQ(vec3 p){ return sk_place(p,vec3(-.04,0.,.06),.45); }
vec3 kneeQ(vec3 p){ return sk_place(p,vec3(.24,0.,.1),-.5); }
vec3 elbQ(vec3 p){ return sk_place(p,vec3(.2,0.,-.19),.9); }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,sk_helmetD(helQ(p)),3.);
  r=U(r,sk_strapD(helQ(p)),4.);
  r=U(r,sk_padD(kneeQ(p),1.),5.);
  r=U(r,sk_padD(elbQ(p),.75),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return sk_helmetT(helQ(p));
  if(id==4.) return sk_strapT(helQ(p));
  if(id==5.) return sk_padT(kneeQ(p),1.);
  if(id==6.) return sk_padT(elbQ(p),.75);
  return .7; }
