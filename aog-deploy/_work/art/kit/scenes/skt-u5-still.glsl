/* Skateboarding Unit 5 "Forces on Four Wheels" — pencil still life: a turned wooden bowl with a glass
   marble resting high on its inside wall (the marble in the bowl: energy stored in height), a stopwatch
   and a tape measure with its blade pulled out. Objects only. */
#define CAM_POS vec3(-0.3370,0.2729,-0.6083)
#define CAM_TGT vec3(-0.1185,-0.0330,0.0107)
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
#define BOWL vec3(0.,0.,.04)
#define BC vec3(0.,.175,0.)
float bowlD(vec3 p){ vec3 q=p-BOWL;
  float d=abs(length(q-BC)-.168)-.007; d=max(d,q.y-.085);
  d=max(d,-q.y);
  float rim=sdTorus(q-vec3(0.,.085,0.),length(vec2(.168,0.))*0.+sqrt(.168*.168-.09*.09),.0075);
  float foot=max(sdCylY(q-vec3(0.,.005,0.),.055,.005)-.002,-sdCylY(q-vec3(0.,.005,0.),.045,.01));
  return min(min(d,rim),foot); }
float bowlT(vec3 p){ vec3 q=p-BOWL; float r=length(q-BC);
  if(q.y>.078) return .6;                                            /* rim */
  if(r<.168) return .78+.14*(grain(vec3(q.x,q.y,q.z*3.)*.5+vec3(length(q.xz)*4.),40.)-.5);  /* inside */
  return .62+.16*(sin(q.y*700.+fbm(q.xz*30.)*4.)*.5); }             /* turned rings outside */
vec3 marbleC(){ vec3 dir=normalize(vec3(.35,-.75,.5)); return BOWL+BC+dir*(.161-.018); }
float marbleD(vec3 p){ return length(p-marbleC())-.018; }
float marbleT(vec3 p){ vec3 v=normalize(p-marbleC()); float s=sin(atan(v.z,v.x)*3.+v.y*5.);
  if(dot(v,normalize(vec3(-.6,.7,-.4)))>.86) return .97; return abs(s)<.25?.35:.8; }
vec3 swQ(vec3 p){ return sk_place(p,vec3(.2,0.,-.14),.8)/1.4; }
vec3 tpQ(vec3 p){ return sk_place(p,vec3(-.16,0.,-.13),.35)/1.0; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,bowlD(p),3.);
  r=U(r,marbleD(p),4.);
  r=U(r,o_stopwatch(swQ(p),0.)*1.4,5.);
  r=U(r,o_tape(tpQ(p),0.)*1.0,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return bowlT(p);
  if(id==4.) return marbleT(p);
  if(id==5.) return t_stopwatch(swQ(p),0.);
  if(id==6.) return t_tape(tpQ(p),0.);
  return .7; }
