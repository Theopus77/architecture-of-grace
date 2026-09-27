/* Chinese Classics Unit 8 "The Age of Philosophers" — pencil still life: two bronze bells of
   the Zhou court (almond-shaped, with rows of round bosses) hanging from a small wooden frame,
   a wooden striking mallet, and a tied bundle of bamboo slips, the books of the Hundred Schools. */
#define CAM_POS vec3(-0.4637,0.2774,-1.0015)
#define CAM_TGT vec3(-0.2165,0.0528,0.1108)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define FC vec3(0.,0.,.14)
#define FW .17
float frame(vec3 p){ vec3 q=p-FC;
  float d=1e5;
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 c=q-vec3(s*FW,0.,0.);
    d=min(d,sdRBox(c-vec3(0.,.16,0.),vec3(.009,.16,.009),.002));
    d=min(d,sdRBox(c-vec3(0.,.008,0.),vec3(.016,.008,.05),.003)); }
  vec3 b=q-vec3(0.,.3,0.); float beam=sdRBox(b,vec3(FW+.03,.011,.011),.003);
  float end=length(vec2(abs(b.x)-FW-.03,b.y-.004))-.014; beam=min(beam,max(end,abs(b.z)-.011));
  return min(d,beam); }
/* a bell: body is an almond in cross-section, flaring down, mouth curved up */
float bell(vec3 p,vec3 c,float s){ vec3 q=(p-c)/s;
  float t=clamp(-q.y/.13,0.,1.);
  vec2 w=vec2(.045+.018*t,.03+.01*t);
  float cs=length(vec2(q.x/w.x,q.z/w.y)); float lens=max(abs(q.x)/w.x*.9+abs(q.z)/w.y*.35,cs*.85);
  float d=(lens-1.)*min(w.x,w.y);
  float mouth=-.13+.018*(1.-(q.x/w.x)*(q.x/w.x));
  d=max(d,max(q.y,mouth-q.y));
  /* rows of bosses on the front and back */
  vec2 bb=vec2(abs(q.x)-.024-.004*t,q.y+.03); vec2 g=vec2(bb.x,mod(bb.y+.012,.024)-.012);
  if(q.y<-.01&&q.y>-.08){ float bs=length(vec3(g.x,g.y,abs(q.z)-w.y*.96))-.0055; d=min(d,max(bs,-(abs(q.x)-.014))); }
  /* a handle shank and a ring */
  d=min(d,sdCylY(q-vec3(0.,.025,0.),.01,.025)-.002);
  d=min(d,sdTorus((q-vec3(0.,.062,0.)).xzy,.01,.003));
  return d*s; }
float bells(vec3 p){ return min(bell(p,FC+vec3(-.075,.225,0.),1.05),bell(p,FC+vec3(.08,.245,0.),.8)); }
#define SL vec3(.34,.024,-.02)
float slips(vec3 p){ vec3 q=p-SL; q.xz=rot(.4)*q.xz;
  float d=sdCylX(q,.024,.1)-.002;
  d=min(d,sdTorus((q-vec3(.05,0.,0.)).yxz,.026,.003)); d=min(d,sdTorus((q-vec3(-.05,0.,0.)).yxz,.026,.003));
  return d; }
float mallet(vec3 p){ vec3 q=p-vec3(.2,.012,-.1); q.xz=rot(-.3)*q.xz;
  float h=sdCylX(q-vec3(-.06,0.,0.),.005,.07);
  float head=sdCylZ(q-vec3(.02,.006,0.),.018,.022)-.002;
  return min(h,head); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,frame(p),3.);
  r=U(r,bells(p),4.);
  r=U(r,slips(p),5.);
  r=U(r,mallet(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .4+.15*grain(p,40.);
  if(id==4.) return .42+.12*fbm(p.xy*70.);
  if(id==5.){ vec3 q=p-SL; q.xz=rot(.4)*q.xz; if(abs(q.x)>.099) return fract(length(q.yz)/.004)<.35?.35:.75;
    if(abs(abs(q.x)-.05)<.005) return .3; return fract(atan(q.z,q.y)*12./6.2832)<.12?.4:.72; }
  if(id==6.) return .5;
  return .7; }
