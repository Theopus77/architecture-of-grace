/* Novel cover, Book Six "The Years We Kept Coming Back" (The Dwelling): a small model house
   with lit windows standing on a round wooden tray, a lit candle beside it and three smooth
   stones in front. */
#define CAM_POS vec3(-0.1997,0.4748,-1.3974)
#define CAM_TGT vec3(-0.0008,0.1269,0.0444)
#define SUN_DIR vec3(-.65,.8,-.3)
#define CAM_FOV 30.
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "novlib.glsl"
#define HS vec3(.12,.07,.09)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,sdRCyl(p-vec3(0,.012,.05),.3,.012,.006),3.);
  r=U(r,house(pl(p,vec3(0,.024,.08),.35),HS),4.);
  r=U(r,candle(pl(p,vec3(.24,.024,.12),0.)),5.);
  r=U(r,min(min(stone(pl(p,vec3(-.1,.024,-.17),.3),vec3(.03,.016,.022)),stone(pl(p,vec3(-.02,.024,-.2),1.),vec3(.026,.014,.02))),stone(pl(p,vec3(.06,.024,-.18),2.),vec3(.022,.013,.018))),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.){ float rr=length(p.xz-vec2(0,.05)); if(p.y>.02&&abs(rr-.27)<.004) return .3; return .6; }
  if(id==4.){ float k=houseInk(pl(p,vec3(0,.024,.08),.35),HS); return k>0.?k:.5; }
  if(id==5.){ return p.y>.1?.98:.9; }
  if(id==6.) return .45;
  return .7; }
