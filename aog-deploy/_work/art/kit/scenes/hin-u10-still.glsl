/* Hindu Texts Unit 10 "Epics, Puranas and Poets" — pencil still life: a tanpura (a long-necked
   drone lute with a round gourd body and tuning pegs) lying on the table, a palm-leaf bundle
   and a pair of small hand cymbals. Objects only. */
#define CAM_POS vec3(-0.3290,0.2613,-0.9124)
#define CAM_TGT vec3(-0.2136,-0.0366,0.0487)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
vec3 tpQ(vec3 p){ vec3 q=p-vec3(.14,0.,.08); q.xz=rot(-.35)*q.xz; q.y-=.07; q.xy=rot(.11)*q.xy; q.y+=.07; return q; }
float tanpura(vec3 p){ vec3 q=tpQ(p);
  vec3 g=q-vec3(.06,.07,0.);
  float gourd=sdEll(g,vec3(.1,.07,.1)); gourd=max(gourd,-g.y-.066);
  float top=max(sdEll(g-vec3(0.,.0,0.),vec3(.095,.073,.095)),.0-g.y); gourd=min(gourd,max(sdCylY(g-vec3(-.01,.0,0.),.09,.004),-1.));
  float neck=sdRBox(q-vec3(-.2,.07,0.),vec3(.22,.016,.02),.008);
  float head=sdRBox(q-vec3(-.43,.074,0.),vec3(.03,.018,.022),.006);
  float pegs=1e5; for(int i=0;i<2;i++){ float x=-.41-float(i)*.025; pegs=min(pegs,sdCylZ(q-vec3(x,.078,0.),.005,.04)); pegs=min(pegs,length(q-vec3(x,.078,.045))-.009); pegs=min(pegs,length(q-vec3(x,.078,-.045))-.009); }
  float bridge=sdRBox(q-vec3(.08,.141,0.),vec3(.006,.006,.03),.002);
  float strings=1e5; for(int i=0;i<4;i++){ float z=-.012+float(i)*.008; strings=min(strings,sdCapsule(q,vec3(.13,.13,z),vec3(-.4,.09,z),.0008)); }
  float nut=sdEll(q-vec3(.16,.05,0.),vec3(.03,.03,.03));
  return min(min(min(gourd,neck),min(head,pegs)),min(bridge,strings)); }
float cymbal(vec3 q){ float d=max(abs(sdEll(q,vec3(.035,.01,.035)))-.0015,-q.y); d=min(d,length(q-vec3(0.,.009,0.))-.006); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,tanpura(p),3.);
  r=U(r,palmBundle(ry(p-vec3(-.08,0.,-.13),.12),.16,.026,.012),4.);
  r=U(r,cymbal(p-vec3(.27,.012,-.12)),5.);
  vec3 c2=p-vec3(.31,.014,-.08); c2.xy=rot(.5)*c2.xy; r=U(r,cymbal(c2),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=tpQ(p); vec3 g=q-vec3(.06,.07,0.); if(g.y>.06&&length(g.xz)<.09){ if(abs(length(g.xz)-.075)<.003) return .3; return .8; } if(q.x<-.4) return .35; return .45; }
  if(id==4.) return palmBundleTone(ry(p-vec3(-.08,0.,-.13),.12)-vec3(0.,.008,0.),.16,.026,.012);
  if(id==5.) return .55;
  return .7; }
