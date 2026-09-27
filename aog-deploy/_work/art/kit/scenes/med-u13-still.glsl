/* Medicine Unit 13 "Traditional Medicine and the Evidence" — pencil still life: a round clay
   teapot with spout and lid, a stone mortar with a pestle, and a tied bundle of dried herbs. */
#define CAM_POS vec3(-0.4653,0.2898,-1.0141)
#define CAM_TGT vec3(-0.2149,0.0621,0.1123)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define TP vec3(.0,0.,.08)
float teapot(vec3 p){ vec3 q=p-TP;
  float body=length((q-vec3(0.,.07,0.))*vec3(1.,1.25,1.))-.09; body*=.85;
  body=smax(body,-q.y+.003,.008);
  float foot=sdCylY(q-vec3(0.,.006,0.),.05,.006)-.002;
  float lid=length((q-vec3(0.,.125,0.))*vec3(1.,2.2,1.))-.05; lid=max(lid*.5,.12-q.y);
  float knob=length(q-vec3(0.,.145,0.))-.011;
  vec3 s=q-vec3(-.085,.07,0.); s.xy=rot(.75)*s.xy; float sp=sdCone(s-vec3(0.,.035,0.),.02,.009,.04);
  vec3 h=q-vec3(.1,.08,0.); float hand=sdTorus(h.xzy,.035,.008); hand=max(hand,-q.x+.075);
  return min(min(min(body,foot),min(lid,knob)),min(sp,hand)); }
#define MC vec3(.27,0.,-.07)
float mortar(vec3 p){ vec3 q=p-MC; float r=length(q.xz);
  float outer=sdCone(q-vec3(0.,.04,0.),.05,.065,.04)-.004;
  float inner=length(q-vec3(0.,.1,0.))-.068;
  float d=max(outer,-inner); d=min(d,sdCylY(q-vec3(0.,.005,0.),.052,.005)-.002);
  return d+.0015*fbm3(p*120.); }
float pestle(vec3 p){ vec3 q=p-MC; return sdCapsule(q,vec3(-.01,.045,.0),vec3(.07,.15,-.02),.012)-.004*smoothstep(.1,.15,q.y); }
float herbs(vec3 p){ vec3 q=p-vec3(-.19,.014,-.06); q.xz=rot(.35)*q.xz; float d=1e3;
  for(int i=0;i<7;i++){ float fi=float(i); float a=(fi-3.)*.06; vec3 s=q; s.xz=rot(a*(s.x>0.?.3:1.))*s.xz;
    d=min(d,sdCapsule(s-vec3(0.,.006*sin(fi*2.),.004*(fi-3.)),vec3(-.12,0.,0.),vec3(.1,0.,0.),.0035)); }
  vec3 lf=q-vec3(-.12,.0,0.); float l=length(lf*vec3(1.2,2.,.9))-.045; d=smin(d,l+.004*vn3(p*260.),.01);
  return d; }
float tie(vec3 p){ vec3 q=p-vec3(-.19,.014,-.06); q.xz=rot(.35)*q.xz; return sdTorus((q-vec3(.02,0.,0.)).yxz,.017,.004); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,teapot(p),3.);
  r=U(r,mortar(p),4.);
  r=U(r,pestle(p),5.);
  r=U(r,herbs(p),6.);
  r=U(r,tie(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-TP; if(abs(q.y-.1)<.003) return .3; if(abs(q.y-.04)<.003) return .35; return .55; }
  if(id==4.) return .6+.12*fbm3(p*80.);
  if(id==5.) return .62;
  if(id==6.) return .45+.15*vn3(p*200.);
  if(id==7.) return .75;
  return .7; }
