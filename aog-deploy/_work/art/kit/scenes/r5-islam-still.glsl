/* r5 "Islam: The Qur'an and the Five Pillars" — objects only, no people and no figures: an
   open mushaf resting on a carved wooden folding stand (rahle) with a low arch between its feet, a loop of
   prayer beads with a tassel in front of it, and a small bowl of dates for breaking the fast.
   The pages carry only an ornamental frame and hint-lines, never writing.
   @params {"mat":{"3":[0.5,1.3,1.0],"4":[0.93,1.0,0.6],"5":[0.3,1.2,0.9],"6":[0.45,1.4,1.0],"7":[0.7,1.3,1.0],"8":[0.3,1.3,1.0]},
            "texlines":{"3":[0.12,0.4,0.5],"4":[0.12,0.4,0.85],"7":[0.12,0.4,0.6]}} */
#define CAM_POS vec3(-0.5789,0.6864,-1.2793)
#define CAM_TGT vec3(-0.3660,0.0011,0.1489)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define SC .5
#define RC vec3(-.02,0.,.12)
#define RY .35
float star8(vec2 f){ vec2 a=abs(f); vec2 r=abs(rot(.785398)*f); return min(max(a.x,a.y),max(r.x,r.y)); }
vec3 rq(vec3 p){ vec3 q=(p-RC)/SC; q.xz=rot(RY)*q.xz; return q; }
float board(vec3 q,float s){
  vec3 a=q-vec3(0,.26,0); a.yz=rot(s*.62)*a.yz;
  float d=sdRBox(a,vec3(.2,.34,.009),.003);
  d=max(d,-(length(vec2(a.x,(a.y+.34)*1.6))-.1));                  /* a low arch between the feet */
  return d; }
float rahle(vec3 p){ vec3 q=rq(p); float d=min(board(q,1.),board(q,-1.)); return max(d,-q.y)*SC; }
vec3 bq(vec3 p){ vec3 q=rq(p); q-=vec3(0.,.565,-.02); q.yz=rot(-.62)*q.yz; return q; }
vec2 book(vec3 p){
  vec3 q=bq(p)/1.22; float x=abs(q.x);
  float curl=.02*sin(clamp(x/.2,0.,1.)*3.1416)+.022*(1.-exp(-x*25.));
  float pages=sdBox(vec3(x-.1,q.y-curl*.8,q.z),vec3(.097,.014,.14))-.001;
  float cover=sdRBox(vec3(x-.104,q.y+.014+curl*.3,q.z),vec3(.107,.004,.149),.002);
  return vec2(pages,cover)*1.22*SC; }
/* prayer beads: a loop of beads lying on the table, with a longer marker bead and a tassel */
#define BD vec3(.03,0.,-.1)
vec2 beadC(float t){ return vec2(.075*cos(t)+.016*cos(2.*t),.048*sin(t)); }
float beads(vec3 p){ vec3 q=p-BD; q.xz=rot(-.3)*q.xz; float d=1e3;
  for(int i=0;i<33;i++){ float t=float(i)/33.*6.2832; vec2 c=beadC(t);
    d=min(d,length(q-vec3(c.x,.0062,c.y))-.0066); }
  vec2 e=beadC(0.); vec3 m=q-vec3(e.x+.016,.006,e.y);
  d=min(d,sdCapsule(m,vec3(-.008,0.,0.),vec3(.011,0.,0.),.006));
  vec3 t=q-vec3(e.x+.045,.005,e.y+.008); t.xz=rot(-.25)*t.xz;
  float tas=sdCone(vec3(t.y,-t.x,t.z),.0035,.013,.022);      /* tassel along +x */
  return min(d,tas); }
/* a small bowl heaped with dates */
#define BW vec3(.2,0.,.02)
float bowl(vec3 p){ vec3 q=p-BW; float r=length(q.xz);
  float o=max(length(q-vec3(0.,.07,0.))-.075,q.y-.036); o=max(o,-q.y);
  float i=length(q-vec3(0.,.072,0.))-.07;
  float d=max(o,-i); d=min(d,sdTorus(q-vec3(0.,.036,0.),sqrt(.075*.075-.034*.034),.0025));
  d=min(d,sdCylY(q-vec3(0.,.003,0.),.028,.003)-.001);
  return d; }
float dates(vec3 p){ vec3 q=p-BW; float d=1e3;
  for(int i=0;i<9;i++){ float fi=float(i); float a=fi*2.4; float rr=i==0?0.:.028+.01*h1(vec2(fi,3.));
    vec3 c=vec3(rr*cos(a),.038+.012*(1.-rr/.04)+.004*h1(vec2(fi,5.)),rr*sin(a));
    vec3 l=q-c; l.xz=rot(a*1.7)*l.xz; l.xy=rot(.2*sin(fi))*l.xy;
    float k0=length(l/vec3(.016,.0085,.0085)),k1=length(l/(vec3(.016,.0085,.0085)*vec3(.016,.0085,.0085)));
    d=min(d,k0*(k0-1.)/k1); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,rahle(p),3.);
  vec2 b=book(p); r=U(r,b.x,4.); r=U(r,b.y,5.);
  r=U(r,beads(p),6.);
  r=U(r,bowl(p),7.);
  r=U(r,dates(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=rq(p);
    return .5+.14*(grain(q.zxy,30.)-.5); }
  if(id==4.){ vec3 q=bq(p)/1.22; float x=abs(q.x); float a=.94;
    vec2 b=abs(vec2(x-.1,q.z))-vec2(.078,.118); float m=max(b.x,b.y);
    if(abs(m)<.003||abs(m+.009)<.0018) a=.45;
    if(m<-.016){ float l=fract((q.z+.2)/.02); if(l<.22) a=.66; }
    if(abs(q.z-.098)<.009&&abs(x-.1)<.05&&m<-.012) a=.55;
    if(x<.008) a=.72; return a; }
  if(id==5.) return .3;
  if(id==6.) return .4;
  if(id==7.){ vec3 q=p-BW; if(abs(q.y-.026)<.002) return .45; return .72; }
  if(id==8.) return .3;
  return .7; }
