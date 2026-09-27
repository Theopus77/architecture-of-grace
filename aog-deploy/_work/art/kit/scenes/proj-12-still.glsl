/* FACS project 12 "Pillow cover with an envelope back" — pencil still life: a plump square
   pillow in a striped cover standing on the table, turned to show its envelope back where the
   two hemmed pieces overlap, with a spool of thread and a pincushion stuck with pins beside it. */
#define CAM_POS vec3(-0.7050,0.6134,-1.1752)
#define CAM_TGT vec3(-0.3399,0.0584,0.1836)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "projparts.glsl"
#define PB vec3(-.01,0.,.07)
#define HS .15
/* pillow-local: x across, y up, z through (the back faces the viewer, -z) */
vec3 pL(vec3 p){ vec3 q=p-PB; q.xz=rot(-.45)*q.xz; q.yz=rot(-.08)*q.yz; q.y-=HS; return q; }
float puff(vec2 u){ vec2 a=clamp(abs(u)/HS,0.,1.); return .068*(1.-a.x*a.x)*(1.-a.y*a.y)+.005; }
float pillow(vec3 p){ vec3 q=pL(p);
  vec2 a=abs(q.xy)/HS; float side=max(abs(q.x)+.016*(1.-a.y*a.y),abs(q.y)+.016*(1.-a.x*a.x))-HS;
  float t=puff(q.xy);
  float lip=q.z<0.&&q.y<.035&&q.y>-.06?.0035*smoothstep(-.06,.03,q.y):0.;   /* the top flap lies over the lower one */
  float d=max(side,abs(q.z)-t-lip);
  return d*.4; }
float spool(vec3 p){ vec3 q=p-vec3(.19,0.,-.07);
  float f1=sdCylY(q-vec3(0.,.004,0.),.024,.004)-.0015, f2=sdCylY(q-vec3(0.,.056,0.),.024,.004)-.0015;
  float core=sdCylY(q-vec3(0.,.03,0.),.019,.024)+.0006*abs(sin(q.y*800.));
  return min(min(f1,f2),core); }
#define CU vec3(.14,0.,-.15)
float cushion(vec3 p){ vec3 q=p-CU; float a=atan(q.z,q.x);
  float d=sdEll(q-vec3(0.,.026,0.),vec3(.036,.028,.036))+.002*abs(sin(a*4.));
  float base=sdCylY(q-vec3(0.,.005,0.),.03,.005)-.002;
  return min(d*.8,base); }
float pins(vec3 p){ vec3 q=p-CU; float d=1e5;
  for(int i=0;i<5;i++){ float fi=float(i); float a=fi*1.3+.5; vec3 dir=normalize(vec3(cos(a)*.6,1.,sin(a)*.6));
    vec3 b=vec3(0.,.026,0.)+dir*.022; d=min(d,sdCapsule(q,b,b+dir*.028,.0009)); d=min(d,length(q-b-dir*.031)-.0042); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pillow(p),3.);
  r=U(r,spool(p),4.);
  r=U(r,cushion(p),5.);
  r=U(r,pins(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=pL(p);
    if(q.z<0.&&abs(q.y-.035)<.0022) return .25;                       /* the overlap edge */
    if(q.z<0.&&(abs(q.y-.043)<.001||abs(q.y+.06)<.001)) return .45;    /* hem stitching */
    return .78-.22*step(.62,fract(q.x/.022)); }                        /* ticking stripes */
  if(id==4.){ vec3 q=p-vec3(.19,0.,-.07); return (q.y>.008&&q.y<.052)?.4:.72; }
  if(id==5.) return .5;
  if(id==6.) return .3;
  return .7; }
