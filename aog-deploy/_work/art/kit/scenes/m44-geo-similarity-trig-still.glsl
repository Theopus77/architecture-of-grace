/* m44 "Geometry: Similarity and Right-Triangle Trigonometry" — a large and a small clear
   set square (the same right triangle at two sizes) standing on their long edges one behind
   the other, and a half-round protractor lying in front. */
#define CAM_POS vec3(-0.2983,0.2116,-0.5430)
#define CAM_TGT vec3(-0.1002,0.0002,0.0781)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
/* a right triangle in xy: legs along +x (length a) and +y (length b), right angle at origin,
   with a triangular hole; thickness 2t */
float setsq(vec3 q,float a,float b,float t){
  vec2 u=q.xy; vec2 n=normalize(vec2(b,a));
  float tri=max(max(-u.x,-u.y),dot(u,n)-a*b/length(vec2(a,b)));
  float k=.28; vec2 v=u-vec2(a,b)*k*.45; float inner=max(max(-v.x,-v.y),dot(v,n)-a*b/length(vec2(a,b))*(1.-k*1.35));
  tri=max(tri,-inner);
  vec2 w=vec2(tri,abs(q.z)-t); return min(max(w.x,w.y),0.)+length(max(w,0.))-.0008; }
float big(vec3 p){ vec3 q=place(p,vec3(-.08,0.,.12),-.15); return setsq(q,.26,.15,.003); }
float small(vec3 p){ vec3 q=place(p,vec3(.08,0.,.02),-.15); return setsq(q,.13,.075,.003); }
float prot(vec3 p){ vec3 q=place(p,vec3(.1,0.,-.1),.1); float r=length(q.xz);
  float d=max(max(r-.075,-q.z),abs(q.y-.0015)-.0015)-.0005;
  d=max(d,-max(max(r-.03,-q.z+.008),1.)*0.+ -max(max(r-.028,-(q.z-.008)),abs(q.y)-.01));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,big(p),3.);
  r=U(r,small(p),4.);
  r=U(r,prot(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.||id==4.){ vec3 q=id==3.?place(p,vec3(-.08,0.,.12),-.15):place(p,vec3(.08,0.,.02),-.15);
    if(abs(n.z)>.6){ if(q.y<.012&&fract(q.x/.01)<.12) return .3; if(q.x<.012&&fract(q.y/.01)<.12) return .3;
      if(q.x<.02&&q.y<.02&&(abs(q.x-.018)<.001||abs(q.y-.018)<.001)) return .25; }
    return .82; }
  if(id==5.){ vec3 q=place(p,vec3(.1,0.,-.1),.1); float r=length(q.xz); float a=atan(q.z,q.x);
    if(r>.06&&fract(a/3.1416*18.)<.1) return .3; if(r>.066&&fract(a/3.1416*36.)<.12) return .4;
    if(abs(r-.05)<.0008) return .4; return .85; }
  return .7; }
