/* Chinese Classics Unit 15 "Interpreters Across the Centuries" — pencil still life: an old
   stitched book lying open, a newer, smaller commentary lying open across it, a pair of round
   reading spectacles, and a tall oil-lamp stand with a small flame (readers through the ages). */
#define CAM_POS vec3(-0.6926,0.4074,-1.2120)
#define CAM_TGT vec3(-0.3850,0.0019,0.1447)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
vec3 b1Q(vec3 p){ vec3 q=p-vec3(-.02,.004,.08); q.xz=rot(.08)*q.xz; return q; }
vec3 b2Q(vec3 p){ vec3 q=p-vec3(.07,.022,.04); q.xz=rot(-.3)*q.xz; return q/.72; }
vec2 openB(vec3 q){ float x=abs(q.x);
  float lift=.016*sin(clamp(x/.13,0.,1.)*1.9)-.01*exp(-x*60.)+.004;
  float pages=sdBox(vec3(x-.065,q.y-lift*.5,q.z),vec3(.064,max(lift*.5,.002),.09))-.001;
  float cover=sdRBox(vec3(x-.068,q.y-.0,q.z),vec3(.068,.0025,.094),.001);
  return vec2(pages,cover); }
/* spectacles: two round rims joined by a bridge, temples folded behind */
vec3 sQ(vec3 p){ vec3 q=p-vec3(-.1,.006,-.1); q.xz=rot(.3)*q.xz; return q; }
float specs(vec3 p){ vec3 q=sQ(p);
  float d=min(sdTorus(q-vec3(-.026,0.,0.),.021,.0025),sdTorus(q-vec3(.026,0.,0.),.021,.0025));
  vec3 b=q-vec3(0.,.002,0.); d=min(d,sdCapsule(b,vec3(-.006,0.,-.004),vec3(.006,0.,-.004),.002));
  d=min(d,sdCapsule(q,vec3(-.046,.002,.004),vec3(.03,.004,.03),.0018));
  d=min(d,sdCapsule(q,vec3(.046,.002,.004),vec3(-.02,.006,.034),.0018));
  return d; }
float lensD(vec3 p){ vec3 q=sQ(p); return min(max(length(q.xz-vec2(-.026,0.))-.021,abs(q.y)-.001),max(length(q.xz-vec2(.026,0.))-.021,abs(q.y)-.001)); }
#define LP vec3(.3,0.,.16)
float lampStand0(vec3 p){ vec3 q=p-LP; float r=length(q.xz);
  float base=max(abs(q.y-.01+r*.1)-.007,r-.055)-.002;
  float col=sdCylY(q-vec3(0.,.12,0.),.007,.11);
  col=smin(col,length((q-vec3(0.,.07,0.))/vec3(1.,.5,1.))*.5-.012,.008);
  float dish=max(abs(q.y-.235-(r*r)*2.5)-.003,r-.05)-.001;
  return min(base,smin(col,dish,.008)); }
float flame0(vec3 p){ vec3 q=p-LP-vec3(.03,.245,0.);
  float t=clamp((q.y+.004)/.04,0.,1.); float r=.009*pow(sin(3.1416*pow(t,.62)),.8)*(1.-.15*t);
  return max(length(q.xz)-r,max(-q.y-.004,q.y-.036))*.7; }
float wick0(vec3 p){ return sdCapsule(p-LP,vec3(.015,.24,0.),vec3(.03,.245,0.),.002); }
float lampStand(vec3 p){ return lampStand0((p-LP)/1.15+LP)*1.15; }
float flame(vec3 p){ return flame0((p-LP)/1.15+LP)*1.15; }
float wick(vec3 p){ return wick0((p-LP)/1.15+LP)*1.15; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 g=p/1.7;
  vec2 a=openB(b1Q(g))*1.7; r=U(r,a.x,3.); r=U(r,a.y,4.);
  vec2 b=openB(b2Q(g))*.72*1.7; r=U(r,b.x,5.); r=U(r,b.y,6.);
  r=U(r,specs(g)*1.7,7.);
  r=U(r,lensD(g)*1.7,8.);
  r=U(r,lampStand(p),9.);
  r=U(r,flame(p),10.);
  r=U(r,wick(p),11.);
  return r; }
float colsT(vec3 q,float pitch){ float x=abs(q.x); if(x<.01||x>.12||abs(q.z)>.075) return .95;
  float c=fract(q.x/pitch); float cell=floor(q.x/pitch); if(c<.22&&q.z>.075-(.05+.07*h1(vec2(cell,7.)))) return .62; return .95; }
float toneAlb(float id,vec3 p0,vec3 n){ vec3 p=id<9.?p0/1.7:p0;
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=b1Q(p); if(abs(q.x)<.004) return .7; return colsT(q,.012); }
  if(id==4.) return .38;
  if(id==5.){ vec3 q=b2Q(p); if(abs(q.x)<.004) return .7; float a=colsT(q,.014); if(a>.9&&abs(q.z-.06)<.004&&abs(q.x)>.02&&abs(q.x)<.11) a=.5; return a; }
  if(id==6.) return .55;
  if(id==7.) return .22;
  if(id==8.) return .9;
  if(id==9.) return .4+.1*fbm(p.xy*80.);
  if(id==10.) return .97;
  if(id==11.) return .15;
  return .7; }
