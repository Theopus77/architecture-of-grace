/* WCS Unit 6 "How Countries Are Governed" — a wooden ballot box with a slot in its lid and a
   folded ballot going in, two more ballots with tick boxes on the table and a pencil. */
#define CAM_POS vec3(-0.3090,0.3939,-0.8361)
#define CAM_TGT vec3(-0.1704,-0.0524,0.0939)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define BB vec3(0.,0.,.06)
float box(vec3 p){ vec3 q=p-BB;
  float d=sdRBox(q-vec3(0.,.085,0.),vec3(.1,.085,.08),.005);
  d=min(d,sdRBox(q-vec3(0.,.172,0.),vec3(.108,.007,.088),.003));
  d=max(d,-sdBox(q-vec3(0.,.18,0.),vec3(.045,.02,.005)));
  d=min(d,sdRBox(q-vec3(.0,.09,-.081),vec3(.02,.014,.003),.001));      /* lock plate */
  return d; }
float ballot(vec3 p){ vec3 q=p-BB-vec3(0.,.21,0.); q.xy=rot(.15)*q.xy; return sdRBox(q,vec3(.035,.04,.0015),.0005); }
float papers(vec3 p){ vec3 q=p-vec3(.23,.002,-.08); q.xz=rot(.35)*q.xz; float d=sdRBox(q,vec3(.05,.0015,.07),.0005);
  q=p-vec3(.17,.006,-.13); q.xz=rot(-.25)*q.xz; d=min(d,sdRBox(q,vec3(.05,.0015,.07),.0005)); return d; }
float pencil(vec3 p){ vec3 q=p-vec3(.25,.008,-.2); q.xz=rot(-.1)*q.xz; float R=.0065;
  float b=max(length(q.yz)-R,abs(q.x)-.09); float t=clamp((q.x-.09)/.025,0.,1.);
  float c=max(length(q.yz)-R*(1.-t),max(.09-q.x,q.x-.115)); return min(b,c); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,box(p),3.);
  r=U(r,ballot(p),4.);
  r=U(r,papers(p),5.);
  r=U(r,pencil(p),6.);
  return r; }
float tick(vec2 u){ /* hint-lines and three tick boxes on a ballot */
  float a=.92; for(int i=0;i<3;i++){ vec2 v=u-vec2(-.028,.035-float(i)*.03); float bx=max(abs(v.x),abs(v.y))-.007;
    if(abs(bx)<.0012) a=.25; if(abs(v.y)<.0012&&v.x>.013&&v.x<.07) a=.6; }
  vec2 v=u-vec2(-.028,.005); if(sdSeg2(v,vec2(-.005,0.),vec2(-.001,-.005))<.0013||sdSeg2(v,vec2(-.001,-.005),vec2(.007,.007))<.0013) a=.15;
  return a; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BB; if(q.y>.165) return .45; if(abs(q.y-.09)<.014&&abs(q.x)<.02&&q.z<-.078) return .3; return .55+.12*grain(p,45.); }
  if(id==4.) return .92;
  if(id==5.){ vec3 q=p-vec3(.23,.002,-.08); q.xz=rot(.35)*q.xz; if(p.y>.004){ q=p-vec3(.17,.006,-.13); q.xz=rot(-.25)*q.xz; } return tick(q.xz); }
  if(id==6.){ vec3 q=p-vec3(.25,.008,-.2); q.xz=rot(-.1)*q.xz; if(q.x>.09) return q.x>.108?.12:.85; return .5; }
  return .7; }
