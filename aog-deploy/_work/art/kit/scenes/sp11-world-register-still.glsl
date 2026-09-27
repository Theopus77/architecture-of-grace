/* sp11-world-register "The Spanish-Speaking World and Register" — one language, many places and
   many ways to say it: a desk globe turned to the Americas, a toy bus (autobús, camión,
   guagua, colectivo: one thing, many names) and a teacup on its saucer for the polite, formal
   voice. No words, no flags. */
#define CAM_POS vec3(-0.4372,0.4893,-0.9188)
#define CAM_TGT vec3(-0.2809,-0.0137,0.1290)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
vec3 place(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
/* ---- globe on a turned stand with a half meridian ---- */
#define GL vec3(.04,0.,.1)
#define GR .092
#define GH .15
vec3 gq(vec3 p){ return globeQ(p,GL+vec3(0.,GH,0.),.41,-2.86); }
float globe(vec3 p){ return length(p-GL-vec3(0.,GH,0.))-GR; }
float stand(vec3 p){ vec3 q=p-GL;
  float base=sdCone(q-vec3(0.,.012,0.),.068,.05,.012)-.002;
  float neck=sdCylY(q-vec3(0.,.035,0.),.009,.018)-.001;
  float knob=length(q-vec3(0.,.055,0.))-.013;
  vec3 m=q-vec3(0.,GH,0.); m.xy=rot(.41)*m.xy;
  float mer=max(abs(length(m.xy)-GR-.009)-.003,abs(m.z)-.0045); mer=max(mer,m.x-.03);
  float pin=sdCylY(m,.0025,GR+.018);
  return min(min(min(base,neck),knob),min(mer,pin)); }
/* ---- a toy bus, long side toward the viewer ---- */
#define BC vec3(-.2,0.,-.02)
vec3 buQ(vec3 p){ return place(p,BC,.25); }
float busD(vec3 q){
  float body=sdRBox(q-vec3(0.,.05,0.),vec3(.1,.034,.036),.012);
  float bump=sdRBox(q-vec3(0.,.018,0.),vec3(.104,.006,.038),.004);
  return min(body,bump); }
float wheelD(vec3 q){ vec3 w=q; w.x=abs(w.x)-.062; w.z=abs(w.z)-.034;
  return sdCylZ(w-vec3(0.,.016,0.),.016,.006)-.002; }
/* ---- teacup on a saucer ---- */
#define TC vec3(.2,0.,-.08)
vec3 tcQ(vec3 p){ return place(p,TC,-.5); }
float saucerD(vec3 q){ float r=length(q.xz);
  float y=.004+.006*smoothstep(.03,.06,r);
  float d=max(abs(q.y-y)-.0025,r-.062); return d-.0008; }
float cupD(vec3 q){ vec3 c=q-vec3(0.,.012,0.); float r=length(c.xz);
  float prof=.02+.018*smoothstep(0.,.045,c.y);                /* flares from the foot to the lip */
  float wall=max(abs(r-prof)-.0022,max(-c.y,c.y-.045));
  float bottom=max(r-prof,abs(c.y-.002)-.003);
  float foot=sdCylY(c-vec3(0.,.001,0.),.018,.003);
  vec3 h=c-vec3(.042,.026,0.); float handle=length(vec2(length(h.xy)-.012,h.z))-.0032;
  handle=max(handle,-(h.x+.002));
  return min(min(wall,bottom),min(foot,handle)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.45-p.z,2.);
  r=U(r,globe(p),3.);
  r=U(r,stand(p),4.);
  vec3 b=buQ(p);
  r=U(r,busD(b),5.);
  r=U(r,wheelD(b),6.);
  vec3 t=tcQ(p);
  r=U(r,saucerD(t),7.);
  r=U(r,cupD(t),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=gq(p); vec3 d=normalize(q); float m=landMask(d);
    if(m>.35&&m<.65) return .2;                                   /* coastline */
    float lat=asin(clamp(d.y,-1.,1.)); float lon=atan(d.z,d.x);
    if(abs(fract(lat/.5236+.5)-.5)<.012||abs(fract(lon/.5236+.5)-.5)<.012) return .6;   /* graticule */
    return m>.5?.3+.1*fbm(d.xz*40.):.95; }
  if(id==4.) return .35;
  if(id==5.){ vec3 q=buQ(p);
    if(q.y>.056&&q.y<.077){                                        /* a band of windows on each side */
      if(abs(q.z)>.03&&abs(fract(q.x/.03+.5)-.5)<.36&&abs(q.x)<.085) return .25;
      if(q.x>.1&&abs(q.z)<.03) return .22;                         /* windscreen */
      if(q.x<-.1&&abs(q.z)<.026) return .3; }
    if(q.z<-.03&&q.x>.058&&q.x<.08&&q.y>.026&&q.y<.077) return .35;   /* door */
    if(abs(q.y-.045)<.0025&&abs(q.z)>.03) return .35;              /* trim line */
    return .8; }
  if(id==6.) return .2;
  if(id==7.){ vec3 q=tcQ(p); float r=length(q.xz); return abs(r-.052)<.002?.5:.92; }
  if(id==8.){ vec3 q=tcQ(p)-vec3(0.,.012,0.); if(abs(q.y-.036)<.0018) return .5; return .93; }
  return .7; }
