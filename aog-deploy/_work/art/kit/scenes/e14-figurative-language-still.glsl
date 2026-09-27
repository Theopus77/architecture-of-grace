/* Room e14 "Figurative Language" — pencil still life: a round tabletop mirror on its
   swivel stand (one thing seen as another), an hourglass ("time is sand running out"), and
   a feather quill standing in an inkwell. */
#define CAM_POS vec3(-0.4392,0.4860,-0.9386)
#define CAM_TGT vec3(-0.2808,-0.0238,0.1241)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
#define MC vec3(.0,.15,.08)
vec3 mQ(vec3 p){ vec3 q=p-MC; q.xz=rot(-.35)*q.xz; q.yz=rot(.12)*q.yz; return q; }
float mirrorD(vec3 q){ float r=length(q.xy);
  float glass=max(r-.09,abs(q.z)-.003);
  float frame=length(vec2(r-.095,q.z))-.009;
  return min(glass,frame); }
float standD(vec3 p){ vec3 q=p-vec3(MC.x,0.,MC.z); q.xz=rot(-.35)*q.xz;
  float base=sdRBox(q-vec3(0.,.008,0.),vec3(.085,.008,.04),.005);
  float a=sdCapsule(q,vec3(-.11,.016,0.),vec3(-.106,.15,0.),.0055);
  float b=sdCapsule(q,vec3(.11,.016,0.),vec3(.106,.15,0.),.0055);
  float feetA=sdRBox(q-vec3(-.11,.012,0.),vec3(.012,.012,.03),.004), feetB=sdRBox(q-vec3(.11,.012,0.),vec3(.012,.012,.03),.004);
  float pins=max(sdCylX(q-vec3(0.,.15,0.),.0045,.11),.1-abs(q.x));
  return min(min(min(a,b),min(feetA,feetB)),min(pins,base)); }
#define HG vec3(-.19,0.,-.06)
float glassHD(vec3 p){ vec3 q=p-HG-vec3(0.,.09,0.); float r=length(q.xz);
  float y=abs(q.y); float R=.008+.034*sin(clamp(y/.075,0.,1.)*2.4);
  float d=max(r-R,y-.075);
  return abs(d)*.7-.0012; }
float frameHD(vec3 p){ vec3 q=p-HG;
  float b=sdCylY(q-vec3(0.,.008,0.),.05,.008)-.002, t=sdCylY(q-vec3(0.,.172,0.),.05,.008)-.002;
  float d=min(b,t);
  for(int i=0;i<3;i++){ float a=float(i)*2.0944+.4; d=min(d,sdCylY(q-vec3(.043*cos(a),.09,.043*sin(a)),.0045+.0015*sin(q.y*80.),.08)); }
  return d; }
float sandD(vec3 p){ vec3 q=p-HG-vec3(0.,.09,0.); float r=length(q.xz);
  float lo=max(q.y+.075-.03+r*.7,-q.y-.074); lo=max(lo,r-.036); lo=max(lo,q.y);
  float hi=max(q.y-.03,r-.024*clamp(q.y/.03,0.,1.)-.001); hi=max(hi,-q.y);
  float stream=max(r-.0012,abs(q.y+.03)-.03);
  return min(min(lo,hi),stream); }
#define IC vec3(.16,0.,-.03)
float inkD(vec3 p){ vec3 q=p-IC; float r=length(q.xz);
  float body=sdCylY(q-vec3(0.,.022,0.),.036-.006*smoothstep(.02,.044,q.y),.022)-.003;
  float neck=sdCylY(q-vec3(0.,.048,0.),.014,.006)-.002;
  float d=min(body,neck); d=max(d,-sdCylY(q-vec3(0.,.05,0.),.009,.02));
  return d; }
float quillD(vec3 p){ vec3 a=IC+vec3(0.,.03,0.), b=IC+vec3(.06,.22,.06);
  float shaft=sdCapsule(p,a,b,.0022);
  vec3 ax=normalize(b-a); vec3 q=p-a; float t=dot(q,ax); vec3 pe=q-ax*t;
  vec3 side=normalize(cross(ax,vec3(0.,0.,1.)));
  float u=dot(pe,side), v=dot(pe,cross(ax,side));
  float s=clamp((t-.07)/.15,0.,1.); float w=.02*sin(s*3.1416)*(t>.07?1.:0.);
  float vane=max(max(abs(u-.003)-w-.0005,abs(v)-.0012),abs(t-.15)-.08);
  return min(shaft,vane*.8); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 m=mQ(p);
  r=U(r,mirrorD(m),3.);
  r=U(r,standD(p),4.);
  r=U(r,frameHD(p),5.);
  r=U(r,glassHD(p),8.);
  r=U(r,sandD(p),9.);
  r=U(r,inkD(p),6.);
  r=U(r,quillD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=mQ(p); float r=length(q.xy); if(r>.09) return .45;
    float g=q.x+q.y; if(abs(g-.03)<.006||abs(g-.052)<.003) return .97; return .82; }
  if(id==4.) return .45+.08*grain(p,70.);
  if(id==5.) return .42+.08*grain(p,70.);
  if(id==8.) return .93;
  if(id==9.) return .6;
  if(id==6.) return .3;
  if(id==7.){ vec3 a=IC+vec3(0.,.03,0.); float t=dot(p-a,normalize(vec3(.06,.19,.06))); float f=fract(t*160.); return f<.25?.6:.85; }
  return .7; }
