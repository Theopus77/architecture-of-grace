/* Room r5 "Islam: The Qur'an and the Five Pillars" — pencil still life, objects only and no
   figures: a carved wooden folding book stand (rahle) in its X shape holding an open book
   whose pages carry only an ornamental frame and hint-lines, a folded prayer rug with a
   geometric border, and a pierced brass lantern. */
#define CAM_POS vec3(-0.2617,0.3393,-0.6786)
#define CAM_TGT vec3(-0.1458,-0.0339,0.0991)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
vec3 rhQ(vec3 p){ return place(p,vec3(0.,0.,.06),-1.05); }   /* the book's spine runs along local x */
#define RA .62
float boardAt(vec3 q,float s){ vec3 b=q-vec3(0.,.07,0.); b.yz=rot(s*RA)*b.yz;
  float d=sdRBox(b,vec3(.085,.0045,.1),.002);
  vec2 u=vec2(b.x,b.z); float cut=abs(length(u-vec2(0.,-.07))-.02)-.004; cut=max(cut,abs(b.y)-.01);   /* a pierced rosette near each foot */
  return max(d,-max(cut,-(b.z+.04))); }
float rahleD(vec3 q){ return min(boardAt(q,1.),boardAt(q,-1.)); }
vec2 bookOn(vec3 q){ /* the open book lies in the upper V */
  vec3 b=q-vec3(0.,.07,0.); float z=abs(b.z); float s=sign(b.z);
  vec3 c=b; c.yz=rot(-s*RA)*c.yz;   /* each half in its own board's frame */
  float pg=sdBox(c-vec3(0.,.012,s*.055),vec3(.07,.006,.05))-.001;
  float cv=sdRBox(c-vec3(0.,.0065,s*.057),vec3(.074,.0018,.054),.001);
  return vec2(max(pg,-b.y+.005),max(cv,-b.y+.003)); }
vec3 rgQ(vec3 p){ return place(p,vec3(.22,0.,-.04),.3); }
float rugD(vec3 q){ float d=1e5; for(int i=0;i<3;i++){ d=min(d,sdRBox(q-vec3(0.,.007+.013*float(i),float(i)*.004),vec3(.075-.002*float(i),.0055,.05),.004)); } return d; }
#define LN vec3(-.19,0.,-.05)
float lanternD(vec3 p){ vec3 q=p-LN; float r=length(q.xz); float a=atan(q.z,q.x);
  float body=sdCylY(q-vec3(0.,.07,0.),.034,.045)-.002;
  float cap=sdCone(q-vec3(0.,.13,0.),.038,.008,.018);
  float fin=sdCylY(q-vec3(0.,.16,0.),.003,.012); float ring=sdTorus(vec3(q.x,q.z,q.y-.178),.009,.0022); ring=sdTorus((q-vec3(0.,.18,0.)).xzy,.009,.0022);
  float foot=sdCylY(q-vec3(0.,.012,0.),.03,.012)-.002;
  vec2 u=vec2(a*.034,q.y-.07); vec2 g=abs(fract(u/vec2(.018,.022)+.5)-.5)*vec2(.018,.022);
  float star=max(abs(g.x)+abs(g.y)*.8-.006,0.);
  float d=min(min(body,cap),min(min(fin,ring),foot));
  float pierce=max(star,abs(r-.034)-.004); pierce=max(pierce,abs(q.y-.07)-.036);
  return max(d,-pierce); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=rhQ(p);
  r=U(r,rahleD(q),3.);
  vec2 b=bookOn(q); r=U(r,b.x,4.); r=U(r,b.y,5.);
  r=U(r,rugD(rgQ(p)),6.);
  r=U(r,lanternD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 b=rhQ(p)-vec3(0.,.07,0.); float s=sign(b.z); vec3 c=b; c.yz=rot(s*RA)*c.yz;
    if(abs(c.y)>.003){ vec2 u=vec2(c.x,c.z); float v=abs(fract(u.x/.02+.5)-.5)+abs(fract(u.y/.02+.5)-.5); if(abs(v-.3)<.04&&c.z<-.02) return .35; } return .5+.08*grain(p,70.); }
  if(id==4.){ vec3 b=rhQ(p)-vec3(0.,.07,0.); float s=sign(b.z); vec3 c=b; c.yz=rot(-s*RA)*c.yz; vec2 u=vec2(c.x,abs(c.z)-.055);
    float fr=abs(max(abs(u.x)/.058,abs(u.y)/.04)-1.); if(fr<.03) return .3; if(fr<.08&&fract((u.x+u.y)*120.)<.5) return .55;
    if(abs(u.x)<.048&&abs(u.y)<.032&&fract((u.y+.1)/.009)<.2) return .62;
    return .95; }
  if(id==5.) return .38;
  if(id==6.){ vec3 q=rgQ(p); vec2 u=q.xz; float e=min(.07-abs(u.x),.048-abs(u.y));
    if(abs(n.y)<.6) return fract(q.y/.006)<.5?.45:.7;
    if(e<.012){ float z=abs(fract((u.x+u.y)/.012)-.5); return z<.15?.3:.6; } if(e<.016) return .35;
    vec2 m=abs(u)/vec2(.03,.02); if(abs(m.x+m.y-1.)<.12) return .4; return .72; }
  if(id==7.){ vec3 q=p-LN; float a=atan(q.z,q.x); if(q.y>.03&&q.y<.108&&length(q.xz)>.03){ vec2 u=vec2(a*.034,q.y-.07); vec2 g=abs(fract(u/vec2(.018,.022)+.5)-.5)*vec2(.018,.022);
      float st=abs(g.x)+abs(g.y)*.8; if(st<.0045) return .15; if(abs(st-.0075)<.0008) return .35; }
    if(abs(q.y-.026)<.0025||abs(q.y-.114)<.0025) return .3; return .6; }
  return .7; }
