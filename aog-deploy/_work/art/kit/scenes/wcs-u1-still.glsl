/* WCS Unit 1 "Families and Homes Around the World" — a small wooden house with a pitched roof,
   door, windows and chimney, beside a snow-block igloo with its entrance tunnel. */
#define CAM_POS vec3(-0.3594,0.4688,-0.9291)
#define CAM_TGT vec3(-0.2045,-0.0298,0.1098)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define HC vec3(-.05,0.,.06)
float house(vec3 p){ vec3 q=p-HC;
  float b=sdRBox(q-vec3(0.,.075,0.),vec3(.09,.075,.07),.004);
  b=max(b,-sdBox(q-vec3(-.03,.045,-.07),vec3(.018,.045,.006)));            /* door recess */
  b=max(b,-sdBox(q-vec3(.045,.085,-.07),vec3(.022,.02,.005)));              /* window */
  b=max(b,-sdBox(q-vec3(-.093,.085,.0),vec3(.006,.02,.025)));               /* side window */
  vec3 r=q-vec3(0.,.15,0.);
  float roof=max(abs(r.x)-.105,max(dot(vec2(abs(r.z),r.y),vec2(.707,.707))-.06,-r.y-.002))-.003;
  roof=max(roof,-max(abs(r.x)-.095,max(dot(vec2(abs(r.z),r.y),vec2(.707,.707))-.05,-r.y+.004)));
  float ch=sdRBox(q-vec3(.05,.2,.03),vec3(.014,.04,.014),.002);
  return min(b,min(roof,ch)); }
#define IC vec3(.22,0.,-.03)
float igloo(vec3 p){ vec3 q=p-IC;
  float d=max(length(q)-.1,-q.y);
  vec3 t=q-vec3(0.,0.,-.1);
  float tun=max(max(sdCylZ(t,.045,.045),-q.y),-(length(q)-.08));
  d=min(d,tun);
  d=max(d,-max(sdCylZ(t-vec3(0.,0.,-.01),.03,.06),-q.y+.0));             /* doorway */
  return d; }
float bushes(vec3 p){ vec3 q=p-vec3(-.1,0.,-.06); return length(q*vec3(1.,1.3,1.))-.028+.004*fbm3(p*60.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,house(p),3.);
  r=U(r,igloo(p),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-HC;
    if(q.y>.148) { vec3 r=q-vec3(0.,.15,0.); float s=dot(vec2(abs(r.z),r.y),vec2(.707,.707)); if(fract(r.x/.018)<.12||fract((abs(r.z)-r.y)/.02)<.15) return .35; return .5; }
    if(q.z<-.064&&abs(q.x+.03)<.018&&q.y<.09) return abs(q.x+.03)<.001?.3:(length(q.xy-vec2(-.02,.045))<.003?.15:.32);
    if(q.z<-.064&&abs(q.x-.045)<.022&&abs(q.y-.085)<.02) return (abs(q.x-.045)<.0015||abs(q.y-.085)<.0015)?.6:.18;
    if(q.x<-.087&&abs(q.z)<.025&&abs(q.y-.085)<.02) return .2;
    if(q.y>.155) return .45;
    return fract(q.y/.016)<.12?.45:.78; }
  if(id==4.){ vec3 q=p-IC; if(q.z<-.1&&q.y<.035&&abs(q.x)<.03) return .1;
    float h=q.y/.018; float row=floor(h); float a=atan(q.z,q.x)*(3.+4.*(1.-q.y/.1));
    if(fract(h)<.1) return .55; if(fract(a+row*.5)<.05) return .6; return .95; }
  if(id==5.) return .4;
  return .7; }
