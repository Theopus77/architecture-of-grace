/* Room fc3 "Measuring and Reading a Recipe" — pencil still life: a glass measuring jug with
   a spout, a handle and marked lines up its side; three measuring cups of different sizes
   lined up in front; and a set of measuring spoons fanned out on their ring. */
#define CAM_POS vec3(-0.2924,0.3285,-0.7321)
#define CAM_TGT vec3(-0.1703,-0.0648,0.0880)
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
#define JC vec3(.0,0.,.08)
vec3 jQ(vec3 p){ return place(p,JC,-.5); }
float jugD(vec3 q){ float H=.13; float R=.052+.006*q.y/H;
  float r=length(q.xz); float a=atan(q.z,q.x);
  float spout=.012*smoothstep(.1,.13,q.y)*pow(max(-cos(a),0.),8.);
  float outer=max(r-R-spout,abs(q.y-H*.5)-H*.5)-.0015;
  float inner=max(r-R-spout+.004,abs(q.y-H*.5-.004)-H*.5);
  float d=max(outer,-inner);
  vec3 h=q-vec3(R+.012,.075,0.); float hd=length(vec2(length(h.xy*vec2(1.,.75))-.03,h.z))-.007;
  hd=max(hd,R-.002-r);
  return min(d,hd); }
float scoop(vec3 q,float R){ float s=abs(length(q-vec3(0.,R,0.))-R)-.0015; s=max(s,q.y-R); s=max(s,-q.y+.001);
  float foot=max(length(q.xz)-R*.5,abs(q.y-.0015)-.0015);
  float h=sdRBox(q-vec3(R+.045,R-.002,0.),vec3(.045,.0015,.009),.001);
  return min(min(s,foot),h); }
float cupsD(vec3 p){ return min(min(scoop(place(p,vec3(-.21,0.,-.03),.4),.042),scoop(place(p,vec3(-.15,0.,-.12),.2),.033)),scoop(place(p,vec3(-.06,0.,-.17),.1),.025)); }
float spoonsD(vec3 p){ vec3 c=vec3(.11,.0035,-.1); float d=sdTorus((p-c).xyz,.014,.002);
  for(int i=0;i<4;i++){ vec3 q=p-c; q.xz=rot(-.9+.45*float(i))*q.xz; q.x-=.01; d=min(d,spoonD((q-vec3(0.,-.0035,0.))/1.4,.09-.012*float(i))*1.4); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,jugD(jQ(p)),3.);
  r=U(r,cupsD(p),4.);
  r=U(r,spoonsD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=jQ(p); float a=atan(q.z,q.x);
    if(abs(a+1.9)<.35&&q.y>.02&&q.y<.12){ float f=fract(q.y/.02); if(f<.12) return .3; if(fract(q.y/.01)<.12&&abs(a+1.9)<.18) return .5; }
    return .93; }
  if(id==4.) return .78;
  if(id==5.) return .75;
  return .7; }
