/* Room "Who, Where, When, Why" — pencil still life: a wooden block carved with a question mark
   (asking), an open pocket watch with its chain (when), and a round brass compass (where). */
#define CAM_POS vec3(-0.3189,0.2281,-0.5271)
#define CAM_TGT vec3(-0.1342,-0.0228,0.0406)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define BH .055
#define BC vec3(-.05,BH,.06)
#define WT vec3(.1,0.,-.02)
#define CP vec3(.05,0.,-.14)
float carve2(float d3,vec2 uv,int g,float sz,float w,float z,float dep){ float gd=glyph2(uv/sz,g)*sz-w; return max(d3,-max(gd,abs(z)-dep)); }
float blockD(vec3 p){ vec3 q=p-BC; q.xz=rot(-.4)*q.xz; float d=sdRBox(q,vec3(BH),.007);
  d=carve2(d,q.xy,63,.085,.0068,q.z+BH,.0045); d=carve2(d,vec2(-q.z,q.y),63,.08,.0064,q.x-BH,.0045); return d; }
float blockInk(vec3 p){ vec3 q=p-BC; q.xz=rot(-.4)*q.xz;
  if(q.z<-BH+.009&&glyph2(q.xy/.085,63)*.085<.009) return .15; if(q.x>BH-.009&&glyph2(vec2(-q.z,q.y)/.08,63)*.08<.0085) return .15;
  vec2 f=q.z<-BH+.003?q.xy:q.x>BH-.003?vec2(q.z,q.y):q.xz; if(abs(max(abs(f.x),abs(f.y))-BH*.86)<.0022) return .45; return .78; }
vec3 wtQ(vec3 p){ return place(p,WT,.4); }
float watchD(vec3 p){ vec3 q=wtQ(p);
  float cs=sdCylY(q-vec3(0.,.008,0.),.04,.005)-.004;
  float glass=sdEll(q-vec3(0.,.013,0.),vec3(.036,.004,.036));
  float crown=sdCylX(q-vec3(-.05,.009,0.),.005,.006)-.001; float bow=sdTorus((q-vec3(-.062,.009,0.)).yxz.zxy,.009,.0018);
  bow=length(vec2(length(q.xz-vec2(-.064,0.))-.009,q.y-.009))-.0018;
  /* the open lid standing up behind */
  vec3 l=q-vec3(.0,.012,.042); l.yz=rot(-1.2)*l.yz; float lid=sdCylY(l-vec3(0.,0.,.04),.04,.002)-.002;
  /* chain: a row of small links trailing off */
  float ch=1e5; for(int i=0;i<10;i++){ float t=float(i); vec3 c=vec3(-.075-t*.011,.0022,.012*sin(t*.5)+t*.004); ch=min(ch,sdTorus((q-c).xzy*vec3(1.,1.,1.),.0045,.0013)); }
  return min(min(min(cs,glass),min(crown,bow)),min(lid,ch)); }
vec3 cpQ(vec3 p){ return place(p,CP,.1); }
float compassD(vec3 p){ vec3 q=cpQ(p);
  float cs=sdCylY(q-vec3(0.,.009,0.),.036,.008)-.002; cs=max(cs,-sdCylY(q-vec3(0.,.018,0.),.031,.006));
  float needle=max(abs(q.x)*.25+abs(q.z)-.006,abs(q.y-.013)-.0012); needle=max(needle,abs(q.x)-.027);
  float pin=sdCylY(q-vec3(0.,.014,0.),.0025,.002);
  float ring=sdTorus((q-vec3(0.,.012,-.044)).xzy.yxz,.007,.0018);
  ring=length(vec2(length((q-vec3(0.,.012,-.043)).zy)-.007,q.x))-.0018;
  return min(min(cs,needle),min(pin,ring)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,blockD(p),3.);
  r=U(r,watchD(p),4.);
  r=U(r,compassD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return blockInk(p);
  if(id==4.){ vec3 q=wtQ(p); if(q.y>.012&&length(q.xz)<.034){ float a=atan(q.z,q.x); float r=length(q.xz);
      if(r>.027&&fract(a*12./6.2832)<.06) return .2; if(sdSeg2(q.xz,vec2(0.),vec2(.016,.008))<.0012||sdSeg2(q.xz,vec2(0.),vec2(-.004,.022))<.0012) return .2; return .92; }
    return .5; }
  if(id==5.){ vec3 q=cpQ(p); if(q.y>.012&&length(q.xz)<.031){ if(abs(q.x)*.25+abs(q.z)<.0075&&abs(q.x)<.028) return q.x>0.?.2:.6; float a=atan(q.z,q.x); if(length(q.xz)>.024&&fract(a*8./6.2832)<.05) return .3; return .92; } return .5; }
  return .7; }
