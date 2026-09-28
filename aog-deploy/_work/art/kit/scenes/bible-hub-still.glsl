/* Bible hub card: a closed bound book with a ribbon marker, and a small clay oil lamp beside it. Objects only. */
#define CAM_POS vec3(-0.3211,0.2364,-0.5318)
#define CAM_TGT vec3(-0.1227,-0.0353,0.0411)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#include "hubparts.glsl"

#define BK vec3(-.03,0.,.02)
#define BR .35
#define BH vec3(.12,.032,.085)
#define LP vec3(.16,0.,-.07)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec3 q=P(p,BK,BR)-vec3(0.,BH.y,0.); vec2 b=bookC(q,BH);
  r=U(r,b.x,3.); r=U(r,b.y,4.);
  vec3 rq=P(p,BK,BR);
  r=U(r,min(ribbon(rq,vec3(.04,2.*BH.y-.004,-BH.z+.004),vec3(.04,.04,-BH.z-.012),.006,.0015),
            ribbon(rq,vec3(.04,.04,-BH.z-.012),vec3(.04,.002,-BH.z-.05),.006,.0015)),5.);
  r=U(r,oilLamp(P(p,LP,2.7),1.1),6.);
  r=U(r,lampFlame(P(p,LP,2.7),1.1),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return bookCT(P(p,BK,BR)-vec3(0.,BH.y,0.),BH,.4);
  if(id==4.) return fract(p.y/.0026)<.3?.72:.93;
  if(id==5.) return .3;
  if(id==6.) return oilLampT(P(p,LP,2.7),1.1);
  if(id==7.) return .97;
  return .7; }
