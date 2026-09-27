/* Hindu Texts Unit 9 "The Upanishads" — pencil still life: a young banyan tree growing in a
   clay pot, a round-bellied water vessel with a spout and a handle (kamandalu), and a
   palm-leaf bundle. Objects only. */
#define CAM_POS vec3(-0.4121,0.4047,-1.1731)
#define CAM_TGT vec3(-0.2639,0.0341,0.0619)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define TP vec3(.08,0.,.1)
float tree(vec3 p){ vec3 q=p-TP;
  float pot=sdCone(q-vec3(0.,.045,0.),.055,.07,.045)-.002; pot=max(pot,-sdCylY(q-vec3(0.,.09,0.),.062,.01));
  float rim=sdTorus(q-vec3(0.,.09,0.),.068,.006);
  float soil=sdCylY(q-vec3(0.,.08,0.),.064,.003);
  float trunk=sdCapsule(q,vec3(0.,.08,0.),vec3(.005,.2,0.),.012);
  trunk=smin(trunk,sdCapsule(q,vec3(.004,.17,0.),vec3(.09,.24,.01),.006),.01);
  trunk=smin(trunk,sdCapsule(q,vec3(.004,.16,0.),vec3(-.09,.23,-.01),.006),.01);
  trunk=min(trunk,sdCapsule(q,vec3(.07,.225,0.),vec3(.072,.095,.0),.002));   /* an aerial root */
  trunk=min(trunk,sdCapsule(q,vec3(-.07,.215,0.),vec3(-.073,.095,.0),.002));
  /* the crown: overlapping clumps of leaves */
  float cr=1e5;
  for(int i=0;i<9;i++){ float a=float(i)*.7; vec3 c=vec3(cos(a)*.1*(.7+.3*sin(a*2.)),.25+.025*sin(a*1.7),sin(a)*.06);
    cr=min(cr,length(q-c)-.036); }
  cr=min(cr,length(q-vec3(0.,.285,0.))-.04);
  cr+=.007*(vn3(q*90.)-.5)+.004*(vn3(q*200.)-.5);
  return min(min(min(pot,rim),soil),min(trunk,cr*.8)); }
float kamandalu(vec3 p){ vec3 q=ry(p-vec3(-.13,0.,-.03),.6);
  float body=sdEll(q-vec3(0.,.05,0.),vec3(.05,.048,.05));
  float neck=sdCone(q-vec3(0.,.11,0.),.02,.014,.02);
  float mouth=sdTorus(q-vec3(0.,.13,0.),.015,.003);
  float spout=sdCapsule(q,vec3(.035,.06,0.),vec3(.075,.1,0.),.006);
  float handle=sdTorus((q-vec3(0.,.12,0.)).xzy*vec3(1.,1.,1.),.0,.0);
  vec3 h=q-vec3(0.,.1,0.); handle=length(vec2(length(h.xy*vec2(1.,1.))-.06,h.z))-.004; handle=max(handle,-h.y+.02);
  return min(min(smin(body,neck,.01),mouth),min(spout,handle)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,tree(p),3.);
  r=U(r,kamandalu(p),4.);
  r=U(r,palmBundle(ry(p-vec3(.1,0.,-.14),-.15),.14,.025,.012),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-TP; if(q.y<.095) return abs(q.y-.03)<.003?.3:.5; if(q.y<.2&&length(q.xz)<.012) return .4; return .5+.25*vn3(q*140.); }
  if(id==4.) return .5;
  if(id==5.) return palmBundleTone(ry(p-vec3(.1,0.,-.14),-.15)-vec3(0.,.008,0.),.14,.025,.012);
  return .7; }
