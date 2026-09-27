/* WCS Unit 14 "Class and Culture Today" — pencil still life: an old leather suitcase standing
   on end with straps and a handle (migration), beside three stacks of coins of very different
   heights (inequality). */
#define CAM_POS vec3(-0.4484,0.3004,-1.0609)
#define CAM_TGT vec3(-0.1889,0.0642,0.1070)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
vec3 sQ(vec3 p){ vec3 q=p-vec3(0.,0.,.12); q.xz=rot(.3)*q.xz; return q; }
float suit(vec3 p){ vec3 q=sQ(p); float d=sdRBox(q-vec3(0.,.15,0.),vec3(.16,.15,.055),.018);
  d=min(d,sdRBox(q-vec3(0.,.15,0.),vec3(.163,.153,.012),.004));
  return d; }
float fittings(vec3 p){ vec3 q=sQ(p);
  float d=sdRBox(q-vec3(-.08,.15,0.),vec3(.016,.156,.061),.003); d=min(d,sdRBox(q-vec3(.08,.15,0.),vec3(.016,.156,.061),.003));
  vec3 h=q-vec3(0.,.315,0.); float hd=sdTorus(vec3(h.x*.7,h.z,h.y).xzy*vec3(1.,1.,1.),.0,.0);
  hd=max(sdTorus(vec3(h.x*.55,h.y,h.z).xzy,.022,.007),-h.y+.0);
  hd=min(hd,sdRBox(h-vec3(-.035,-.006,0.),vec3(.01,.006,.012),.003)); hd=min(hd,sdRBox(h-vec3(.035,-.006,0.),vec3(.01,.006,.012),.003));
  d=min(d,hd);
  vec3 c=vec3(abs(q.x)-.155,abs(q.y-.15)-.145,abs(q.z)-.05); d=min(d,length(c)-.014);
  d=min(d,sdRBox(q-vec3(-.045,.3,-.05),vec3(.012,.006,.008),.002)); d=min(d,sdRBox(q-vec3(.045,.3,-.05),vec3(.012,.006,.008),.002));
  return d; }
float coins(vec3 p){ float d=1e5; vec3 cs[3]; cs[0]=vec3(.2,0.,-.08); cs[1]=vec3(.29,0.,-.03); cs[2]=vec3(.37,0.,-.1);
  int nn[3]; nn[0]=2; nn[1]=6; nn[2]=13;
  for(int i=0;i<3;i++){ for(int k=0;k<13;k++){ if(k>=nn[i]) break; float fk=float(k);
      vec3 o=vec3(.002*sin(fk*2.3+float(i)),.0045+fk*.009,.002*cos(fk*1.7));
      d=min(d,sdCylY(p-cs[i]-o,.022,.0035)-.0008); } }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,suit(p),3.);
  r=U(r,fittings(p),4.);
  r=U(r,coins(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=sQ(p); if(abs(q.z)<.013&&abs(n.z)<.5) return .3; return .5+.1*fbm(p.xy*30.); }
  if(id==4.) return .3;
  if(id==5.){ if(abs(n.y)>.7){ vec2 u=p.xz-floor(p.xz); return .72; } return fract(p.y/.009)<.18?.35:.6; }
  return .7; }
