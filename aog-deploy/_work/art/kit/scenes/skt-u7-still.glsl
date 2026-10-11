/* Skateboarding Unit 7 "Pools, Parks and the Ollie" — pencil still life: a model section of an empty
   backyard pool wall (curved concrete transition, a band of square tiles and a rounded coping stone on
   top), a skate magazine and a VHS video cassette lying on it. Objects only, no writing. */
#define CAM_POS vec3(-0.5322,0.2674,-0.8175)
#define CAM_TGT vec3(-0.2176,-0.0560,0.0361)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sktparts_a.glsl"
/* a pool coping stone: a rounded bullnose on top, a row of square tiles on its face, rough concrete behind */
vec3 poolQ(vec3 p){ return sk_place(p,vec3(-.1,0.,.12),.15); }
float poolD(vec3 p){ vec3 q=poolQ(p);
  return sdRBox(q-vec3(0.,.055,.0),vec3(.16,.055,.06),.004)+.0008*fbm(q.xy*80.); }
float copeD(vec3 p){ vec3 q=poolQ(p);
  float c=sdCylX(q-vec3(0.,.112,-.045),.026,.163)-.002;
  float bed=sdRBox(q-vec3(0.,.124,.01),vec3(.163,.014,.055),.003);
  return min(c,bed); }
float poolT(vec3 p){ vec3 q=poolQ(p);
  if(q.z<-.057&&q.y>.04){ vec2 g=fract(vec2((q.x+.16)/.04,(q.y-.04)/.04)); if(g.x<.08||g.y<.08) return .3; return .5+.08*vn(q.xy*200.); }  /* tile row */
  return .72+.12*vn(q.xy*300.+q.z*300.)-.15*step(.9,vn(q.xz*900.+q.y*600.)); }
float copeT(vec3 p){ vec3 q=poolQ(p); if(fract((q.x+.163)/.1087)<.03) return .35; return .84-.06*vn(q.xy*300.); }
/* magazine and cassette */
vec3 magQ(vec3 p){ return sk_place(p,vec3(.02,0.,-.19),.3); }
float magD(vec3 p){ vec3 q=magQ(p); return sdRBox(q-vec3(0.,.003,0.),vec3(.105,.003,.14),.0012); }
float magT(vec3 p){ vec3 q=magQ(p); vec2 u=q.xz; if(q.y<.005) return fract(q.y/.0009)<.4?.7:.9;
  if(u.y>.1&&u.y<.128&&abs(u.x)<.09) return .25;                          /* masthead block */
  if(abs(u.x)<.09&&u.y<.09&&u.y>-.06){ float w=sin(u.x*40.)*.02-.0;        /* cover photo: a ramp drawn as a curve */
    if(u.y<-.03+.06*(1.-sqrt(max(1.-((u.x+.09)/.18)*((u.x+.09)/.18),0.)))) return .4; return .7; }
  if(u.y<-.075&&u.y>-.125&&u.x<.0&&u.x>-.09&&fract(u.y/.012)<.35) return .45;
  return .88; }
vec3 vhsQ(vec3 p){ vec3 q=sk_place(p,vec3(.17,0.,-.02),-.15)/1.35; q.yz=rot(-.22)*q.yz; return vec3(q.x,.0125-q.z,q.y-.052); }
float vhsD(vec3 p){ vec3 q=vhsQ(p); float b=sdRBox(q-vec3(0.,.0125,0.),vec3(.094,.0125,.052),.002);
  float win=sdBox(q-vec3(0.,.025,.008),vec3(.045,.0025,.018));
  vec3 r=vec3(abs(q.x)-.03,q.y-.025,q.z-.008);
  float hole=sdCylY(r,.0145,.007);
  float hub=sdCylY(r-vec3(0.,-.004,0.),.0065,.004);
  return min(max(max(b,-win),-hole),hub)*1.35; }
float vhsT(vec3 p){ vec3 q=vhsQ(p); vec2 u=q.xz;
  if(q.y>.0235){
    for(int i=0;i<2;i++){ vec2 c=u-vec2(i==0?-.03:.03,.008); float r=length(c);
      if(r<.0068){ return fract(atan(c.y,c.x)*3./3.14159)<.3&&r>.0025?.9:.35; }
      if(r<.015) return .2; }
    if(abs(u.x)<.045&&abs(u.y-.008)<.018) return .6;                    /* window */
    if(abs(u.x)<.075&&u.y<-.018&&u.y>-.045){ if(abs(u.x)<.06&&abs(u.y+.03)<.0025) return .55; return .9; }  /* blank label */
    return .4; }
  if(q.z<-.05&&abs(q.x)<.08&&q.y>.005&&q.y<.02) return .85;            /* spine label */
  return .22; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,poolD(p),3.);
  r=U(r,copeD(p),4.);
  r=U(r,magD(p),5.);
  r=U(r,vhsD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return poolT(p);
  if(id==4.) return copeT(p);
  if(id==5.) return magT(p);
  if(id==6.) return vhsT(p);
  return .7; }
