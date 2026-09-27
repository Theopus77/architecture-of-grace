/* Science hub page — pencil still life: a glass beaker with measuring marks and some water, a
   spiral ammonite fossil standing on its edge, and a magnifying glass lying over a leaf. */
#define CAM_POS vec3(-0.3438,0.2443,-0.5726)
#define CAM_TGT vec3(-0.1467,-0.0003,0.0584)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define BK vec3(.02,0.,.1)
#define BR .052
#define BHH .14
#define FOS vec3(-.13,0.,.05)
#define FR .062
#define LF vec3(.1,0.,-.09)
#define MG vec3(.2,0.,-.02)
/* ---- beaker with a pouring lip toward -x ---- */
float beakerD(vec3 q){
  float o=sdCylY(q-vec3(0.,BHH*.5,0.),BR,BHH*.5)-.0015;
  float i=sdCylY(q-vec3(0.,BHH*.5+.004,0.),BR-.003,BHH*.5);
  float d=max(o,-i);
  d=min(d,sdTorus(q-vec3(0.,BHH,0.),BR-.0005,.0024));
  vec3 s=q-vec3(-BR,BHH-.004,0.); float lip=max(length(s.xz*vec2(1.,1.3))-.016,abs(s.y)-.004); lip=max(lip,-(length(s.xz*vec2(1.,1.3))-.013));
  d=min(d,max(lip,-q.x-BR+.012));
  float water=sdCylY(q-vec3(0.,.035,0.),BR-.003,.035);
  return min(d,water); }
float beakerT(vec3 q){ float rr=length(q.xz);
  if(rr<BR-.0025&&q.y<.071&&q.y>.069) return .3;                       /* water line seen from above */
  if(rr<BR-.0025) return q.y<.07?.62:.94;
  float a=atan(q.z,q.x);
  if(a<-1.9&&a>-2.8||a>-1.2&&a<-.4){}                                   /* marks on the side toward us */
  if(q.z<-.01&&abs(q.x+.012)<.018){ float t=fract((q.y-.02)/.02); float k=abs(q.x+.012);
    if(q.y>.018&&q.y<.12&&t<.07&&k<(fract((q.y-.02)/.04)<.1?.018:.009)) return .2; }
  if(abs(q.y-.07)<.0016) return .25;                                    /* the water line on the glass */
  if(q.y<.07) return .58;                                               /* water seen through the glass */
  return .93; }
/* ---- ammonite: a coiled shell standing on edge, facing -z, propped slightly back ---- */
vec3 fq(vec3 p){ vec3 q=P(p,FOS,-.35); q-=vec3(0.,FR*.93,0.); q.yz=rot(.2)*q.yz; return q; }
float fossilD(vec3 q){
  float r=length(q.xy); float a=atan(q.y,q.x);
  float th=.019*(.35+.65*smoothstep(0.,FR,r));                          /* thicker toward the rim */
  float d=sdEll(q,vec3(FR,FR,th*1.15));
  /* whorl groove: log spiral r = c*exp(k*theta) */
  float k=.2; float t=log(max(r,.001)/.004)/k; float w=fract((t-a)/(2.*PI));
  float groove=abs(w-.5)*2.;
  d+=.003*smoothstep(.8,1.,groove)+.00035*(.5+.5*sin(a*30.+r*60.));  /* whorls and ribs */
  return d*.8; }
float fossilT(vec3 q){ float r=length(q.xy); float a=atan(q.y,q.x);
  float t=log(max(r,.001)/.004)/.2; float w=fract((t-a)/(2.*PI));
  if(abs(w-.5)>.44&&r>.006) return .2;                                  /* the spiral line */
  float rib=.5+.5*sin(a*26.+r*60.);
  return .58+.12*rib+.06*(fbm(q.xy*200.)-.5); }
/* ---- leaf lying on the table, tip toward +x ---- */
vec3 lq(vec3 p){ vec3 q=P(p,LF,.25); return q; }
float leafD(vec3 q){ float L=.17; float x=q.x+L*.5; float t=clamp(x/L,0.,1.);
  float w=.045*sin(t*PI)*(1.-.25*t)+.001;
  float d=max(abs(q.z)-w,abs(x-L*.5)-L*.5);
  float y=q.y-.003-.012*t*t-.004*(q.z/.04)*(q.z/.04);
  float blade=max(d,abs(y)-.0012)-.0006;
  float stem=sdCapsule(q,vec3(-L*.5-.03,.0025,0.),vec3(-L*.5+.005,.0035,0.),.0017);
  return min(blade,stem); }
float leafT(vec3 q){ float L=.17; float x=q.x+L*.5;
  if(abs(q.z)<.0012) return .3;                                         /* midrib */
  float v=abs(q.z)*1.2-(x-fract(x/.022)*.022); float vf=fract((x-abs(q.z)*1.1)/.022);
  if(vf<.08&&abs(q.z)>.002) return .45;                                 /* side veins */
  return .6; }
/* ---- magnifying glass lying on the table, handle toward +x ---- */
vec3 mq(vec3 p){ vec3 q=P(p,MG,.35); return q; }
float magD(vec3 q){
  vec3 c=q-vec3(0.,.02,0.); c.xy=rot(.06)*c.xy;
  float rim=sdTorus(c,.047,.0045);
  float lens=max(length(c.xz)-.046,abs(c.y)-.0025*(1.-length(c.xz)/.06));
  float neck=sdCapsule(q,vec3(.05,.021,0.),vec3(.066,.018,0.),.004);
  float hd=sdCapsule(q,vec3(.068,.017,0.),vec3(.16,.013,0.),.0085);
  float ferr=sdCylX(q-vec3(.07,.017,0.),.009,.005);
  return min(min(rim,lens),min(neck,min(hd,ferr))); }
float magT(vec3 q){ if(q.x>.074) return .3+.08*grain(q.zyx,60.); if(q.x>.064) return .75;
  if(length(q.xz)<.043) return .95; return .45; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,beakerD(p-BK),3.);
  r=U(r,fossilD(fq(p)),4.);
  float fb=sdRBox(P(p,FOS,-.35)-vec3(0.,.008,.028),vec3(.045,.008,.02),.006);   /* a little stone wedge propping it */
  r=U(r,fb,5.);
  r=U(r,leafD(lq(p)),6.);
  r=U(r,magD(mq(p)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return beakerT(p-BK);
  if(id==4.) return fossilT(fq(p));
  if(id==5.) return .55+.1*fbm(p.xz*80.);
  if(id==6.) return leafT(lq(p));
  if(id==7.) return magT(mq(p));
  return .7; }
