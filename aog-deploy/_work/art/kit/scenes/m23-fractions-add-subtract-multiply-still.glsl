/* Room m23 "Fractions: Add, Subtract, Multiply" — pencil still life: a wooden fraction tray
   (one whole, then rows of halves, thirds, quarters and sixths, each row the same length),
   with a bar of chocolate scored three by four lying in front and one square broken off. */
#define CAM_POS vec3(-0.4067,0.5656,-0.8490)
#define CAM_TGT vec3(-0.1816,-0.0535,0.1079)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define TL .16
#define RW .019
/* the tray: lying on the table, turned a little */
vec3 trayQ(vec3 p){ vec3 q=p-vec3(0.,.1,.08); q.xz=rot(-.14)*q.xz; q.yz=rot(-1.)*q.yz; return q; }
/* a little easel behind it: a ledge in front and two back legs */
float easelD(vec3 p){ vec3 q=p; q.xz=rot(-.14)*q.xz;
  float d=sdRBox(q-vec3(0.,.012,.012),vec3(TL+.02,.012,.012),.003);
  d=min(d,sdCapsule(vec3(abs(q.x),q.y,q.z),vec3(.11,0.,.27),vec3(.11,.17,.15),.006));
  return d; }
float trayD(vec3 q){
  float o=sdRBox(q-vec3(0.,.012,0.),vec3(TL+.014,.012,5.*RW+.014),.004);
  float i=sdBox(q-vec3(0.,.02,0.),vec3(TL+.001,.012,5.*RW+.001));
  return max(o,-i); }
/* row r (0 = back, the whole) holds n equal tiles */
float rowN(float r){ return r<.5?1.:r<1.5?2.:r<2.5?3.:r<3.5?4.:6.; }
vec2 tilesD(vec3 q){
  float z=q.z+5.*RW; float r=clamp(floor(z/(2.*RW)),0.,4.);
  float rz=(4.-r); /* back row is the whole: flip so r=0 sits at +z */
  float cz=-5.*RW+(r+.5)*2.*RW;
  float n=rowN(4.-r); float w=2.*TL/n;
  float k=clamp(floor((q.x+TL)/w),0.,n-1.); float cx=-TL+(k+.5)*w;
  float d=sdRBox(q-vec3(cx,.026,cz),vec3(w*.5-.0022,.014,RW-.0016),.0028);
  return vec2(d,mod(4.-r,2.)); }
/* the chocolate bar: 3 by 4 squares, one square broken off the near corner */
vec3 chocQ(vec3 p){ vec3 q=p-vec3(.25,0.,-.11); q.xz=rot(-.3)*q.xz; return q; }
#define CS .036
float sq(vec3 q,vec2 c){ return sdRBox(q-vec3(c.x,.0075,c.y),vec3(CS*.5-.0012,.0045,CS*.5-.0012),.0028); }
float chocD(vec3 q){
  float base=sdRBox(q-vec3(0.,.0025,0.),vec3(2.*CS,.0025,1.5*CS),.001);
  base=max(base,-sdBox(q-vec3(1.5*CS,.0025,-CS),vec3(CS*.5+.0002,.01,CS*.5+.0002)));   /* the gap */
  vec2 g=vec2(clamp(floor(q.x/CS+2.),0.,3.),clamp(floor(q.z/CS+1.5),0.,2.));
  vec2 c=vec2((g.x-1.5)*CS,(g.y-1.)*CS);
  float s=(g.x>2.5&&g.y<.5)?1e3:sq(q,c);
  return min(base,s); }
float pieceD(vec3 p){ vec3 q=p-vec3(.06,0.,-.15); q.xz=rot(.5)*q.xz;
  return min(sdRBox(q-vec3(0.,.0025,0.),vec3(CS*.5,.0025,CS*.5),.001),sq(q,vec2(0.))); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,3.-p.z,2.);
  vec3 t=trayQ(p);
  r=U(r,trayD(t),3.); r=U(r,easelD(p),8.);
  if(abs(t.x)<TL+.02&&abs(t.z)<5.*RW+.02){ vec2 tl=tilesD(t); r=U(r,tl.x,4.+tl.y); }
  else r=U(r,sdBox(t-vec3(0.,.026,0.),vec3(TL,.014,5.*RW)),4.);
  r=U(r,chocD(chocQ(p)),6.);
  r=U(r,pieceD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return .5+.12*grain(trayQ(p)*vec3(1.,1.,1.),30.);
  if(id==4.) return .86;
  if(id==5.) return .5;
  if(id==6.||id==7.) return .28;
  if(id==8.) return .55;
  return .7; }
