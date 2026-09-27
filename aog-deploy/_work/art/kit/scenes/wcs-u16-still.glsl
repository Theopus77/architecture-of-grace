/* WCS Unit 16 "Propaganda, Extremism and Civic Life" — pencil still life: an old desk radio
   microphone on a round stand, a folded stack of newspapers, and a hand loudspeaker (megaphone)
   lying on its side. */
#define CAM_POS vec3(-0.5507,0.2848,-1.1138)
#define CAM_TGT vec3(-0.2764,0.0353,0.1205)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define MC vec3(.0,0.,.1)
float micBase(vec3 p){ vec3 q=p-MC; float d=sdCylY(q-vec3(0.,.012,0.),.07,.01)-.004; d=min(d,sdCone(q-vec3(0.,.035,0.),.04,.012,.012));
  d=min(d,sdCylY(q-vec3(0.,.12,0.),.007,.08)); return d; }
vec3 hQ(vec3 p){ vec3 q=p-MC-vec3(0.,.26,0.); q.yz=rot(-.15)*q.yz; return q; }
float micHead(vec3 p){ vec3 q=hQ(p); float d=length(q/vec3(.05,.07,.032))-1.; d*=.032; d=max(d,-(abs(q.z)-.02)*1.); 
  float cage=sdRBox(q,vec3(.052,.072,.02),.02); d=min(d,cage);
  return d; }
float yoke(vec3 p){ vec3 q=hQ(p); float d=max(abs(length(q.xy)-.07)-.004,abs(q.z)-.004); d=max(d,q.y);
  d=min(d,sdCylY(p-MC-vec3(0.,.19,0.),.009,.012)); d=min(d,sdCylZ(q-vec3(.07,0.,0.),.008,.01)); d=min(d,sdCylZ(q+vec3(.07,0.,0.),.008,.01)); return d; }
vec3 nQ(vec3 p){ vec3 q=p-vec3(.25,0.,.03); q.xz=rot(-.3)*q.xz; return q; }
float papers(vec3 p){ vec3 q=nQ(p); float d=1e5; for(int i=0;i<5;i++){ float fi=float(i); vec3 o=q-vec3(.006*sin(fi*2.7),.006+fi*.012,.005*cos(fi*1.9));
    o.xz=rot(.05*sin(fi*3.1))*o.xz; d=min(d,sdRBox(o,vec3(.13,.0045,.09),.004)); } return d; }
vec3 mQ(vec3 p){ vec3 q=p-vec3(-.2,.0,-.1); q.xz=rot(2.5)*q.xz; return q; }
float mega(vec3 p){ vec3 q=mQ(p); vec3 c=q-vec3(0.,.055,0.); float t=clamp((c.x+.1)/.2,0.,1.); float r=.018+.037*t*t*.6+.022*t;
  float d=max(abs(length(c.yz)-r)-.003,abs(c.x)-.1)*.8;
  d=min(d,sdTorus((c-vec3(.1,0.,0.)).yxz,r+.0,.004));
  d=min(d,sdCylX(c+vec3(.115,0.,0.),.014,.02)-.002);
  d=min(d,sdRBox(c-vec3(-.07,-.035,0.),vec3(.008,.02,.008),.003));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,micBase(p),3.);
  r=U(r,micHead(p),4.);
  r=U(r,yoke(p),5.);
  r=U(r,papers(p),6.);
  r=U(r,mega(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .4;
  if(id==4.){ vec3 q=hQ(p); if(abs(q.z)>.018){ if(fract(q.y/.008)<.35) return .3; return .6; } if(abs(fract(q.x/.01))<.3) return .35; return .5; }
  if(id==5.) return .45;
  if(id==6.){ vec3 q=nQ(p); if(n.y>.7&&q.y>.05){ vec2 u=q.xz;
      if(u.y>.055&&u.y<.075&&abs(u.x)<.1) return .3;
      if(u.y>.045&&u.y<.05) return .45;
      float col=fract((u.x+.12)/.06); if(u.y<.035&&u.y>-.075&&abs(u.x)<.11&&col<.85&&fract(u.y/.009)<.3) return .6;
      if(u.x>.03&&u.x<.1&&u.y<.035&&u.y>-.01) return .55; }
    if(abs(n.y)<.7) return fract(p.y/.004)<.4?.65:.85; return .92; }
  if(id==7.){ vec3 c=mQ(p)-vec3(0.,.055,0.); if(abs(c.x-.1)<.006) return .3; return .6; }
  return .7; }
