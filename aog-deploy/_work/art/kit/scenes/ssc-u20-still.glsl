/* Social Studies Unit 20 "U.S. History: Industry to the Progressive Era" — pencil still
   life: a brick factory model with a saw-tooth roof and two tall smokestacks, a large iron
   gear standing on edge, and a railroad spike and hammer. */
#define CAM_POS vec3(-0.3266,0.2944,-0.9748)
#define CAM_TGT vec3(-0.1860,0.0474,0.0834)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define FC vec3(.1,0.,.17)
vec3 fq(vec3 p){ vec3 q=p-FC; q.xz=rot(-.3)*q.xz; return q; }
vec2 factory(vec3 p){
  vec3 q=fq(p);
  float body=sdRBox(q-vec3(0.,.05,0.),vec3(.15,.05,.07),.003);
  /* saw-tooth roof: four teeth along x */
  float tx=fract((q.x+.15)/.075)*.075; float ty=q.y-.1;
  float tooth=max(ty-(tx*.5),ty-.0)*0.;
  float saw=max(max(q.y-.1-.035*clamp(tx/.06,0.,1.),.1-q.y),max(abs(q.x)-.15,abs(q.z)-.07));
  saw=min(saw,max(max(abs(tx-.062)-.0,-1.),-1.)*0.+saw);
  body=min(body,saw*.8);
  body=max(body,-sdBox(q-vec3(-.1,.03,-.07),vec3(.018,.03,.006)));          /* loading door */
  float stacks=min(sdCone(q-vec3(.1,.16,.03),.02,.014,.13),sdCone(q-vec3(.04,.14,.04),.018,.013,.11));
  float lips=min(sdCylY(q-vec3(.1,.292,.03),.017,.004),sdCylY(q-vec3(.04,.252,.04),.016,.004));
  return vec2(body,min(stacks,lips)); }
float gearD(vec3 c,float R,int n,float th){
  float a=atan(c.y,c.x); float r=length(c.xy);
  float teeth=R+.009*smoothstep(-.25,.25,sin(a*float(n)));
  float g=max(r-teeth,abs(c.z)-th);
  g=max(g,-sdCylZ(c,R*.22,th+.01));
  float holes=max(abs(r-R*.6)-R*.17,abs(c.z)-th-.01); holes=max(holes,(.45-sin(a*6.))*r*.3);
  return max(g,-holes); }
vec3 gq(vec3 p){ vec3 q=p-vec3(-.19,.075,.02); q.xz=rot(.5)*q.xz; return q; }
float gear(vec3 p){ return gearD(gq(p),.066,18,.009); }
vec3 hq(vec3 p){ vec3 q=p-vec3(.37,.012,-.03); q.xz=rot(-.6)*q.xz; return q; }
vec2 hammer(vec3 p){
  vec3 q=hq(p);
  float han=sdCapsule(q,vec3(-.1,0.,0.),vec3(.05,0.,0.),.008);
  float head=sdRBox(q-vec3(.06,.0,0.),vec3(.012,.012,.04),.003);
  vec3 s=p-vec3(.28,.006,-.08); s.xz=rot(.3)*s.xz;
  float spike=sdRBox(s,vec3(.05,.005,.005),.001); spike=min(spike,sdRBox(s-vec3(-.05,0.,0.),vec3(.004,.009,.009),.002));
  return vec2(min(han,spike),head); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 f=factory(p); r=U(r,f.x,3.); r=U(r,f.y,4.);
  r=U(r,gear(p),5.);
  vec2 h=hammer(p); r=U(r,h.x,6.); r=U(r,h.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=fq(p);
    if(q.y>.1&&n.y>.2){ float tx=fract((q.x+.15)/.075); return .35; }
    if(q.y>.1) return .85;                                                        /* north-light glazing */
    if(q.z<-.066&&q.y>.045&&q.y<.08&&q.x>-.07){ if(fract((q.x+.07)/.03)<.6) return .25; }
    float row=floor(q.y/.008); float bx=fract((q.x+q.z)/.018+row*.5);
    if(fract(q.y/.008)<.15||bx<.08) return .38; return .55; }                     /* brick */
  if(id==4.) return .4;
  if(id==5.) return .38;
  if(id==6.) return .6;
  if(id==7.) return .3;
  return .7; }
