/* Practice room "Soy and Estoy — Who I Am, How I Am" — pencil still life: a school ID card standing
   in a holder with its lanyard coiled in front (soy: who I am), a little wooden toy house with a door and a chimney (estoy en
   casa: where I am), and a glass thermometer lying in front (estoy bien: how I am). */
#define CAM_POS vec3(-0.5202,0.3558,-0.9537)
#define CAM_TGT vec3(-0.2187,-0.0059,0.1315)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
/* toy house: a block body, a pitched roof with eaves, a chimney, a door and windows cut in */
vec3 hsQ(vec3 p){ vec3 q=p-vec3(.02,0.,.1); q.xz=rot(.45)*q.xz; return q; }
float bodyD(vec3 q){ float d=sdRBox(q-vec3(0.,.075,0.),vec3(.085,.075,.07),.003);
  d=max(d,-sdBox(q-vec3(.02,.045,-.07),vec3(.018,.045,.006)));                     /* door recess */
  d=max(d,-sdBox(q-vec3(-.045,.095,-.07),vec3(.018,.018,.004)));                   /* window */
  d=max(d,-sdBox(q-vec3(-.085,.1,.0),vec3(.004,.02,.02)));                          /* side window */
  return d; }
float roofD(vec3 q){ vec3 r=q-vec3(0.,.15,0.);
  float slab=max(abs(dot(vec2(abs(r.z),r.y),normalize(vec2(.62,1.)))-.052)-.006,abs(r.x)-.1);
  slab=max(slab,-r.y-.003); slab=max(slab,r.y-.085);
  float gable=max(dot(vec2(abs(r.z),r.y),normalize(vec2(.62,1.)))-.045,max(abs(r.x)-.085,-r.y));
  float ch=sdRBox(q-vec3(-.045,.225,.03),vec3(.014,.035,.014),.002);
  return min(min(slab-.001,gable),ch); }
/* door knob */
float knobD(vec3 q){ return length(q-vec3(.03,.045,-.066))-.0045; }
/* ID card standing in a small holder, its lanyard coiled on the table in front */
vec3 idQ(vec3 p){ vec3 q=p-vec3(.19,.0,-.04); q.xz=rot(-.3)*q.xz; return q; }
vec3 cardF(vec3 q){ vec3 c=q-vec3(0.,.012,0.); c.yz=rot(.3)*c.yz; c.y-=.05; return c; }   /* card frame: x across, y up, z thickness */
float cardD(vec3 q){ return sdRBox(cardF(q),vec3(.075,.05,.0018),.004)-.0004; }
float holdD(vec3 q){ float d=sdRBox(q-vec3(0.,.008,.004),vec3(.06,.008,.016),.003);
  return max(d,-sdBox(cardF(q)-vec3(0.,-.045,0.),vec3(.08,.02,.0025))); }
float cordD(vec3 q){ vec3 c=q-vec3(-.01,.0035,-.085);
  float a=atan(c.z,c.x); float d=abs(length(c.xz*vec2(1.,1.5))-.06-.005*sin(a*3.))-.005; d=max(d,abs(c.y)-.0025);
  return d; }
/* thermometer: a glass rod with a bulb, lying in front */
vec3 thQ(vec3 p){ vec3 q=p-vec3(-.02,.0075,-.13); q.xz=rot(.25)*q.xz; return q; }
float thermoD(vec3 q){ float d=sdCapsule(q,vec3(-.09,0.,0.),vec3(.09,0.,0.),.0072);
  d=min(d,length(q-vec3(-.095,0.,0.))-.0085); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 h=hsQ(p);
  r=U(r,bodyD(h),3.); r=U(r,roofD(h),4.); r=U(r,knobD(h),5.);
  vec3 i=idQ(p); r=U(r,cardD(i),6.); r=U(r,min(cordD(i),holdD(i)),7.);
  r=U(r,thermoD(thQ(p)),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=hsQ(p); if(q.z<-.066&&abs(q.x-.02)<.018&&q.y<.09) return .3;   /* door */
    if(abs(q.x+.045)<.018&&abs(q.y-.095)<.018) return .2; return .8; }
  if(id==4.){ vec3 q=hsQ(p); float t=dot(vec2(abs(q.z),q.y-.15),normalize(vec2(1.,-.62)));
    return fract(t/.012)<.2?.3:.5; }                                             /* roof shingle rows */
  if(id==5.) return .3;
  if(id==6.){ vec3 c=cardF(idQ(p)); vec2 u=c.xy;
    if(sdBox2(u-vec2(-.038,-.004),vec2(.024,.03))<0.) return .5;                  /* photo square, blank */
    if(u.x>-.004&&u.x<.062&&abs(fract((u.y+.03)/.016)-.5)<.12&&u.y<.02&&u.y>-.04) return .3;   /* hint-lines */
    if(u.y>.034) return .35;                                                      /* band across the top */
    return .95; }
  if(id==7.) return .35;
  if(id==8.){ vec3 q=thQ(p); if(q.x<-.085) return .25; if(q.x<.03&&abs(q.z)<.0015) return .3;
    if(fract(q.x/.008)<.15&&q.z>0.) return .45; return .88; }
  return .7; }
