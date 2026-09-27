/* Economics Unit 3 "Workers, Makers and Markets" — pencil still life: a finished wooden
   birdhouse (something made), a claw hammer and a small pile of nails, and a hanging price
   tag tied to the birdhouse. */
#define CAM_POS vec3(-0.4270,0.2250,-0.7882)
#define CAM_TGT vec3(-0.3099,0.0193,0.0933)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define BC vec3(.1,0.,.15)
vec3 bq(vec3 p){ vec3 q=p-BC; q.xz=rot(-1.9)*q.xz; q=q.zyx; q.z=-q.z; return q; }  /* gable faces the viewer */
vec2 birdhouse(vec3 p){
  vec3 q=bq(p);
  vec2 h=gableHouse(q,vec3(.06,.07,.065),1.1,.018);
  float body=max(h.x,-sdCylZ(q-vec3(0.,.1,-.065),.018,.02));              /* round door */
  float perch=sdCylZ(q-vec3(0.,.07,-.075),.004,.014);
  float base=sdRBox(q-vec3(0.,.004,0.),vec3(.075,.004,.08),.002);
  return vec2(min(min(body,perch),base),h.y); }
vec3 hq(vec3 p){ vec3 q=p-vec3(-.19,.012,-.02); q.xz=rot(.5)*q.xz; return q; }
vec2 hammer(vec3 p){
  vec3 q=hq(p);
  float han=sdCapsule(q,vec3(-.12,0.,0.),vec3(.06,.002,0.),.01);
  vec3 h=q-vec3(.072,.012,0.);
  float head=sdRBox(h-vec3(0.,0.,-.01),vec3(.012,.013,.03),.004);
  float face=sdCylZ(h-vec3(0.,0.,-.045),.012,.01)-.001;
  vec3 c=h-vec3(0.,0.,.03); float claw=max(abs(length(c.zy-vec2(-.0,.02))-.028)-.004,max(abs(c.x)-.01,-c.z));
  claw=max(claw,c.y-.02);
  claw=max(claw,-max(abs(c.x)-.0015,c.z-.035));
  return vec2(han,min(min(head,face),claw)); }
float nails(vec3 p){
  float d=1e5;
  for(int i=0;i<6;i++){ vec2 r=h22(vec2(float(i),5.)); vec3 c=p-vec3(-.02+r.x*.08,.003,-.1+r.y*.05);
    c.xz=rot(r.x*6.)*c.xz; d=min(d,min(sdCapsule(c,vec3(-.025,0.,0.),vec3(.022,0.,0.),.0022),sdCylX(c-vec3(-.025,0.,0.),.005,.0012))); }
  return d; }
vec2 tag(vec3 p){
  vec3 q=bq(p);
  vec3 t=q-vec3(.07,.075,-.07); t.xy=rot(-.2)*t.xy;
  float card=sdRBox(t,vec3(.018,.028,.0012),.001);
  card=max(card,-(length(t.xy-vec2(0.,.02))-.003));
  float str=sdCapsule(q,vec3(.075,.1,-.07),vec3(.06,.138,-.06),.001);
  return vec2(card,str); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 b=birdhouse(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  vec2 h=hammer(p); r=U(r,h.x,5.); r=U(r,h.y,6.);
  r=U(r,nails(p),7.);
  vec2 t=tag(p); r=U(r,t.x,8.); r=U(r,t.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bq(p); if(length(vec2(q.x,q.y-.1))<.02&&q.z<-.06) return .1; return .7+.1*grain(q,40.); }
  if(id==4.) return .4;
  if(id==5.) return .55+.1*grain(hq(p).zyx,50.);
  if(id==6.) return .3;
  if(id==7.) return .4;
  if(id==8.) return .92;
  return .7; }
