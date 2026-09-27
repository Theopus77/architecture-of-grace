/* FCS Unit 1 "Clean Hands" — pencil still life: a pump bottle of hand soap, a bar of soap on a
   ridged dish with a few bubbles, and a folded hand towel. */
#define CAM_POS vec3(-0.6014,0.4315,-0.9981)
#define CAM_TGT vec3(-0.2924,0.0112,0.1519)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define PB vec3(.02,0.,.03)
float pump(vec3 p){ vec3 q=p-PB;
  float body=sdRBox(q-vec3(0.,.1,0.),vec3(.055,.1,.04),.022);
  float shoulder=sdCone(q-vec3(0.,.212,0.),.034,.02,.016);
  float collar=sdCylY(q-vec3(0.,.235,0.),.022,.012)-.002;
  float stem=sdCylY(q-vec3(0.,.262,0.),.006,.022);
  vec3 h=q-vec3(-.02,.29,0.); float head=sdRBox(h,vec3(.03,.012,.014),.008);
  float spout=sdCapsule(q,vec3(-.04,.294,0.),vec3(-.075,.286,0.),.0055);
  return min(min(min(body,shoulder),min(collar,stem)),min(head,spout)); }
float dish(vec3 p){ vec3 q=p-vec3(-.17,0.,-.02); q.xz=rot(.15)*q.xz;
  float d=sdRBox(q-vec3(0.,.012,0.),vec3(.085,.012,.055),.01);
  d=max(d,-sdRBox(q-vec3(0.,.024,0.),vec3(.074,.008,.044),.008));
  float ridges=max(sdRBox(q-vec3(0.,.012,0.),vec3(.072,.006,.042),.003),abs(fract(q.x/.018)-.5)*.018-.003);
  return min(d,ridges); }
float soap(vec3 p){ vec3 q=p-vec3(-.17,.037,-.02); q.xz=rot(.1)*q.xz; return sdRBox(q,vec3(.058,.018,.035),.015)+.0008*sin(q.x*200.); }
float bubbles(vec3 p){ float d=length(p-vec3(-.13,.066,-.035))-.012; d=min(d,length(p-vec3(-.105,.058,-.02))-.008);
  d=min(d,length(p-vec3(-.2,.06,-.04))-.007); return d; }
float towel(vec3 p){ vec3 q=p-vec3(.19,.0,.04); q.xz=rot(-.3)*q.xz;
  float a=sdRBox(q-vec3(0.,.012,0.),vec3(.1,.012,.07),.01);
  float b=sdRBox(q-vec3(-.01,.035,0.),vec3(.09,.011,.07),.01);
  float c=sdRBox(q-vec3(.0,.057,-.005),vec3(.075,.01,.066),.01);
  return min(min(a,b),c); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pump(p),3.);
  r=U(r,dish(p),4.);
  r=U(r,soap(p),5.);
  r=U(r,bubbles(p),6.);
  r=U(r,towel(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-PB; if(q.y>.215) return .3;                 /* dark pump head */
    if(q.z<-.03&&abs(q.x)<.035&&q.y>.07&&q.y<.15){ if(abs(q.y-.13)<.004||abs(q.y-.085)<.004) return .35;
      if(q.y>.1&&q.y<.118&&abs(q.x)<.025) return .45; return .85; }   /* a label with a little drop */
    return q.y<.16?.6:.7; }                                      /* soap seen through the bottle */
  if(id==4.) return .55;
  if(id==5.) return .82;
  if(id==6.) return .95;
  if(id==7.){ vec3 q=p-vec3(.19,.0,.04); q.xz=rot(-.3)*q.xz; if(abs(q.x-.06)<.006||abs(q.x-.075)<.003) return .4; return .72; }
  return .7; }
