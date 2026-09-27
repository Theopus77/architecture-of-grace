/* Room "Chemistry: Atoms, Bonding, Reactions" — pencil still life: a ball-and-stick model of
   methane standing on three of its atoms, a smaller water molecule beside it, and a conical
   lab flask half full. */
#define CAM_POS vec3(-0.3454,0.2550,-0.6031)
#define CAM_TGT vec3(-0.1363,0.0087,0.0540)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define FL vec3(.1,0.,.1)
#define BL .075
#define HR .02
/* methane: carbon in the centre, one H straight up, three below on the table */
vec3 mC(){ return vec3(-.05,HR+BL*.333,-.02); }
vec3 mH(int i){ if(i==0) return mC()+vec3(0.,BL,0.);
  float a=float(i)*2.0944+.4; return mC()+BL*vec3(.9428*cos(a),-.3333,.9428*sin(a)); }
float atomsD(vec3 p,out float isC){ float c=length(p-mC())-.033; float h=1e5;
  for(int i=0;i<4;i++) h=min(h,length(p-mH(i))-HR);
  /* water */
  vec3 o=vec3(.09,.026,-.12); float w=length(p-o)-.026;
  vec3 h1=o+vec3(-.042,.02,-.02), h2=o+vec3(.045,.02,.0);
  float wh=min(length(p-h1)-.017,length(p-h2)-.017);
  isC=min(c,w)<min(h,wh)?1.:0.;
  return min(min(c,h),min(w,wh)); }
float sticksD(vec3 p){ float d=1e5; for(int i=0;i<4;i++) d=min(d,sdCapsule(p,mC(),mH(i),.0055));
  vec3 o=vec3(.09,.026,-.12); d=min(d,sdCapsule(p,o,o+vec3(-.042,.02,-.02),.005)); d=min(d,sdCapsule(p,o,o+vec3(.045,.02,.0),.005));
  return d; }
float flaskD(vec3 p){ vec3 q=p-FL;
  float body=sdCone(q-vec3(0.,.055,0.),.075,.02,.055)-.005;
  float neck=sdCylY(q-vec3(0.,.13,0.),.018,.03)-.001;
  float lip=sdTorus(q-vec3(0.,.16,0.),.019,.003);
  float d=min(smin(body,neck,.01),lip);
  d=max(d,-sdCylY(q-vec3(0.,.14,0.),.014,.03));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  float ic; float a=atomsD(p,ic);
  r=U(r,a,ic>.5?3.:4.);
  r=U(r,sticksD(p),5.);
  r=U(r,flaskD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .3;
  if(id==4.) return .88;
  if(id==5.) return .6;
  if(id==6.){ vec3 q=p-FL; if(q.y<.05) return .45+.05*sin(q.y*300.); if(abs(q.y-.05)<.003) return .25;
    if(q.y>.07&&q.y<.1&&abs(atan(q.z,q.x)+1.9)<.35) return fract(q.y/.01)<.2?.4:.9; return .9; }
  return .7; }
