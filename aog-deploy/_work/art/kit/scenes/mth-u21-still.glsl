/* Math Unit 21 "Geometry: Similarity, Trigonometry and Circles" — pencil still life: a small
   model flagpole with a pennant on a round base, a round hand mirror lying flat on the table,
   and a set of three similar wooden triangles, small to large, standing in a row. */
#define CAM_POS vec3(-0.3803,0.2233,-0.7434)
#define CAM_TGT vec3(-0.2713,0.0328,0.1092)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float triD(vec3 p,vec3 c,float ry,float s){ vec3 q=p-c; q.xz=rot(ry)*q.xz; q/=s; vec2 u=q.xy;
  /* right triangle: legs along x and y */
  float t=max(max(-u.x,-u.y),dot(u,normalize(vec2(.12,.1)))-.12*.1/length(vec2(.12,.1)));
  return (max(t+.004,abs(q.z)-.01)-.003)*s; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  /* flagpole */
  vec3 f=p-vec3(.2,0.,.16);
  float pole=min(sdCylY(f-vec3(0.,.11,0.),.0045,.11),length(f-vec3(0.,.225,0.))-.009);
  pole=min(pole,sdCylY(f-vec3(0.,.008,0.),.045,.008)-.003);
  r=U(r,pole,3.);
  vec3 g=f-vec3(0.,.19,0.); float w=.004*sin(g.x*60.);
  float flag=max(max(-g.x,abs(g.y)-.03*(1.-g.x/.1)),max(g.x-.1,abs(g.z-w)-.0015));
  r=U(r,flag,4.);
  /* mirror */
  vec3 m=p-vec3(.1,0.,.0); m.xz=rot(.5)*m.xz;
  float mir=sdCylY(m-vec3(0.,.006,0.),.06,.006)-.002;
  float handle=sdRBox(m-vec3(.095,.005,0.),vec3(.04,.005,.011),.004);
  r=U(r,min(mir,handle),5.);
  /* similar triangles */
  r=U(r,triD(p,vec3(-.3,0.,.12),.25,1.5),6.);
  r=U(r,triD(p,vec3(-.1,0.,.1),.25,1.05),7.);
  r=U(r,triD(p,vec3(.03,0.,.07),.25,.7),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.) return .82;
  if(id==5.){ vec3 m=p-vec3(.1,0.,.0); m.xz=rot(.5)*m.xz; if(n.y>.9&&length(m.xz)<.05) return .95; return .35; }
  if(id>=6.) return .6+.08*grain(p,30.);
  return .7; }
