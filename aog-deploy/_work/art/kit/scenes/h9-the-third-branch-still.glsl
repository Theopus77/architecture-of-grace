/* Practice room "The Third Branch" — pencil still life: a judge's gavel resting on its round
   sound block, a thick law book lying behind, and a small fluted stone column (a courthouse). */
#define CAM_POS vec3(-0.3695,0.4757,-0.9264)
#define CAM_TGT vec3(-0.2144,-0.0237,0.1142)
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
#define COL vec3(-.12,0.,.08)
#define BK vec3(.06,0.,.09)
#define BS vec3(.1,.028,.075)
#define SB vec3(.1,0.,-.1)
float columnD(vec3 q){ float d=sdRBox(q-vec3(0.,.008,0.),vec3(.04,.008,.04),.002);
  d=min(d,sdCylY(q-vec3(0.,.02,0.),.032,.004)-.002);
  float a=atan(q.z,q.x); float r=.026-.0018*smoothstep(.3,.8,abs(cos(a*8.)));
  d=min(d,sdCylY(q-vec3(0.,.12,0.),r-(q.y-.02)*.02,.1));
  d=min(d,sdCylY(q-vec3(0.,.225,0.),.03,.006)-.002);
  d=min(d,sdRBox(q-vec3(0.,.238,0.),vec3(.038,.007,.038),.002));
  return d; }
float blockD(vec3 q){ float d=sdCylY(q-vec3(0.,.012,0.),.05,.012)-.002; d=min(d,sdTorus(q-vec3(0.,.012,0.),.05,.003)); return d; }
vec3 gvQ(vec3 p){ vec3 q=p-SB-vec3(-.02,.052,0.); q.xz=rot(-.35)*q.xz; return q; }
float headD(vec3 q){ float d=sdCylZ(q,.022,.042)-.003; d=min(d,sdCylZ(q,.024,.004)-.001);
  for(int i=0;i<2;i++){ d=min(d,sdCylZ(q-vec3(0.,0.,(float(i)*2.-1.)*.034),.024,.003)-.001); } return d; }
float handleD(vec3 q){ vec3 h=q-vec3(0.,-.0,0.); h.xy=rot(-.2)*h.xy; return min(sdCapsule(h,vec3(.02,0.,0.),vec3(.16,0.,0.),.0065),length(h-vec3(.165,0.,0.))-.01); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,columnD(place(p,COL,.3)),3.);
  vec3 b=p-BK; b.xz=rot(-.2)*b.xz;
  r=U(r,bookD(b,BS),4.);
  r=U(r,blockD(p-SB),5.);
  vec3 g=gvQ(p);
  r=U(r,headD(g),6.);
  r=U(r,handleD(g),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .85-.08*fbm(p.xy*60.);
  if(id==4.){ vec3 b=p-BK; b.xz=rot(-.2)*b.xz; if(b.y>2.*BS.y-.002) return .6;
    if(b.x>-BS.x+.01&&b.y<2.*BS.y-.004&&b.y>.004) return .9;
    if(b.x<-BS.x+.01&&abs(b.y-BS.y)<.004) return .8; return .35; }
  if(id==5.) return .45+.1*grain(p-SB,60.);
  if(id==6.){ vec3 g=gvQ(p); if(abs(abs(g.z)-.034)<.004||abs(g.z)<.004) return .3; return .5; }
  if(id==7.) return .5;
  return .7; }
