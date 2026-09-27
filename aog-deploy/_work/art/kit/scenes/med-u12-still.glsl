/* Medicine Unit 12 "How Medicine Knows" — pencil still life: a wooden rack of four glass test
   tubes (two with liquid), a clipboard with a bar chart and hint-lines, and a pencil. */
#define CAM_POS vec3(-0.4653,0.2898,-1.0141)
#define CAM_TGT vec3(-0.2149,0.0621,0.1123)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define RC vec3(.03,0.,.04)
float rack(vec3 p){ vec3 q=p-RC;
  float base=sdRBox(q-vec3(0.,.008,0.),vec3(.14,.008,.04),.003);
  float top=sdRBox(q-vec3(0.,.1,0.),vec3(.14,.007,.03),.003);
  float xs=q.x; xs=xs-clamp(floor(xs/.07+.5),-1.5,1.5)*.07;
  vec3 h=vec3(q.x-clamp(floor((q.x+.035)/.07)*.07-.035+.0,-.105,.105),q.y,q.z);
  float holes=length(vec3(q.x-clamp(round((q.x-.035)/.07)*.07+.035,-.105,.105),0.,q.z).xz)-.017;
  top=max(top,-holes);
  float legs=min(sdRBox(vec3(abs(q.x)-.13,q.y-.055,q.z),vec3(.008,.05,.028),.002),1e3);
  return min(min(base,top),legs); }
float tubeX(int i){ return RC.x-.105+float(i)*.07; }
float tubes(vec3 p){ float d=1e3; for(int i=0;i<4;i++){ vec3 q=p-vec3(tubeX(i),0.,RC.z);
  float t=sdCapsule(q,vec3(0.,.03,0.),vec3(0.,.16,0.),.014); t=max(abs(t)-.0015,q.y-.165);
  t=min(t,sdTorus(q-vec3(0.,.165,0.),.0145,.0025)); d=min(d,t);} return d; }
float liquid(vec3 p){ float d=1e3; for(int i=0;i<4;i++){ if(i==1||i==3) continue; vec3 q=p-vec3(tubeX(i),0.,RC.z);
  d=min(d,max(sdCapsule(q,vec3(0.,.03,0.),vec3(0.,.16,0.),.0125),q.y-(i==0?.1:.075))); } return d; }
#define CB vec3(.3,.0,-.08)
vec3 cbQ(vec3 p){ vec3 q=p-CB; q.xz=rot(.3)*q.xz; return q; }
float board(vec3 p){ vec3 q=cbQ(p); float b=sdRBox(q-vec3(0.,.004,0.),vec3(.085,.004,.115),.003);
  float clip=sdRBox(q-vec3(0.,.012,.1),vec3(.035,.006,.014),.004); return min(b,clip); }
float paper(vec3 p){ vec3 q=cbQ(p); return sdBox(q-vec3(0.,.0088,-.01),vec3(.075,.0008,.1)); }
float pencilD(vec3 p){ vec3 q=p-vec3(.2,.0066,-.16); q.xz=rot(.5)*q.xz;
  float R=.0066; vec2 h=abs(q.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(q.x)-.08);
  float t=clamp((q.x-.08)/.024,0.,1.); float cone=max(length(q.yz)-R*(1.-t)*.95,max(.08-q.x,q.x-.104));
  return min(body,cone); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,rack(p),3.);
  r=U(r,tubes(p),4.);
  r=U(r,liquid(p),5.);
  r=U(r,board(p),6.);
  r=U(r,paper(p),7.);
  r=U(r,pencilD(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45+.12*grain(p,40.);
  if(id==4.) return .88;
  if(id==5.) return .5;
  if(id==6.) return .4;
  if(id==7.){ vec3 q=cbQ(p); vec2 u=vec2(q.x,q.z);
    if(u.y>.0){ float bx=floor((u.x+.06)/.03); float hgt=.02+.018*fract(sin(bx*7.1)*43.)+bx*.008;
      if(u.x>-.06&&u.x<.06&&fract((u.x+.06)/.03)<.6&&u.y<.01+hgt) return .35;
      if(abs(u.y-.008)<.001&&abs(u.x)<.065) return .2; }
    if(u.y<-.02&&u.y>-.1&&abs(u.x)<.06&&fract(u.y/.014)<.18) return .6;
    return .95; }
  if(id==8.){ vec3 q=p-vec3(.2,.0066,-.16); q.xz=rot(.5)*q.xz; if(q.x>.08) return q.x>.096?.12:.88; return .6; }
  return .7; }
