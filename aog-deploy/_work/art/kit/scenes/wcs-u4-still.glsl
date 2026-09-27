/* WCS Unit 4 "Continents and Cultures" — a tilted desk globe on a wooden stand with a
   brass meridian ring, beside a stack of three books. */
#define CAM_POS vec3(-0.3090,0.3939,-0.8361)
#define CAM_TGT vec3(-0.1704,-0.0524,0.0939)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define GC vec3(0.,.2,.05)
mat3 tilt(){ float a=.41; return mat3(cos(a),sin(a),0.,-sin(a),cos(a),0.,0.,0.,1.); }
float globe(vec3 p){ return length(p-GC)-.1; }
float ring(vec3 p){ vec3 q=tilt()*(p-GC); q.xz=rot(.6)*q.xz; float t=sdTorus(q.xzy,.112,.005); return max(t,-q.z-.0); }
float stand(vec3 p){ vec3 q=p-vec3(GC.x,0.,GC.z);
  float base=sdCylY(q-vec3(0.,.01,0.),.07,.008)-.003;
  float neck=sdCylY(q-vec3(0.,.045,0.),.012+.006*sin(q.y*60.),.04);
  vec3 a=tilt()*(p-GC); float ax=sdCylY(a,.004,.125);
  return min(min(base,neck),ax); }
float books(vec3 p){ float d=1e5;
  vec3 q=p-vec3(.24,.016,-.02); q.xz=rot(.15)*q.xz; d=min(d,sdRBox(q,vec3(.1,.016,.07),.003));
  q=p-vec3(.235,.045,-.02); q.xz=rot(-.1)*q.xz; d=min(d,sdRBox(q,vec3(.09,.013,.064),.003));
  q=p-vec3(.24,.07,-.02); q.xz=rot(.3)*q.xz; d=min(d,sdRBox(q,vec3(.08,.012,.058),.003));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,globe(p),3.);
  r=U(r,ring(p),4.);
  r=U(r,stand(p),5.);
  r=U(r,books(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 d=tilt()*normalize(p-GC); d.xz=rot(-.9)*d.xz;
    float lat=asin(d.y), lon=atan(d.z,d.x);
    float land=fbm(vec2(lon*1.6,lat*2.2)+vec2(3.1,1.7))-.5+.12*cos(lat*2.);
    if(abs(land)<.012) return .25; if(abs(fract(lat/.35)-.5)>.49||abs(fract(lon/.52)-.5)>.495) return .7;
    return land>0.?.62:.9; }
  if(id==4.) return .55;
  if(id==5.) return .4+.12*grain(p,40.);
  if(id==6.){ if(abs(n.y)<.5){ float y=p.y; float f=fract(y/.004); return f<.3?.7:.88; } return .45; }
  return .7; }
