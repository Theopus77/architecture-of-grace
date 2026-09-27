/* Social Studies Unit 16 "Revolutions and the Modern World" — pencil still life: a toy steam
   locomotive with a tall smokestack and spoked wheels, standing on a short piece of track,
   beside two meshing gears. */
#define CAM_POS vec3(-0.2755,0.1988,-0.6833)
#define CAM_TGT vec3(-0.1745,0.0216,0.0759)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define LC vec3(.08,0.,.12)
vec3 lq(vec3 p){ vec3 q=p-LC; q.xz=rot(-.3)*q.xz; return q; }
float wheelZ(vec3 c,float R){ /* spoked wheel, axis z */
  float tire=max(abs(length(c.xy)-R+.003)-.004,abs(c.z)-.005);
  float hub=sdCylZ(c,.007,.006);
  float a=atan(c.y,c.x); float sp=abs(fract(a/6.2832*8.)-.5)*6.2832/8.*length(c.xy)-.0022;
  float spokes=max(max(sp,length(c.xy)-R),abs(c.z)-.003);
  return min(min(tire,hub),spokes); }
vec2 loco(vec3 p){
  vec3 q=lq(p);
  float boiler=sdCylX(q-vec3(.02,.085,0.),.034,.085)-.002;
  float front=sdCylX(q-vec3(.108,.085,0.),.036,.004);
  float stack=sdCone(q-vec3(.07,.15,0.),.012,.022,.03)-.001;
  stack=min(stack,sdCylY(q-vec3(.07,.182,0.),.024,.004));
  float dome=length((q-vec3(0.,.118,0.))*vec3(1.,1.2,1.))-.018;
  float cab=sdRBox(q-vec3(-.1,.1,0.),vec3(.035,.06,.042),.003);
  cab=max(cab,-sdBox(q-vec3(-.1,.12,0.),vec3(.02,.018,.06)));               /* windows through the cab */
  float roof=sdRBox(q-vec3(-.1,.162,0.),vec3(.045,.004,.05),.002);
  float frame=sdRBox(q-vec3(0.,.045,0.),vec3(.14,.008,.032),.002);
  float cow=max(max(dot(vec2(q.x-.14,q.y-.04),normalize(vec2(.03,.04))),-(q.y-.018)),max(abs(q.z)-.028,.13-q.x));
  float w=1e5;
  for(int i=0;i<3;i++){ float x=.06-float(i)*.07; float R=i==2?.04:.03;
    for(int s=0;s<2;s++){ float z=s==0?.038:-.038; w=min(w,wheelZ(q-vec3(x,R+.012,z),R)); } }
  float rod=sdRBox(q-vec3(.0,.038,.046),vec3(.075,.003,.002),.001);
  float rails=min(sdRBox(q-vec3(0.,.008,.038),vec3(.24,.004,.004),.001),sdRBox(q-vec3(0.,.008,-.038),vec3(.24,.004,.004),.001));
  float ties=1e5; for(int i=0;i<9;i++){ ties=min(ties,sdRBox(q-vec3(-.2+float(i)*.05,.002,0.),vec3(.009,.002,.06),.001)); }
  float body=min(min(boiler,front),min(stack,dome)); body=min(body,min(min(cab,roof),min(frame,cow)));
  return vec2(body,min(min(w,rod),min(rails,ties))); }
float gear(vec3 c,float R,int n,float th){
  float a=atan(c.y,c.x); float r=length(c.xy);
  float teeth=R+.007*smoothstep(-.2,.2,sin(a*float(n)));
  float g=max(r-teeth,abs(c.z)-th);
  g=max(g,-sdCylZ(c,R*.25,th+.01));
  float holes=max(abs(r-R*.6)-R*.17,abs(c.z)-th-.01); holes=max(holes,(.45-sin(a*5.))*r*.3);
  g=max(g,-holes);
  return g; }
vec3 gq(vec3 p){ vec3 q=p-vec3(-.19,0.,.02); q.xz=rot(.35)*q.xz; return q; }
float gears(vec3 p){
  vec3 q=gq(p);
  float g1=gear(q-vec3(0.,.062,0.),.055,16,.008);
  vec3 c=q-vec3(.085,.036,-.01); c.xy=rot(.2)*c.xy;
  float g2=gear(c,.03,9,.008);
  float stand=sdRBox(q-vec3(0.,.004,0.),vec3(.03,.004,.02),.002);
  stand=min(stand,sdCylZ(q-vec3(0.,.062,.012),.006,.012));
  return min(min(g1,g2),stand); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 l=loco(p); r=U(r,l.x,3.); r=U(r,l.y,4.);
  r=U(r,gears(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=lq(p); if(q.x>-.07&&q.x<.1&&abs(q.y-.085)<.04&&fract((q.x+.07)/.05)<.07) return .7; return .32; }  /* boiler bands */
  if(id==4.) return .4;
  if(id==5.) return .55;
  return .7; }
