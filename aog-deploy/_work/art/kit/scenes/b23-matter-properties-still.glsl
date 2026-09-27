/* Room b23 "Matter: Properties and Changes" — pencil still life of the three states: a
   stovetop kettle (the water that becomes steam), a tumbler of water, and ice cubes melting
   on a saucer. */
#define CAM_POS vec3(-0.4049,0.4427,-0.9040)
#define CAM_TGT vec3(-0.2537,-0.0441,0.1104)
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
vec3 kQ(vec3 p){ return place(p,vec3(0.,0.,.07),.35); }
float kettleD(vec3 q){
  float body=sdCylY(q-vec3(0.,.05,0.),.07,.04)-.012;
  float dome=sdEll(q-vec3(0.,.09,0.),vec3(.082,.05,.082));
  float d=smin(body,dome,.02);
  d=max(d,-q.y+.002);
  float sp=sdCapsule(q,vec3(-.06,.045,0.),vec3(-.125,.115,0.),.012);
  sp=smin(sp,sdCapsule(q,vec3(-.1,.09,0.),vec3(-.137,.128,0.),.008),.01);
  sp=max(sp,-sdCapsule(q,vec3(-.1,.09,0.),vec3(-.15,.14,0.),.005));
  d=smin(d,sp,.012);
  float rim=sdTorus(q-vec3(0.,.135,0.),.03,.004);
  float lid=sdEll(q-vec3(0.,.133,0.),vec3(.03,.008,.03));
  float knob=length(q-vec3(0.,.148,0.))-.011;
  return min(min(d,rim),min(lid,knob)); }
float handleD(vec3 q){ vec3 h=q-vec3(0.,.14,0.);
  float t=length(vec2(length(h.xy*vec2(1.,.85))-.062,h.z))-.007;
  t=max(t,-(h.y-.02));
  float legs=min(sdCapsule(q,vec3(-.055,.12,0.),vec3(-.06,.16,0.),.0065),sdCapsule(q,vec3(.055,.12,0.),vec3(.06,.16,0.),.0065));
  return min(t,legs); }
#define GL vec3(.16,0.,-.04)
float glassD(vec3 p){ vec3 q=p-GL; float r=length(q.xz); float R=.034+q.y*.06;
  float outer=max(r-R,abs(q.y-.055)-.055)-.001;
  float inner=max(r-R+.003,abs(q.y-.062)-.055);
  return max(outer,-inner); }
float waterD(vec3 p){ vec3 q=p-GL; float r=length(q.xz); return max(r-.034-q.y*.06+.003,abs(q.y-.037)-.031); }
#define SC vec3(-.15,0.,-.1)
float saucerD(vec3 p){ vec3 q=p-SC; float r=length(q.xz);
  float d=max(abs(q.y-.004-r*r*1.6)-.0025,r-.07)-.001;
  return min(d,sdTorus(q-vec3(0.,.012,0.),.068,.003)); }
float iceD(vec3 p){ float d=1e5;
  for(int i=0;i<3;i++){ float fi=float(i); vec3 c=SC+vec3(-.025+.03*fi,.024+.0*fi,.012*sin(fi*2.));
    if(i==2) c=SC+vec3(-.01,.052,.004);
    vec3 q=p-c; q.xz=rot(fi*.9+.3)*q.xz; q.xy=rot(fi*.3-.2)*q.xy;
    d=min(d,sdRBox(q,vec3(.019),.006)+.0015*vn3(q*200.)); }
  return d; }
float puddleD(vec3 p){ vec3 q=p-SC; return max(length(q.xz)-.05,abs(q.y-.009)-.0014); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 k=kQ(p);
  r=U(r,kettleD(k),3.);
  r=U(r,handleD(k),4.);
  r=U(r,glassD(p),5.);
  r=U(r,waterD(p),6.);
  r=U(r,saucerD(p),7.);
  r=U(r,iceD(p),8.);
  r=U(r,puddleD(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 k=kQ(p); if(abs(k.y-.03)<.003) return .45; return .72; }
  if(id==4.) return .35;
  if(id==5.){ vec3 q=p-GL; if(q.y>.066&&q.y<.07) return .4; return .93; }
  if(id==6.){ vec3 q=p-GL; if(q.y>.065) return .45; return .72; }
  if(id==7.){ vec3 q=p-SC; float r=length(q.xz); return abs(r-.058)<.0025?.5:.88; }
  if(id==8.) return .9;
  if(id==9.) return .8;
  return .7; }
