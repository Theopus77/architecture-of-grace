/* Hindu Texts Unit 2 "Krishna, Ganesha and the Stories Families Tell" — pencil still life:
   a bowl heaped with pleated modak sweets, a bamboo flute lying in front with a peacock
   feather across it. Objects only. */
#define CAM_POS vec3(-0.2333,0.2098,-0.6246)
#define CAM_TGT vec3(-0.1538,-0.0216,0.0365)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define BC vec3(.1,0.,.08)
/* one modak: a round base drawn up to a point, with pleats */
float modak(vec3 q){
  float base=sdEll(q-vec3(0.,.018,0.),vec3(.026,.02,.026));
  float t=clamp((q.y-.018)/.034,0.,1.); float a=atan(q.z,q.x);
  float r=.021*(1.-t)*(1.-.3*t)*(1.-.12*abs(sin(a*5.)));
  float top=max((length(q.xz)-r)*.8,max(.018-q.y,q.y-.052));
  return smin(base,top,.008)*.9; }
float modaks(vec3 p){ vec3 q=p-BC; float d=1e5;
  for(int i=0;i<6;i++){ float a=float(i)*1.047+.3; vec3 c=vec3(cos(a)*.04,.036,sin(a)*.04);
    vec3 m=q-c; m.xy=rot(-cos(a)*.3)*m.xy; m.zy=rot(-sin(a)*.3)*m.zy; d=min(d,modak(m)); }
  d=min(d,modak(q-vec3(0.,.058,0.)));
  return d; }
vec3 fluteQ(vec3 p){ vec3 q=p-vec3(-.02,.012,-.1); q.xz=rot(-.12)*q.xz; return q; }
float flute(vec3 p){ vec3 q=fluteQ(p);
  float d=max(length(q.yz)-.011,abs(q.x)-.2);
  d=max(d,-(length(vec2(q.yz))-.007));
  for(int i=0;i<6;i++){ float x=.02+float(i)*.024; d=max(d,-(length(vec2(q.x-x,q.z+.0))-.0035+q.y*0.)*1.+min(0.,-q.y+.004)*0.-(q.y<.004?1.:0.)); }
  d=max(d,-max(length(vec2(q.x+.13,q.z))-.004,.004-q.y));
  float nodes=1e5; nodes=min(nodes,sdTorus((q-vec3(-.07,0.,0.)).yxz,.0115,.0018)); nodes=min(nodes,sdTorus((q-vec3(-.17,0.,0.)).yxz,.0115,.0018));
  float bands=min(sdTorus((q-vec3(.17,0.,0.)).yxz,.0115,.002),sdTorus((q-vec3(.185,0.,0.)).yxz,.0115,.002));
  return min(d,min(nodes,bands)); }
vec3 featherQ(vec3 p){ vec3 q=p-vec3(-.06,.024,-.07); q.xz=rot(-.55)*q.xz; q.xy=rot(.04)*q.xy; return q; }
float feather(vec3 p){ vec3 q=featherQ(p);
  float quill=max(length(q.yz)-.0022,abs(q.x)-.14);
  vec3 e=q-vec3(.14,0.,0.); e.yz=rot(-.7)*e.yz; float t=clamp((e.x+.1)/.16,0.,1.);
  float w=.026*pow(sin(3.1416*t),.8);
  float vane=max(abs(e.y+.002*sin(e.z*90.))-.0012,max(abs(e.z)-w,abs(e.x+.02)-.08));
  return min(quill,vane); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.35-p.z,2.);
  r=U(r,bowlD(p-BC,.085,.045),3.);
  r=U(r,modaks(p),4.);
  r=U(r,flute(p),5.);
  r=U(r,feather(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BC; if(abs(q.y-.03)<.004) return .3; return .45; }
  if(id==4.) return .86;
  if(id==5.){ vec3 q=fluteQ(p); if(abs(q.x-.1)<.003) return .3; return .66; }
  if(id==6.){ vec3 e=featherQ(p)-vec3(.14,0.,0.); e.yz=rot(-.7)*e.yz; vec2 u=vec2((e.x-.02)/1.4,e.z);
    float r=length(u); if(r<.007) return .12; if(r<.012) return .5; if(r<.017) return .25;
    if(abs(e.x)<.1&&abs(fract(atan(e.z,e.x+.12)*18.)-.5)<.12) return .55; return .75; }
  if(id==7.) return .8;
  return .7; }
