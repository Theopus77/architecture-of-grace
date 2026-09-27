/* Practice room "Maps and Regions of the United States" — pencil still life: a wooden jigsaw
   map of the lower 48 states cut into five regions (West, Southwest, Midwest, Southeast,
   Northeast) in its tray, the Northeast piece lifted out and lying beside it, and a rolled
   wall map tied with string behind. */
#define CAM_POS vec3(-0.4106,0.3646,-0.4540)
#define CAM_TGT vec3(-0.1787,-0.0449,0.1255)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
const vec2 US[39]=vec2[39](vec2(-0.1492,0.0741),vec2(-0.1404,0.0585),vec2(-0.1466,0.0325),vec2(-0.1274,-0.0163),vec2(-0.1092,-0.0292),vec2(-0.0972,-0.0279),vec2(-0.0780,-0.0370),vec2(-0.0634,-0.0338),vec2(-0.0546,-0.0338),vec2(-0.0364,-0.0520),vec2(-0.0182,-0.0650),vec2(-0.0062,-0.0722),vec2(-0.0073,-0.0598),vec2(0.0104,-0.0481),vec2(0.0333,-0.0500),vec2(0.0416,-0.0410),vec2(0.0572,-0.0474),vec2(0.0676,-0.0520),vec2(0.0764,-0.0767),vec2(0.0832,-0.0663),vec2(0.0770,-0.0422),vec2(0.0936,-0.0202),vec2(0.1061,-0.0117),vec2(0.1040,0.0000),vec2(0.1144,0.0227),vec2(0.1352,0.0292),vec2(0.1316,0.0390),vec2(0.1508,0.0507),vec2(0.1456,0.0669),vec2(0.1378,0.0676),vec2(0.1274,0.0520),vec2(0.1092,0.0520),vec2(0.1014,0.0429),vec2(0.0884,0.0377),vec2(0.0702,0.0306),vec2(0.0650,0.0585),vec2(0.0364,0.0715),vec2(0.0052,0.0780),vec2(-0.1404,0.0780));
float polyUS(vec2 p){ float d=dot(p-US[0],p-US[0]); float s=1.;
  for(int i=0,j=38;i<39;j=i,i++){ vec2 e=US[j]-US[i],w=p-US[i]; vec2 b=w-e*clamp(dot(w,e)/dot(e,e),0.,1.); d=min(d,dot(b,b));
    bvec3 c=bvec3(p.y>=US[i].y,p.y<US[j].y,e.x*w.y>e.y*w.x); if(all(c)||all(not(c))) s*=-1.; }
  return s*sqrt(d); }
/* region k as a box in map space: 0 W, 1 SW, 2 MW, 3 SE, 4 NE */
float regBox(vec2 u,int k){ float X0=-.078,X1=.0104,X2=.0728;
  vec2 lo=k==0?vec2(-1.,-1.):k==1?vec2(X0,-1.):k==2?vec2(X0,0.):k==3?vec2(X1,-1.):vec2(X2,0.);
  vec2 hi=k==0?vec2(X0,1.):k==1?vec2(X1,0.):k==2?vec2(X2,1.):k==3?vec2(1.,0.):vec2(1.,1.);
  return sdBox2(u-(lo+hi)*.5,(hi-lo)*.5); }
float pieceD2(vec2 u,int k){ return max(polyUS(u),regBox(u,k)+.0012); }
#define TH .006
vec3 trQ(vec3 p){ vec3 q=p-vec3(-.02,0.,.08); q.xz=rot(.08)*q.xz; return q; }
float trayD(vec3 q,float P){ float d=sdRBox(q-vec3(0.,.006,0.),vec3(.172,.006,.1),.004);
  float hole=max(P-.0008,abs(q.y-.012)-.004);
  return max(d,-hole); }
float piecesD(vec3 q,float P,out float k){ float d=1e3; k=0.;
  for(int i=0;i<4;i++){ float e=max(max(P,regBox(q.xz,i)+.0012),abs(q.y-.0115)-.0035)-.0006; if(e<d){ d=e; k=float(i);} }
  return d; }
/* the Northeast piece, out of the tray and lying on the table in front, turned a little */
vec3 neQ(vec3 p){ vec3 q=p-vec3(.16,0.,-.06); q.xz=rot(-.35)*q.xz; q+=vec3(.11,0.,.035); return q; }
float neD(vec3 p){ vec3 q=neQ(p); float bb=sdBox(q-vec3(.11,.004,.03),vec3(.05,.01,.06)); if(bb>.01) return bb; return max(pieceD2(q.xz,4),abs(q.y-.0035)-.0035)-.0006; }
/* rolled wall map with string */
vec3 rlQ(vec3 p){ vec3 q=p-vec3(.0,.025,.235); q.xz=rot(-.1)*q.xz; return q; }
float rollD(vec3 q){ float d=sdCylX(q,.024,.2)-.001; d=max(d,-sdCylX(q,.019,.22));
  return d; }
float stringD(vec3 q){ float d=1e3; for(int i=0;i<2;i++){ float x=i==0?-.1:.1; d=min(d,max(abs(length(q.yz)-.0255)-.0015,abs(q.x-x)-.0015)); } return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 t=trQ(p);
  float bb=sdBox(t-vec3(0.,.01,0.),vec3(.18,.02,.11));
  if(bb<.01){ float P=polyUS(t.xz); r=U(r,trayD(t,P),3.); float k; float pd=piecesD(t,P,k); r=U(r,pd,4.+k); } else r=U(r,bb,3.);
  r=U(r,neD(p),8.);
  vec3 l=rlQ(p); r=U(r,rollD(l),9.); r=U(r,stringD(l),10.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=trQ(p); if(q.y<.0125&&polyUS(q.xz)<.001) return .3; return .6+.06*grain(q,60.); }  /* the empty Northeast hole reads dark */
  if(id==4.) return .85;   /* West */
  if(id==5.) return .45;   /* Southwest */
  if(id==6.) return .7;    /* Midwest */
  if(id==7.) return .3;    /* Southeast */
  if(id==8.) return .55;   /* Northeast */
  if(id==9.){ vec3 q=rlQ(p); if(abs(q.x)>.195) return .8; return .88; }
  if(id==10.) return .3;
  return .7; }
