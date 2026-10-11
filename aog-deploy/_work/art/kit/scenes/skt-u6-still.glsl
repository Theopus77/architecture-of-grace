/* Skateboarding Unit 6 "First Tricks" — pencil still life: a small plywood quarterpipe with a steel
   coping pipe and a deck on top, and a skateboard rolling up its curved transition (kickturns, dropping
   in and carving all happen here), with a training cone on the floor. Objects only. */
#define CAM_POS vec3(-0.9843,0.6783,-1.6662)
#define CAM_TGT vec3(-0.2759,0.0125,0.1048)
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
#define RR .6
#define RH .36
#define RXT .5499
#define RW .34
/* the ramp frame: the transition starts at x=0 and rises toward +x */
vec3 rampQ(vec3 p){ return sk_place(p,vec3(.02,0.,.12),-.42); }
float rampD(vec3 p){ vec3 q=rampQ(p);
  float box=sdRBox(q-vec3((RXT+.22)*.5,RH*.5,0.),vec3((RXT+.22)*.5,RH*.5,RW),.003);
  float cyl=RR-length(q.xy-vec2(0.,RR));
  return max(box,cyl); }
float copingD(vec3 p){ vec3 q=rampQ(p); return sdCylZ(q-vec3(RXT,RH+.004,0.),.012,RW+.004); }
float rampT(vec3 p){ vec3 q=rampQ(p);
  if(abs(q.z)>RW-.003){ float f=fract(q.y/.012); return (q.x>RXT-.01)?(f<.12?.5:.72):(.7+.15*(grain(q.zxy,50.)-.5)); }  /* plywood side */
  if(q.y>RH-.004&&q.x>RXT) return fract((q.z+RW)/.1)<.025?.4:.76;                       /* deck boards */
  float s=atan(q.x,RR-q.y)*RR; if(fract(s/.12)<.02) return .45;                        /* transition sheets */
  if(fract(s/.06+.5)<.03&&abs(abs(q.z)-.2)<.004) return .4;                             /* screw lines */
  return .82; }
/* the skateboard, nose up the transition: rear wheels on the floor, front wheels on the curve */
#define BTH .1884
vec3 boardQ(vec3 p){ vec3 q=rampQ(p)-vec3(.0902,.0389,-.04); q.xy=rot(BTH)*q.xy; return q; }
vec3 coneQ(vec3 p){ return (p-vec3(-.42,0.,.05))/.6; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,rampD(p),3.);
  r=U(r,copingD(p),4.);
  vec3 b=boardQ(p);
  r=U(r,sk_deckD(b),5.);
  r=U(r,sk_trucksD(b),6.);
  r=U(r,sk_wheelsD(b),7.);
  r=U(r,o_cone(coneQ(p),0.)*.6,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return rampT(p);
  if(id==4.) return .55+.3*step(.5,fract(rampQ(p).z*30.))*0.;
  vec3 b=boardQ(p);
  if(id==5.) return sk_deckT(b);
  if(id==6.) return sk_trucksT(b);
  if(id==7.) return sk_wheelsT(b);
  if(id==8.) return t_cone(coneQ(p),0.);
  return .7; }
