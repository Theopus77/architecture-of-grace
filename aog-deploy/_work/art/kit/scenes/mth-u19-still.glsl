/* Math Unit 19 "Algebra I: Exponents, Polynomials and Quadratics" — pencil still life: five
   stacks of pennies that double each time (1, 2, 4, 8 and 16 coins), in a row that climbs. */
#define CAM_POS vec3(-0.2479,0.1284,-0.4126)
#define CAM_TGT vec3(-0.1831,0.0152,0.0939)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define CT .0075
#define CRAD .03
float stackD(vec3 p,vec3 c,float n){ vec3 q=p-c;
  float k=clamp(floor(q.y/CT),0.,n-1.); vec3 l=q-vec3(.0012*sin(k*2.7),(k+.5)*CT,.0012*cos(k*1.9));
  float d=sdCylY(l,CRAD-.0006,CT*.5-.0004)-.0004;
  return max(d,sdCylY(q-vec3(0.,n*CT*.5,0.),CRAD+.01,n*CT*.5+.002)); }
vec3 sc(int i){ return vec3(-.2+float(i)*.07,0.,.1-float(i)*.012); }
float cnt(int i){ return i==0?1.:i==1?2.:i==2?4.:i==3?8.:16.; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  float d=1e5; for(int i=0;i<5;i++) d=min(d,stackD(p,sc(i),cnt(i)));
  r=U(r,d,3.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ if(n.y>.7){ int i=int(floor((p.x+.235)/.07)); vec2 u=p.xz-sc(i).xz; float r=length(u); if(abs(r-CRAD*.82)<.0012) return .3; return .6; }
    float f=fract(p.y/CT); return f<.14?.22:.55+.1*fract(atan(p.z,p.x)*40.); }
  return .7; }
