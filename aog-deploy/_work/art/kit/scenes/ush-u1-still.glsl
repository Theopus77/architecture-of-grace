/* U.S. History Unit 1 "Early Encounters" (The City of Mounds) — pencil study of Cahokia's
   great mound, framed close: a terraced, flat-topped earthen mound with a long stair up its
   face, a thatched temple on the summit, a timber palisade and two houses at its foot.
   No people. */
#define CAM_POS vec3(-0.7892,0.1459,-1.2503)
#define CAM_TGT vec3(-0.3795,0.0027,0.0916)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.9,.75,.05)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 240
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float frustum(vec3 q,vec2 b,float h,float s,float r){
  float d=max(max(abs(q.x)-(b.x-s*q.y),abs(q.z)-(b.y-s*q.y)),max(-q.y,q.y-h));
  return d*.75-r; }
float mound(vec3 p){
  /* hand-built earth: soft-shouldered terraces, slumped slopes and rain-cut gullies */
  vec3 q=p;
  float t1=frustum(q,vec2(.34,.2),.07,.8,.022);
  float t2=frustum(q-vec3(.05,0.,.05),vec2(.25,.15),.14,.75,.022);
  float t3=frustum(q-vec3(.08,0.,.08),vec2(.17,.1),.19,.8,.02);
  float side=frustum(q-vec3(-.25,0.,-.06),vec2(.08,.1),.1,.8,.02);
  float d=smin(smin(t1,t2,.03),smin(t3,side,.025),.03);
  float ang=atan(q.z-.05,q.x-.05);
  float gully=pow(abs(sin(ang*17.+fbm(q.xz*6.)*9.)),8.)*.007*smoothstep(.35,.7,fbm(q.xz*11.+3.))*smoothstep(.0,.05,q.y)*smoothstep(.2,.1,q.y);
  float e=(fbm(q.xz*14.+q.y*6.)-.5)*.016+(vn(q.xz*70.)-.5)*.0025;
  d=(d+e+gully)*.7;
  /* the long stair up the front: a raised ramp on the face with cut steps */
  vec3 s=q-vec3(.05,0.,-.235);
  float ramp=max(abs(s.x)-.032,max(-s.z,s.z-.15));
  float top=(s.z)*1.05;                           /* slope of the ramp */
  float stepTop=floor(top/.011)*.011+.011;
  float stairs=max(ramp,max(s.y-min(stepTop,.14),-s.y));
  return min(d,stairs*.9); }
float house(vec3 p,vec3 c,float r,float h){
  vec3 q=p-c; float wall=sdCylY(q-vec3(0,h*.3,0),r,h*.3)-.001;
  float roof=sdCone(q-vec3(0,h*.85,0),r*1.3,.002,h*.28)-.001;
  return min(wall,roof); }
float temple(vec3 p){
  vec3 q=p-vec3(.1,.19,.1);
  float wall=sdRBox(q-vec3(0,.025,0),vec3(.05,.025,.035),.002);
  vec3 r=q-vec3(0,.05,0); float roof=max(max(abs(r.z)-.042,dot(vec2(abs(r.x),r.y),normalize(vec2(.62,1.)))-.036),-r.y);
  float door=sdBox(q-vec3(0.,.016,-.036),vec3(.009,.016,.004));
  return max(min(wall,roof),-door); }
float palisade(vec3 p){
  /* an arc of pointed posts around the back of the mound */
  vec3 q=p-vec3(.05,0.,.05); float R=.55; float r=length(q.xz);
  float a=atan(q.x,q.z); float st=.018;
  float id=clamp(floor(a/st+.5),-70.,70.); float aa=id*st; vec3 c=vec3(sin(aa)*R,0.,cos(aa)*R);
  vec3 k=q-c; float post=sdCylY(k-vec3(0,.035,0),.0055,.035);
  float tip=sdCone(k-vec3(0,.076,0),.0055,.0006,.006);
  return min(post,tip); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,mound(p),3.);
  r=U(r,temple(p),4.);
  r=U(r,min(min(house(p,vec3(-.44,0.,.02),.045,.105),house(p,vec3(-.36,0.,.2),.04,.095)),house(p,vec3(.45,0.,.12),.042,.1)),5.);
  r=U(r,palisade(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .8;
  if(id==3.) return .62-.08*fbm(p.xz*30.);
  if(id==4.){ vec3 q=p-vec3(.1,.19,.1); return q.y>.05?.5:.75; }
  if(id==5.){ return p.y>.04?.5:.75; }
  if(id==6.) return .5;
  return .7; }
