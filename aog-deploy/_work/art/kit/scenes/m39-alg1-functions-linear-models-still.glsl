/* Room m39 "Algebra I: Functions and Linear Models" — pencil still life of a linear model you
   can watch: a lit candle in a saucer holder that burns down at a steady rate, a ruler
   standing upright in a wooden foot beside it to measure the height, and a card propped
   behind with a straight falling line on a grid. */
#define CAM_POS vec3(-0.3433,0.4060,-0.7452)
#define CAM_TGT vec3(-0.2142,-0.0096,0.1210)
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
#define CN vec3(-.03,0.,-.02)
float holderD(vec3 p){ vec3 q=p-CN; float r=length(q.xz);
  float dish=max(abs(q.y-.004-r*r*1.2)-.0025,r-.06)-.001;
  float cup=max(abs(r-.024)-.002,abs(q.y-.016)-.012);
  float ring=sdTorus((q-vec3(.068,.01,0.)).xzy*vec3(1.,1.,1.),.012,.0028);
  ring=sdTorus(vec3(q.x-.07,q.z,q.y-.012),.013,.003);
  return min(min(dish,cup),ring); }
float candleD2(vec3 p){ vec3 q=p-CN-vec3(0.,.006,0.); float d=sdCylY(q-vec3(0.,.07,0.),.02,.07)-.001;
  d=max(d,-(length(q-vec3(0.,.158,0.))-.02)*1.);
  float drip=sdCapsule(q,vec3(.019,.135,-.006),vec3(.021,.11,-.008),.003);
  return min(d,drip); }
float wickD(vec3 p){ vec3 q=p-CN-vec3(0.,.006,0.); return sdCapsule(q,vec3(0.,.135,0.),vec3(.001,.15,0.),.0012); }
float flameD(vec3 p){ vec3 q=p-CN-vec3(0.,.158,0.); float w=.0065*(1.-smoothstep(.004,.03,q.y)); return max(sdEll(q-vec3(0.,.012,0.),vec3(.0068,.016,.0068)),-(q.y+.002)); }
vec3 ruQ(vec3 p){ vec3 q=p-vec3(.11,0.,.0); q.xz=rot(.4)*q.xz; return q; }
float rulerUpD(vec3 q){ float foot=sdRBox(q-vec3(0.,.01,0.),vec3(.03,.01,.03),.003);
  float r=sdRBox(q-vec3(0.,.1,0.),vec3(.016,.09,.003),.0012);
  return min(foot,r); }
vec3 cdQ(vec3 p){ vec3 q=p-vec3(.05,0.,.14); q.xz=rot(-.12)*q.xz; q.yz=rot(.3)*q.yz; return q; }
float cardD(vec3 q){ float c=sdRBox(q-vec3(0.,.1,0.),vec3(.13,.1,.003),.002);
  float prop=sdCapsule(q,vec3(-.1,.0,.05),vec3(-.1,.15,.01),.004); prop=min(prop,sdCapsule(q,vec3(.1,.0,.05),vec3(.1,.15,.01),.004));
  return min(c,prop); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,holderD(p),3.);
  r=U(r,candleD2(p),4.);
  r=U(r,wickD(p),5.);
  r=U(r,flameD(p),6.);
  r=U(r,rulerUpD(ruQ(p)),7.);
  r=U(r,cardD(cdQ(p)),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .5;
  if(id==4.) return .9;
  if(id==5.) return .15;
  if(id==6.){ vec3 q=p-CN-vec3(0.,.162,0.); return q.y<.002?.55:.97; }
  if(id==7.){ vec3 q=ruQ(p); if(q.y<.02) return .5+.08*grain(p,80.);
    if(q.z<-.002&&q.x<-.004){ float f=fract(q.y/.01); float big=fract(q.y/.05); if(big<.08||big>.92) return .2; if(f<.12||f>.88) return (q.x<-.009)?.35:.85; } return .82; }
  if(id==8.){ vec3 q=cdQ(p); vec2 u=q.xy-vec2(0.,.1);
    if(q.z>-.002) return .5;
    if(abs(u.x+.11)<.0015&&abs(u.y)<.085) return .2; if(abs(u.y+.085)<.0015&&u.x>-.11&&u.x<.12) return .2;
    if(sdSeg2(u,vec2(-.11,.07),vec2(.1,-.07))<.0022) return .15;
    vec2 g=abs(fract(u/.02+.5)-.5)*.02; if(min(g.x,g.y)<.0006&&u.x>-.11&&u.y>-.085) return .78;
    return .95; }
  return .7; }
