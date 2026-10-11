/* Skateboarding Unit 3 "Push, Roll, Stop" — pencil still life: a canvas skate shoe (the pushing foot
   and the foot brake), a small wooden slope with a loose urethane wheel rolling off its foot, and an
   orange-style training cone for turning. Objects only. */
#define CAM_POS vec3(-0.4855,0.2909,-0.6263)
#define CAM_TGT vec3(-0.2261,0.0245,0.0774)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sptmar.glsl"
#include "sktparts_a.glsl"
vec3 shoeQ(vec3 p){ return sk_place(p,vec3(.06,0.,-.06),-.5); }
/* the little slope: a wooden wedge rising toward +x, with a lip strip at its foot */
vec3 slopeQ(vec3 p){ return sk_place(p,vec3(-.08,0.,.17),-.15); }
float slopeD(vec3 p){ vec3 q=slopeQ(p);
  float w=sdRBox(q-vec3(0.,.04,0.),vec3(.13,.04,.07),.004);
  float cut=dot(q-vec3(-.13,.0,0.),normalize(vec3(-.08,.26,0.)));            /* the ramp face */
  return max(w,cut); }
float slopeT(vec3 p){ vec3 q=slopeQ(p);
  if(abs(q.z)>.066) return .62+.15*(grain(q.zyx,90.)-.5);                     /* side: end grain */
  if(q.x>.125) return .6;
  float f=fract((q.x+.13)/.043); if(f<.04) return .4;                            /* plank seams */
  return .72+.15*(grain(vec3(q.z,q.y,q.x),60.)-.5); }
vec3 wheelQ(vec3 p){ return sk_place(p,vec3(-.27,0.,.08),-.5); }
vec3 coneQ(vec3 p){ return (p-vec3(.33,0.,.1))/.7; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec3 s=shoeQ(p);
  r=U(r,sk_shoeSoleD(s),3.);
  r=U(r,sk_shoeUpperD(s),4.);
  r=U(r,slopeD(p),5.);
  r=U(r,sk_looseWheelD(wheelQ(p)),6.);
  r=U(r,o_cone(coneQ(p),0.)*.7,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  vec3 s=shoeQ(p);
  if(id==3.) return sk_shoeSoleT(s);
  if(id==4.) return sk_shoeUpperT(s);
  if(id==5.) return slopeT(p);
  if(id==6.) return sk_looseWheelT(wheelQ(p));
  if(id==7.) return t_cone(coneQ(p),0.);
  return .7; }
