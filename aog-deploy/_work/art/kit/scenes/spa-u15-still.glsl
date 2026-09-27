/* Spanish Unit 15 "The Preterite: What Happened" — pencil still life of things that are done:
   an hourglass whose sand has all run to the bottom, a candle burned low in its holder, and a
   spent match lying beside it. */
#define CAM_POS vec3(-0.4917,0.2876,-0.7629)
#define CAM_TGT vec3(-0.2528,0.0010,0.1255)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define HG vec3(.04,0.,.06)
float bulbR(float y){ float t=abs(y-.11)/.085; return .006+.052*sin(clamp(t,0.,1.)*2.3)*smoothstep(0.,.3,t)+.0*t; }
float glassH(vec3 q){ float r=length(q.xz); float R=bulbR(q.y); return max(abs(r-R)-.002,abs(q.y-.11)-.088); }
float frame(vec3 q){ float top=sdRBox(q-vec3(0.,.207,0.),vec3(.075,.009,.075),.006), bot=sdRBox(q-vec3(0.,.009,0.),vec3(.075,.009,.075),.006);
  float posts=1e5; for(int i=0;i<3;i++){ float a=float(i)*2.094+.4; vec3 c=q-vec3(.062*cos(a),.108,.062*sin(a));
    posts=min(posts,sdCylY(c,.0055+.0015*sin(c.y*90.),.1)); } return min(min(top,bot),posts); }
float sand(vec3 q){ float r=length(q.xz); float R=bulbR(q.y)-.003;
  float heap=q.y-(.068-r*.55); float s=max(max(r-R,heap),.018-q.y); return s; }
#define CN vec3(-.14,0.,.0)
float candle(vec3 p){ vec3 q=p-CN;
  float dish=max(abs(q.y-(.004+.01*smoothstep(.025,.055,length(q.xz))))-.0022,length(q.xz)-.055);
  float cup=sdCylY(q-vec3(0.,.012,0.),.02,.01);
  float wax=sdCylY(q-vec3(0.,.026,0.),.016,.012)-.0015; wax=smin(wax,(length((q-vec3(.012,.035,-.012))/vec3(.008,.02,.008))-1.)*.008,.004);   /* a drip */
  float wick=sdCapsule(q,vec3(0.,.04,0.),vec3(.003,.047,.0),.0012);
  vec3 h=q-vec3(.06,.01,0.); float ring=max(sdTorus(h.xzy,.013,.003),-h.x-.004);
  return min(min(dish,cup),min(min(wax,wick),ring)); }
float match(vec3 p){ vec3 q=p-vec3(-.07,.0025,-.1); q.xz=rot(.4)*q.xz; float s=sdRBox(q,vec3(.035,.0022,.0022),.0008);
  float head=(length((q-vec3(.036,0.,0.))/vec3(.006,.0032,.0032))-1.)*.003; return min(s,head); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=p-HG;
  r=U(r,frame(q),3.);
  r=U(r,glassH(q),4.);
  r=U(r,sand(q),5.);
  r=U(r,candle(p),6.);
  r=U(r,match(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .4;
  if(id==4.) return .96;
  if(id==5.) return .55;
  if(id==6.){ vec3 q=p-CN; if(q.y>.039) return .1; if(q.y>.017) return .88; return .45; }
  if(id==7.){ vec3 q=p-vec3(-.07,.0025,-.1); q.xz=rot(.4)*q.xz; return q.x>.022?.12:.72; }
  return .7; }
