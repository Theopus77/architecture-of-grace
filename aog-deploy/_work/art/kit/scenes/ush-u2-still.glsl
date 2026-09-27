/* U.S. History Unit 2 "English Settlement" (The Thirteen Colonies) — pencil still life: a
   wooden model of a small three-masted sailing ship like the ones that carried settlers to
   Jamestown, on a cradle stand, with a round brass compass and a rolled map before it.
   No figures. */
#define CAM_POS vec3(-0.4882,0.5779,-1.1300)
#define CAM_TGT vec3(-0.3008,-0.0251,0.1266)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define SH vec3(.0,0.,.1)
#define SR 0.3
vec3 sq(vec3 p){ return L(p,SH,SR)-vec3(0,.05,0); }   /* ship frame: bow to +x */
float hull(vec3 q){
  float t=clamp(q.x/.16,-1.,1.);
  float w=.042*sqrt(max(1.-pow(abs(t),2.4),0.))+.002;
  float keel=-.045*(1.-.25*t*t)+.012*step(0.,-t)*0.;
  float d=max(abs(q.z)-w*smoothstep(keel-.005,.02,q.y)*.9-w*.1,max(keel-q.y,abs(q.x)-.17));
  float deckH=.012+.02*smoothstep(-.08,-.16,q.x)+.012*smoothstep(.1,.16,q.x);
  d=max(d,q.y-deckH);
  float rail=max(abs(abs(q.z)-w)-.002,max(q.y-deckH-.008,deckH-q.y)); rail=max(rail,abs(q.x)-.16);
  return min(d*.8,rail); }
float mast(vec3 q,float x,float h){ return sdCylY(q-vec3(x,h*.5,0),.0035,h*.5); }
float sail(vec3 q,float x,float y,float hw,float hh){ vec3 s=q-vec3(x,y,0); float bil=.012*(1.-pow(s.y/hh,2.))*(1.-.4*pow(s.z/hw,2.));
  float d=max(abs(s.x-bil)-.0015,max(abs(s.z)-hw*(1.+.12*s.y/hh),abs(s.y)-hh));
  float yard=sdCylZ(s-vec3(0,hh,0),.0022,hw*1.2);
  return min(d*.8,yard); }
float ship(vec3 q){
  float d=hull(q);
  d=min(d,min(mast(q,.06,.2),min(mast(q,-.02,.25),mast(q,-.11,.17))));
  d=min(d,sdCapsule(q,vec3(.15,.03,0),vec3(.24,.07,0),.0028));   /* bowsprit */
  d=min(d,min(sail(q,.06,.1,.05,.035),sail(q,.06,.17,.038,.022)));
  d=min(d,min(sail(q,-.02,.11,.058,.04),sail(q,-.02,.2,.044,.028)));
  d=min(d,sail(q,-.11,.11,.04,.03));
  /* stays from masthead to bowsprit */
  d=min(d,sdCapsule(q,vec3(.06,.2,0),vec3(.23,.068,0),.001));
  d=min(d,sdCapsule(q,vec3(-.02,.25,0),vec3(.06,.2,0),.001));
  return d; }
float cradle(vec3 p){ vec3 q=L(p,SH,SR); float b=sdRBox(q-vec3(0,.006,0),vec3(.12,.006,.035),.003);
  float s1=sdRBox(q-vec3(-.07,.025,0),vec3(.006,.02,.03),.002), s2=sdRBox(q-vec3(.07,.025,0),vec3(.006,.02,.03),.002);
  return min(b,min(s1,s2)); }
float compass(vec3 q){ float b=sdCylY(q-vec3(0,.012,0),.045,.012)-.003; float lid=max(sdCylY(q-vec3(0,.02,0),.041,.006),-q.y+.023);
  float ring=sdTorus((q-vec3(0,.012,.052)).xzy*vec3(1.,1.,1.),.008,.0025);
  return min(max(b,-sdCylY(q-vec3(0,.026,0),.04,.004)),ring); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,ship(sq(p)),3.);
  r=U(r,cradle(p),4.);
  r=U(r,compass(L(p,vec3(-.2,0.,-.1),0.)),5.);
  r=U(r,rollD(L(p,vec3(.12,0.,-.15),-.2),.018,.1),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=sq(p); if(q.y>.04&&abs(q.z)<.07&&abs(n.x)>.5) return .9;  /* sails */
    if(q.y>.035&&abs(q.z)<.07&&(abs(q.x-.06)<.02||abs(q.x+.02)<.02||abs(q.x+.11)<.02)&&abs(q.z)>.004) return .88;
    if(q.y<.02&&q.y>-.04){ return fract(q.y/.007)<.18?.3:.45; } return .4; }
  if(id==4.) return .45;
  if(id==5.){ vec3 q=L(p,vec3(-.2,0.,-.1),0.); if(q.y>.02&&length(q.xz)<.04){ vec2 c=q.xz; float a=atan(c.y,c.x);
      float ne=max(abs(c.x)*1.,abs(c.y)*4.); if(abs(c.x)<.004*(1.-abs(c.y)/.034)*2.&&abs(c.y)<.034) return .2;
      if(abs(length(c)-.034)<.0015) return .35; if(length(c)>.03&&fract(a/6.2832*16.)<.15) return .35; return .92; }
    return .5; }
  if(id==6.) return rollT(L(p,vec3(.12,0.,-.15),-.2),.018,.1);
  return .7; }
