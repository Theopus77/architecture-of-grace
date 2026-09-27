/* Room m51 "Financial Math" — pencil still life: a china piggy bank with a coin going into
   its slot, three coin stacks growing taller from left to right (interest adding up period
   by period), and a small savings passbook lying open (hint-lines only). */
#define CAM_POS vec3(-0.3702,0.3907,-0.8251)
#define CAM_TGT vec3(-0.2319,-0.0543,0.1021)
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
vec3 pgQ(vec3 p){ return place(p,vec3(-.02,0.,.07),-.45); }   /* snout on local -x */
float pigD(vec3 q){ vec3 b=q-vec3(0.,.088,0.);
  float body=sdEll(b,vec3(.095,.07,.068));
  float snout=sdCylX(b-vec3(-.095,-.005,0.),.026,.014)-.004;
  snout=max(snout,-sdCylX(b-vec3(-.114,-.005,-.008),.005,.004)); snout=max(snout,-sdCylX(b-vec3(-.114,-.005,.008),.005,.004));
  float d=smin(body,snout,.012);
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 e=b-vec3(-.05,.06,s*.035); e.xz=rot(s*.3)*e.xz;
    d=smin(d,sdEll(e,vec3(.008,.02,.016))+.0,.006); }
  for(int i=0;i<4;i++){ vec2 s=vec2(i<2?-1.:1.,mod(float(i),2.)<1.?-1.:1.);
    d=smin(d,sdCylY(q-vec3(s.x*.052,.015,s.y*.034),.014,.015)-.002,.01); }
  d=max(d,-sdBox(b-vec3(.0,.07,0.),vec3(.003,.012,.022)));
  vec3 t=b-vec3(.1,.01,0.); float tail=max(sdTorus(t.xzy*vec3(1.,1.,1.),.011,.0025),-t.y-.004);
  tail=sdTorus(vec3(t.x,t.z,t.y),.009,.0025);
  return min(d,tail); }
float slotCoin(vec3 q){ vec3 b=q-vec3(0.,.088+.082,0.); return sdCylX(b,.02,.0018)-.0006; }
float stacksD(vec3 p){ return min(min(coinStack(p-vec3(.1,0.,-.1),.022,.0045,3),coinStack(p-vec3(.16,0.,-.07),.022,.0045,6)),coinStack(p-vec3(.22,0.,-.04),.022,.0045,10)); }
vec3 pbQ(vec3 p){ vec3 q=p-vec3(-.17,.0,-.1); q.xz=rot(.35)*q.xz; return q; }
float bookD2(vec3 q){ float x=abs(q.x); float lift=.004*sin(clamp(x/.05,0.,1.)*1.8);
  float pages=sdBox(vec3(x-.027,q.y-.003-lift*.5,q.z),vec3(.026,.002+lift*.5,.038))-.0008;
  float cov=sdRBox(vec3(x-.028,q.y+.0005,q.z),vec3(.029,.0015,.04),.0008);
  return min(pages,cov); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=pgQ(p);
  r=U(r,pigD(q),3.);
  r=U(r,slotCoin(q),4.);
  r=U(r,stacksD(p),5.);
  r=U(r,bookD2(pbQ(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=pgQ(p); vec3 b=q-vec3(0.,.088,0.); if(b.x<-.1&&abs(b.y+.005)<.022) return .7; return .86; }
  if(id==4.) return .55;
  if(id==5.) return .62;
  if(id==6.){ vec3 q=pbQ(p); if(q.y<.001) return .4; float x=abs(q.x);
    if(x>.008&&x<.048&&abs(q.z)<.03&&fract((q.z+.05)/.008)<.18) return .6; return .95; }
  return .7; }
