/* Social Studies Unit 6 "The First Peoples of North America" — pencil still life: a round
   clay pot with painted bands, a coiled woven basket and a hand drum with a hide head and laced sides. */
#define CAM_POS vec3(-0.2475,0.2381,-0.7896)
#define CAM_TGT vec3(-0.1329,0.0365,0.0738)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define PC vec3(.1,0.,.14)
vec2 pot0(vec3 q);
vec2 pot(vec3 p){ return pot0((p-PC)/1.3)*1.3; }
vec2 pot0(vec3 q){
  float y=q.y; float rr=length(q.xz);
  /* profile: radius as a function of height */
  float R=.075*sin(clamp((y+.005)/.17,0.,1.)*2.7+.35);
  R=max(R,.0);
  float neck=smoothstep(.13,.16,y); R=mix(R,.042,neck);
  float d=(rr-R)*.8; d=max(d,max(-y,y-.175));
  d=max(d,-(sdCylY(q-vec3(0.,.17,0.),.036,.03)));                        /* open mouth */
  float lip=sdTorus(q-vec3(0.,.175,0.),.04,.005);
  return vec2(min(d,lip),0.); }
float basket(vec3 p){
  vec3 q=p-vec3(-.12,0.,.06);
  float rr=length(q.xz);
  float d=max(rr-(.07+.02*q.y/.07),max(-q.y,q.y-.07))-.002;
  d=max(d,-max(rr-(.064+.02*q.y/.07),.006-q.y));
  float rim=sdTorus(q-vec3(0.,.07,0.),.09,.005);
  d+= .0012*sin(q.y*700.);                                                  /* coil rows */
  return min(d,rim); }
vec3 kq(vec3 p){ vec3 q=p-vec3(.33,0.,.03); q.xz=rot(-.3)*q.xz; return q; }
vec2 canoe(vec3 p){   /* a hand drum: wooden frame, hide head, laced cords */
  vec3 q=kq(p);
  float frame=sdCylY(q-vec3(0.,.04,0.),.07,.04)-.002;
  float head=sdCylY(q-vec3(0.,.082,0.),.072,.003)-.001;
  float a=atan(q.z,q.x); float lace=max(abs(length(q.xz)-.073)-.0025,abs(q.y-.04)-.035);
  lace=max(lace,abs(fract(a*16./6.2832+(q.y-.04)*4.)-.5)*.03-.002);
  return vec2(min(frame,lace),head); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pot(p).x,3.);
  r=U(r,basket(p),4.);
  vec2 c=canoe(p); r=U(r,c.x,5.); r=U(r,c.y,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=(p-PC)/1.3; float a=atan(q.z,q.x);
    if(abs(q.y-.1)<.012){ float z=abs(fract(a*6./3.1416)-.5)*2.; if(abs((q.y-.1)/.012-(z*2.-1.))<.35) return .2; return .75; }
    if(abs(q.y-.08)<.0025||abs(q.y-.122)<.0025) return .25;
    if(abs(q.y-.045)<.006&&fract(a*8./3.1416)<.4) return .3;
    return .62; }
  if(id==4.){ vec3 q=p-vec3(-.12,0.,.06); float a=atan(q.z,q.x);
    return (fract(q.y/.01+.5*step(.5,fract(a*20./3.1416)))<.5)?.45:.72; }
  if(id==5.){ return .45; vec3 q=kq(p); if(abs(abs(q.x)-.12)<.002||abs(abs(q.x)-.06)<.0015) return .3; return fract(q.x/.03+fbm(q.xy*80.)*.4)<.08?.45:.85; }  /* birchbark seams */
  if(id==6.){ vec3 q=kq(p); if(q.y>.08&&abs(length(q.xz)-.04)<.003) return .4; return .85; }
  return .7; }
