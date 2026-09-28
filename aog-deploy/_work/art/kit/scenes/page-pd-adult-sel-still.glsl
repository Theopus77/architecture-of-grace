/* Professional Development · Adult SEL — pencil still life: four small stone pillars standing in a
   row on a plinth, a flat stone lintel resting across them. The four pillars, for grown-ups. */
#define CAM_POS vec3(-0.4429,0.3146,-0.5500)
#define CAM_TGT vec3(-0.2196,0.0086,0.0954)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define PL vec3(.0,0.,.06)
float col(vec3 q,float H){ float s=sdCylY(q-vec3(0.,H*.5,0.),.017,H*.5);
  float a=atan(q.z,q.x); s+= .0012*smoothstep(.2,.8,abs(sin(a*8.)));    /* flutes */
  float base=sdRBox(q-vec3(0.,.006,0.),vec3(.024,.006,.024),.002);
  float cap=sdRBox(q-vec3(0.,H-.006,0.),vec3(.024,.006,.024),.002);
  return min(s,min(base,cap)); }
float temple(vec3 p){ vec3 q=P(p,PL,.12); float H=.1;
  float plinth=sdRBox(q-vec3(0.,.012,0.),vec3(.2,.012,.06),.003);
  float d=plinth;
  for(int i=0;i<4;i++){ float x=-.14+float(i)*.0933; d=min(d,col(q-vec3(x,.024,0.),H)); }
  float lin=sdRBox(q-vec3(0.,.024+H+.014,0.),vec3(.19,.014,.045),.003);
  return min(d,lin); }
float templeT(vec3 p){ vec3 q=P(p,PL,.12);
  if(q.y<.024) return .6+.08*(fbm(q.xz*60.)-.5);
  if(q.y>.124) return .68+.08*(fbm(q.xz*50.+q.y)-.5);
  return .8+.05*(fbm(q.xy*70.)-.5); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,temple(p),3.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return templeT(p);
  return .7; }
