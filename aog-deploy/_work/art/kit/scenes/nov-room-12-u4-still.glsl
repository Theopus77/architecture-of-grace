/* Novel scene room-12-u4: a picnic blanket with a basket of apples and apples on the cloth */
#define CAM_POS vec3(-0.1767,0.3821,-1.3322)
#define CAM_TGT vec3(0.0252,0.0792,0.0812)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.8,-.35)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "novlib.glsl"
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);

  r=U(r,.9-p.z,2.);
  r=U(r,sdRBox(p-vec3(0,.004+.003*sin(p.x*20.)*sin(p.z*17.),0),vec3(.45,.004,.28),.002),3.);
  r=U(r,basket(pl(p,vec3(-.08,.008,.05),.2),.13,.07),4.);
  float a=min(min(apple(p-vec3(-.1,.15,.06),.04),apple(p-vec3(-.04,.155,.03),.042)),apple(p-vec3(-.1,.16,.0),.04));
  a=min(a,min(apple(p-vec3(.17,.05,-.08),.042),apple(pl(p,vec3(.26,.05,-.02),1.),.04)));
  r=U(r,a,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==3.){ vec2 u=p.xz; if(fract(u.x/.09)<.18||fract(u.y/.09)<.18) return .5; return .85; }
  if(id==4.){ float k=basketInk(pl(p,vec3(-.08,.008,.05),.2),.13,.07); return k>0.?k:.6; }
  if(id==5.) return .5;
  return .6; }
