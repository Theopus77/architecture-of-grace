/* Practice room "Rights in Writing" — pencil still life: a parchment unrolled between its two
   rolled ends (hint-lines only), a quill feather standing in an inkwell, and a round wax seal. */
#define CAM_POS vec3(-0.3708,0.4243,-0.8658)
#define CAM_TGT vec3(-0.2260,-0.0426,0.1068)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define SCR vec3(-.03,0.,-.03)
#define INK vec3(.1,0.,.12)
#define SEAL vec3(.2,.0,-.12)
vec3 scQ(vec3 p){ vec3 q=p-SCR; q.xz=rot(.1)*q.xz; return q; }
float sheetD(vec3 q){ return sdBox(q-vec3(0.,.0012+.004*sin(q.x*20.)*0.,0.),vec3(.15,.0008,.09)); }
float rollsD(vec3 q){ float d=1e3; for(int i=0;i<2;i++){ vec3 c=q-vec3(i==0?-.16:.16,.018,0.);
    float s=length(c.xy)-.018+.0015*sin(atan(c.y,c.x)*1.+length(c.xy)*400.)*0.; d=min(d,max(s,abs(c.z)-.095)); } return d; }
float inkD(vec3 q){ float d=sdRBox(q-vec3(0.,.022,0.),vec3(.032,.022,.032),.008); d=smin(d,sdCylY(q-vec3(0.,.05,0.),.013,.008),.006);
  d=max(d,-sdCylY(q-vec3(0.,.06,0.),.009,.012)); return d; }
vec3 quQ(vec3 p){ vec3 q=p-INK-vec3(0.,.045,0.); q.xz=rot(.25)*q.xz; q.xy=rot(.45)*q.xy; return q; }
float quillD(vec3 q){ float shaft=sdCapsule(q,vec3(0.,-.02,0.),vec3(0.,.16,0.),.0022);
  float t=clamp((q.y-.04)/.13,0.,1.); float w=.022*sin(t*PI)*(1.-.35*t)+.0015; float bend=q.y*q.y*.4;
  vec3 v=q-vec3(bend+w*.25,0.,0.);
  float vane=max(max(abs(v.x)-w,abs(v.z)-.0012),max(.04-q.y,q.y-.17));
  return min(shaft,vane*.8); }
float sealD(vec3 q){ float a=atan(q.z,q.x); float d=sdCylY(q-vec3(0.,.004,0.),.022+.002*sin(a*7.),.004)-.002;
  d=max(d,-(length(q.xz)-.014)*0.-0.); d=max(d,-max(abs(length(q.xz)-.013)-.0012,-(q.y-.009))); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 s=scQ(p);
  r=U(r,sheetD(s),3.);
  r=U(r,rollsD(s),4.);
  r=U(r,inkD(p-INK),5.);
  r=U(r,quillD(quQ(p)),6.);
  r=U(r,sealD(p-SEAL),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=scQ(p); if(q.y>0.&&q.y<.004){ float lz=(q.z-.068)/-.015; float li=floor(lz+.5); float f=abs(lz-li);
      if(li==0.&&f<.18&&abs(q.x)<.06) return .25;                                   /* a heading line */
      if(li>=2.&&li<=9.&&f<.09&&abs(q.x+ (li==9.?.04:0.))<(li==9.?.075:.12)) return .35; }
    return .88-.05*fbm(q.xz*40.); }
  if(id==4.) return .8-.08*fbm(p.xy*60.);
  if(id==5.) return .35;
  if(id==6.){ vec3 q=quQ(p); if(abs(q.x-q.y*q.y*.4)<.0015) return .45; return .88; }
  if(id==7.){ vec3 q=p-SEAL; if(length(q.xz)<.013&&q.y>.006) return .35; return .3; }
  return .7; }
