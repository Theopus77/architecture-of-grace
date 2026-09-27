/* English hub page — pencil still life: an open dictionary with two columns of hint-lines and
   thumb-index tabs, a small stack of closed books behind it, a fountain pen lying in front and
   a glass inkwell. */
#define CAM_POS vec3(-0.4720,0.3303,-0.7573)
#define CAM_TGT vec3(-0.2018,-0.0373,0.0642)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define DIC vec3(.0,.0045,-.03)
#define DICR .12
#define STK vec3(-.02,0.,.2)
#define PEN vec3(.1,.0075,-.215)
#define PENR -.35
#define INK vec3(.2,0.,.1)
/* the stack: three closed books, each turned a little */
vec3 bq(vec3 p,int i){ float f=float(i);
  vec3 c=STK+vec3(.006*sin(f*2.1),.022+f*.044,.004*cos(f*1.3));
  return P(p,c,.1-.14*f+.05*f*f); }
vec3 bh(int i){ return i==0?vec3(.13,.021,.095):i==1?vec3(.115,.02,.085):vec3(.1,.021,.075); }
float stackD(vec3 p,out float pg){ float d=1e3; pg=1e3;
  for(int i=0;i<3;i++){ vec2 b=bookC(bq(p,i),bh(i)); d=min(d,b.x); pg=min(pg,b.y); }
  return d; }
/* fountain pen along x, nib at +x, cap posted on the back */
float penD(vec3 q){
  float barrel=sdCapsule(q,vec3(-.05,0.,0.),vec3(.03,0.,0.),.0068);
  float grip=max(length(q.yz)-mix(.0058,.0046,clamp((q.x-.03)/.016,0.,1.)),abs(q.x-.038)-.008);
  vec3 n=q-vec3(.046,0.,0.); float t=clamp(n.x/.024,0.,1.);
  float nib=max(max(abs(n.z)-.0048*(1.-t)-.0004,abs(n.y+n.z*n.z*6.)-.0008),max(-n.x,n.x-.024));
  float cap=sdCapsule(q,vec3(-.1,0.,0.),vec3(-.045,0.,0.),.0078);
  float band=max(length(q.yz)-.0083,abs(q.x+.047)-.0022);
  float clip=sdRBox(q-vec3(-.075,.0085,0.),vec3(.022,.0011,.0022),.0008);
  float clipBall=length(q-vec3(-.054,.0086,0.))-.0022;
  return min(min(min(barrel,grip),min(nib,cap)),min(band,min(clip,clipBall))); }
float penT(vec3 q){
  if(q.x>.046) return (abs(q.z)<.0005&&q.x>.056)?.2:.82;          /* nib with its slit */
  if(q.x>.03) return .3;
  if(abs(q.x+.047)<.0024) return .85;                               /* the gold band */
  if(q.y>.0075&&q.x<-.05&&q.x>-.1) return .8;                       /* the clip */
  return .22; }
/* squat glass inkwell with a screw cap */
float inkD(vec3 q){
  float body=sdRBox(q-vec3(0.,.026,0.),vec3(.036,.026,.036),.012);
  float sh=sdCylY(q-vec3(0.,.056,0.),.02,.006)-.002;
  float cap=sdCylY(q-vec3(0.,.07,0.),.018,.009)-.002;
  return min(body,min(sh,cap)); }
float inkT(vec3 q){
  if(q.y>.061) return fract(atan(q.z,q.x)/.26)<.3&&q.y<.078?.2:.3;  /* ridged cap */
  if(q.y<.034&&q.y>.004) return .38;                                 /* the ink inside */
  return .88; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 o=bookO(P(p,DIC,DICR),.095,.13);
  r=U(r,o.y,3.); r=U(r,o.x,4.);
  float pg; float s=stackD(p,pg);
  r=U(r,s,5.); r=U(r,pg,6.);
  r=U(r,penD(P(p,PEN,PENR)),7.);
  r=U(r,inkD(p-INK),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=P(p,DIC,DICR);                    /* cover and thumb-index tabs on its edge */
    if(abs(q.x)>.095&&q.y>-.001){ float z=q.z; if(fract((z+.125)/.032)<.5) return .25; }
    return .4; }
  if(id==4.){ vec3 q=P(p,DIC,DICR); float x=abs(q.x); if(x<.004) return .7;
    if(abs(q.z)>.112) return .95;
    /* two columns per page; each entry starts with a short bold head-line */
    float cx=x-.012; float col=cx<.04?0.:1.; float u=cx-col*.042; if(u<0.||u>.036||x>.09) return .95;
    float row=floor((q.z+.11)/.0095); float f=fract((q.z+.11)/.0095);
    if(f>.22) return .95;
    float hd=h1(vec2(row,col+sign(q.x)*3.)); float end=.036-.016*step(.7,h1(vec2(row+7.,col)));
    if(hd>.72&&u<.012) return .2;
    return u<end?.55:.95; }
  if(id==5.){ float pg; vec3 q; for(int i=0;i<3;i++){ q=bq(p,i); vec3 h=bh(i);
      if(sdRBox(q,h+.003,.001)<.002){ float cv=i==1?.55:.35; return bookCT(q,h,cv); } } return .4; }
  if(id==6.) return fract(p.y/.0026)<.3?.72:.93;
  if(id==7.) return penT(P(p,PEN,PENR));
  if(id==8.) return inkT(p-INK);
  return .7; }
