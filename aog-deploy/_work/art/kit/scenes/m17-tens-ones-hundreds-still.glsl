/* Practice room "Tens and ones, then hundreds" — pencil still life: base-ten blocks. A hundred
   flat stands on its edge at the back, three ten-rods lie in front of it, and four loose unit
   cubes sit beside them. Grooves mark every unit. */
#define CAM_POS vec3(-0.2858,0.3395,-0.6781)
#define CAM_TGT vec3(-0.1695,-0.0350,0.1021)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define UN .016
/* a block of a x b x c units with a groove between units; centre-bottom at q=0 */
float blk(vec3 q,vec3 n){ vec3 h=n*UN*.5; vec3 c=q-vec3(0.,h.y,0.); float d=sdRBox(c,h,.0015);
  vec3 g=abs(fract((c+h)/UN+.5)-.5)*UN; float gr=1e3;
  if(n.x>1.) gr=min(gr,g.x); if(n.y>1.) gr=min(gr,g.y); if(n.z>1.) gr=min(gr,g.z);
  return max(d,-(max(gr-.0007,-(d+.0012))*1.)); }
vec3 flQ(vec3 p){ vec3 q=p-vec3(0.,0.,.08); q.xz=rot(.2)*q.xz; q.yz=rot(.12)*q.yz; return q; }
vec3 rodQ(vec3 p,float i){ vec3 q=p-vec3(-.04+i*.004,0.,-.03-i*.022); q.xz=rot(.18+i*.05)*q.xz; return q; }
vec3 unQ(vec3 p,float i){ vec2 o=i==0.?vec2(.13,-.02):i==1.?vec2(.16,-.03):i==2.?vec2(.14,-.06):vec2(.135,-.03);
  vec3 q=p-vec3(o.x,i==3.?UN:0.,o.y); q.xz=rot(i*.7)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,blk(flQ(p),vec3(10.,10.,1.)),3.);
  float d=1e3; for(int i=0;i<3;i++) d=min(d,blk(rodQ(p,float(i)),vec3(10.,1.,1.))); r=U(r,d,4.);
  d=1e3; for(int i=0;i<4;i++) d=min(d,blk(unQ(p,float(i)),vec3(1.))); r=U(r,d,5.);
  return r; }
float groove(vec3 c,vec3 n){ vec3 h=n*UN*.5; vec3 g=abs(fract((c+h)/UN+.5)-.5)*UN; float gr=1e3;
  if(n.x>1.) gr=min(gr,g.x); if(n.y>1.) gr=min(gr,g.y); if(n.z>1.) gr=min(gr,g.z); return gr; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=flQ(p); vec3 c=q-vec3(0.,UN*5.,0.); return groove(c,vec3(10.,10.,1.))<.0014?.35:.8; }
  if(id==4.){ for(int i=0;i<3;i++){ vec3 q=rodQ(p,float(i)); if(abs(q.z)<UN*.6&&abs(q.x)<UN*5.2){ vec3 c=q-vec3(0.,UN*.5,0.); return groove(c,vec3(10.,1.,1.))<.0014?.3:.72; } } return .72; }
  if(id==5.) return .7;
  return .7; }
