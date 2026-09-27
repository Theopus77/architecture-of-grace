/* fc8 "Nutrition and Meal Planning" — a tall cereal box, one measured serving in a bowl with a
   spoon, and a metal measuring cup with a long handle. */
#define CAM_POS vec3(-0.4987,0.3115,-0.7802)
#define CAM_TGT vec3(-0.2128,0.0064,0.1160)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
#define CB vec3(-.06,0.,.14)
vec3 cbQ(vec3 p){ return place(p,CB,-.3); }
float box(vec3 p){ vec3 q=cbQ(p);
  float d=sdRBox(q-vec3(0.,.11,0.),vec3(.065,.11,.022),.002);
  vec3 t=q-vec3(0.,.22,0.); d=min(d,max(sdRBox(t,vec3(.064,.006,.021),.001),-t.y+.0)); /* folded top flap */
  return d; }
#define BW vec3(.07,0.,-.05)
float bowl(vec3 p){ vec3 q=p-BW;
  vec3 c=q-vec3(0.,.09,0.); float s=length(c)-.085; s=abs(s)-.003; s=max(s,q.y-.055);
  float foot=sdCylY(q-vec3(0.,.005,0.),.03,.005)-.001;
  return min(s*.85,foot); }
float cereal(vec3 p){ vec3 q=p-BW; vec3 v=voro(q.xz*110.);
  float top=.047+.004*(1.-smoothstep(0.,.35,v.x));
  return max(q.y-top,length(q.xz)-.076); }
vec3 spQ(vec3 p){ vec3 q=p-BW-vec3(.035,.058,.0); q.xy=rot(.45)*q.xy; q.xz=rot(-.3)*q.xz; return q; }
float spoon(vec3 p){ vec3 q=spQ(p); float h=sdCapsule(q,vec3(0.),vec3(.09,0.,0.),.003);
  vec3 b=q-vec3(-.012,-.004,0.); float bowl=max(abs(sdEll(b,vec3(.02,.008,.013)))-.001,b.y-.002);
  return min(h,bowl); }
#define MC vec3(-.03,0.,-.1)
float mcup(vec3 p){ vec3 q=p-MC;
  float o=sdCylY(q-vec3(0.,.025,0.),.032,.025)-.001; o=max(o,-sdCylY(q-vec3(0.,.03,0.),.03,.025));
  vec3 h=q-vec3(.07,.05,-.01); h.xz=rot(.2)*h.xz; float hd=sdRBox(h,vec3(.04,.002,.007),.002);
  hd=max(hd,-(length(h.xz-vec2(-.03,0.))-.003));
  return min(o,hd); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,box(p),3.);
  r=U(r,bowl(p),4.);
  r=U(r,cereal(p),5.);
  r=U(r,spoon(p),6.);
  r=U(r,mcup(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=cbQ(p); if(q.z<-.02){ vec2 u=vec2(q.x,q.y-.11);
      if(abs(u.y-.07)<.014&&abs(u.x)<.05) return .35;                                  /* a title band */
      float bw=length((u-vec2(0.,-.03))*vec2(1.,1.8))-.04; if(bw<0.&&u.y<-.03) return .55;
      if(abs(bw)<.0018) return .3;
      if(length(u-vec2(-.012,-.026))<.008||length(u-vec2(.015,-.022))<.007||length(u-vec2(0.,-.018))<.007) return .6;
      if(abs(u.y+.09)<.0015&&abs(u.x)<.04) return .5; }
    return .8; }
  if(id==4.) return .85;
  if(id==5.){ vec3 v=voro((p-BW).xz*110.); return v.x<.08?.35:.6; }
  if(id==6.) return .6;
  if(id==7.){ vec3 q=p-MC; if(q.y<.05&&abs(fract(q.y/.012)-.5)<.05&&length(q.xz)>.03) return .35; return .7; }
  return .7; }
