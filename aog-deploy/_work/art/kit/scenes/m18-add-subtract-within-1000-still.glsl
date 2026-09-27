/* m18 "Adding and Subtracting within 1,000" — base-ten blocks: a stack of three hundred-flats
   with ten-rods laid across the top, a row of loose ten-rods in front, and a few unit cubes. */
#define CAM_POS vec3(-0.5199,0.4782,-0.5890)
#define CAM_TGT vec3(-0.1814,-0.0806,0.1231)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_mid.glsl"
#define UU .02
vec3 stQ(vec3 p,int i){ float fi=float(i); return place(p,vec3(.01+.004*sin(fi*2.),fi*UU,.14+.003*cos(fi*3.)),.35+.05*sin(fi*1.7)); }
float flats(vec3 p){ float d=1e5; for(int i=0;i<3;i++) d=min(d,flatD(stQ(p,i),UU)); return d; }
vec3 topQ(vec3 p,int i){ float fi=float(i); return place(p,vec3(-.02+fi*.045,3.*UU,.12+fi*.035),-.45+fi*.06); }
float topRods(vec3 p){ return min(rodD(topQ(p,0),UU),rodD(topQ(p,1),UU)); }
vec3 rowQ(vec3 p,int i){ float fi=float(i); return place(p,vec3(-.07+fi*.004,0.,-.03-fi*.0215),.5); }
float rowRods(vec3 p){ float d=1e5; for(int i=0;i<3;i++) d=min(d,rodD(rowQ(p,i),UU)); return d; }
vec3 uQ(vec3 p,int i){ vec3 c=i==0?vec3(.15,0.,-.02):i==1?vec3(.177,0.,-.03):i==2?vec3(.16,0.,-.058):i==3?vec3(.163,UU,-.025):vec3(.2,0.,-.07);
  return place(p,c+vec3(.05,0.,.0),.3+float(i)*.7); }
float units(vec3 p){ float d=1e5; for(int i=0;i<5;i++) d=min(d,unitD(uQ(p,i),UU)); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,flats(p),3.);
  r=U(r,topRods(p),4.);
  r=U(r,rowRods(p),5.);
  r=U(r,units(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ int k=int(clamp(floor(p.y/UU),0.,2.)); vec3 q=stQ(p,k);
    if(n.y>.7) return gridTone(q.xz,UU,.86);
    return gridTone(vec2(abs(n.x)>abs(n.z)?q.z:q.x,q.y-UU*.5),UU,.8); }
  if(id==4.){ vec3 q=topQ(p,0); if(abs(q.z)>UU*.6) q=topQ(p,1); return gridTone(vec2(q.x,UU*.5),UU,.66); }
  if(id==5.){ float best=1e5; vec3 bq=vec3(0.); for(int i=0;i<3;i++){ vec3 q=rowQ(p,i); if(abs(q.z)<best){best=abs(q.z);bq=q;} } return gridTone(vec2(bq.x,UU*.5),UU,.66); }
  if(id==6.) return .5;
  return .7; }
