/* m16 "Adding and subtracting within 20" — two wooden ten-frames side by side, the first full
   and the second holding three round counters (10 and 3 more), with two towers of linking
   cubes, one of ten and one of three, standing behind. */
#define CAM_POS vec3(-0.3640,0.2297,-0.6838)
#define CAM_TGT vec3(-0.1218,-0.0287,0.0751)
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
#define CS .026
vec3 fQ(vec3 p,float k){ vec3 q=p-vec3(-.1+k*.3,0.,-.03+k*.02); q.xz=rot(.05)*q.xz; return q; }
float frameD(vec3 q){
  float b=sdRBox(q-vec3(0.,.008,0.),vec3(5.*CS+.008,.008,2.*CS+.008),.003);
  vec2 c=vec2(mod(q.x+5.*CS,2.*CS)-CS,mod(q.z+2.*CS,2.*CS)-CS);
  float well=max(length(c)-CS*.8,abs(q.y-.016)-.004);
  if(abs(q.x)<5.*CS&&abs(q.z)<2.*CS) b=max(b,-well);
  return b; }
float frames(vec3 p){ return min(frameD(fQ(p,0.)),frameD(fQ(p,1.))); }
float counters(vec3 p){ float d=1e5;
  for(int k=0;k<2;k++){ vec3 q=fQ(p,float(k)); int n=k==0?10:3;
    for(int i=0;i<10;i++){ if(i>=n) break; float x=(float(i-(i/5)*5)-2.)*2.*CS; float z=(float(i/5)-.5)*-2.*CS;
      d=min(d,sdCylY(q-vec3(x,.016,z),CS*.72,.004)-.002); } }
  return d; }
#define LC .018
float tower(vec3 p,vec3 b,int n,float ry){ vec3 q=p-b; q.xz=rot(ry)*q.xz;
  float y=clamp(floor(q.y/(2.*LC)),0.,float(n-1)); vec3 c=q-vec3(0.,(y+.5)*2.*LC,0.);
  float d=sdRBox(c,vec3(LC*.96),.002);
  d=min(d,sdCylY(c-vec3(0.,LC,0.),.006,.004));
  float bound=max(abs(q.x)-LC,max(abs(q.z)-LC,max(-q.y,q.y-float(n)*2.*LC-.01)));
  return max(d,bound-.0); }
vec3 lay(vec3 p,vec3 b,float ry){ vec3 q=p-b; q.xz=rot(ry)*q.xz; return vec3(q.y-LC,q.x,q.z)+b; }
float towers(vec3 p){ return min(tower(p,vec3(.1,0.,.16),10,.3),tower(p,vec3(.15,0.,.12),3,.1)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,frames(p),3.);
  r=U(r,counters(p),4.);
  r=U(r,tower(lay(p,vec3(-.12,0.,.14),.05),vec3(-.12,0.,.14),10,0.),5.);
  r=U(r,tower(p,vec3(.3,0.,.14),3,.2),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .6+.1*grain(p,40.);
  if(id==4.) return .35;
  if(id==5.) return .7;
  if(id==6.) return .45;
  return .7; }
