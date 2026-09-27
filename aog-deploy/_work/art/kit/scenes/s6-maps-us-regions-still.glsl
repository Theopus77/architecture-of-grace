/* Practice room "Maps and Regions of the United States" — pencil still life: a paper road map
   opened in an accordion fold (a coastline, rivers and a mountain line drawn on it, a small key
   box in one corner, no words), a pocket compass lying on it, and two round-headed map pins. */
#define CAM_POS vec3(-0.1585,0.1850,-0.4638)
#define CAM_TGT vec3(-0.0788,-0.0717,0.0710)
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
#define MP vec3(0.,0.,.02)
#define PW .06
#define CMP vec3(.13,0.,-.09)
vec3 mpQ(vec3 p){ vec3 q=p-MP; q.xz=rot(.12)*q.xz; return q; }
/* four panels along x, folded like a zigzag: heights rise and fall */
float fold(float x){ float t=(x+2.*PW)/PW; float k=clamp(t,0.,4.); float f=abs(fract(k*.5)-.5)*2.; return f*.02*smoothstep(0.,.3,k)+.0008; }
float mapD(vec3 q){ float y=fold(q.x); float d=max(abs(q.y-y)-.0007,max(abs(q.x)-2.*PW,abs(q.z)-.085)); return d*.8; }
vec3 cmQ(vec3 p){ vec3 q=p-CMP; q.xz=rot(.3)*q.xz; return q; }
float compassD(vec3 q){ float d=sdCylY(q-vec3(0.,.008,0.),.032,.008)-.003; d=min(d,sdTorus(q-vec3(0.,.016,0.),.032,.003));
  return d; }
float pinsD(vec3 p){ float d=1e3; for(int i=0;i<2;i++){ vec3 b=p-(i==0?vec3(-.03,0.,-.1):vec3(.02,0.,-.12));
    d=min(d,length(b-vec3(0.,.008,0.))-.008); d=min(d,sdCapsule(b,vec3(0.,.004,0.),vec3(.02,.0015,.01),.0009)); } return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,mapD(mpQ(p)),3.);
  r=U(r,compassD(cmQ(p)),4.);
  r=U(r,pinsD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=mpQ(p); vec2 u=q.xz;
    float coast=u.x-.09-.02*sin(u.y*40.)-.01*sin(u.y*110.); if(coast>0.) return abs(coast)<.0015?.25:.78;      /* sea to the right */
    if(abs(u.y+.04*sin(u.x*20.)+.02-u.x*.3)<.0012) return .35;                                                /* a river */
    if(abs(u.y-.05+.02*sin(u.x*35.))<.0012&&u.x<.0) return .4;                                                  /* another */
    float m=abs(u.x+.07+.01*sin(u.y*80.)); if(m<.012&&fract(u.y/.01)<.4&&u.y>-.06&&u.y<.06) return .45;        /* mountains, hatched */
    if(abs(abs(u.x+.1)-.016)<.001&&u.y<-.05&&u.y>-.08||abs(abs(u.y+.065)-.015)<.001&&u.x<-.084&&u.x>-.116) return .3;   /* key box */
    if(abs(u.x+.1)<.01&&abs(u.y+.065)<.01&&fract(u.y/.006)<.25) return .45;
    return .93; }
  if(id==4.){ vec3 q=cmQ(p); float r=length(q.xz); if(q.y>.012&&r<.028){ float a=atan(q.z,q.x); vec2 u=rot(-.3)*q.xz;
      if(abs(u.x)<.0065*(1.-abs(u.y)/.026)&&abs(u.y)<.026) return u.y>0.?.12:.55;       /* the needle */
      if(r>.022&&abs(fract(a/(PI/2.))-.5)>.46) return .25; if(r>.024&&abs(fract(a/(PI/8.))-.5)>.44) return .45; return .93; }
    return .45; }
  if(id==5.) return .4;
  return .7; }
