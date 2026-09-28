/* Professional Development · Staff Wellness — pencil still life: a mug of tea and a soft knitted
   blanket folded in a thick stack, a quiet moment for the adult. */
#define CAM_POS vec3(-0.3152,0.2429,-0.4353)
#define CAM_TGT vec3(-0.1415,0.0049,0.0668)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define BL vec3(-.04,0.,.06)
#define MG vec3(.13,0.,-.03)
float pdBlanket(vec3 p){ vec3 q=P(p,BL,.12); float d=1e5;
  for(int i=0;i<3;i++){ float fi=float(i); float y=.02+fi*.036;
    vec3 c=q-vec3(.006*sin(fi*2.),y,0.);
    c.y+=.004*sin(c.x*30.+fi)*sin(c.z*25.);               /* soft, a little lumpy */
    float s=sdRBox(c,vec3(.12-.006*fi,.019,.085),.018);
    d=smin(d,s,.012); }
  vec3 dr=q-vec3(.02,0.,-.085); float drape=sdRBox(dr-vec3(0.,.045,0.),vec3(.09,.045,.006),.006);   /* one fold hanging over the front */
  d=smin(d,drape,.01);
  return d; }
float pdBlanketT(vec3 p){ vec3 q=P(p,BL,.12);
  if(fract((q.x+.2)/.03)<.12) return .6;                 /* woven stripes */
  if(fract((q.x+.2)/.09)<.08) return .45;
  return .78+.06*(fbm(q.xz*80.)-.5); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pdBlanket(p),3.);
  r=U(r,mug(P(p,MG,.5),.038,.092),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return pdBlanketT(p);
  if(id==4.) return mugT(P(p,MG,.5),.038,.092,.6);
  return .7; }
