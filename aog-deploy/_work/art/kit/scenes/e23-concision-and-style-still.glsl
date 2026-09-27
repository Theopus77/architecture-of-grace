/* Practice room "Concision and Style" — pencil still life: a pair of scissors lying open, a
   strip of writing (hint-lines) cut in two with a short piece snipped out, and a crumpled ball
   of paper (the words that were cut). */
#define CAM_POS vec3(-0.2348,0.2672,-0.6146)
#define CAM_TGT vec3(-0.1311,-0.0667,0.0811)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define BALL vec3(.03,.05,.06)
#define SC vec3(.1,.006,-.09)
#define STRIP vec3(-.13,.0,-.03)
float ballD(vec3 p){ vec3 q=p-BALL; float d=length(q)-.05;
  vec3 v=q*38.; float c=abs(fbm3(v)-.5)*2.; d+=.006*(1.-c)-.004*fbm3(v*2.3); return d*.6; }
/* scissors: two blades crossing at a screw, with finger loops, lying on the table */
float blade(vec3 q,float s){ q.xz=rot(s*.22)*q.xz; float t=clamp(q.x/.12,0.,1.);
  float w=.009*(1.-t)+.0015; float b=max(sdBox(q-vec3(.06,0.,s*w*.0),vec3(.06,.0015,w)),-q.x-.0);
  float arm=sdCapsule(q,vec3(0.),vec3(-.05,0.,s*-.015),.004);
  vec3 l=q-vec3(-.07,0.,s*-.02); float loop=length(vec2(length(l.xz*vec2(.8,1.))-.017,l.y))-.004;
  return min(min(b,arm),loop); }
vec3 scQ(vec3 p){ vec3 q=p-SC; q.xz=rot(2.6)*q.xz; return q; }
float scD(vec3 q){ return min(blade(q-vec3(0.,.001,0.),1.),blade(q+vec3(0.,.0022,0.),-1.)); }
float screwD(vec3 q){ return sdCylY(q,.004,.004); }
vec3 stQ(vec3 p,float k){ vec3 q=p-STRIP; q.xz=rot(.25)*q.xz; q.x-=k; return q; }
float stripD(vec3 p){ vec3 a=stQ(p,-.045); vec3 b=stQ(p,.065); vec3 c=stQ(p,.012); c.xz=rot(.5)*c.xz; c.z+=.035;
  float d=sdBox(a-vec3(0.,.0008,0.),vec3(.04,.0007,.02));
  d=min(d,sdBox(b-vec3(0.,.0008,0.),vec3(.035,.0007,.02)));
  d=min(d,sdBox(c-vec3(0.,.0008,0.),vec3(.016,.0007,.02)));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,ballD(p),3.);
  vec3 s=scQ(p);
  r=U(r,scD(s),4.);
  r=U(r,screwD(s),5.);
  r=U(r,stripD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BALL; float c=abs(fbm3(q*38.)-.5)*2.; return c<.12?.45:.9; }
  if(id==4.){ vec3 q=scQ(p); return q.x<-.01?.35:.75; }
  if(id==5.) return .3;
  if(id==6.){ vec3 q=stQ(p,0.); float l=fract((q.z+.02)/.01); if(q.y>0.&&q.y<.004&&l<.25&&abs(q.z)<.015) return .3; return .93; }
  return .7; }
