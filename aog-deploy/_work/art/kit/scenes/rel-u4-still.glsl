/* World Religions Unit 4 "What Is a Religion?" — pencil still life: a school globe on a
   turned stand with its brass meridian ring (people of many faiths all over the world), two
   closed books stacked, and a lit candle in a candlestick. No figures, no symbols of one
   faith over another. */
#define CAM_POS vec3(-0.3803,0.5462,-0.9901)
#define CAM_TGT vec3(-0.2134,0.0088,0.1297)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define GL vec3(.0,0.,.08)
#define GR .105
#define GY .19
#define BK vec3(.2,0.,-.04)
#define BS vec3(.1,.017,.075)
#define CN vec3(-.19,0.,-.02)
vec3 gq(vec3 p){ vec3 q=p-GL-vec3(0,GY,0); q.xy=rot(.41)*q.xy; return q; }   /* tilted earth axis */
float globe(vec3 p){
  vec3 q=p-GL;
  float base=sdCylY(q-vec3(0,.008,0),.07,.008)-.003;
  base=smin(base,sdCone(q-vec3(0,.03,0),.04,.012,.016),.008);
  float stem=sdCylY(q-vec3(0,.055,0),.008,.03);
  vec3 g=gq(p);
  float ball=length(g)-GR;
  float mer=max(abs(length(g.xy)-GR-.009)-.0035,abs(g.z)-.005);           /* the meridian half ring */
  mer=max(mer,-(g.x+.0));
  float pin=sdCylY(g,.003,GR+.02);
  float ringFoot=sdCapsule(q,vec3(0,.075,0),vec3(0,.085,0),.008);
  return min(min(base,stem),min(min(ball,mer),min(pin,ringFoot))); }
float land(vec3 g){ vec3 n=normalize(g); float c=fbm(vec2(atan(n.z,n.x)*1.6,n.y*3.2)+3.1); return c; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,globe(p),3.);
  r=U(r,bookD(L(p,BK,-.3),BS),4.);
  r=U(r,bookD(L(p,BK+vec3(0,2.*BS.y,0),-.15),BS*vec3(.85,.9,.85)),5.);
  vec3 c=L(p,CN,0.)/1.1;
  r=U(r,min(holderD(c),candleD(c,.098,.12,.0125))*1.1,6.);
  r=U(r,tear(c-vec3(.0015,.228,0),.05,.0105)*1.1,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 g=gq(p); float r=length(g);
    if(r<GR+.002){ vec3 u=normalize(g); float lat=asin(u.y), lon=atan(u.z,u.x);
      float a=land(g)>.52?.5:.86;
      if(abs(fract(lat/.35+.5)-.5)<.035||abs(fract(lon/.5236+.5)-.5)<.03) a-=.2;
      if(abs(land(g)-.52)<.012) a=.3; return a; }
    return .45; }
  if(id==4.) return bookT(L(p,BK,-.3),BS,.35);
  if(id==5.) return bookT(L(p,BK+vec3(0,2.*BS.y,0),-.15),BS*vec3(.85,.9,.85),.55);
  if(id==6.){ vec3 q=L(p,CN,0.)/1.1; if(q.y>.1) return q.y>.214?.2:.9; return abs(q.y-.05)<.003?.35:.5; }
  if(id==7.) return .97;
  return .7; }
