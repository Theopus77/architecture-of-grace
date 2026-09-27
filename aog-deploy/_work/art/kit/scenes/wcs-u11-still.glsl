/* WCS Unit 11 "Left, Right and the Kinds of Government" — pencil still life: a crown resting on
   a tasselled cushion (monarchy) beside a wooden ballot box with a folded ballot in its slot. */
#define CAM_POS vec3(-0.4493,0.2542,-0.9216)
#define CAM_TGT vec3(-0.2200,0.0457,0.1101)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define BC vec3(.2,0.,.06)
float box(vec3 p){ vec3 q=p-BC; q.xz=rot(-.25)*q.xz;
  float d=sdRBox(q-vec3(0.,.1,0.),vec3(.12,.1,.09),.006);
  d=max(d,-sdRBox(q-vec3(0.,.2,0.),vec3(.05,.02,.005),.001));
  return d; }
float lid(vec3 p){ vec3 q=p-BC; q.xz=rot(-.25)*q.xz;
  float d=sdRBox(q-vec3(0.,.207,0.),vec3(.128,.007,.098),.004);
  d=max(d,-sdRBox(q-vec3(0.,.21,0.),vec3(.05,.02,.005),.001));
  d=min(d,sdRBox(q-vec3(0.,.14,-.093),vec3(.014,.02,.004),.002));
  return d; }
float ballot(vec3 p){ vec3 q=p-BC; q.xz=rot(-.25)*q.xz; q-=vec3(.005,.245,0.); q.xy=rot(.08)*q.xy;
  return sdRBox(q,vec3(.04,.045,.0012),.0008); }
#define CC vec3(-.1,0.,-.02)
float cushion(vec3 p){ vec3 q=p-CC; q.xz=rot(.35)*q.xz;
  float d=sdRBox(q-vec3(0.,.04,0.),vec3(.08,.012,.08),.028);
  d+=.004*smoothstep(.0,.06,.06-length(q.xz));
  vec2 c=abs(q.xz)-vec2(.098); float t=length(vec3(c.x,q.y-.04,c.y)*vec3(1.,.8,1.))-.01;
  return min(d,t); }
float crown(vec3 p){ vec3 q=p-CC-vec3(0.,.075,0.); float r=length(q.xz); float a=atan(q.z,q.x);
  float sec=6.2832/8.; float aa=mod(a,sec)-sec*.5; float f=abs(aa)/(sec*.5);
  float top=.03+.035*(1.-f);
  float band=max(abs(r-.055)-.0035,max(-q.y,q.y-top))-.001;
  vec3 tip=vec3(.055*cos(a-aa),.068,.055*sin(a-aa)); float ball=length(q-tip)-.0075;
  float rim=sdTorus(q-vec3(0.,.004,0.),.057,.0055);
  float rim2=sdTorus(q-vec3(0.,.026,0.),.057,.004);
  return min(min(band,min(rim,rim2)),ball); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,box(p),3.);
  r=U(r,lid(p),4.);
  r=U(r,ballot(p),5.);
  r=U(r,cushion(p),6.);
  r=U(r,crown(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BC; q.xz=rot(-.25)*q.xz; if(q.z<-.085){ vec2 u=q.xy-vec2(0.,.1);
      float sq=max(abs(u.x),abs(u.y))-.025; if(abs(sq)<.0025) return .25;
      if(sdSeg2(u,vec2(-.014,.0),vec2(-.004,-.012))<.003||sdSeg2(u,vec2(-.004,-.012),vec2(.018,.016))<.003) return .25; }
    return .5+.14*grain(p.zyx,45.); }
  if(id==4.) return .42+.1*grain(p.zyx,45.);
  if(id==5.){ vec3 q=p-BC; q.xz=rot(-.25)*q.xz; float l=fract((q.y-.23)/.012); if(abs(q.x)<.028&&q.y>.235&&l<.2) return .6; return .93; }
  if(id==6.){ vec3 q=p-CC; q.xz=rot(.35)*q.xz; if(max(abs(q.x),abs(q.z))>.09) return .35; if(abs(max(abs(q.x),abs(q.z))-.07)<.003) return .3; return .5; }
  if(id==7.){ vec3 q=p-CC-vec3(0.,.075,0.); float a=atan(q.z,q.x);
    float g=fract(a*8./6.2832); if(abs(q.y-.015)<.007&&abs(g-.5)<.12) return .25; return .72; }
  return .7; }
