/* sp4-ser-estar "Ser, Estar and Describing People" — who you are and how or where you are now:
   a hand mirror lying on the table (ser: who and what), a thermometer on a little wooden stand
   (estar: how right now) and a pocket compass (estar: where). No people, no words. */
#define CAM_POS vec3(-0.4577,0.4905,-0.9111)
#define CAM_TGT vec3(-0.3018,-0.0108,0.1335)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
/* ---- thermometer on a wooden plaque standing in a foot ---- */
#define TC vec3(.12,0.,.06)
vec3 thQ(vec3 p){ vec3 q=place(p,TC,.25); return q; }
vec3 plQ(vec3 q){ vec3 r=q-vec3(0.,.02,0.); r.yz=rot(-.12)*r.yz; return r; }   /* leans back a little */
float plaqueD(vec3 q){ vec3 r=plQ(q);
  float b=sdRBox(r-vec3(0.,.125,0.),vec3(.036,.125,.007),.006);
  b=max(b,-(sdCylZ(r-vec3(0.,.232,0.),.005,.02)));                 /* hanging hole */
  return b; }
float footD(vec3 q){ return sdRBox(q-vec3(0.,.013,0.02),vec3(.058,.013,.04),.005); }
float tubeD(vec3 q){ vec3 r=plQ(q)-vec3(0.,0.,-.011);
  float t=sdCapsule(r,vec3(0.,.055,0.),vec3(0.,.215,0.),.0042);
  float bulb=length(r-vec3(0.,.048,0.))-.0085;
  float clip1=sdRBox(r-vec3(0.,.2,.003),vec3(.008,.004,.002),.001);
  float clip2=sdRBox(r-vec3(0.,.075,.003),vec3(.008,.004,.002),.001);
  return min(smin(t,bulb,.004),min(clip1,clip2)); }
/* ---- a small standing table mirror: oval glass on two posts, swivelling on side pins ---- */
#define MC vec3(-.12,0.,.05)
vec3 miQ(vec3 p){ return place(p,MC,-.3); }
vec3 ovQ(vec3 q){ vec3 r=q-vec3(0.,.125,0.); r.yz=rot(.12)*r.yz; return r; }   /* tipped back a little */
float ovalD(vec2 u){ return (length(u/vec2(.06,.08))-1.)*.06; }
float mirFrameD(vec3 q){
  float base=sdRBox(q-vec3(0.,.009,0.),vec3(.085,.009,.035),.005);
  vec3 c=q; c.x=abs(c.x);
  float post=sdCapsule(c,vec3(.074,.015,0.),vec3(.074,.13,0.),.0045);
  float pin=sdCylX(c-vec3(.066,.125,0.),.006,.008)-.001;
  vec3 r=ovQ(q); float o=ovalD(r.xy);
  float rim=max(o-.006,abs(r.z)-.007)-.001;
  rim=max(rim,-max(o,r.z+.004));                    /* the glass sits a little in */
  return min(min(base,post),min(pin,rim)); }
float mirGlassD(vec3 q){ vec3 r=ovQ(q); return max(ovalD(r.xy)+.001,abs(r.z+.002)-.0015); }
/* ---- pocket compass lying in front ---- */
#define CC vec3(.03,0.,-.08)
vec3 coQ(vec3 p){ return place(p,CC,.4); }
float compD(vec3 q){
  float c=sdCylY(q-vec3(0.,.008,0.),.034,.008)-.002;
  float bez=sdTorus(q-vec3(0.,.017,0.),.033,.003);
  c=max(c,-sdCylY(q-vec3(0.,.019,0.),.029,.004));
  float stem=sdCylZ(q-vec3(0.,.009,.04),.005,.006)-.001;
  vec3 b=q-vec3(0.,.009,.055); float bail=sdTorus(b.xzy,.009,.0022);
  return min(min(c,bez),min(stem,bail)); }
float compGlassD(vec3 q){ return sdCylY(q-vec3(0.,.0155,0.),.029,.0008); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.45-p.z,2.);
  vec3 t=thQ(p);
  r=U(r,plaqueD(t),3.);
  r=U(r,footD(t),4.);
  r=U(r,tubeD(t),5.);
  vec3 m=miQ(p);
  r=U(r,mirFrameD(m),6.);
  r=U(r,mirGlassD(m),7.);
  vec3 c=coQ(p);
  r=U(r,compD(c),8.);
  r=U(r,compGlassD(c),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 r=plQ(thQ(p)); float a=.62+.1*grain(r.yxz,90.);
    if(r.z<-.004&&r.y>.06&&r.y<.21){ float k=fract((r.y-.06)/.01); float big=step(.8,fract((r.y-.06)/.05+.1));
      float w=big>0.?.017:.011;
      if(abs(r.x)>.008&&abs(r.x)<w&&(k<.16||k>.95)) a=.18; }
    if(r.z<-.004&&abs(abs(r.x)-.03)<.0015&&r.y>.02&&r.y<.23) a=.4;   /* painted border */
    return a; }
  if(id==4.) return .45+.1*grain(thQ(p),70.);
  if(id==5.){ vec3 r=plQ(thQ(p)); if(r.y<.14&&abs(r.x)<.0022) return .12; if(r.y<.058) return .15; return .9; }
  if(id==6.){ vec3 r=ovQ(miQ(p)); float o=ovalD(r.xy); if(o>.001&&o<.004&&r.z<-.006) return .25; return .42+.1*grain(miQ(p),80.); }
  if(id==7.){ vec3 r=ovQ(miQ(p)); float s=r.x*.7+r.y*.7-.125*0.;          /* two soft reflection streaks */
    if(abs(s+.01)<.012) return .97; if(abs(s-.022)<.004) return .95; return .78; }
  if(id==8.) return .42;
  if(id==9.){ vec3 q=coQ(p); vec2 u=q.xz; float r=length(u);
    float nd=abs(u.x)*3.2+abs(u.y)-.024;                      /* the needle, north half dark */
    if(nd<0.) return u.y>0.?.1:.8;
    if(r<.003) return .3;
    float a=atan(u.y,u.x); if(r>.022&&r<.027&&abs(fract(a/1.5708+.5)-.5)<.03) return .2;   /* four marks */
    if(r>.024&&r<.026&&abs(fract(a/.3927+.5)-.5)<.08) return .45;
    return .88; }
  return .7; }
