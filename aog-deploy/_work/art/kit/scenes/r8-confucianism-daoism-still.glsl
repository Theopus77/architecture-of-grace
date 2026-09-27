/* Room "Confucianism and Daoism" — pencil still life: a round clay teapot with two small cups
   (quiet, simple things), and a book of bamboo slips tied with cord, partly unrolled on the
   table (slats with hint-lines only, no script). Objects only. */
#define CAM_POS vec3(-0.3182,0.2237,-0.5398)
#define CAM_TGT vec3(-0.1308,-0.0239,0.0357)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define TP vec3(-.06,0.,.08)
#define BS vec3(.08,0.,-.1)
vec3 tpQ(vec3 p){ return place(p,TP,.3); }
float potD(vec3 p){ vec3 q=tpQ(p);
  float body=sdEll(q-vec3(0.,.05,0.),vec3(.07,.05,.07));
  body=max(body,-q.y+.004);
  float foot=sdCylY(q-vec3(0.,.005,0.),.04,.005);
  float lid=sdCylY(q-vec3(0.,.098,0.),.03,.004)-.002; lid=min(lid,length(q-vec3(0.,.109,0.))-.009);
  /* spout: a curving tube toward -x */
  float sp=1e5; vec3 a=vec3(-.055,.04,0.);
  for(int i=1;i<=6;i++){ float t=float(i)/6.; vec3 b=vec3(-.055-.05*t,.04+.045*t*t+.01*t,0.); sp=min(sp,sdCapsule(q,a,b,.011-.005*t)); a=b; }
  /* handle: a loop on +x */
  vec3 h=q-vec3(.075,.055,0.); float hd=length(vec2(length(h.xy*vec2(1.,.8))-.025,h.z))-.0055; hd=max(hd,.06-q.x);
  return min(min(smin(body,foot,.006),lid),min(smin(sp,body,.006),hd)); }
float cupAt(vec3 p,vec3 c){ vec3 q=p-c; float o=sdCone(q-vec3(0.,.018,0.),.016,.026,.018)-.001; float i=sdCone(q-vec3(0.,.022,0.),.012,.023,.018); return max(o,-i); }
float cupsD(vec3 p){ return min(cupAt(p,vec3(.1,0.,.1)),cupAt(p,vec3(.15,0.,.03))); }
vec3 bsQ(vec3 p){ return place(p,BS,-.15); }
float slipsD(vec3 p){ vec3 q=bsQ(p);
  /* flat part: slats side by side along x; rolled part at +x */
  float flat_=max(sdBox(q-vec3(-.04,.003,0.),vec3(.07,.003,.075)),0.);
  vec3 r=q-vec3(.05,.022,0.); float roll=sdCylZ(r,.022,.075)-.001;
  float d=min(flat_,roll);
  d+=.0006*smoothstep(.3,.5,abs(fract((q.x+.2)/.012)-.5))*step(q.x,.03);
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,potD(p),3.);
  r=U(r,cupsD(p),4.);
  r=U(r,slipsD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.) return .6;
  if(id==5.){ vec3 q=bsQ(p); if(abs(abs(q.z)-.045)<.003) return .25;           /* the two cords */
    if(q.x<.03){ if(abs(fract((q.x+.2)/.012)-.5)>.44) return .45; if(abs(q.z)<.038&&fract(q.z/.009)<.25&&abs(fract((q.x+.2)/.012)-.5)<.15) return .55; return .85; }
    return .6+.15*sin(atan(q.y-.022,q.x-.05)*20.); }
  return .7; }
