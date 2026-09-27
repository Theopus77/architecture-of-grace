/* Economics Unit 1 "Wants, Needs and Choices" — pencil still life: a round loaf of bread
   and a water jug (needs) beside a toy car (a want). */
#define CAM_POS vec3(-0.1528,0.2203,-0.7490)
#define CAM_TGT vec3(-0.0451,0.0313,0.0609)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define LC vec3(-.02,0.,.1)
float loaf(vec3 p){
  vec3 q=p-LC; q.xz=rot(.3)*q.xz;
  float d=length((q-vec3(0.,.02,0.))*vec3(1.,1.45,1.25))-.1; d*=.6;
  d=max(d,-q.y);
  /* three scored cuts across the top */
  float cut=abs(fract((q.x+.045)/.045)-.5)*.045-.003; cut=max(cut,abs(q.x)-.07);
  d=max(d,-max(cut,.055-q.y));
  return d; }
#define JC vec3(.2,0.,.2)
vec2 jug(vec3 p){
  vec3 q=p-JC; float y=q.y; float t=clamp(y/.2,0.,1.);
  float R=.055+.015*sin(t*3.)-.03*smoothstep(.65,.9,t)+.006*smoothstep(.93,1.,t);
  float d=(length(q.xz)-R)*.8; d=max(d,max(-y,y-.2));
  d=max(d,-sdCylY(q-vec3(0.,.2,0.),.022,.02));
  float lip=sdTorus(q-vec3(0.,.2,0.),.028,.004);
  vec3 s=q-vec3(-.03,.19,0.); float spout=max(length(s.xz*vec2(.7,1.))-.012,abs(s.y)-.012)-.002;
  float h=sdTorus((q-vec3(.058,.12,0.)).xzy,.035,.006); h=max(h,-(q.x-.055));
  return vec2(min(min(d,lip),spout),h); }
vec3 cq(vec3 p){ vec3 q=p-vec3(.38,0.,.02); q.xz=rot(-.55)*q.xz; return q; }
vec2 car(vec3 p){
  vec3 q=cq(p);
  float body=sdRBox(q-vec3(0.,.035,0.),vec3(.08,.015,.035),.012);
  float cab=sdRBox(q-vec3(-.01,.062,0.),vec3(.042,.018,.03),.012);
  body=smin(body,cab,.008);
  float w=1e5;
  for(int i=0;i<4;i++){ vec3 c=q-vec3(i<2?.05:-.05,.02,(i%2==0)?.036:-.036); w=min(w,sdCylZ(c,.02,.008)-.002); }
  return vec2(body,w); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,loaf(p),3.);
  vec2 j=jug(p); r=U(r,j.x,4.); r=U(r,j.y,4.);
  vec2 c=car(p); r=U(r,c.x,5.); r=U(r,c.y,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-LC; q.xz=rot(.3)*q.xz; float cut=abs(fract((q.x+.045)/.045)-.5)*.045; if(cut<.006&&q.y>.05&&abs(q.x)<.07) return .85; return .5+.08*fbm3(q*70.); }
  if(id==4.){ vec3 q=p-JC; if(abs(q.y-.08)<.003||abs(q.y-.1)<.002) return .35; return .7; }
  if(id==5.){ vec3 q=cq(p); if(q.y>.05&&abs(n.y)<.6) return .25; return .45; }    /* windows */
  if(id==6.){ vec3 q=cq(p); vec2 u=vec2(q.x-(q.x>0.?.05:-.05),q.y-.02); return length(u)<.009?.75:.2; }
  return .7; }
