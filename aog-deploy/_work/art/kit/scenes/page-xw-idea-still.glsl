/* Crosswalk: IDEA and special education law — a thick bound law book with a ribbon marker, lying on a tabbed file folder, with a paper clip. */
#define CAM_POS vec3(-0.3048,0.2174,-0.4912)
#define CAM_TGT vec3(-0.1207,-0.0348,0.0405)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.4)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#include "xwparts.glsl"

#define FD vec3(.0,0.,.03)
vec3 fq(vec3 p){ return P(p,FD,-.12); }
float folder(vec3 q){ float a=sdRBox(q-vec3(0.,.002,0.),vec3(.16,.0012,.12),.0008);
  float b=sdRBox(q-vec3(.005,.0048,-.004),vec3(.155,.0012,.114),.0008);
  float tab=sdRBox(q-vec3(.07,.002,.128),vec3(.045,.0012,.012),.004);
  return min(min(a,b),tab); }
float sheet(vec3 q){ return sdRBox(q-vec3(-.01,.0035,.02),vec3(.14,.0006,.105),.0004); }
#define BK vec3(-.01,0.,.02)
vec3 bq(vec3 p){ return P(p,BK+vec3(0.,.006,0.),.22); }
float ribbon(vec3 q){ vec3 r=q-vec3(-.02,0.,0.);
  float a=sdRBox(r-vec3(0.,.0445,-.07),vec3(.008,.0007,.022),.0004);
  float b=sdRBox(r-vec3(0.,.024,-.0925),vec3(.008,.021,.0007),.0004);
  vec3 t=r-vec3(-.006,.0045,-.13); t.xz=rot(.25)*t.xz; float c=sdRBox(t,vec3(.008,.0007,.038),.0004);
  return min(a,min(b,c)); }
#define CL vec3(.17,0.,-.1)
float clipD(vec3 p){ vec3 q=P(p,CL,.5)-vec3(0.,.0015,0.);
  float o=abs(sdB2(q.xz,vec2(.034,.01))-.003)-.0014; float i=abs(sdB2(q.xz-vec2(-.005,0.),vec2(.024,.004))-.002)-.0014;
  return max(min(o,i),abs(q.y)-.0009); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,folder(fq(p)),3.); r=U(r,sheet(fq(p)),4.);
  vec2 b=xwBookD(bq(p),vec3(.12,.022,.09)); r=U(r,b.x,5.); r=U(r,b.y,6.);
  r=U(r,ribbon(bq(p)),7.);
  r=U(r,clipD(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return .74; 
  if(id==4.){ vec3 q=fq(p); vec2 u=q.xz-vec2(-.01,.02); float l=fract((u.y+.1)/.014);
    if(u.x>.02&&u.x<.12&&l<.16&&u.y<.09&&u.y>-.09) return .55; return .96; }
  if(id==5.){ vec3 q=bq(p); if(q.y>.04&&abs(q.x+.06)<.004) return .2; if(q.y>.04&&abs(q.z)<.05&&abs(q.x-.02)<.05&&abs(abs(q.z)-.03)<.0025) return .55; return .3; }
  if(id==6.) return xwPagesT(bq(p));
  if(id==7.) return .25; if(id==8.) return .45;
  return .7; }
