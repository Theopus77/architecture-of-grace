/* s1 "Government: Local, State, National" — a small model of a domed capitol building with
   columns and steps, a wooden gavel on its sound block, and a ballot box with a slot. */
#define CAM_POS vec3(-0.3855,0.2714,-0.6727)
#define CAM_TGT vec3(-0.1407,0.0103,0.0944)
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
#define CP vec3(-.04,0.,.14)
vec3 cQ(vec3 p){ return place(p,CP,-.3); }
float capitol(vec3 p){ vec3 q=cQ(p);
  float steps=1e5; for(int i=0;i<3;i++){ float fi=float(i); steps=min(steps,sdBox(q-vec3(0.,.005+fi*.01,-.005*fi),vec3(.13-.008*fi,.005,.07-.005*fi))); }
  float body=sdBox(q-vec3(0.,.065,.02),vec3(.11,.035,.04));
  float wings=sdBox(q-vec3(0.,.055,.02),vec3(.13,.025,.035));
  float cols=1e5; for(int i=0;i<6;i++){ float x=(float(i)-2.5)*.018; cols=min(cols,sdCylY(q-vec3(x,.065,-.035),.0045,.035)); }
  float ent=sdBox(q-vec3(0.,.104,-.03),vec3(.06,.004,.012));
  vec3 pd=q-vec3(0.,.108,-.03); float ped=max(max(abs(pd.x)*.4+pd.y-.018,-pd.y),abs(pd.z)-.012);
  float drum=sdCylY(q-vec3(0.,.12,.02),.035,.018);
  float dome=max(length(q-vec3(0.,.138,.02))-.036,-(q.y-.138));
  float lant=sdCylY(q-vec3(0.,.184,.02),.006,.012);
  float d=min(min(steps,min(body,wings)),min(cols,min(ent,ped)));
  d=min(d,min(drum,min(dome,lant)));
  return d; }
vec3 gQ(vec3 p){ return place(p,vec3(.14,0.,-.08),.5); }
float gavel(vec3 p){ vec3 q=gQ(p);
  float block=sdCylY(q-vec3(0.,.008,0.),.035,.008)-.002;
  vec3 h=q-vec3(.0,.034,.0); float head=sdCylX(h,.014,.03)-.002;
  head=min(head,sdCylX(h-vec3(.03,0.,0.),.016,.003)); head=min(head,sdCylX(h+vec3(.03,0.,0.),.016,.003));
  float handle=sdCapsule(q,vec3(0.,.034,0.),vec3(-.02,.02,-.12),.005);
  return min(block,min(head,handle)); }
vec3 bQ(vec3 p){ return place(p,vec3(.2,0.,.1),-.35); }
float ballot(vec3 p){ vec3 q=bQ(p);
  float b=sdRBox(q-vec3(0.,.05,0.),vec3(.045,.05,.04),.004);
  b=max(b,-sdBox(q-vec3(0.,.1,0.),vec3(.025,.01,.003)));
  float lid=sdRBox(q-vec3(0.,.102,0.),vec3(.048,.004,.043),.002);
  lid=max(lid,-sdBox(q-vec3(0.,.1,0.),vec3(.025,.01,.003)));
  vec3 c=q-vec3(0.,.12,0.); float card=sdBox(c,vec3(.018,.02,.001));
  return min(min(b,lid),card); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,capitol(p),3.);
  r=U(r,gavel(p),4.);
  r=U(r,ballot(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=cQ(p); if(q.z<-.019&&q.y>.035&&q.y<.09&&abs(q.x)>.065){ vec2 w=vec2(mod(q.x,.02)-.01,mod(q.y-.035,.025)-.0125); if(abs(w.x)<.004&&abs(w.y)<.007) return .35; }
    if(q.y>.138&&q.y<.175&&fract(atan(q.z-.02,q.x)*2.5)<.08) return .5;
    return .88; }
  if(id==4.){ vec3 q=gQ(p); if(q.y<.018) return .4; return .5+.12*grain(q,50.); }
  if(id==5.){ vec3 q=bQ(p); if(q.y>.107) return .95; return .75; }
  return .7; }
