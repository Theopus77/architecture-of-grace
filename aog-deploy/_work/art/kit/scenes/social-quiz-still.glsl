/* social-quiz "The Quiz Room" — the room that keeps score: a small slate in a wooden frame,
   propped up, with two bundles of chalk tally marks; a fill-in-the-blank quiz sheet with its
   word-bank box lying in front; a stick of chalk and a pencil.
   @params {"mat":{"3":[0.55,1.3,1.0],"4":[0.3,1.1,0.8],"5":[0.95,1.0,0.5],"6":[0.95,1.1,0.9],"7":[0.6,1.2,1.0]},
            "texlines":{"4":[0.12,0.4,0.95],"5":[0.12,0.4,0.9],"7":[0.12,0.4,0.6]}} */
#define CAM_POS vec3(-0.3771,0.4740,-0.9508)
#define CAM_TGT vec3(-0.2191,-0.0350,0.1095)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
/* slate: stands on its bottom edge, leaning back against nothing (a little prop behind) */
#define SL vec3(.04,0.,.12)
vec3 slQ(vec3 p){ vec3 q=p-SL; q.xz=rot(.25)*q.xz; q.yz=rot(.28)*q.yz; return q-vec3(0.,.11,0.); }
#define SW vec2(.15,.105)
float frameD(vec3 p){ vec3 q=slQ(p);
  float o=sdRBox(q,vec3(SW,.009).xyz,.004);
  float i=sdBox(q,vec3(SW-.016,.02));
  return max(o,-i); }
float slateD(vec3 p){ vec3 q=slQ(p); return sdBox(q,vec3(SW-.012,.004)); }
float propD(vec3 p){ vec3 q=p-SL; q.xz=rot(.25)*q.xz; return sdRBox(q-vec3(0.,.05,.07),vec3(.02,.05,.006),.003); }
float tally(vec2 u){ float d=1e3;   /* two bundles of five: four uprights and a slash, then three */
  for(int b=0;b<2;b++){ vec2 o=vec2(-.085+float(b)*.1,0.);
    int n=b==0?4:3;
    for(int i=0;i<4;i++){ if(i>=n) break; float x=o.x+float(i)*.016+.003*sin(float(i+b*4)*2.1);
      d=min(d,sdSeg2(u,vec2(x,-.045+.004*cos(float(i)*1.7)),vec2(x+.004,.045))); }
    if(b==0) d=min(d,sdSeg2(u,o+vec2(-.012,-.03),o+vec2(.062,.035))); }
  return d; }
/* quiz sheet lying on the table in front */
vec3 shQ(vec3 p){ vec3 q=p-vec3(-.03,0.,-.06); q.xz=rot(-.12)*q.xz; return q; }
float sheet(vec3 p){ vec3 q=shQ(p); float bend=.004*sin(q.x*20.)*smoothstep(.04,.1,q.x);
  return sdBox(q-vec3(0.,.0012+bend,0.),vec3(.125,.0008,.094)); }
float chalk(vec3 p){ vec3 q=p-vec3(.19,.006,.03); q.xz=rot(.5)*q.xz; return sdCapsule(q,vec3(-.03,0.,0.),vec3(.03,0.,0.),.006); }
vec3 pcQ(vec3 p){ vec3 q=p-vec3(.12,.0068,-.1); q.xz=rot(-.35)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,min(frameD(p),propD(p)),3.);
  r=U(r,slateD(p),4.);
  r=U(r,sheet(p),5.);
  r=U(r,chalk(p),6.);
  r=U(r,pencilD2(pcQ(p),.085),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return .52+.16*(grain(slQ(p).zxy,40.)-.5);
  if(id==4.){ vec3 q=slQ(p); if(tally(q.xy)<.0028) return .95; return .22+.05*fbm(q.xy*60.); }
  if(id==5.){ vec3 q=shQ(p); vec2 u=q.xz/1.25; float a=.96;
    for(int i=0;i<3;i++){ float y=.045-float(i)*.03;
      if(glyph((u-vec2(-.085,y))/.018,49+i)*.018<.0016) a=.25;                          /* 1 2 3 */
      if(abs(u.y-y)<.0011&&u.x>-.072&&u.x<-.02) a=.5;                                   /* the question */
      if(abs(u.y-y+.004)<.0009&&u.x>-.015&&u.x<.02) a=.3;                               /* the blank */
      if(abs(u.y-y)<.0011&&u.x>.024&&u.x<.04) a=.5; }
    float bx=sdBox2(u-vec2(.0,-.05),vec2(.08,.016)); if(abs(bx)<.0012) a=.3;           /* word bank */
    if(bx<0.&&abs(u.y+.05)<.001&&fract((u.x+.08)/.04)<.6&&abs(u.x)<.07) a=.55;
    return a; }
  if(id==6.) return .95;
  if(id==7.) return pencilTone(pcQ(p),.085);
  return .7; }
