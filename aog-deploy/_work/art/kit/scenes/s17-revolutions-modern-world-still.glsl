/* s17 "World History: Revolutions and the Modern World" — three wooden spools of mill thread
   (the factory), a pocket watch on its chain (the new clock time) lying on a stack of two old
   books (the Enlightenment). */
#define CAM_POS vec3(-0.2965,0.3420,-0.4741)
#define CAM_TGT vec3(-0.0946,-0.0315,0.0400)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#include "roomparts_e.glsl"
vec3 s1Q(vec3 p){ return p-vec3(-.06,0.,.07); }
vec3 s2Q(vec3 p){ return p-vec3(.0,0.,.1); }
vec3 s3Q(vec3 p){ vec3 q=p-vec3(-.1,.028,-.06); q.xy=rot(1.5708)*q.xy; q.xz=rot(.5)*q.xz; return q; }   /* lying on its side */
#define BK1 vec3(.12,.016,-.05)
#define BK2 vec3(.12,.044,-.05)
vec3 wQ(vec3 p){ return plc(p,vec3(.1,.056,-.06),2.5)*.72; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,min(min(spoolWood(s1Q(p),.036,.1),spoolWood(s2Q(p),.03,.075)),spoolWood(s3Q(p)+vec3(0.,.035,0.),.028,.07)),3.);
  r=U(r,min(min(spoolThread(s1Q(p),.036,.1),spoolThread(s2Q(p),.03,.075)),spoolThread(s3Q(p)+vec3(0.,.035,0.),.028,.07)),4.);
  vec2 b1=flatBook(p,BK1,vec3(.1,.016,.075),.25); vec2 b2=flatBook(p,BK2,vec3(.088,.012,.066),.1);
  r=U(r,b1.x,b1.y>.5?6.:5.); r=U(r,b2.x,b2.y>.5?6.:5.);
  vec3 w=wQ(p);
  r=U(r,min(watchCase(w),watchChain(w)),7.);
  r=U(r,watchFace(w),8.);
  r=U(r,watchHands(w),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .7;
  if(id==4.){ float t=fract((p.y+p.x*.08+p.z*.08)/.0022); return t<.4?.3:.5; }
  if(id==5.) return p.y<.032?.35:.5;
  if(id==6.) return fract(p.y/.003)<.3?.7:.92;
  if(id==7.) return .4;
  if(id==8.){ vec3 w=wQ(p); float r=length(w.xz); float a=atan(w.z,w.x);
    if(r>.022&&r<.027&&fract(a/(2.*PI)*12.)<.12) return .15; if(abs(r-.0285)<.0008) return .3; return .93; }
  if(id==9.) return .1;
  return .7; }
