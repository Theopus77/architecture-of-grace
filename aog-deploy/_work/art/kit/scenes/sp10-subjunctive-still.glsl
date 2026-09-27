/* Practice room "The Subjunctive" — pencil still life: a dandelion seed head on its stem in a
   small bud vase (a wish: ojalá, quiero que…), and an open notebook with a pencil, ready for
   writing the wish down. */
#define CAM_POS vec3(-0.6639,0.4429,-1.0036)
#define CAM_TGT vec3(-0.1990,0.0445,0.1917)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* bud vase: a small round-bellied glass bottle with a narrow neck */
#define VC vec3(-.02,0.,.1)
float vaseD(vec3 p){ vec3 q=p-VC; float y=q.y; float r=length(q.xz);
  float R=.05*sqrt(max(0.,1.-pow((y-.042)/.046,2.)))+.009;          /* belly */
  R=mix(R,.012+.004*smoothstep(.13,.145,y),smoothstep(.07,.1,y));    /* neck, lip */
  float d=max(r-R,max(-y,y-.145));
  return d*.7; }
/* stem: a gentle curve up out of the neck; seed head a soft ball */
vec3 stemPt(float t){ return VC+vec3(-.025*t*t,.13+.13*t,.01*t); }
float stemD(vec3 p){ float d=1e3; vec3 a=stemPt(0.);
  for(int i=1;i<=8;i++){ vec3 b=stemPt(float(i)/8.); d=min(d,sdCapsule(p,a,b,.0028)); a=b; }
  float lf=1e3; vec3 l=p-stemPt(.05)-vec3(.02,-.01,0.); l.xy=rot(-.8)*l.xy;
  lf=max(length(l*vec3(1.,6.,3.))/6.-.004,-1.);
  return min(d,lf); }
#define HC (stemPt(1.)+vec3(0.,.045,0.))
float headD(vec3 p){ vec3 q=p-HC; float r=length(q);
  vec3 u=q/max(r,1e-4); float fz=.009*pow(vn3(u*30.),2.)+.004*vn3(u*70.);
  return max(r-.046-fz,-(q.y+.058))*.6; }
float calyxD(vec3 p){ vec3 q=p-HC+vec3(0.,.012,0.); return length(q*vec3(1.,1.4,1.))/1.4-.01; }
/* an open notebook for writing the wish down, a pencil lying on it */
vec3 nbQ(vec3 p){ vec3 q=p-vec3(.2,.02,-.04); q.xz=rot(-.25)*q.xz; q.yz=rot(-.22)*q.yz; return q; }
vec2 nbD(vec3 p){ vec3 q=nbQ(p); float x=abs(q.x);
  float lift=.02*sin(clamp(x/.1,0.,1.)*1.9)-.012*exp(-x*55.)+.006;
  float pages=sdBox(vec3(x-.052,q.y-lift*.5,q.z),vec3(.05,max(lift*.5,.003),.07))-.0015;
  float cover=sdRBox(vec3(x-.056,q.y+.001,q.z),vec3(.058,.0035,.075),.0015);
  float prop=sdRBox(p-vec3(.2,.012,.03),vec3(.1,.012,.025),.003);
  return vec2(pages,min(cover,prop)); }
vec3 pnQ(vec3 p){ vec3 q=nbQ(p)-vec3(.03,.02,-.005); q.xz=rot(.5)*q.xz; return q; }
float pencilD(vec3 q){ float R=.0055; vec2 h=abs(q.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(q.x)-.08);
  float t=clamp((q.x-.08)/.022,0.,1.); float cone=max(length(q.yz)-R*(1.-t)*.95,max(.08-q.x,q.x-.102));
  return min(body,cone); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,vaseD(p),3.);
  r=U(r,min(stemD(p),calyxD(p)),4.);
  r=U(r,headD(p),5.);
  vec2 nb=nbD(p); r=U(r,nb.x,6.); r=U(r,nb.y,7.); r=U(r,pencilD(pnQ(p)),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-VC; return q.y<.05&&q.y>.012?.65:.82; }        /* a little water in the belly */
  if(id==4.) return .38;
  if(id==5.){ vec3 q=normalize(p-HC); float f=vn3(q*55.); return f>.72?.55:.97; }   /* seed tufts: mostly white, a few grey ticks */
  if(id==6.){ vec3 q=nbQ(p); float x=abs(q.x); if(x<.006) return .6;
    if(x>.012&&x<.09&&q.z<.05&&q.z>-.055&&fract((q.z+.1)/.013)<.14) return .5;   /* ruled hint-lines */
    return .95; }
  if(id==7.) return .35;
  if(id==8.){ vec3 q=pnQ(p); return q.x>.08?(q.x>.096?.15:.85):.55; }
  return .7; }
