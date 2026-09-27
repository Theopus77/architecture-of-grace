/* b24 "Ecosystems and Food Webs" — a fern in a clay pot, a slice of log with two mushrooms
   growing from it, and a pinecone lying on the table. */
#define CAM_POS vec3(-0.4646,0.2832,-0.6683)
#define CAM_TGT vec3(-0.2133,0.0151,0.1192)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
#define PT vec3(-.06,0.,.12)
float pot(vec3 p){ vec3 q=p-PT;
  float o=sdCone(q-vec3(0.,.045,0.),.042,.055,.045)-.002;
  float rim=sdCylY(q-vec3(0.,.092,0.),.06,.01)-.002;
  float d=min(o,rim); d=max(d,-sdCylY(q-vec3(0.,.1,0.),.05,.02));
  d=min(d,sdCylY(q-vec3(0.,.085,0.),.05,.004));      /* soil */
  return d; }
float fern(vec3 p){ vec3 q=p-PT-vec3(0.,.088,0.);
  if(length(q-vec3(0.,.06,0.))>.2) return length(q-vec3(0.,.06,0.))-.18;
  float d=1e5;
  for(int i=0;i<6;i++){ float a=float(i)*1.047+.3; vec2 dir=vec2(cos(a),sin(a));
    float L=.15+.02*sin(float(i)*3.1);
    vec3 r=vec3(dot(q.xz,dir),q.y,dot(q.xz,vec2(-dir.y,dir.x)));     /* frond plane: x out, y up */
    /* the rachis: a parabola rising then drooping */
    float x=clamp(r.x,0.,L); float y=x*1.6-x*x*6.;
    vec2 cx=vec2(x,y);
    float s=length(vec2(r.x-x,r.y-y))*.7; float st=length(vec3(r.x-x,r.y-y,r.z))-.0016;
    d=min(d,st);
    /* leaflets: short ellipses either side of the rachis, shrinking to the tip */
    float k=clamp(r.x/L,0.,1.); float w=.024*(1.-k*.85)*smoothstep(0.,.1,k);
    float seg=.011; float lf=1e5;
    for(int j=0;j<2;j++){ float xi=(floor(r.x/seg)+.5+float(j)-.5*step(.5,fract(r.x/seg))*0.)*seg; xi=(floor(r.x/seg-.5)+.5+float(j))*seg;
      float kk=clamp(xi/L,0.,1.); float ww=.026*(1.-kk*.85)*smoothstep(0.,.08,kk);
      float yi=xi*1.6-xi*xi*6.;
      vec3 l=vec3(r.x-xi,r.y-yi,abs(r.z)-ww*.55); l.xz=rot(.45)*l.xz;
      if(xi>0.&&xi<L) lf=min(lf,sdEll(l,vec3(.0055,.0014,ww*.6+.0005))); }
    d=min(d,lf); }
  return d; }
#define LG vec3(.13,0.,.06)
float logD(vec3 p){ vec3 q=p-LG; float a=atan(q.z,q.x);
  float r=.085+.005*(fbm(vec2(a*6.,q.y*30.))-.5)+.0015*sin(a*37.+fbm(vec2(a*3.,0.))*4.);
  return sdCylY(q-vec3(0.,.02,0.),r,.02)-.002; }
float mush(vec3 p,vec3 b,float h,float c,float lean){ vec3 q=p-b; q.xy=rot(lean)*q.xy;
  float st=sdCapsule(q,vec3(0.),vec3(0.,h,0.),c*.22)-.001*sin(q.y*300.)*0.;
  vec3 k=q-vec3(0.,h,0.); float cap=sdEll(k,vec3(c,c*.6,c)); cap=max(cap,-k.y-c*.05);
  cap=max(cap,-(sdEll(k+vec3(0.,c*.12,0.),vec3(c*.92,c*.45,c*.92))));
  return min(st,cap); }
float mushes(vec3 p){ return min(mush(p,LG+vec3(-.02,.04,.01),.06,.034,.12),mush(p,LG+vec3(.03,.04,-.03),.035,.022,-.25)); }
vec3 pcQ(vec3 p){ vec3 q=p-vec3(.07,.028,-.1); q.xz=rot(-.25)*q.xz; return q; }
float cone(vec3 p){ vec3 q=pcQ(p);                                   /* lies along x */
  float x=q.x; float rr=.028*(1.-pow(abs(x-.004)/.055,2.2)); rr=max(rr,.004);
  float a=atan(q.z,q.y);
  vec2 sc=vec2(fract(x/.013+a*1.3),fract(x/.013-a*.95))-.5; float bump=.007*min(.5-abs(sc.x),.5-abs(sc.y))*smoothstep(.0,.02,rr);
  float d=length(q.yz)-rr-bump; d=max(d,abs(x)-.058);
  float stalk=sdCapsule(q,vec3(-.058,0.,0.),vec3(-.072,.003,0.),.003);
  return min(d*.6,stalk); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pot(p),3.);
  r=U(r,fern(p),4.);
  r=U(r,logD(p),5.);
  r=U(r,mushes(p),6.);
  r=U(r,cone(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-PT; if(q.y>.08&&length(q.xz)<.051) return .25; return .6; }
  if(id==4.) return .45;
  if(id==5.){ vec3 q=p-LG; if(n.y>.7){ float r=length(q.xz)+.004*fbm(q.xz*60.);
      if(r>.078) return .35; return fract(r/.009)<.18?.4:.8; }
    return .35+.2*fbm(vec2(atan(q.z,q.x)*20.,q.y*300.)); }
  if(id==6.) return n.y<-.2?.4:.82;
  if(id==7.){ vec3 q=pcQ(p); float a=atan(q.z,q.y); vec2 sc=vec2(fract(q.x/.013+a*1.3),fract(q.x/.013-a*.95)); return min(sc.x,sc.y)<.12?.2:.52; }
  return .7; }
