/* Math Unit 4 "Measuring, Time and Money" — pencil still life: a twin-bell alarm clock,
   a wooden ruler lying in front of it and a small stack of coins. */
#define CAM_POS vec3(-0.4721,0.2963,-1.0508)
#define CAM_TGT vec3(-0.3228,0.0353,0.1163)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define CC vec3(.06,.135,.12)
#define CR .1
vec3 ckQ(vec3 p){ vec3 q=p-CC; q.xz=rot(.18)*q.xz; return q; }
vec2 clock(vec3 p){ vec3 q=ckQ(p);
  float body=sdCylZ(q,CR,.03)-.006;
  float rim=length(vec2(length(q.xy)-CR-.002,q.z+.036))-.008;
  body=min(body,rim);
  body=max(body,-(sdCylZ(q-vec3(0.,0.,-.04),CR-.012,.006)));      /* recessed face */
  float feet=min(length(q-vec3(-.06,-.1,0.))-.018,length(q-vec3(.06,-.1,0.))-.018);
  float bells=1e5;
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec2 dir=vec2(s*.62,.78);
    vec3 b=q-vec3(dir*(CR+.025),0.); b.xy=rot(s*.67)*b.xy;
    float bell=max(length(b)-.038,-b.y-.004); bell=max(bell,-(length(b)-.033));
    bells=min(bells,bell); }
  float stem=sdCylY(q-vec3(0.,CR+.012,0.),.005,.018);
  float handle=max(length(vec2(length(q.xy-vec2(0.,CR+.02))-.05,q.z))-.005,-(q.y-CR-.02));
  float hands=1e5; vec2 h=q.xy; float hz=q.z+.036;
  hands=min(hands,max(sdSeg2(h,vec2(0.),vec2(-.042,.024))-.005,abs(hz)-.002));   /* hour hand at 10 */
  hands=min(hands,max(sdSeg2(h,vec2(0.),vec2(.034,.06))-.0035,abs(hz+.003)-.0015)); /* minute hand at 2 */
  hands=min(hands,length(q-vec3(0.,0.,-.038))-.006);
  return vec2(min(min(body,feet),min(bells,min(stem,handle))),hands); }
vec3 ruQ(vec3 p){ vec3 q=p-vec3(-.07,.004,-.03); q.xz=rot(.15)*q.xz; return q; }
float ruler(vec3 p){ return sdRBox(ruQ(p),vec3(.2,.004,.028),.0015); }
float coins(vec3 p){ vec3 q=p-vec3(.19,0.,-.01); float d=1e5;
  for(int i=0;i<6;i++){ vec3 c=q-vec3(.002*sin(float(i)*2.3),.0035+float(i)*.0072,.002*cos(float(i)*1.7)); d=min(d,sdCylY(c,.026,.0033)-.0003); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 c=clock(p); r=U(r,c.x,3.); r=U(r,c.y,4.);
  r=U(r,ruler(p),5.);
  r=U(r,coins(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=ckQ(p); float r=length(q.xy);
    if(q.z<-.032&&r<CR-.012){ float a=atan(q.y,q.x)/(PI/6.); float f=abs(fract(a+.5)-.5)*PI/6.*r;
      if(r>CR-.03&&f<.0022) return .12; if(r>CR-.022&&abs(fract(a*5.+.5)-.5)<.06) return .45; return .92; }
    return .42; }
  if(id==4.) return .1;
  if(id==5.){ vec3 q=ruQ(p); if(q.y>.003&&q.z>.0){ float t=fract((q.x+.2)/.01); float big=fract((q.x+.2)/.05);
      if(t<.12&&q.z>(big<.03?.008:.018)) return .18; } return .8; }
  if(id==6.) return fract(p.y/.0072)<.25?.3:.62;
  return .7; }
