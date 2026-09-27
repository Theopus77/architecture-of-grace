/* Novel scene room-207-u1: a brass compass resting on an unrolled map, a star marked in the corner */
#define CAM_POS vec3(-0.0754,0.3593,-1.0786)
#define CAM_TGT vec3(0.0180,-0.0148,0.0435)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.6,.8,-.35)
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
  r=U(r,mapSheet(pl(p,vec3(0,0,0),.1),vec2(.36,.22)),3.);
  r=U(r,compass(pl(p,vec3(.05,.004,-.02),.3)*.7)/.7,4.);
  r=U(r,pencil(pl(p,vec3(-.2,.0066,-.15),.4)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==3.){ vec3 q=pl(p,vec3(0,0,0),.1); vec2 u=q.xz;
    float coast=abs(u.y-.05*sin(u.x*14.)-.03*sin(u.x*31.)+.02); if(coast<.003) return .3;
    if(abs(sdSeg2(u,vec2(-.25,-.12),vec2(.2,.12)))<.002&&fract(u.x*60.)<.5) return .35;
    if(sdStar5(u-vec2(.26,.14),.03,.45)<0.) return .3;
    return .9; }
  if(id==4.){ float k=compassInk(pl(p,vec3(.05,.004,-.02),.3)*.7); return k>0.?k:.6; }
  if(id==5.) return pencilInk(pl(p,vec3(-.2,.0066,-.15),.4));
  return .6; }
