/* m44 "Similarity and Right-Triangle Trigonometry" — a home-made clinometer (a protractor on a
   post with a sighting tube along its straight edge and a plumb bob hanging on a string), and
   two wooden right-triangle wedges of the same shape, one twice the size of the other. */
#define CAM_POS vec3(-0.6059,0.2354,-0.8289)
#define CAM_TGT vec3(-0.2189,0.0144,0.1661)
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
/* clinometer: pivot at CC on top of a post, protractor turned up by TILT */
#define CC vec3(-.02,.2,.12)
#define TILT .45
#define PR .11
#define WR -.15
vec3 cQ(vec3 p){ vec3 q=p-CC; q.xz=rot(-.25)*q.xz; return q; }            /* post frame */
vec3 prQ(vec3 p){ vec3 q=cQ(p); q.xy=rot(-TILT)*q.xy; return q; }         /* protractor frame, flat edge along x at y=0, arc below */
float protractor(vec3 p){ vec3 q=prQ(p);
  float d2=max(length(q.xy)-PR,q.y);
  d2=max(d2,-(max(length(q.xy)-PR*.52,q.y+.012)));                        /* the inner window */
  return extrude(d2,q.z,.0035,.0012); }
float tube(vec3 p){ vec3 q=prQ(p); return max(abs(sdCylX(q-vec3(0.,.009,0.),.0075,PR*1.05))-.0014,0.)-.0003; }
float tubeS(vec3 p){ vec3 q=prQ(p); float o=sdCylX(q-vec3(0.,.009,0.),.0075,PR*1.05); float i=sdCylX(q-vec3(0.,.009,0.),.006,PR*1.2); return max(o,-i); }
/* the plumb string hangs straight down from the pivot */
float bob(vec3 p){ vec3 q=cQ(p)-vec3(0.,0.,-.008);
  float s=sdCapsule(q,vec3(0.),vec3(0.,-.095,0.),.0008);
  vec3 b=q-vec3(0.,-.1,0.);
  float w=sdCone(b,.0,.015,.02);
  w=min(w,sdEll(b-vec3(0.,.008,0.),vec3(.014,.008,.014)));
  return min(s,w); }
float post(vec3 p){ vec3 q=cQ(p);
  float pole=sdCylY(q-vec3(0.,-CC.y*.5-.004,.02),.007,CC.y*.5-.006);
  float knob=sdCylZ(q-vec3(0.,0.,.012),.009,.012)-.001;
  float base=sdCylY(q-vec3(0.,-CC.y+.008,.02),.05,.008)-.002;
  return min(min(pole,knob),base); }
/* two wooden right-triangle wedges of the same shape, one twice the size of the other */
float wedge(vec3 q,float k){ float d2=sdTri2(q.xy,vec2(-.06,0.)*k,vec2(.06,0.)*k,vec2(-.06,.07)*k);
  return extrude(d2+.003,q.z,.016,.003); }
vec3 w1Q(vec3 p){ return place(p,vec3(.19,0.,.02),WR); }
vec3 w2Q(vec3 p){ return place(p,vec3(.03,0.,-.17),WR); }
float tblock(vec3 p){ return wedge(w1Q(p),1.6); }
float tsmall(vec3 p){ return wedge(w2Q(p),.8); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,protractor(p),3.);
  r=U(r,tubeS(p),4.);
  r=U(r,bob(p),5.);
  r=U(r,post(p),6.);
  r=U(r,tblock(p),7.);
  r=U(r,tsmall(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=prQ(p); float r=length(q.xy); float a=atan(-q.y,q.x);    /* 0..pi along the arc */
    if(abs(q.z)<.0034) return .7;
    float t=fract(a/(PI/36.)+.5); float big=fract(a/(PI/6.)+.5);
    if(r>PR-.012&&abs(t-.5)>.44) return .2;
    if(r>PR-.022&&abs(big-.5)>.47) return .15;
    return .88; }
  if(id==4.) return .55;
  if(id==5.) return .35;
  if(id==6.) return .5+.08*grain(p.xzy,5.);
  if(id==7.||id==8.) return .62+.08*grain(p,5.);
  return .7; }
