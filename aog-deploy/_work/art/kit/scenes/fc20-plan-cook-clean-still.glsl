/* Room "Plan It, Cook It, Clean It Up" — pencil still life: a small notepad with a checklist
   of hint-lines (plan), a lidded cooking pot with two handles (cook), a round wind-up kitchen
   timer, and a dish sponge (clean). */
#define CAM_POS vec3(-0.4500,0.3073,-0.7422)
#define CAM_TGT vec3(-0.1917,-0.0341,0.0512)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define PT vec3(-.02,0.,.08)
#define TM vec3(.16,0.,-.02)
float potD(vec3 p){ vec3 q=p-PT;
  float o=sdCylY(q-vec3(0.,.05,0.),.085,.05)-.003; float i=sdCylY(q-vec3(0.,.06,0.),.08,.05); float d=max(o,-i);
  d=min(d,sdTorus(q-vec3(0.,.1,0.),.084,.0035));
  vec3 h=vec3(abs(q.x)-.1,q.y-.085,q.z); float hd=length(vec2(length(h.xy)-.014,h.z))-.005; hd=max(hd,.087-abs(q.x)); d=min(d,hd);
  return d; }
float lidD(vec3 p){ vec3 q=p-PT-vec3(0.,.1,0.);
  float lid=max(length(q-vec3(0.,-.1,0.))-.13,-(length(q-vec3(0.,-.103,0.))-.127)); lid=max(lid,-q.y+.0); lid=max(lid,length(q.xz)-.088);
  float rim=sdTorus(q-vec3(0.,.002,0.),.087,.003);
  float knob=sdCylY(q-vec3(0.,.04,0.),.008,.01)-.002; knob=min(knob,sdEll(q-vec3(0.,.053,0.),vec3(.018,.007,.018)));
  return min(min(lid,rim),knob); }
vec3 tmQ(vec3 p){ return place(p,TM,.5); }
float timerD(vec3 p){ vec3 q=tmQ(p);
  float body=max(length(q-vec3(0.,.035,0.))-.05,-q.y);
  body=smin(body,sdCylY(q-vec3(0.,.008,0.),.048,.008),.01);
  float dial=sdTorus((q-vec3(0.,.04,0.)).xyz,.049,.003);
  float knob=sdCylY(q-vec3(0.,.09,0.),.007,.008)-.002;
  float feet=1e5; for(int i=0;i<3;i++){ float a=float(i)*2.09; feet=min(feet,length(q-vec3(cos(a)*.035,.002,sin(a)*.035))-.006); }
  return min(min(body,dial),min(knob,feet)); }
vec3 npQ(vec3 p){ vec3 q=p-vec3(-.14,.0,-.11); q.xz=rot(.25)*q.xz; return q; }
float padD(vec3 p){ vec3 q=npQ(p); float d=sdRBox(q-vec3(0.,.006,0.),vec3(.055,.006,.075),.002);
  for(int i=0;i<6;i++){ float x=-.042+float(i)*.017; d=min(d,sdTorus((q-vec3(x,.012,.074)).yzx,.005,.0012)); }
  return d; }
float spongeD(vec3 p){ vec3 q=place(p,vec3(.11,0.,-.14),-.3);
  return sdRBox(q-vec3(0.,.016,0.),vec3(.045,.016,.03),.006)+.0006*fbm(q.xz*400.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,potD(p),3.);
  r=U(r,lidD(p),4.);
  r=U(r,timerD(p),5.);
  r=U(r,padD(p),6.);
  r=U(r,spongeD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.) return .6;
  if(id==5.){ vec3 q=tmQ(p); vec3 d=q-vec3(0.,.035,0.); if(d.y>.02){ float a=atan(d.z,d.x); if(fract(a*12./6.2832)<.08) return .25; } if(abs(q.y-.04)<.004) return .3; return .82; }
  if(id==6.){ vec3 q=npQ(p); if(q.y>.01){ float l=fract((q.z+.08)/.02); if(abs(q.z)<.058&&l<.14&&q.x>-.03&&q.x<.042) return .45;
      if(abs(q.z)<.058&&l>.3&&l<.75&&abs(q.x+.042)<.007) return abs(q.x+.042)>.005||abs(fract((q.z+.08)/.02)-.52)>.2?.35:.92; }
    return .92; }
  if(id==7.){ vec3 q=place(p,vec3(.11,0.,-.14),-.3); return q.y>.02?.3:.7; }
  return .7; }
