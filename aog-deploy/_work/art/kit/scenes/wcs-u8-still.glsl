/* WCS Unit 8 "Social Class in Europe" — a tall castle chess rook with crenellations, a large
   iron cog wheel from a factory machine, and a rolled parchment scroll. */
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
#define RC vec3(-.02,0.,.06)
float rook(vec3 p){ vec3 q=p-RC; float r=length(q.xz);
  float d=sdCylY(q-vec3(0.,.012,0.),.07,.012)-.003;
  d=min(d,sdTorus(q-vec3(0.,.03,0.),.058,.008));
  float w=.045-.008*sin(clamp((q.y-.035)/.15,0.,1.)*3.1416);
  d=min(d,max(r-w,abs(q.y-.11)-.075));
  d=min(d,sdTorus(q-vec3(0.,.19,0.),.052,.006));
  float top=max(r-.058,abs(q.y-.225)-.03); top=max(top,-max(r-.042,-(q.y-.215)));
  float a=atan(q.z,q.x); float cr=abs(fract(a/6.2832*6.)-.5)*6.2832/6.*r;
  top=max(top,-max(cr-.012,-(q.y-.236)));
  return min(d,top); }
#define GC vec3(.22,0.,.0)
float cog(vec3 p){ vec3 q=p-GC-vec3(0.,.09,0.); q.xy=rot(.1)*q.xy; q.xz=rot(-.5)*q.xz; /* standing up, leaning */
  float r=length(q.xy); float a=atan(q.y,q.x); float t=smoothstep(.2,.35,abs(fract(a/6.2832*12.)-.5));
  float R=.075+.014*(1.-t);
  float d=max(r-R,abs(q.z)-.012); d=max(d,-(r-.052)); 
  d=min(d,max(r-.058,abs(q.z)-.01)*1.);
  float sp=1e5; for(int i=0;i<4;i++){ vec2 v=rot(float(i)*.785)*q.xy; sp=min(sp,abs(v.y)-.007); }
  float web=max(max(r-.056,abs(q.z)-.007),sp);
  float hub=max(r-.018,abs(q.z)-.016); hub=max(hub,-(r-.007));
  d=max(d,-max(r-.052,0.)); d=min(min(max(r-R,max(abs(q.z)-.012,.052-r)),web),hub);
  return d; }
float scroll(vec3 p){ vec3 q=p-vec3(.14,.016,-.15); q.xz=rot(-.25)*q.xz;
  float d=sdCylX(q,.016,.1)-.001; d=min(d,sdCylX(q-vec3(.105,0.,0.),.006,.012)); d=min(d,sdCylX(q+vec3(.105,0.,0.),.006,.012));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,rook(p),3.);
  r=U(r,cog(p),4.);
  r=U(r,scroll(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-RC; if(q.y>.2&&length(q.xz)<.044) return .25; return .72+.08*grain(p,40.); }
  if(id==4.){ vec3 q=p-GC-vec3(0.,.09,0.); float r=length(q); if(r<.02) return .35; return .45+.1*fbm3(p*80.); }
  if(id==5.){ vec3 q=p-vec3(.14,.016,-.15); q.xz=rot(-.25)*q.xz; if(abs(q.x)>.1) return .35; if(abs(q.x)<.002) return .4; return .86; }
  return .7; }
