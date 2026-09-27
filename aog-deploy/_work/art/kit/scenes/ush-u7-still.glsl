/* U.S. History Unit 7 "America on the Move" (The Westward Movement) — pencil still life: a
   wooden model of a covered wagon with a canvas bonnet over its hoops and four spoked wheels,
   and a short piece of railroad track on wooden ties with a spike (gold, rails and cattle).
   No figures. */
#define CAM_POS vec3(-0.4453,0.4407,-0.9372)
#define CAM_TGT vec3(-0.2897,-0.0607,0.1076)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define WG vec3(-.02,0.,.1)
#define WR .45
float wheel(vec3 q,float R){ /* wheel in xy plane */
  float rim=max(abs(length(q.xy)-R)-.004,abs(q.z)-.005);
  float a=atan(q.y,q.x); float st=6.2832/12.; float k=floor(a/st+.5)*st; vec2 d2=rot(k)*q.xy;
  float sp=max(max(abs(d2.y)-.0022,abs(q.z)-.0025),max(-d2.x,d2.x-R));
  float hub=sdCylZ(q,.012,.012)-.002;
  return min(min(rim,sp),hub); }
float wagon(vec3 q){
  float bed=sdRBox(q-vec3(0,.075,0),vec3(.13,.022,.05),.003);
  bed=max(bed,-sdBox(q-vec3(0,.09,0),vec3(.124,.02,.044)));
  float d=bed;
  d=min(d,wheel(q-vec3(.085,.048,-.058),.048)); d=min(d,wheel(q-vec3(.085,.048,.058),.048));
  d=min(d,wheel(q-vec3(-.085,.058,-.058),.058)); d=min(d,wheel(q-vec3(-.085,.058,.058),.058));
  d=min(d,min(sdCylZ(q-vec3(.085,.048,0),.005,.06),sdCylZ(q-vec3(-.085,.058,0),.005,.06)));
  /* the canvas bonnet: a tunnel over the bed, puckered at the ends */
  vec3 c=q-vec3(0,.095,0); float R=.058; float pucker=.012*smoothstep(.1,.15,abs(c.x));
  float bon=max(abs(length(c.yz)-R+pucker)-.0022,max(-c.y,abs(c.x)-.15));
  d=min(d,bon);
  d=min(d,sdCapsule(q,vec3(.13,.06,0),vec3(.26,.03,0),.004));   /* tongue */
  return d; }
float track(vec3 q){ float d=1e5;
  for(int i=0;i<4;i++){ float x=float(i)*.05-.075; d=min(d,sdRBox(q-vec3(x,.007,0),vec3(.012,.007,.06),.002)); }
  for(int j=0;j<2;j++){ float z=j==0?-.035:.035; vec3 r=q-vec3(0,.014,z);
    float web=sdBox(r-vec3(0,.009,0),vec3(.11,.009,.0018)); float head=sdRBox(r-vec3(0,.019,0),vec3(.11,.0035,.0045),.001);
    float foot=sdBox(r-vec3(0,.0015,0),vec3(.11,.0015,.008)); d=min(d,min(web,min(head,foot))); }
  d=min(d,sdCylY(q-vec3(.1,.014,-.1)*vec3(1.,0.,1.)-vec3(0,.006,0),.003,.006)); 
  vec3 s=q-vec3(.03,.004,-.1); s.xy=rot(1.5708)*s.xy; d=min(d,min(sdCylY(s,.003,.04),sdRBox(s-vec3(0,.04,0),vec3(.006,.003,.004),.001)));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 w=L(p,WG,WR)/1.25;
  r=U(r,wagon(w)*1.25,3.);
  r=U(r,track(L(p,vec3(.02,0.,-.12),-.1)),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=L(p,WG,WR)/1.25; vec3 c=q-vec3(0,.095,0);
    if(c.y>0.&&abs(length(c.yz)-.058)<.01&&abs(c.x)<.15){ if(abs(fract(c.x/.05+.5)-.5)<.06) return .6; return .9; }
    return .45+.1*grain(q.zyx,40.); }
  if(id==4.){ vec3 q=L(p,vec3(.02,0.,-.12),-.1); if(q.y<.0141) return .5+.1*grain(q.zyx,20.); return .35; }
  return .7; }
