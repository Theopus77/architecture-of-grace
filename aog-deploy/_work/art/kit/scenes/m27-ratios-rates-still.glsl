/* Room m27 "Ratios, Rates and Unit Rates" — pencil still life of a lemonade recipe: a tall
   glass pitcher half full, two whole lemons and a cut half showing its segments (lemons to
   water, a group you repeat), and a stopwatch lying face up (a rate: how much per second). */
#define CAM_POS vec3(-0.3791,0.4272,-0.8639)
#define CAM_TGT vec3(-0.2340,-0.0400,0.1093)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
#define PCN vec3(-.02,0.,.08)
vec3 pQ(vec3 p){ return place(p,PCN,.25); }
float pitcherD(vec3 q){ float H=.2; float R=.055+.012*sin(clamp(q.y/H,0.,1.)*2.6)-.008*smoothstep(.15,.2,q.y);
  float r=length(q.xz); float a=atan(q.z,q.x);
  float spout=.02*smoothstep(.16,.2,q.y)*pow(max(-cos(a),0.),10.);
  float outer=max(r-R-spout,abs(q.y-H*.5)-H*.5)-.0015;
  float inner=max(r-R-spout+.0035,abs(q.y-H*.5-.005)-H*.5);
  float d=max(outer,-inner);
  vec3 h=q-vec3(.068,.12,0.); float hd=length(vec2(length(h.xy*vec2(1.3,.7))-.04,h.z))-.008; hd=max(hd,.058-r);
  return min(d,hd); }
float lemonadeD(vec3 q){ float H=.2; float R=.055+.012*sin(clamp(q.y/H,0.,1.)*2.6)-.004; float r=length(q.xz);
  return max(r-R,abs(q.y-.058)-.052); }
float lemon(vec3 q){ float d=sdEll(q,vec3(.042,.03,.03));
  d=min(d,sdEll(q-vec3(.04,0.,0.),vec3(.01,.008,.008))); d=min(d,sdEll(q+vec3(.04,0.,0.),vec3(.008,.007,.007)));
  return d+.0006*vn3(q*500.); }
float lemonsD(vec3 p){ vec3 a=p-vec3(.12,.036,-.05); a.xz=rot(.5)*a.xz; vec3 b=p-vec3(.18,.036,.04); b.xz=rot(-.9)*b.xz;
  return min(lemon(a/1.2),lemon(b/1.2))*1.2; }
vec3 hlQ(vec3 p){ vec3 q=p-vec3(.05,.0,-.13); q.xz=rot(.3)*q.xz; return q; }
float halfD(vec3 q){ vec3 c=q-vec3(0.,.036,0.); float d=sdEll(c,vec3(.032,.036,.032)); d=min(d,sdEll(c+vec3(0.,.034,0.),vec3(.007,.008,.007))); return max(d,c.y); }
vec3 swQ(vec3 p){ return place(p,vec3(-.14,0.,-.1),.4); }
float watchD(vec3 q){ float b=sdCylY(q-vec3(0.,.009,0.),.038,.007)-.003;
  float crown=sdCylZ(q-vec3(0.,.01,.048),.006,.008)-.001;
  float ring=sdTorus((q-vec3(0.,.01,.063)).xzy*vec3(1.,1.,1.),.009,.0022);
  ring=sdTorus((q-vec3(0.,.01,.064)),.009,.0024);
  float btn=sdCylAB(q,vec3(.028,.01,.03),vec3(.035,.01,.038),.004);
  return min(min(b,crown),min(ring,btn)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=pQ(p);
  r=U(r,pitcherD(q),3.);
  r=U(r,lemonadeD(q),4.);
  r=U(r,lemonsD(p),5.);
  r=U(r,halfD(hlQ(p)),6.);
  r=U(r,watchD(swQ(p)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=pQ(p); if(abs(q.y-.108)<.0025) return .3; if(q.y<.108&&q.y>.01) return .8+.05*sin(q.y*300.)*0.; return .95; }
  if(id==4.){ vec3 q=pQ(p); if(q.y>.106) return .45; return .76; }
  if(id==5.) return .62+.08*vn3(p*300.);
  if(id==6.){ vec3 q=hlQ(p); if(q.y>.034){ float r=length(q.xz)/.032; float a=atan(q.z,q.x); if(r>.85) return .45; if(abs(fract(a/.698+.5)-.5)<.06||r<.12) return .5; return .85; } return .62; }
  if(id==7.){ vec3 q=swQ(p); float r=length(q.xz); if(q.y>.017&&r<.034){ float a=atan(q.x,q.z);
      if(r>.026&&abs(fract(a/.5236+.5)-.5)<.1) return .15; if(sdSeg2(q.xz,vec2(0.),vec2(.02,.012))<.0015) return .15; return .95; }
    return .45; }
  return .7; }
