/* Room b12 "6th Grade Review" — pencil still life: a clipboard of graph paper with the two
   axes, a plotted line and points, leaning back; a pocket calculator lying in front; a pencil. */
#define CAM_POS vec3(-0.4734,0.5502,-0.9934)
#define CAM_TGT vec3(-0.3042,0.0056,0.1417)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
vec3 clipQ(vec3 p){ vec3 q=p-vec3(-.06,0.,.1); q.xz=rot(.12)*q.xz; q.yz=rot(.72)*q.yz; return q; }
float boardD(vec3 q){ return sdRBox(q-vec3(0.,.16,0.),vec3(.115,.16,.004),.004); }
float paperD(vec3 q){ return sdBox(q-vec3(0.,.145,-.0048),vec3(.1,.13,.0006)); }
float clipD(vec3 q){ float c=sdRBox(q-vec3(0.,.3,-.008),vec3(.04,.014,.005),.004);
  c=min(c,sdCylX(q-vec3(0.,.312,-.004),.006,.03));
  c=min(c,sdTorus((q-vec3(0.,.322,-.004)).xzy,.012,.002));
  return c; }
vec3 calcQ(vec3 p){ return place(p,vec3(.13,0.,.0),.42)*.8; }
float calcD(vec3 q){
  float b=sdRBox(q-vec3(0.,.009,0.),vec3(.048,.009,.082),.006);
  b=max(b,-sdRBox(q-vec3(0.,.019,.052),vec3(.036,.003,.014),.002));   /* screen well */
  float ix=clamp(floor(q.x/.022+2.),0.,3.), cx=(ix-1.5)*.022;
  float jz=clamp(floor((q.z+.066)/.019+.5),0.,4.), cz=-.066+jz*.019;
  float k=sdRBox(vec3(q.x-cx,q.y-.0195,q.z-cz),vec3(.0078,.0035,.0066),.0028);
  return min(b,k); }
vec3 penQ(vec3 p){ vec3 q=p-vec3(-.06,.0062,-.04); q.xz=rot(-.35)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 c=clipQ(p);
  r=U(r,boardD(c),3.);
  r=U(r,paperD(c),4.);
  r=U(r,clipD(c),5.);
  r=U(r,calcD(calcQ(p))/.8,6.);
  r=U(r,pencilD2(penQ(p),.075),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45+.1*grain(p,50.);
  if(id==4.){ vec3 q=clipQ(p); vec2 u=vec2(q.x,q.y-.14);
    if(abs(u.x)<.0016||abs(u.y)<.0016) return .18;                        /* the axes */
    if(sdSeg2(u,vec2(-.085,-.1),vec2(.085,.1))<.0022) return .22;          /* the line */
    for(int i=0;i<3;i++){ vec2 c=vec2(-.05+.05*float(i),-.059+.059*float(i)); if(length(u-c)<.006) return .12; }
    vec2 g=abs(fract(u/.02+.5)-.5)*.02; if(min(g.x,g.y)<.001) return .6;
    return .95; }
  if(id==5.) return .6;
  if(id==6.){ vec3 q=calcQ(p);
    if(q.z>.036&&q.z<.068&&abs(q.x)<.037&&q.y<.0178&&q.y>.015) return .55;   /* screen */
    if(q.y>.0165&&q.z<.03) return .88;                                        /* keys */
    return .3; }
  if(id==7.) return pencilTone(penQ(p),.075);
  return .7; }
