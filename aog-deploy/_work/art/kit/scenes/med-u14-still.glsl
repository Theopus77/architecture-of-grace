/* Medicine Unit 14 "Global Health" — pencil still life: a desk globe on a stand with a
   meridian ring, beside a folded mosquito net (a neat stack of fine-mesh folds). */
#define CAM_POS vec3(-0.3773,0.2764,-1.0119)
#define CAM_TGT vec3(-0.1319,0.0532,0.0921)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define GC vec3(0.,.2,.06)
#define GR .11
vec3 gq(vec3 p){ vec3 q=p-GC; q.xy=rot(.41)*q.xy; q.xz=rot(.6)*q.xz; return q; }
float globe(vec3 p){ return length(p-GC)-GR; }
float ring(vec3 p){ vec3 q=p-GC; q.xy=rot(.41)*q.xy; return max(sdTorus(q.xzy.yxz,GR+.012,.004),-1.); }
float stand(vec3 p){ vec3 q=p-vec3(GC.x,0.,GC.z);
  float base=sdCylY(q-vec3(0.,.01,0.),.07,.008)-.004;
  float st=sdCone(q-vec3(0.,.045,0.),.022,.009,.03);
  float post=sdCylY(q-vec3(0.,.07,0.),.007,.03);
  return min(min(base,st),post); }
#define NC vec3(.27,0.,-.07)
float net(vec3 p){ vec3 q=p-NC; q.xz=rot(-.2)*q.xz; float d=1e3;
  for(int i=0;i<4;i++){ float fi=float(i); float y=.013+fi*.024; d=min(d,sdRBox(q-vec3(.003*sin(fi*3.),y,.002*cos(fi*5.)),vec3(.11-fi*.004,.011,.075),.01)); }
  return d+.0015*fbm3(p*90.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,globe(p),3.);
  r=U(r,ring(p),4.);
  r=U(r,stand(p),5.);
  r=U(r,net(p),6.);
  return r; }
float land(vec2 ll){ /* soft invented continents from noise, lon/lat */
  return fbm(ll*vec2(1.6,2.2)+vec2(3.,1.)); }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=normalize(gq(p)); vec2 ll=vec2(atan(q.z,q.x),asin(q.y));
    float l=land(ll); if(abs(l-.5)<.01) return .2; if(l>.5) return .5;
    if(fract(ll.y*5.73/1.)<.03||fract(ll.x*5.73/1.)<.02) return .7; return .88; }
  if(id==4.) return .35;
  if(id==5.) return .4;
  if(id==6.){ vec3 q=p-NC; float m=min(fract(q.x/.006),fract(q.z/.006)); return m<.25?.72:.9; }
  return .7; }
