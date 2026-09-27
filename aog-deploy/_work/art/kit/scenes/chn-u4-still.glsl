/* Chinese Classics Unit 4 "What the Classics Are" — pencil still life: a stack of four
   thread-bound books (the old stitched Chinese book, each a little askew), a rolled bundle
   of bamboo slips tied with cord (the oldest form of the books), and a stone seal. */
#define CAM_POS vec3(-0.3330,0.2726,-0.7178)
#define CAM_TGT vec3(-0.1487,-0.0121,0.0944)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define BT .022
vec3 bkQ(vec3 p,int i){ float fi=float(i); vec3 q=p-vec3(.0+.012*sin(fi*2.3),BT*(fi*2.+1.),.1+.01*cos(fi*1.7)); q.xz=rot(.12*sin(fi*1.9+.5)+.05)*q.xz; return q; }
float book(vec3 q){ float d=sdRBox(q,vec3(.13,BT-.0005,.09),.003);
  float cover=max(abs(q.y)-BT+.003,-1.); /* page block is recessed a hair between the covers */
  float rec=max(sdBox(q,vec3(.14,BT-.0035,.086)),-sdBox(q,vec3(.127,BT,.086)));
  return max(d,-rec+.0)-.0; }
float books(vec3 p){ float d=1e5; for(int i=0;i<4;i++) d=min(d,book(bkQ(p,i))); return d; }
/* rolled bamboo slips, lying along x in front, tied with a cord */
#define RS vec3(.02,.03,-.12)
float rollD(vec3 p){ vec3 q=p-RS; q.xz=rot(-.15)*q.xz;
  float d=sdCylX(q,.03,.12)-.002; d=max(d,-max(length(q.yz)-.012,abs(q.x)-.13));
  d=min(d,sdTorus((q-vec3(.05,0.,0.)).yxz,.032,.003)); d=min(d,sdTorus((q-vec3(-.05,0.,0.)).yxz,.032,.003));
  return d; }
#define SE vec3(.3,0.,.02)
float seal(vec3 p){ vec3 q=p-SE; q.xz=rot(.3)*q.xz;
  float d=sdRBox(q-vec3(0.,.045,0.),vec3(.022,.045,.022),.004);
  float cap=(length((q-vec3(0.,.1,0.))/vec3(.024,.018,.024))-1.)*.018; return smin(d,cap,.01); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,books(p),3.);
  r=U(r,rollD(p),4.);
  r=U(r,seal(p),5.);
  return r; }
float bookTone(vec3 q,vec3 n){
  if(abs(q.y)>BT-.004){                           /* covers */
    if(q.y>0.&&abs(q.x+.07)<.012&&abs(q.z)<.06) return .9;      /* paper title slip, blank */
    if(q.y>0.&&abs(abs(q.x+.07)-.012)<.0012&&abs(q.z)<.06) return .35;
    if(q.x<-.12&&n.y>.5){ for(int k=0;k<4;k++){ float z=-.066+float(k)*.044; if(abs(q.z-z)<.0014) return .25; } }
    return .38; }
  if(abs(q.x)>.12){ for(int k=0;k<4;k++){ float z=-.066+float(k)*.044; if(abs(q.z-z)<.0016&&q.x<0.) return .25; } }
  return fract(q.y/.0026)<.4?.72:.9; }        /* page edges */
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ for(int i=0;i<4;i++){ vec3 q=bkQ(p,i); if(abs(q.y)<BT+.001&&abs(q.x)<.135&&abs(q.z)<.095) return bookTone(q,n); } return .5; }
  if(id==4.){ vec3 q=p-RS; q.xz=rot(-.15)*q.xz; float r=length(q.yz); if(abs(q.x)>.121) return fract(r/.0045)<.35?.35:.75;
    if(abs(abs(q.x)-.05)<.005) return .3; float a=atan(q.z,q.y); return fract(a*14./6.2832)<.12?.4:.72; }
  if(id==5.){ vec3 q=p-SE; return q.y>.085?.5:.62; }
  return .7; }
