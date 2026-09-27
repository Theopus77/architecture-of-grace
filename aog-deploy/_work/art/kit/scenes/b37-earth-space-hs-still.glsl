/* Practice room "Earth and Space" — pencil still life: a drawing board propped up with two pins
   and a loop of string, a pencil tracing an ellipse around them (an orbit and its two foci),
   and a layered rock in front (Earth's layers of time). */
#define CAM_POS vec3(-0.3852,0.3868,-0.7815)
#define CAM_TGT vec3(-0.2521,-0.0417,0.1113)
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
#define BRD vec3(.02,.095,.08)
#define EA .095
#define EB .062
#define EC .0719
#define PT vec2(EA*cos(1.),EB*sin(1.))
#define ROCK vec3(-.16,0.,-.07)
/* board space: x across, y up the board, z out of the board toward us (-z world) */
vec3 bQ(vec3 p){ vec3 q=p-BRD; q.xz=rot(-.25)*q.xz; q.yz=rot(-.42)*q.yz; q.z=-q.z; return q; }
float boardD(vec3 q){ return sdRBox(q+vec3(0.,0.,.007),vec3(.15,.1,.007),.003); }
float legD(vec3 p){ vec3 q=p-BRD; q.xz=rot(-.25)*q.xz; return sdCapsule(q,vec3(0.,.06,.02),vec3(0.,-.095,.1),.006); }
float pinsD(vec3 q){ float d=1e3; for(int i=0;i<2;i++){ vec3 c=q-vec3(i==0?-EC:EC,0.,0.);
    d=min(d,sdCylZ(c-vec3(0.,0.,.008),.0015,.008)); d=min(d,sdCylZ(c-vec3(0.,0.,.02),.006,.004)-.001); d=min(d,length(c-vec3(0.,0.,.028))-.005); } return d; }
float penD(vec3 q){ vec3 c=q-vec3(PT,0.); c=vec3(.076-c.z,c.y,c.x); c.xy=rot(.25)*c.xy; return pencilD2(c,.05); }
float rockD(vec3 p){ vec3 q=place(p,ROCK,.5); float d=sdRBox(q-vec3(0.,.035,0.),vec3(.065,.035,.045),.01);
  d=max(d,dot(q-vec3(.03,.055,0.),normalize(vec3(.8,1.,-.3))));
  d=max(d,dot(q-vec3(-.04,.06,-.01),normalize(vec3(-.7,1.,-.5))));
  d=max(d,dot(q-vec3(0.,.02,-.035),normalize(vec3(.2,.3,-1.))));
  d+=.008*fbm(q.xz*25.+q.y*18.)+.002*fbm(q.xy*120.); return d*.8; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 b=bQ(p);
  r=U(r,boardD(b),3.);
  r=U(r,legD(p),3.);
  r=U(r,pinsD(b),4.);
  r=U(r,penD(b),5.);
  r=U(r,rockD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bQ(p); if(q.z<-.001) return .6;
    vec2 u=q.xy; float e=length(u/vec2(EA,EB))-1.; float ed=abs(e)*EB;
    float a=atan(u.y/EB,u.x/EA);
    if(ed<.0014&&(a<1.||a>1.9)) return .22;                              /* the ellipse drawn so far */
    if(ed<.0008) return .6;                                              /* the rest, faint */
    float s=min(sdSeg2(u,vec2(-EC,0.),PT),sdSeg2(u,vec2(EC,0.),PT)); s=min(s,sdSeg2(u,vec2(-EC,0.),vec2(EC,0.)));
    if(s<.0009) return .3;                                              /* the string */
    if(length(u)<.003) return .5;                                        /* the centre, a dot */
    return .9; }
  if(id==4.) return .35;
  if(id==5.){ vec3 q=bQ(p)-vec3(PT,0.); vec3 c=vec3(.076-q.z,q.y,q.x); c.xy=rot(.25)*c.xy; return pencilTone(c,.05); }
  if(id==6.){ vec3 q=place(p,ROCK,.5); float y=q.y+.25*q.x+.004*sin(q.x*40.)+.004*fbm(q.xz*30.);
    float b=fract(y/.013); return (b<.2?.35:b<.55?.62:.78)+.08*fbm(q.xz*90.); }
  return .7; }
