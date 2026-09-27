/* Science Unit 26 "Environmental Science" — pencil still life: a model wind turbine, a small
   solar panel on its stand, and a seedling growing in a pot. */
#define CAM_POS vec3(-0.9621,0.5120,-1.3270)
#define CAM_TGT vec3(-0.3685,0.0746,0.2353)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define WC vec3(.02,0.,.1)
vec2 turbine(vec3 p){ vec3 q=p-WC;
  float base=sdCylY(q-vec3(0.,.008,0.),.045,.008)-.003;
  float tower=sdCone(q-vec3(0.,.16,0.),.012,.006,.15);
  vec3 n=q-vec3(0.,.31,0.); n.xz=rot(.5)*n.xz;
  float nac=sdCapsule(n,vec3(0.,0.,.03),vec3(0.,0.,-.02),.011);
  float hub=length(n-vec3(0.,0.,-.03))-.012;
  float bl=1e5;
  for(int i=0;i<3;i++){ vec3 b=n-vec3(0.,0.,-.032); b.xy=rot(float(i)*2.094+.3)*b.xy;
    float t=clamp(b.y/.15,0.,1.); float w=.012*(1.-t)+.004;
    bl=min(bl,max(sdRBox(b-vec3(0.,.075,0.),vec3(w,.075,.002),.0015),-b.y)); }
  return vec2(min(base,tower),min(min(nac,hub),bl)); }
vec3 sq(vec3 p){ vec3 q=p-vec3(-.25,.07,.02); q.xz=rot(.45)*q.xz; q.yz=rot(-.75)*q.yz; return q; }
vec2 solar(vec3 p){ vec3 q=sq(p);
  float fr=sdRBox(q,vec3(.09,.004,.06),.002);
  float cells=sdBox(q-vec3(0.,.003,0.),vec3(.085,.002,.055));
  vec3 s=p-vec3(-.25,0.,.02); s.xz=rot(.45)*s.xz;
  float leg=min(sdCapsule(s,vec3(-.05,0.,.04),vec3(-.05,.07,.0),.004),sdCapsule(s,vec3(.05,0.,.04),vec3(.05,.07,.0),.004));
  leg=min(leg,min(sdCapsule(s,vec3(-.05,0.,-.03),vec3(-.05,.04,-.03),.004),sdCapsule(s,vec3(.05,0.,-.03),vec3(.05,.04,-.03),.004)));
  return vec2(min(fr,leg),cells); }
float leaf(vec3 q,vec3 base,float ay,float tilt,float L){
  vec3 l=q-base; l.xz=rot(ay)*l.xz; l.xy=rot(tilt)*l.xy; l.y+=.25*l.x*l.x/L;
  return .6*sdEll(l-vec3(L*.5,0.,0.),vec3(L*.5,.004,L*.3)); }
#define PC vec3(.3,0.,.02)
vec2 pot(vec3 p){ vec3 q=(p-PC)/.8;
  float body=sdCone(q-vec3(0.,.05,0.),.045,.06,.05)-.002; body=max(body,-(sdCylY(q-vec3(0.,.11,0.),.052,.02)));
  float rim=sdCylY(q-vec3(0.,.095,0.),.067,.011)-.003; rim=max(rim,-sdCylY(q-vec3(0.,.1,0.),.056,.03));
  float soil=sdCylY(q-vec3(0.,.083,0.),.056,.006);
  float pl=sdCapsule(q,vec3(0.,.085,0.),vec3(.004,.16,0.),.0035);
  pl=min(pl,leaf(q,vec3(.004,.16,0.),.4,.6,.06)); pl=min(pl,leaf(q,vec3(.004,.16,0.),3.5,.6,.055));
  pl=min(pl,leaf(q,vec3(.003,.12,0.),1.9,.4,.045));
  return vec2(min(body,rim),min(soil,pl))*.8; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 t=turbine(p); r=U(r,t.x,3.); r=U(r,t.y,4.);
  vec2 s=solar(p); r=U(r,s.x,5.); r=U(r,s.y,6.);
  vec2 k=pot(p); r=U(r,k.x,7.); r=U(r,k.y,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .8; if(id==4.) return .85; if(id==5.) return .45;
  if(id==6.){ vec3 q=sq(p); vec2 g=abs(fract(vec2(q.x/.0283,q.z/.0275))-.5); return min(g.x,g.y)<.05?.8:.3; }
  if(id==7.) return .5; if(id==8.) return (p.y<.08)?.2:.45;
  return .7; }
