/* sp19-who-where-when "Who, Where, When, Why" — a Spanish question stands between its two marks:
   a wooden opening mark and a closing question mark standing on the table, a twin-bell alarm
   clock (when) and a crusty loaf of bread on a board (what: Ana come pan). No words. */
#define CAM_POS vec3(-0.4753,0.4535,-0.9966)
#define CAM_TGT vec3(-0.3110,-0.0749,0.1040)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
float extrude(float d2,float z,float h,float r){ vec2 w=vec2(d2+r,abs(z)-h+r); return min(max(w.x,w.y),0.)+length(max(w,0.))-r; }
float qmark(vec2 p){ float d=arc(p,vec2(0.,.2),.19,-PI*.5,PI*1.05); d=min(d,seg(p,vec2(0.,.01),vec2(0.,-.14)));
  return min(d,length(p-vec2(0.,-.36))-.02); }
#define QS .21
#define QW .019
/* the closing mark ? and the opening mark (the same shape turned upside down) */
#define Q1 vec3(-.02,0.,.1)
#define Q2 vec3(.13,0.,.1)
vec3 q1Q(vec3 p){ return place(p,Q1,-.12); }
vec3 q2Q(vec3 p){ return place(p,Q2,-.2); }
float markD(vec3 q,float flip){
  vec2 u=vec2(q.x,q.y-.098)*flip; if(length(q-vec3(0.,.1,0.))>.16) return length(q-vec3(0.,.1,0.))-.14;
  float d=qmark(u/QS)*QS-QW;
  return extrude(d,q.z,.014,.004); }
/* ---- twin-bell alarm clock, face toward the viewer ---- */
#define CK vec3(.27,0.,-.02)
vec3 ckQ(vec3 p){ return place(p,CK,-.35); }
float clockD(vec3 q){
  vec3 c=q-vec3(0.,.07,0.);
  float body=sdCylZ(c,.052,.016)-.004;
  float bez=sdTorus(c.xzy+vec3(0.,.02,0.),.05,.0035);
  vec3 b=c; b.x=abs(b.x); vec3 bb=b-vec3(.033,.052,.0); bb.xy=rot(-.55)*bb.xy;
  float bell=max(length(bb)-.022,-bb.y+.002); bell=max(bell,-(length(bb)-.019));
  float stem=sdCapsule(b,vec3(.022,.045,0.),vec3(.032,.056,0.),.0025);
  float ham=sdCapsule(c,vec3(0.,.05,.0),vec3(0.,.075,0.),.0025); ham=min(ham,length(c-vec3(0.,.078,0.))-.0055);
  vec3 l=b-vec3(.034,-.052,0.); float leg=sdCapsule(l,vec3(-.008,.012,0.),vec3(.006,-.012,0.),.004);
  leg=min(leg,length(l-vec3(.007,-.014,0.))-.006);
  float key=sdCylZ(c-vec3(0.,0.,.024),.005,.006);
  return min(min(min(body,bez),min(bell,stem)),min(min(ham,leg),key)); }
/* ---- a sliced sandwich loaf on a bread board, one slice lying in front of the cut end ---- */
#define BR vec3(-.2,0.,-.07)
vec3 brQ(vec3 p){ return place(p,BR,.3); }
float boardD(vec3 q){ float b=sdRBox(q-vec3(0.,.008,0.),vec3(.14,.008,.115),.006);
  float h=sdCylY(q-vec3(.165,.008,0.),.028,.008)-.002; h=max(h,-sdCylY(q-vec3(.17,.008,0.),.008,.02));
  return min(b,h); }
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
float breadProf(vec2 u){ return smin(sdBox2(u-vec2(0.,.034),vec2(.044,.034))-.004,length(u-vec2(0.,.066))-.05,.012); }
vec3 gQ(vec3 q){ vec3 g=q; g.xz=rot(-1.3)*g.xz; return g; }
vec3 loQ(vec3 q){ return gQ(q)-vec3(-.05,.016,0.); }
float loafD(vec3 q){ vec3 l=loQ(q); return extrude(breadProf(l.zy),l.x,.075,.008); }
vec3 slQ(vec3 q){ vec3 s=gQ(q)-vec3(.09,.022,-.01); s.xz=rot(-.35)*s.xz; return s; }
float sliceD(vec3 q){ vec3 s=slQ(q); return extrude(breadProf(vec2(s.z,-s.x+.058)),s.y,.0055,.002); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.45-p.z,2.);
  r=U(r,markD(q1Q(p),-1.),3.);
  r=U(r,markD(q2Q(p),1.),4.);
  vec3 c=ckQ(p);
  r=U(r,clockD(c),5.);
  vec3 b=brQ(p);
  r=U(r,boardD(b),6.);
  r=U(r,loafD(b),7.);
  r=U(r,sliceD(b),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return .55+.12*grain(q1Q(p).yxz,70.);
  if(id==4.) return .55+.12*grain(q2Q(p).yxz,70.);
  if(id==5.){ vec3 c=ckQ(p)-vec3(0.,.07,0.);
    if(c.z<-.018&&length(c.xy)<.046){ float r=length(c.xy); float a=atan(c.x,c.y);
      if(r>.036&&r<.043&&abs(fract(a/.5236+.5)-.5)<.07) return .15;              /* hour marks */
      if(sdSeg2(c.xy,vec2(0.),.024*vec2(sin(1.05),cos(1.05)))<.0022) return .12;  /* hour hand at ten past two */
      if(sdSeg2(c.xy,vec2(0.),.034*vec2(sin(.2),cos(.2)))<.0016) return .12;
      if(r<.004) return .15;
      return .92; }
    return .35; }
  if(id==6.) return .6+.12*grain(brQ(p),60.);
  if(id==7.){ vec3 l=loQ(brQ(p));
    if(l.x>.07){ float c=breadProf(l.zy); return c>-.005?.3:.9-.25*step(.78,vn(l.zy*900.)); }   /* crumb at the cut end, crust rim */
    return (l.y>.07?.42:.5)+.1*fbm(l.xz*260.); }
  if(id==8.){ vec3 s=slQ(brQ(p)); float c=breadProf(vec2(s.z,-s.x+.058)); if(abs(s.y)<.004||c>-.005) return .35;
    return .9-.25*step(.78,vn(s.xz*900.)); }
  return .7; }
