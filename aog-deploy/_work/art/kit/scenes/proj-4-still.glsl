/* FACS project 4 "Yogurt parfait with measured layers" — pencil still life: a tall clear glass
   showing six even layers (yogurt, granola, berries, twice over) with berries on top and a long
   spoon in it, a half-cup measure of granola, and a few loose blueberries. */
#define CAM_POS vec3(-0.4107,0.4391,-0.8665)
#define CAM_TGT vec3(-0.1453,0.0354,0.1218)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "projparts.glsl"
#define GC vec3(-.01,0.,.04)
#define MC vec3(.12,0.,-.04)
#define TOPY .128
float glass(vec3 p){ vec3 q=p-GC; float r=length(q.xz); float R=.042+.008*clamp(q.y/.15,0.,1.);
  float d=max(r-R,abs(q.y-.075)-.075);
  d=max(d,-max(r-R+.003,-(q.y-.009)));
  d=min(d,max(r-R+.003,q.y-TOPY));                     /* the parfait inside, seen through */
  d=min(d,sdTorus(q-vec3(0.,.15,0.),R-.0005,.0022));
  return d*.9; }
float layerOf(vec3 q){ float a=atan(q.z,q.x); float y=q.y-.009+.0025*sin(a*3.+1.)+.0015*sin(a*7.);
  return floor(y/((TOPY-.009)/6.)); }
float topping(vec3 p){ vec3 q=p-GC; float d=1e5;
  for(int i=0;i<7;i++){ float fi=float(i); float a=fi*2.4; float rr=.012+.022*fract(fi*.618);
    d=min(d,length(q-vec3(rr*cos(a),TOPY+.004,rr*sin(a)))-.0078); }
  return d; }
float spoon(vec3 p){ vec3 q=p-GC; vec3 a=vec3(.012,.1,.005), b=vec3(.06,.2,.02);
  float h=sdCapsule(q,a,b,.0035); vec3 s=q-a; return min(h,sdEll(s,vec3(.009,.015,.006))); }
float mcup(vec3 p,vec3 c,float r,float hgt,float a){ vec3 q=p-c; q.xz=rot(a)*q.xz;
  float rr=r*(.85+.15*clamp(q.y/hgt,0.,1.));
  float outer=sdCylY(q-vec3(0.,hgt*.5,0.),rr,hgt*.5)-.002; float inner=sdCylY(q-vec3(0.,hgt*.5+.004,0.),rr-.004,hgt*.5);
  float cup=max(outer,-inner);
  float handle=sdRBox(q-vec3(r+.05,hgt-.003,0.),vec3(.055,.0025,.011),.002);
  return min(cup,handle); }
float granola(vec3 p){ vec3 q=p-MC; return max(sdCylY(q-vec3(0.,.02,0.),.043,.02),q.y-.04-.004*vn3(q*260.)); }
float berries(vec3 p){ float d=length(p-vec3(.06,.0075,-.12))-.0078;
  d=min(d,length(p-vec3(.08,.0075,-.105))-.0078); d=min(d,length(p-vec3(-.07,.0075,-.06))-.0078); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  { float g=glass(p); vec3 q=p-GC; float id=3.;
    if(q.y<TOPY+.001&&q.y>.009){ float k=mod(layerOf(q),3.); id=k==1.?8.:k==2.?9.:3.; }
    r=U(r,g,id); }
  r=U(r,topping(p),4.);
  r=U(r,berries(p),4.);
  r=U(r,spoon(p),5.);
  r=U(r,mcup(p,MC,.048,.045,-.4),6.);
  r=U(r,granola(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-GC;
    if(q.y>TOPY+.002||q.y<.009) return .9;
    float L=layerOf(q); float k=mod(L,3.);
    if(k==0.) return .95;                                                    /* yogurt */
    if(k==1.) return .55-.25*step(.68,vn3(q*520.));                         /* granola */
    return .18+.3*step(.82,vn3(q*300.)); }                                   /* berries */
  if(id==4.) return .25;
  if(id==5.) return .7;
  if(id==6.){ vec3 q=p-MC; return abs(q.y-.03)<.0022&&length(q.xz)>.04?.35:.64; }
  if(id==8.) return .55-.25*step(.68,vn3(p*520.));
  if(id==9.) return .2+.3*step(.82,vn3(p*300.));
  if(id==7.) return .55-.2*step(.7,vn3(p*520.));
  return .7; }
