/* FCS Unit 17 "Food Science: What Happens When You Cook" — pencil still life: a round loaf of
   risen bread with slashes across its crust, a raw egg beside a cracked one in a small bowl,
   and a probe thermometer standing in a glass beaker. */
#define CAM_POS vec3(-0.3265,0.2207,-0.6190)
#define CAM_TGT vec3(-0.1355,-0.0159,0.0910)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define LF vec3(.03,0.,.07)
float loaf(vec3 p){ vec3 q=p-LF; q.xz=rot(-.3)*q.xz;
  float d=(length((q-vec3(0.,.02,0.))/vec3(.12,.075,.085))-1.)*.075; d=max(d,-q.y);
  for(int i=0;i<3;i++){ float x=-.05+float(i)*.05; float s=abs(q.x-x+q.z*.35)-.004; d=smax(d,-max(s,-(q.y-.075)),.006); }   /* slashes */
  return d+.0012*vn3(q*300.); }
#define BW vec3(-.17,0.,-.03)
float bowl(vec3 p){ vec3 q=p-BW-vec3(0.,.045,0.); float s=max(abs(length(q)-.05)-.003,q.y); return max(s,-q.y-.04); }
float yolkD(vec3 p){ vec3 q=p-BW-vec3(0.,.012,0.); float white=max(length(q.xz)-.034,q.y-.004); float y=length(q-vec3(0.,.005,0.))-.013; return min(white,y); }
float egg(vec3 p){ vec3 q=p-vec3(-.1,.022,-.1); q.xz=rot(.6)*q.xz; q.xy=rot(1.45)*q.xy; return (length(q/vec3(.022,.03,.022))-1.)*.022; }
#define BK vec3(.2,0.,-.04)
float beaker(vec3 p){ vec3 q=p-BK; float wall=max(abs(length(q.xz)-.034)-.0018,abs(q.y-.05)-.05);
  float bot=sdCylY(q-vec3(0.,.003,0.),.034,.003); float lip=sdTorus(q-vec3(0.,.1,0.),.035,.0025);
  vec3 s=q-vec3(-.03,.1,-.02); float spout=max(sdTorus(s.xzy,.006,.002),-s.x); return min(min(wall,bot),min(lip,spout)); }
float probe(vec3 p){ vec3 q=p-BK-vec3(.006,.0,0.); vec3 a=normalize(vec3(.18,1.,-.05)); vec3 x=a, z=normalize(cross(x,vec3(0.,0.,1.))), y=cross(z,x);
  vec3 l=vec3(dot(q,x),dot(q,y),dot(q,z)); float stem=sdCapsule(l,vec3(.01,0.,0.),vec3(.14,0.,0.),.0022);
  float dial=sdCylX(l-vec3(.15,0.,0.),.02,.006)-.002; return min(stem,dial); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,loaf(p),3.);
  r=U(r,bowl(p),4.);
  r=U(r,yolkD(p),5.);
  r=U(r,egg(p),6.);
  r=U(r,beaker(p),7.);
  r=U(r,probe(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-LF; return q.y>.07?.4:.5; }
  if(id==4.) return .8;
  if(id==5.){ vec3 q=p-BW-vec3(0.,.012,0.); return length(q.xz)<.014?.45:.95; }
  if(id==6.) return .85;
  if(id==7.){ vec3 q=p-BK; if(q.z<-.02){ for(int i=1;i<5;i++){ if(abs(q.y-float(i)*.02)<.0012&&abs(q.x)<(i%2==0?.012:.007)) return .2; } } return .95; }
  if(id==8.){ vec3 q=p-BK; return q.y>.13?.4:.55; }
  return .7; }
