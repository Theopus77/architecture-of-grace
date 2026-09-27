/* s16 "World History: Empires and Exchange" — the Silk Roads to the Columbian Exchange: a
   roll of patterned silk lying on the table with its end unrolled toward us in soft waves, a
   burlap sack of peppercorns, tied at the neck and folded open, with a few spilled beside it, and a tomato and a potato, two
   foods that crossed the ocean.
   @params {"mat":{"3":[0.62,1.3,1.0],"4":[0.7,1.2,0.9],"5":[0.55,1.3,1.0],"6":[0.3,1.3,1.0],"7":[0.45,1.3,1.0],"8":[0.3,1.2,0.8],"9":[0.5,1.3,1.0]},
            "texlines":{"3":[0.12,0.4,0.7],"4":[0.12,0.4,0.7],"5":[0.12,0.4,0.6],"9":[0.12,0.4,0.5]}} */
#define CAM_POS vec3(-0.2326,0.3156,-0.6477)
#define CAM_TGT vec3(-0.1222,-0.0399,0.0928)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEllS(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
/* a roll of silk lying on the table, its free end unrolled toward us in soft waves */
#define BT vec3(-.04,.042,.1)
vec3 btQ(vec3 p){ vec3 q=p-BT; q.xz=rot(.3)*q.xz; return q; }
float bolt(vec3 p){ vec3 q=btQ(p); float d=sdCylX(q,.04,.11)-.004;
  d=max(d,-max(length(q.yz)-.009,abs(q.x)-.2));                         /* the core tube hole */
  return d; }
vec3 clQ(vec3 p){ return btQ(p); }
float cloth(vec3 p){ vec3 q=clQ(p); float z=-q.z;                          /* runs from under the roll toward -z */
  float t=clamp(z/.2,0.,1.);
  float h=-.042+.0018+.011*max(0.,sin(z*42.-.8))*smoothstep(.03,.07,z)*(1.-.4*t);
  float y0=mix(-.0,h,smoothstep(.0,.05,z));                                /* leaves the roll's bottom front */
  float y=z<.05?-.042+.0018+sqrt(max(.0016-(z-.0)*(z-.0),0.))*0.:h;
  float d=abs(q.y-h)-.0016;
  d=max(d,abs(q.x)-.1); d=max(d,max(-z+.0,z-.2));
  return d*.7; }
/* sack: burlap, full at the bottom, gathered and tied at the neck, the top folded open */
#define SK vec3(.15,0.,.07)
float sack(vec3 p){ vec3 q=p-SK; float y=q.y; float a=atan(q.z,q.x);
  float r=.06*(1.-.55*smoothstep(.05,.1,y))+.03*smoothstep(.1,.13,y)+.003*sin(a*9.+y*20.)*smoothstep(.06,.1,y);
  float d=max(length(q.xz)-r,abs(y-.065)-.065);
  d=smin(d,sdEllS(q-vec3(0.,.035,0.),vec3(.064,.036,.064)),.02);
  d=max(d,-(sdCylY(q-vec3(0.,.14,0.),r-.005,.03)));
  float tie=sdTorus(q-vec3(0.,.1,0.),.034,.004);
  return min(d*.8,tie); }
float corns(vec3 p){ vec3 q=p-SK-vec3(0.,.118,0.); vec2 c=floor(q.xz/.008); vec2 f=fract(q.xz/.008)-.5;
  float h=h1(c)*.004; float d=length(vec3(f.x*.008,q.y-h,f.y*.008))-.0036; d=max(d,length(q.xz)-.052);
  float sp=1e3;
  for(int i=0;i<8;i++){ float fi=float(i); vec3 c2=SK+vec3(-.03-.05*h1(vec2(fi,1.)),.004,-.075-.035*h1(vec2(fi,2.)));
    sp=min(sp,length(p-c2)-.0042); }
  return min(d,sp); }
/* tomato and potato */
#define TM vec3(.07,0.,-.14)
vec2 tomato(vec3 p){ vec3 q=p-TM-vec3(0.,.034,0.); float a=atan(q.z,q.x);
  float r=.04*(1.+.04*cos(a*5.)); float d=sdEllS(q,vec3(r,.034,r));
  vec3 t=q-vec3(0.,.035,0.); float ca=1e3;
  for(int i=0;i<5;i++){ float b=float(i)*1.2566+.3; vec3 s=t; s.xz=rot(b)*s.xz; ca=min(ca,sdEllS(s-vec3(.011,-.001,0.),vec3(.012,.0028,.0045))); }
  ca=min(ca,sdCapsule(t,vec3(0.),vec3(.003,.013,.001),.0026));
  return vec2(d*.9,ca); }
float potato(vec3 p){ vec3 q=p-vec3(.2,.024,-.07); q.xz=rot(.8)*q.xz;
  float d=sdEllS(q,vec3(.052,.024,.03)); d+=.0015*sin(q.x*120.)*sin(q.z*90.);
  for(int i=0;i<4;i++){ float fi=float(i); vec3 e=vec3(-.035+fi*.022,.02,.01*sin(fi*2.)); d=max(d,-(length(q-e)-.004)); }
  return d*.8; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bolt(p),3.);
  r=U(r,cloth(p),4.);
  r=U(r,sack(p),5.);
  r=U(r,corns(p),6.);
  vec2 t=tomato(p); r=U(r,t.x,7.); r=U(r,t.y,8.);
  r=U(r,potato(p),9.);
  return r; }
float silk(vec2 u){   /* a repeating diamond-and-dot pattern */
  vec2 g=fract(u/.028)-.5; float dm=abs(g.x)+abs(g.y);
  if(abs(dm-.36)<.05) return .35; if(length(g)<.09) return .4; return .82; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=btQ(p); if(abs(q.x)>.108) return fract(length(q.yz)/.0035)<.3?.45:.85; return silk(vec2(q.x,atan(q.y,q.z)*.044)); }
  if(id==4.){ vec3 q=clQ(p); if(abs(abs(q.x)-.097)<.003) return .45; return silk(q.xz); }
  if(id==5.){ vec3 q=p-SK; return .55+.12*sin(q.y*600.)*sin(atan(q.z,q.x)*60.); }
  if(id==6.) return .3;
  if(id==7.){ vec3 q=p-TM-vec3(0.,.034,0.); vec3 v=normalize(q); if(dot(v,normalize(vec3(-.5,.7,-.5)))>.93) return .9; return .45; }
  if(id==8.) return .3;
  if(id==9.){ vec3 q=p-vec3(.2,.024,-.07); return .62+.1*fbm(q.xz*200.)-(h1(floor(q.xz/.012))>.9?.25:0.); }
  return .7; }
