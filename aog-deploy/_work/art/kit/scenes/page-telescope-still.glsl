/* Telescope page — pencil still life: a brass refracting telescope on a wooden tripod, a rolled
   star chart on the table and a small pocket compass. */
#define CAM_POS vec3(-0.5873,0.5460,-1.3780)
#define CAM_TGT vec3(-0.3650,0.0626,0.1132)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define HEAD vec3(-.02,.26,.08)
/* tripod: three turned legs from the head to the table */
float legs(vec3 p){ float d=1e9;
  for(int i=0;i<3;i++){ float a=float(i)*2.094+.4; vec3 f=vec3(sin(a)*.1,0.,cos(a)*.1)+vec3(HEAD.x,0.,HEAD.z);
    d=min(d,sdCapsule(p,HEAD-vec3(0.,.012,0.),f,.0065));
    d=min(d,sdCapsule(p,f+vec3(0.,.004,0.),f,.009)); }                           /* feet */
  d=min(d,sdCylY(p-HEAD+vec3(0.,.008,0.),.02,.01)-.002);                           /* head block */
  d=min(d,sdCylY(p-HEAD-vec3(0.,.01,0.),.006,.012));                               /* post */
  return d; }
/* telescope tube frame: along local x, tipped up toward the upper right */
vec3 tq(vec3 p){ vec3 q=p-HEAD-vec3(0.,.035,0.); q.xz=rot(.55)*q.xz; q.xy=rot(.45)*q.xy; return q; }
float tubeD(vec3 p){ vec3 q=tq(p);
  float main=sdCylX(q-vec3(.02,0.,0.),.022,.14)-.001;
  float hood=sdCylX(q-vec3(.185,0.,0.),.027,.035)-.001;
  hood=max(hood,-sdCylX(q-vec3(.2,0.,0.),.023,.04));
  float ring=min(sdCylX(q-vec3(.15,0.,0.),.025,.004),sdCylX(q-vec3(-.1,0.,0.),.024,.004))-.001;
  float draw=sdCylX(q-vec3(-.15,0.,0.),.013,.035)-.001;
  float eye=sdCylX(q-vec3(-.19,0.,0.),.009,.012)-.001;
  float knob=sdCylZ(q-vec3(-.12,-.018,.0),.006,.03)-.001;
  float finder=sdCylX(q-vec3(-.02,.034,0.),.006,.05)-.001;
  finder=min(finder,sdRBox(q-vec3(-.02,.026,0.),vec3(.004,.008,.003),.001));
  float cradle=sdRBox(q-vec3(0.,-.025,0.),vec3(.03,.006,.012),.003);
  return min(min(min(main,hood),min(ring,draw)),min(min(eye,knob),min(finder,cradle))); }
/* rolled star chart lying on the table, tied with a string */
vec3 cq(vec3 p){ vec3 q=p-vec3(-.03,.024,-.08); q.xz=rot(-.3)*q.xz; return q; }
float chartD(vec3 p){ vec3 q=cq(p); float r=length(q.yz);
  float roll=max(abs(r-.017)-.006,abs(q.x)-.11);
  float end=max(r-.012,abs(q.x)-.112);   /* inner turns visible at the ends */
  return min(roll-.0005,max(end,-(r-.004))); }
float tieD(vec3 p){ vec3 q=cq(p); return sdTorus(vec3(q.y,q.x-.03,q.z).xzy*vec3(1.,1.,1.),.024,.0018); }
vec3 kq(vec3 p){ return p-vec3(.25,0.,.02); }
float compD(vec3 p){ vec3 q=kq(p);
  float c=sdCylY(q-vec3(0.,.008,0.),.032,.006)-.003;
  c=max(c,-(sdCylY(q-vec3(0.,.016,0.),.026,.004)));
  float bow=sdTorus((q-vec3(0.,.012,.038)).xzy,.008,.002);
  return min(c,bow); }
float needleD(vec3 p){ vec3 q=kq(p)-vec3(0.,.0125,0.); q.xz=rot(.6)*q.xz;
  float nd=max(abs(q.y)-.001,abs(q.x)*.25+abs(q.z)-.0055); nd=max(nd,abs(q.x)-.022);
  return min(nd,sdCylY(q,.003,.002)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,legs(p),3.);
  r=U(r,tubeD(p),4.);
  r=U(r,chartD(p),5.);
  r=U(r,tieD(p),6.);
  r=U(r,compD(p),7.);
  r=U(r,needleD(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ return fract(p.y*60.+fbm(p.xz*40.))<.2?.4:.5; }   /* wood grain */
  if(id==4.){ vec3 q=tq(p); if(abs(q.x-.15)<.005||abs(q.x+.1)<.005) return .3; return q.x<-.115?.45:.62; }
  if(id==5.){ vec3 q=cq(p); float r=length(q.yz);
    if(abs(q.x)>.108) return fract(r/.0035)<.35?.45:.85;           /* spiral of turns */
    vec2 u=vec2(q.x,atan(q.y,q.z)*.023);                            /* dots and a dipper line of stars */
    vec2 g=fract(u/.018)-.5; if(length(g)<.09&&h1(floor(u/.018))>.55) return .25;
    return .86; }
  if(id==6.) return .35;
  if(id==7.){ vec3 q=kq(p); float r=length(q.xz);
    if(q.y>.012&&r<.027){ float a=atan(q.z,q.x); if(r>.02&&fract(a/.3927)<.12) return .3; return .9; }
    return .5; }
  if(id==8.){ vec3 q=kq(p); q.xz=rot(.6)*q.xz; return q.x>0.?.15:.6; }
  return .7; }
