/* Economics Unit 12 "Supply, Demand and the Market" — pencil still life: a small chalkboard
   on an easel with a supply-and-demand graph (two crossing lines), and a crate of apples. */
#define CAM_POS vec3(-0.4649,0.2730,-0.9077)
#define CAM_TGT vec3(-0.3309,0.0376,0.1004)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define EC vec3(.1,0.,.2)
vec3 eq(vec3 p){ vec3 q=p-EC; q.xz=rot(-.2)*q.xz; return q; }
vec2 easel(vec3 p){
  vec3 q=eq(p);
  vec3 b=q-vec3(0.,.17,-.02); b.yz=rot(-.18)*b.yz;
  float frame=sdRBox(b,vec3(.12,.09,.008),.003);
  float board=sdBox(b-vec3(0.,0.,-.004),vec3(.108,.078,.006));
  frame=max(frame,-board);
  float legs=1e5;
  for(int i=0;i<2;i++){ float s=float(i)*2.-1.; legs=min(legs,sdCapsule(q,vec3(s*.1,0.,-.045),vec3(s*.085,.27,-.01),.006)); }
  legs=min(legs,sdCapsule(q,vec3(0.,0.,.09),vec3(0.,.25,.01),.005));
  float ledge=sdRBox(q-vec3(0.,.075,-.045),vec3(.11,.004,.012),.002);
  return vec2(min(frame,min(legs,ledge)),board); }
vec3 kq(vec3 p){ vec3 q=p-vec3(-.19,0.,.02); q.xz=rot(.3)*q.xz; return q; }
vec2 crate(vec3 p){
  vec3 q=kq(p);
  float c=crateD(q,vec3(.075,.04,.055));
  float ap=1e5;
  for(int i=0;i<3;i++) for(int j=0;j<2;j++){ ap=min(ap,length((q-vec3(-.045+float(i)*.045,.085,-.022+float(j)*.044))*vec3(1.,1.1,1.))-.024); }
  ap=min(ap,length(q-vec3(-.02,.11,0.))-.024);
  return vec2(c,ap); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 e=easel(p); r=U(r,e.x,3.); r=U(r,e.y,4.);
  vec2 c=crate(p); r=U(r,c.x,5.); r=U(r,c.y,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .55+.1*grain(eq(p).zxy,40.);
  if(id==4.){ vec3 q=eq(p); vec3 b=q-vec3(0.,.17,-.02); b.yz=rot(-.18)*b.yz; vec2 u=b.xy;
    float ax=min(max(abs(u.x+.08)-.0015,abs(u.y+.005)-.065),max(abs(u.y+.065)-.0015,abs(u.x-.005)-.085));
    float sup=max(abs(u.y-(u.x*.6))-.002,abs(u.x)-.065);
    float dem=max(abs(u.y+(u.x*.6))-.002,abs(u.x)-.065);
    if(ax<0.||sup<0.||dem<0.) return .88;
    if(length(u)<.006) return .95;
    return .18; }
  if(id==5.){ vec3 q=kq(p); if(abs(fract(q.y/.027)-.5)>.45) return .25; return .6; }
  if(id==6.) return .45;
  return .7; }
