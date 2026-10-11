/* Skateboarding course hub — pencil still life: a skateboard with its back wheels on the table and its
   front wheels up on a short section of painted concrete curb (steel edge along the top), a block of
   skate wax on the curb and a vented helmet in front. Objects only. */
#define CAM_POS vec3(-0.9455,0.5198,-1.3864)
#define CAM_TGT vec3(-0.3659,-0.0365,0.1207)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sktparts_a.glsl"
#define SRY -.35
#define CH .15
#define BTH .3747
/* scene frame: the board runs along x, the curb starts just past the front wheels */
vec3 sceneQ(vec3 p){ return sk_place(p,vec3(-.06,0.,.06),SRY); }
float curbD(vec3 p){ vec3 q=sceneQ(p)-vec3(.42,0.,.0);
  float c=sdRBox(q-vec3(0.,CH*.5,0.),vec3(.23,CH*.5,.17),.01)+.0008*fbm(q.xy*70.+q.z*40.);
  return c; }
float edgeD(vec3 p){ vec3 q=sceneQ(p)-vec3(.42,0.,.0);              /* steel angle along the front top edge */
  float a=sdBox(q-vec3(-.229,CH-.02,0.),vec3(.0025,.02,.172));
  float b=sdBox(q-vec3(-.21,CH+.0005,0.),vec3(.02,.0025,.172));
  return min(a,b)-.0005; }
float curbT(vec3 p){ vec3 q=sceneQ(p)-vec3(.42,0.,.0);
  if(q.x<-.225&&q.y<CH-.04){ if(q.y>.03&&q.y<CH-.05) return .55+.06*vn(q.zy*200.); return .75; } /* painted band on the face */
  return .74+.12*vn(q.xz*250.+q.y*100.)-.14*step(.9,vn(q.xz*800.+q.y*500.)); }
/* the board: rear wheels on the table, front wheels on the curb top */
vec3 boardQ(vec3 p){ vec3 q=sceneQ(p)-vec3(0.,.0769,0.); q.xy=rot(BTH)*q.xy; return q; }
/* wax block on the curb */
vec3 waxQ(vec3 p){ return sk_place(sceneQ(p),vec3(.5,CH,.06),.5); }
float waxD(vec3 p){ vec3 q=waxQ(p); float d=sdRBox(q-vec3(0.,.018,0.),vec3(.04,.018,.028),.008); return d+.0012*vn(q.xz*300.); }
float waxT(vec3 p){ vec3 q=waxQ(p); if(q.y>.03) return .9-.12*step(.75,vn(q.xz*400.)); return .82; }
vec3 helQ(vec3 p){ return sk_place(p,vec3(.12,0.,-.3),-.3)/.9; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,curbD(p),3.);
  r=U(r,edgeD(p),4.);
  vec3 b=boardQ(p);
  r=U(r,sk_deckD(b),5.);
  r=U(r,sk_trucksD(b),6.);
  r=U(r,sk_wheelsD(b),7.);
  r=U(r,waxD(p),8.);
  r=U(r,sk_helmetD(helQ(p))*.9,9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return curbT(p);
  if(id==4.) return .45;
  vec3 b=boardQ(p);
  if(id==5.) return sk_deckT(b);
  if(id==6.) return sk_trucksT(b);
  if(id==7.) return sk_wheelsT(b);
  if(id==8.) return waxT(p);
  if(id==9.) return sk_helmetT(helQ(p));
  if(id==10.) return sk_strapT(helQ(p));
  return .7; }
