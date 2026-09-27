/* Buddhist Texts Unit 1 "The Prince Who Asked Why" — pencil still life: a prince's crown set
   down on a tasselled cushion, a plain alms bowl beside it, and a fallen bodhi leaf. The
   choice between a palace life and a seeker's life, told with objects only. No figures. */
#define CAM_POS vec3(-0.2918,0.2111,-0.6263)
#define CAM_TGT vec3(-0.2115,-0.0230,0.0427)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define CC vec3(.06,0.,.1)
float cushion(vec3 p){ vec3 q=p-CC; float d=sdRBox(q-vec3(0.,.032,0.),vec3(.12,.03,.1),.028); d-=.006*(1.-smoothstep(0.,.11,length(q.xz)));
  d-=.006*(1.-smoothstep(0.,.1,length(q.xz)))*0.; 
  for(int i=0;i<4;i++){ vec2 c=vec2(i<2?-.125:.125,(i==0||i==2)?-.105:.105); vec3 t=q-vec3(c.x,.032,c.y);
    d=min(d,sdCone(t-vec3(0.,-.012,0.),.009,.003,.014)); d=min(d,length(t)-.007); }
  return d; }
float crown(vec3 p){ vec3 q=p-CC-vec3(0.,.052,0.);
  float r=.058; float band=max(abs(length(q.xz)-r)-.004,max(-q.y,q.y-.03));
  float a=atan(q.z,q.x); float pk=abs(fract(a*7./6.2832)-.5)*2.;
  float pts=max(abs(length(q.xz)-r)-.0035,max(q.y-.03-.035*(1.-pk)*(1.-pk),.02-q.y));
  float rim=min(sdTorus(q-vec3(0.,.002,0.),r,.005),sdTorus(q-vec3(0.,.03,0.),r,.004));
  vec2 f=vec2(fract(a*7./6.2832+.5)-.5,0.); vec3 gp=vec3(cos(a)*r,.016,sin(a)*r); float gem=1e5;
  float ka=floor(a*7./6.2832+.5)*6.2832/7.; gem=sdEll(q-vec3(cos(ka)*(r+.003),.016,sin(ka)*(r+.003)),vec3(.007,.008,.007));
  float ka2=ka+3.1416/7.; float ball=length(q-vec3(cos(ka)*r,.068,sin(ka)*r))-.005;
  return min(min(band,pts),min(min(rim,gem),ball)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,cushion(p),3.);
  r=U(r,crown(p),4.);
  r=U(r,bowlD(p-vec3(-.17,0.,-.02),.07,.05),5.);
  r=U(r,bodhiLeaf(ry(p-vec3(-.02,0.,-.13),-.3),1.1),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-CC; vec2 f=abs(q.xz)-vec2(.1,.08); if(abs(max(f.x,f.y))<.003&&q.y>.04) return .4; return .65; }
  if(id==4.) return .55;
  if(id==5.) return .38;
  if(id==6.) return bodhiTone(ry(p-vec3(-.02,0.,-.13),-.3),1.1);
  return .7; }
