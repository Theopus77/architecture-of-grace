/* Room ec6 "The Business Cycle and Fiscal Policy" — pencil still life: a small tabletop
   easel holding a chart of a wave rolling around a rising straight line (peak, trough,
   growth), and in front of it a row of coin stacks that rise and fall like the same wave. */
#define CAM_POS vec3(-0.4700,0.5468,-1.0015)
#define CAM_TGT vec3(-0.3004,-0.0000,0.1384)
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
vec3 eQ(vec3 p){ vec3 q=p-vec3(-.02,0.,.12); q.xz=rot(-.15)*q.xz; return q; }
vec3 bQ(vec3 q){ vec3 b=q-vec3(0.,.035,0.); b.yz=rot(.25)*b.yz; return b; }
float boardD(vec3 b){ return sdRBox(b-vec3(0.,.11,-.008),vec3(.14,.1,.004),.003); }
float easelD(vec3 q){ vec3 b=bQ(q);
  float l1=sdRBox(b-vec3(-.1,.12,0.),vec3(.008,.13,.005),.002), l2=sdRBox(b-vec3(.1,.12,0.),vec3(.008,.13,.005),.002);
  float ledge=sdRBox(b-vec3(0.,.008,-.012),vec3(.15,.005,.012),.002);
  float lip=sdRBox(b-vec3(0.,.014,-.022),vec3(.15,.006,.002),.001);
  float back=sdCapsule(q,vec3(0.,.25,.06),vec3(0.,.0,.14),.005);
  return min(min(l1,l2),min(min(ledge,lip),back)); }
float stacksD(vec3 p){ float d=1e5;
  for(int i=0;i<7;i++){ float fi=float(i); float h=7.+5.*sin(fi*1.05+.3)+fi*.8;
    vec3 c=vec3(-.15+.055*fi,0.,-.06+.008*fi);
    d=min(d,coinStack(p-c,.024,.0055,int(h+.5))); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=eQ(p);
  r=U(r,boardD(bQ(q)),3.);
  r=U(r,easelD(q),4.);
  r=U(r,stacksD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 b=bQ(eQ(p)); vec2 u=b.xy-vec2(0.,.11);
    if(b.z>-.009) return .5;
    if(abs(u.x+.115)<.0015&&u.y>-.08&&u.y<.08) return .2;               /* axes */
    if(abs(u.y+.075)<.0015&&u.x>-.115&&u.x<.12) return .2;
    float trend=-.045+(u.x+.115)*.3;
    if(abs(u.y-trend)<.0014&&u.x>-.11&&u.x<.12&&fract(u.x/.012)<.6) return .35;   /* the dashed straight line */
    float wave=trend+.035*sin((u.x+.115)*52.);
    if(abs(u.y-wave)<.0022&&u.x>-.11&&u.x<.12) return .12;              /* the wave */
    return .94; }
  if(id==4.) return .5+.08*grain(p,70.);
  if(id==5.) return .62;
  return .7; }
