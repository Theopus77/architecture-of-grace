/* Novel scene room-12-u3: two small chairs facing each other on a round rug, a ball between them */
#define CAM_POS vec3(-0.2342,0.6025,-1.8449)
#define CAM_TGT vec3(0.0095,0.1761,0.1046)
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
  r=U(r,sdRCyl(p-vec3(0,.004,0),.42,.004,.002),3.);
  r=U(r,chair(pl(p,vec3(-.27,.008,0),1.5708),.55),4.);
  r=U(r,chair(pl(p,vec3(.27,.008,0),-1.5708),.55),5.);
  r=U(r,length(p-vec3(0,.063,-.05))-.055,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;

  if(id==3.){ float rr=length(p.xz); return fract(rr/.06)<.2?.5:.78; }
  if(id==4.||id==5.) return .55;
  if(id==6.){ vec3 q=p-vec3(0,.063,-.05); return abs(q.y+.3*q.x)<.012?.3:.8; }
  return .6; }
