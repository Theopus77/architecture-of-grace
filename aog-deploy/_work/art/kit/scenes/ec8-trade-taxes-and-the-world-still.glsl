/* Practice room "Trade, Taxes and the World Economy" — pencil still life: a wooden toy cargo
   ship loaded with shipping containers, one container on the table in front, and a rubber stamp
   (the customs desk where a tariff is paid). */
#define CAM_POS vec3(-0.3198,0.3428,-0.6983)
#define CAM_TGT vec3(-0.2004,-0.0419,0.1034)
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
#define SHIP vec3(0.,0.,.07)
#define CT vec3(-.12,0.,-.08)
#define STP vec3(.15,0.,-.08)
vec3 shQ(vec3 p){ vec3 q=p-SHIP; q.xz=rot(.22)*q.xz; return q; }
float hullD(vec3 q){ float w=.045*(1.-smoothstep(.1,.19,q.x))+.004; float d=sdBox2(vec2(abs(q.z)-w+.01,q.y-.028),vec2(.01,.028));
  d=max(sdRBox(q-vec3(0.,.028,0.),vec3(.2,.028,.05),.006),abs(q.z)-w-(q.y-.056)*-.12);
  d=max(d,-(q.x+.2)); return d; }
float bridgeD(vec3 q){ float d=sdRBox(q-vec3(-.155,.095,0.),vec3(.028,.04,.038),.003);
  d=min(d,sdRBox(q-vec3(-.155,.138,0.),vec3(.034,.004,.044),.002));
  d=min(d,sdCylY(q-vec3(-.17,.16,0.),.008,.02)); return d; }
vec3 bx(vec3 q,vec3 c){ return q-c; }
float contD(vec3 q){ vec3 s=vec3(.034,.0145,.018); float d=1e3;
  for(int i=0;i<4;i++) for(int j=0;j<2;j++) for(int k=0;k<2;k++){
    if(i==3&&j==1) continue; if(i==0&&j==1&&k==1) continue;
    vec3 c=vec3(-.08+float(i)*.071,.056+s.y+float(j)*2.*s.y,(float(k)-.5)*2.*s.z);
    d=min(d,sdRBox(q-c,s-vec3(.001),.0015)); }
  return d; }
float boxT(vec3 q,vec3 s){ vec3 a=abs(q); if(a.x<s.x-.003&&(a.z>s.z-.002)) return fract(q.x/.006)<.35?.35:.7; return .7; }
float stampD(vec3 q){ float d=sdRBox(q-vec3(0.,.012,0.),vec3(.035,.01,.025),.003);
  d=min(d,sdCylY(q-vec3(0.,.04,0.),.008,.02)); d=min(d,length(q-vec3(0.,.07,0.))-.018); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=shQ(p);
  r=U(r,hullD(q),3.);
  r=U(r,bridgeD(q),4.);
  r=U(r,contD(q),5.);
  vec3 c=place(p,CT,-.4);
  r=U(r,sdRBox(c-vec3(0.,.02,0.),vec3(.05,.02,.024),.0015),6.);
  r=U(r,stampD(place(p,STP,.4)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=shQ(p); if(q.y<.02) return .4; if(abs(q.y-.045)<.002) return .3; return .7; }
  if(id==4.){ vec3 q=shQ(p); if(q.y>.1&&q.y<.12&&abs(q.z)>.03&&fract(q.x/.012)<.5) return .3; return .85; }
  if(id==5.){ vec3 q=shQ(p); float f=fract(q.x/.006); return (n.y>.5)?.75:(f<.3?.35:.62); }
  if(id==6.){ vec3 c=place(p,CT,-.4); if(abs(c.x)>.046) return .45; return fract(c.x/.007)<.3?.35:.7; }
  if(id==7.){ vec3 q=place(p,STP,.4); if(q.y<.004) return .2; if(q.y<.024) return .45; return .6; }
  return .7; }
