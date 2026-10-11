/* Front-page door "Skateboarding" (door-skate) — pencil still life: a complete skateboard tipped up on its
   tail as if just popped, nose high, its middle resting on the top edge of a small wooden block; a helmet
   (crown and vents turned away, nothing reads as a face) beside the block and one spare wheel standing on
   its edge near the tail. Objects only, no logos. Sizes in metres. */
#define CAM_POS vec3(-1.3389,0.5295,-1.4877)
#define CAM_TGT vec3(-0.4817,0.0468,0.2452)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sktparts_a.glsl"
#define SRY -.30
#define TH .6632          /* 38 degrees: tail on the table, rear wheels just lifted */
#define TX -.42           /* where the tail tip touches the table, scene frame */
#define BX .342           /* block's near top edge from the tail tip (deck middle rests there) */
#define BY .212
/* scene frame: the board runs along x */
vec3 sceneQ(vec3 p){ return sk_place(p,vec3(0.,0.,.05),SRY); }
vec3 boardQ(vec3 p){ vec3 s=sceneQ(p); vec2 d=s.xy-vec2(TX,0.); d=rot(TH)*d; return vec3(d+vec2(-.4,.124),s.z); }
/* the wooden block: a sawn chunk of a 4x4 post laid on its side */
vec3 blockQ(vec3 p){ return sceneQ(p)-vec3(TX+BX+.085,0.,.0); }
float blockD(vec3 p){ vec3 q=blockQ(p);
  return sdRBox(q-vec3(0.,(BY-.002)*.5,0.),vec3(.088,(BY-.002)*.5,.11),.007)+.0008*vn(q.xy*60.+q.z*30.); }
float blockT(vec3 p){ vec3 q=blockQ(p);
  if(abs(q.z)>.104){ float r=length(vec2(q.x-.03,q.y-.05)); return .7+.12*(fract(r/.012)<.25?-1.:0.)+.05*vn(q.xy*300.); } /* end grain rings */
  return .74+.16*(grain(vec3(q.z,q.x,q.y*4.),26.)-.5)-.12*step(.93,vn(q.zy*90.)); }
/* helmet on the table to the right, crown up, its front turned away to the back right */
vec3 helQ(vec3 p){ return sk_place(sceneQ(p),vec3(.22,0.,-.3),2.3)/.9; }
/* spare wheel on its edge near the tail, its hub toward the viewer */
vec3 whQ(vec3 p){ return sk_place(sceneQ(p),vec3(-.5,0.,-.2),-.35); }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,blockD(p),3.);
  vec3 b=boardQ(p);
  r=U(r,sk_deckD(b),5.);
  r=U(r,sk_trucksD(b),6.);
  r=U(r,sk_wheelsD(b),7.);
  vec3 h=helQ(p);
  r=U(r,sk_helmetD(h)*.9,8.);
  r=U(r,sk_strapD(h)*.9,9.);
  r=U(r,sk_looseWheelD(whQ(p)),10.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return blockT(p);
  vec3 b=boardQ(p);
  if(id==5.) return sk_deckT(b);
  if(id==6.) return sk_trucksT(b);
  if(id==7.) return sk_wheelsT(b);
  if(id==8.) return sk_helmetT(helQ(p));
  if(id==9.) return sk_strapT(helQ(p));
  if(id==10.) return sk_looseWheelT(whQ(p));
  return .7; }
