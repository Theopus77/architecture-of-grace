/* sp9 "Pronouns, Reflexives and Commands" — the morning routine of the reflexive verbs
   (me miro, me peino, me lavo los dientes): a round standing mirror, a comb lying in front of
   it, and a toothbrush leaning in a glass tumbler.
   @params {"mat":{"3":[0.5,1.3,1.0],"4":[0.62,1.0,0.4],"5":[0.4,1.3,1.0],"6":[0.75,1.3,1.0],"7":[0.55,1.3,1.0],"8":[0.3,1.2,0.8]},
            "texlines":{"4":[0.12,0.4,0.6],"5":[0.12,0.4,0.7],"8":[0.12,0.4,0.6]}} */
#define CAM_POS vec3(-0.4570,0.5388,-0.9772)
#define CAM_TGT vec3(-0.2907,0.0033,0.1387)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define MC vec3(-.04,0.,.12)
#define MRY .3
#define MR .11
/* the mirror split in two: frame, stem and foot (3) and the glass (4) */
vec2 mirr(vec3 p){ vec3 q=P(p,MC,MRY); vec3 c=q-vec3(0.,MR+.06,0.);
  float frame=length(vec2(length(c.xy)-MR,c.z))-.011;
  float back=max(length(c.xy)-MR,abs(c.z-.006)-.004);
  float glass=max(length(c.xy)-MR+.004,abs(c.z+.001)-.002);
  float stem=sdCylY(q-vec3(0.,.035,.0),.009,.035);
  float neck=sdCylY(q-vec3(0.,.062,.0),.013,.006)-.002;
  float foot=sdCylY(q-vec3(0.,.007,0.),MR*.55,.006)-.003;
  float d=min(min(frame,back),min(min(stem,neck),foot));
  return vec2(d,glass); }
/* a comb lying flat on the table, spine along x, teeth pointing toward us */
vec3 cbQ(vec3 p){ vec3 q=P(p,vec3(.03,0.,-.06),-.2)*.7; return q; }
float combL(vec3 q){
  float spine=sdRBox(q-vec3(0.,.004,.012),vec3(.085,.0035,.009),.002);
  float x=q.x; float cell=.0075; float xi=mod(x+cell*.5,cell)-cell*.5;
  float L=abs(x)<.045?.03:.022;                       /* coarse half and fine half */
  float tooth=sdRBox(vec3(xi,q.y-.004,q.z+L*.5-.004),vec3(.0017,.0026,L*.5),.001);
  tooth=max(tooth,abs(x)-.082);
  return min(spine,tooth); }
float comb(vec3 p){ return combL(cbQ(p))*1.4286; }
#define TC vec3(.17,0.,.03)
float tumbler(vec3 p){ vec3 q=p-TC;
  float o=sdCylY(q-vec3(0.,.04,0.),.036-.004*(q.y/.08),.04)-.002;
  float i=sdCylY(q-vec3(0.,.047,0.),.031-.004*(q.y/.08),.04);
  return max(o,-i); }
vec3 tbQ(vec3 p){ vec3 q=p-(TC+vec3(-.006,.012,.004)); q.xy=rot(.42)*q.xy; q.zy=rot(-.2)*q.zy; return q; }
vec2 brush(vec3 p){ vec3 q=tbQ(p);
  float h=sdCapsule(q,vec3(0.),vec3(0.,.15,0.),.0055);
  h=smin(h,sdEll(q-vec3(0.,.08,0.),vec3(.0075,.03,.0065)),.01);
  float head=sdRBox(q-vec3(0.,.172,0.),vec3(.006,.022,.0035),.003);
  h=smin(h,head,.006);
  float bristle=sdRBox(q-vec3(0.,.172,-.0075),vec3(.0055,.02,.005),.001);
  return vec2(h,bristle); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 m=mirr(p); r=U(r,m.x,3.); r=U(r,m.y,4.);
  r=U(r,comb(p),5.);
  r=U(r,tumbler(p),6.);
  vec2 b=brush(p); r=U(r,b.x,7.); r=U(r,b.y,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=P(p,MC,MRY); vec3 c=q-vec3(0.,MR+.06,0.);
    float a=atan(c.y,c.x); if(abs(length(c.xy)-MR)<.012&&fract(a*9.55)<.18) return .35;   /* beaded rim */
    return .5; }
  if(id==4.){ vec3 q=P(p,MC,MRY); vec3 c=q-vec3(0.,MR+.06,0.); float s=c.x+c.y;
    if(abs(s-MR*.3)<.016||abs(s-MR*.62)<.007) return .97;                              /* two glints */
    return .45+.12*c.y/MR; }
  if(id==5.){ vec3 q=cbQ(p); if(q.z>.0) return .45; return .5; }
  if(id==6.){ vec3 q=p-TC; if(abs(q.y-.062)<.003) return .45; if(abs(atan(q.z,q.x)+2.1)<.18) return .97; return .72; }
  if(id==7.){ vec3 q=tbQ(p); if(abs(q.y-.08)<.022&&abs(q.z)<.004&&q.z<0.) return .4; return .6; }
  if(id==8.){ vec3 q=tbQ(p); return fract(q.y/.005)<.4?.2:.45; }
  return .7; }
