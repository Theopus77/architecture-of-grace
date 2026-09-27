/* e19 "Literary Devices" — an hourglass in a turned wooden frame, an open book, and an old
   skeleton key resting on its pages (symbols that stand for more than themselves). */
#define CAM_POS vec3(-0.3072,0.2452,-0.5284)
#define CAM_TGT vec3(-0.1090,0.0340,0.0923)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
#define HG vec3(-.06,0.,.12)
float frame(vec3 p){ vec3 q=place(p,HG,.3);
  float b=sdCylY(q-vec3(0.,.008,0.),.055,.008)-.003;
  float t=sdCylY(q-vec3(0.,.172,0.),.055,.008)-.003;
  float d=min(b,t);
  for(int i=0;i<3;i++){ float a=float(i)*2.094+.3; vec3 c=q-vec3(cos(a)*.045,.09,sin(a)*.045);
    d=min(d,sdCylY(c,.0045+.0018*sin(c.y*150.),.08)); }
  return d; }
float glassD(vec3 q){ float y=q.y-.09; float r=.004+.036*pow(abs(y)/.075,.8)*smoothstep(.078,.06,abs(y))+.0;
  r=max(r,.004); float s=length(q.xz)-r; return max(s,abs(y)-.078); }
float glass(vec3 p){ vec3 q=place(p,HG,.3); float g=glassD(q); return max(abs(g)-.0015,-1.)*.8; }
float sand(vec3 p){ vec3 q=place(p,HG,.3); float g=glassD(q)+.0025;
  float bottom=max(g,q.y-(.035+.012*smoothstep(.03,0.,length(q.xz))));
  float top=max(g,max(q.y-.14,-(q.y-.105)));
  float stream=max(length(q.xz)-.0012,abs(q.y-.07)-.035);
  return min(min(bottom,top),stream); }
vec3 bookQ(vec3 p){ vec3 q=p-vec3(.14,.02,.05); q.xz=rot(-.2)*q.xz; q.yz=rot(-.18)*q.yz; return q; }
vec2 bookD2(vec3 p){
  vec3 q=bookQ(p); float x=abs(q.x);
  float lift=.022*sin(clamp(x/.11,0.,1.)*1.9)-.014*exp(-x*55.)+.006;
  float pages=sdBox(vec3(x-.056,q.y-lift*.5,q.z),vec3(.055,max(lift*.5,.003),.075))-.0015;
  float cover=sdRBox(vec3(x-.06,q.y+.001,q.z),vec3(.063,.003,.081),.0015);
  float prop=sdRBox(p-vec3(.14,.012,.12),vec3(.12,.012,.03),.003);
  return vec2(pages,min(cover,prop)); }
vec3 kQ(vec3 p){ vec3 q=bookQ(p)-vec3(.05,.03,-.005); q.xz=rot(.5)*q.xz; return q/1.3; }
float key(vec3 p){ vec3 q=kQ(p);
  float bow=sdTorus(q-vec3(-.05,0.,0.),.013,.003);
  bow=min(bow,sdTorus(q-vec3(-.05,0.,0.),.006,.0018));
  float shaft=sdCylX(q-vec3(.005,0.,0.),.0028,.045);
  float collar=sdCylX(q-vec3(-.03,0.,0.),.0042,.003);
  float bit=sdBox(q-vec3(.04,0.,-.008),vec3(.008,.0022,.008));
  bit=max(bit,-sdBox(q-vec3(.04,0.,-.01),vec3(.0025,.004,.004)));
  return min(min(bow,shaft),min(collar,bit))*1.3; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,frame(p),3.);
  r=U(r,glass(p),4.);
  r=U(r,sand(p),5.);
  vec2 b=bookD2(p); r=U(r,b.x,6.); r=U(r,b.y,7.);
  r=U(r,key(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .4+.12*grain(place(p,HG,.3),40.);
  if(id==4.) return .92;
  if(id==5.) return .55+.1*vn3(p*2000.);
  if(id==6.){ vec3 q=bookQ(p); float x=abs(q.x); float a=.94;
    vec2 u=vec2(x-.056,q.z); float l=fract((u.y+.07)/.011);
    if(abs(u.y)<.065&&abs(u.x)<.042&&l<.18) a=.6;
    if(x<.004) a=.7; return a; }
  if(id==7.) return .4;
  if(id==8.) return .35;
  return .7; }
