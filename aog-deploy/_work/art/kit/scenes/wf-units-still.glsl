/* wf-units "The Word Foundry · Class Units" — a small bench anvil with a wooden letter block
   carved A standing on its face, a second block carved B on the table, and a hammer lying in
   front: words are forged from their stems, one unit at a time.
   @params {"mat":{"3":[0.42,1.3,1.0],"4":[0.72,1.3,1.0],"5":[0.72,1.3,1.0],"6":[0.62,1.2,0.9],"7":[0.35,1.3,1.0]},
            "texlines":{"4":[0.12,0.4,0.85],"5":[0.12,0.4,0.85],"6":[0.12,0.4,0.5]}} */
#define CAM_POS vec3(-0.4066,0.4959,-1.0480)
#define CAM_TGT vec3(-0.2352,-0.0560,0.1019)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define AV vec3(.02,0.,.08)
#define AR .18
vec3 anQ(vec3 p){ vec3 q=p-AV; q.xz=rot(AR)*q.xz; return q; }
/* a bench anvil along x: foot, waisted body, a flat face, a horn to +x and a heel with a square hole */
float anvil(vec3 p){
  vec3 q=anQ(p);
  float foot=sdRBox(q-vec3(0.,.018,0.),vec3(.1,.018,.075),.006);
  foot=max(foot,-(sdCylZ(q-vec3(0.,0.,0.),.045,.09)));                 /* arch under the foot */
  float t=clamp((q.y-.036)/.08,0.,1.); float w=mix(.075,.045,smoothstep(0.,.7,t))+.02*t*t;
  float body=sdRBox(q-vec3(0.,.076,0.),vec3(w+.01,.042,w*.7),.006)*.85;
  float face=sdRBox(q-vec3(-.02,.132,0.),vec3(.12,.018,.056),.004);
  vec3 h=q-vec3(.1,.132,0.); float hx=clamp(h.x/.16,0.,1.);
  float horn=max(length(vec2(h.y+.01*hx*hx,h.z))-mix(.04,.004,pow(hx,.8)),max(-h.x,h.x-.16))*.8;
  horn=max(horn,q.y-.15);
  float d=smin(min(foot,body),face,.012); d=smin(d,horn,.01);
  d=max(d,-sdBox(q-vec3(-.115,.15,0.),vec3(.009,.03,.009)));          /* hardy hole */
  d=max(d,-sdCylY(q-vec3(-.08,.15,0.),.005,.03));                      /* pritchel hole */
  return d; }
#define BH .042
float block(vec3 p,vec3 c,float ry,int g,int g2){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  float d=sdRBox(q,vec3(BH),.005);
  if(d>.02) return d;
  d=carve(d,q.xy,g,.064,.0052,q.z+BH,.0035);
  d=carve(d,vec2(-q.z,q.y),g2,.06,.005,q.x-BH,.0035);
  return d; }
float letterInk(vec3 p,vec3 c,float ry,int g,int g2){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  if(q.z<-BH+.007&&glyph(q.xy/.064,g)*.064<.0072) return .15;
  if(q.x>BH-.007&&glyph(vec2(-q.z,q.y)/.06,g2)*.06<.0068) return .15;
  vec2 f=q.z<-BH+.003?q.xy:q.x>BH-.003?vec2(q.z,q.y):q.xz;
  if(abs(max(abs(f.x),abs(f.y))-BH*.84)<.0019) return .45;
  return .78; }
#define BA (AV+vec3(-.03,.15+BH,-.005))
#define BAR (AR-.35)
#define BB vec3(.25,BH,-.03)
#define BBR -.5
vec3 hmQ(vec3 p){ vec3 q=p-vec3(.03,0.,-.15); q.xz=rot(.22)*q.xz; return q; }
float hammer(vec3 p){
  vec3 q=hmQ(p);
  float handle=sdCapsule(q,vec3(-.2,.012,0.),vec3(.06,.016,0.),.011);
  handle=smin(handle,sdCapsule(q,vec3(-.2,.012,0.),vec3(-.16,.013,0.),.013),.02);
  vec3 h=q-vec3(.075,.018,0.);
  float head=sdCylZ(h,.018,.045)-.002;                       /* the head lies on its side */
  head=smin(head,sdCylZ(h-vec3(0.,0.,-.05),.021,.008)-.002,.006);   /* striking face */
  float peen=length(h-vec3(0.,0.,.05))-.018;
  head=min(head,smin(sdCylZ(h-vec3(0.,0.,.03),.012,.02),peen,.01));
  return min(handle,head); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,anvil(p),3.);
  r=U(r,block(p,BA,BAR,65,66),4.);
  r=U(r,block(p,BB,BBR,66,67),5.);
  vec3 q=hmQ(p);
  float hd=hammer(p);
  r=U(r,hd,q.x<.055?6.:7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=anQ(p); float a=.42;
    if(n.y>.8&&q.y>.145) a=.62;                                 /* the polished face */
    return a+.06*(fbm3(p*60.)-.5); }
  if(id==4.) return letterInk(p,BA,BAR,65,66);
  if(id==5.) return letterInk(p,BB,BBR,66,67);
  if(id==6.) return .62+.18*(grain(hmQ(p).zxy,70.)-.5);
  if(id==7.) return .34;
  return .7; }
