/* Buddhist Texts Unit 3 "Calm and Kindness" — pencil still life: a metal singing bowl on a
   small round cushion with its wooden striker, a little stack of smooth river stones, and a
   lotus flower. Objects only. */
#define CAM_POS vec3(-0.2483,0.2609,-0.7384)
#define CAM_TGT vec3(-0.1557,-0.0402,0.0336)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define BC vec3(.06,0.,.1)
float sbowl(vec3 p){ vec3 q=p-BC-vec3(0.,.03,0.);
  float o=sdEll(q-vec3(0.,.055,0.),vec3(.1,.075,.1)); o=max(o,q.y-.065);
  float i=sdEll(q-vec3(0.,.056,0.),vec3(.093,.07,.093));
  float d=max(o,-i); d=min(d,sdTorus(q-vec3(0.,.064,0.),.087,.0035));
  return d; }
float cushion(vec3 p){ vec3 q=p-BC; return sdTorus(q-vec3(0.,.018,0.),.07,.022)*1.; }
float striker(vec3 p){ vec3 q=p-vec3(.2,.012,-.07); q.xz=rot(-.5)*q.xz; float d=max(length(q.yz)-.011,abs(q.x)-.09); d=min(d,max(length(q.yz)-.012,abs(q.x+.06)-.03)); return d-.001; }
float stones(vec3 p){ vec3 q=p-vec3(-.17,0.,-.02); float d=sdEll(q-vec3(0.,.018,0.),vec3(.055,.018,.042));
  d=min(d,sdEll(ry(q-vec3(.004,.047,.0),.5),vec3(.042,.014,.032)));
  d=min(d,sdEll(ry(q-vec3(-.003,.071,.002),1.1),vec3(.03,.011,.024)));
  d=min(d,sdEll(ry(q-vec3(.0,.089,0.),.2),vec3(.019,.008,.016)));
  return d+.0015*vn3(q*150.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,sbowl(p),3.);
  r=U(r,cushion(p),4.);
  r=U(r,striker(p),5.);
  r=U(r,stones(p),6.);
  r=U(r,lotus(ry(p-vec3(-.02,0.,-.13),.4),1.2),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BC; if(abs(q.y-.08)<.0018||abs(q.y-.086)<.0012) return .3; return .5; }
  if(id==4.) return .35;
  if(id==5.){ vec3 q=p-vec3(.2,.012,-.07); q.xz=rot(-.5)*q.xz; return q.x<-.03?.35:.62; }
  if(id==6.) return .55;
  if(id==7.) return .88;
  return .7; }
