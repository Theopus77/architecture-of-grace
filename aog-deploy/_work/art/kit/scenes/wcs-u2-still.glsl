/* WCS Unit 2 "Food, Clothes, Words and Holidays" — a patterned bowl of rice with a pair of
   chopsticks laid on its rim, a round scored loaf of bread and a small cup. */
#define CAM_POS vec3(-0.1182,0.2259,-0.5069)
#define CAM_TGT vec3(-0.0318,-0.0525,0.0732)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define BC vec3(-.02,0.,0.)
float bowl(vec3 p){ vec3 q=p-BC; vec3 s=q-vec3(0.,.11,0.);
  float d=max(abs(length(s)-.1)-.004,q.y-.078);
  d=min(d,max(abs(length(q.xz)-.04)-.004,max(-q.y,q.y-.02)));
  return d; }
float rice(vec3 p){ vec3 q=p-BC; float m=max(length((q-vec3(0.,.02,0.))*vec3(1.,1.25,1.))-.078,length(q-vec3(0.,.11,0.))-.097);
  return m+.0015*vn3(p*500.); }
float chop(vec3 p){ float a=sdCapsule(p,vec3(-.09,.08,-.035),vec3(.19,.085,.02),.0038);
  float b=sdCapsule(p,vec3(-.09,.08,-.015),vec3(.19,.088,.045),.0038); return min(a,b); }
#define LB vec3(.2,0.,.12)
float loaf(vec3 p){ vec3 q=p-LB; float d=length(q/vec3(.1,.07,.09))-1.; d*=.07; d=max(d,-q.y);
  d+= .006*smoothstep(.006,0.,abs(fract((q.x+q.z*.5)/.05+.5)-.5)*.05)*step(.03,q.y); return d; }
#define CC vec3(.12,0.,-.11)
float cup(vec3 p){ vec3 q=p-CC; float d=max(abs(length(q.xz)-.034)-.003,abs(q.y-.035)-.035);
  d=min(d,sdCylY(q-vec3(0.,.003,0.),.034,.003));
  d=min(d,sdTorus((q-vec3(.04,.038,0.)).xyz,.016,.004)); return max(d,-(length(q.xz)-.031)*step(.006,q.y)+0.*q.y); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bowl(p),3.);
  r=U(r,rice(p),4.);
  r=U(r,chop(p),5.);
  r=U(r,loaf(p),6.);
  r=U(r,cup(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BC; if(abs(q.y-.06)<.003||abs(q.y-.03)<.002) return .3;
    if(q.y>.035&&q.y<.057){ float a=atan(q.z,q.x); if(abs(sin(a*14.)*.009+.046-q.y)<.0022) return .3; } return .88; }
  if(id==4.) return .95;
  if(id==5.) return .38;
  if(id==6.){ vec3 q=p-LB; if(abs(fract((q.x+q.z*.5)/.05+.5)-.5)*.05<.003&&q.y>.03) return .8; return .5; }
  if(id==7.){ vec3 q=p-CC; if(abs(q.y-.055)<.004) return .35; return .82; }
  return .7; }
