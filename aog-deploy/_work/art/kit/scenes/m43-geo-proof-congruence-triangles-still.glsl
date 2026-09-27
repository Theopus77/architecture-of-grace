/* Room m43 "Geometry: Proof, Congruence and Triangles" — pencil still life: a wooden model
   truss bridge built from a row of matching triangles, resting on two blocks; a drawing compass
   standing open beside it, and in front a triangle of three sticks pinned at the corners. */
#define CAM_POS vec3(-0.3896,0.2428,-0.8457)
#define CAM_TGT vec3(-0.1741,-0.0022,0.0849)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define BL .2
#define BW .045
#define TH .1
#define BY .04
float beam(vec3 q,vec3 a,vec3 b,float r){ vec3 ab=b-a; float L=length(ab); vec3 c=q-(a+b)*.5;
  vec3 x=ab/L, y=normalize(cross(x,vec3(0.,0.,1.))), z=cross(x,y);
  if(abs(x.z)>.9){ y=vec3(0.,1.,0.); z=normalize(cross(x,y)); y=cross(z,x); }
  return sdRBox(vec3(dot(c,x),dot(c,y),dot(c,z)),vec3(L*.5+r*.6,r,r),r*.35); }
vec3 brQ(vec3 p){ return place(p,vec3(0.,0.,.08),.22); }
float trussSide(vec3 q,float z){ float d=1e5; float s=2.*BL/4.;
  d=min(d,beam(q,vec3(-BL,BY,z),vec3(BL,BY,z),.0055));                          /* bottom chord */
  d=min(d,beam(q,vec3(-BL+s*.5,BY+TH,z),vec3(BL-s*.5,BY+TH,z),.0055));          /* top chord */
  for(int k=0;k<4;k++){ float x0=-BL+float(k)*s;
    d=min(d,beam(q,vec3(x0,BY,z),vec3(x0+s*.5,BY+TH,z),.0045));
    d=min(d,beam(q,vec3(x0+s*.5,BY+TH,z),vec3(x0+s,BY,z),.0045)); }
  return d; }
float bridgeD(vec3 q){
  float d=min(trussSide(q,-BW),trussSide(q,BW));
  float s=2.*BL/4.;
  for(int k=0;k<3;k++){ float x=-BL+s*.5+float(k)*s+s*.5*0.; d=min(d,beam(q,vec3(-BL+s*(float(k)+1.),BY+TH,-BW),vec3(-BL+s*(float(k)+1.),BY+TH,BW),.004)); }
  d=min(d,beam(q,vec3(-BL+s*.5,BY+TH,-BW),vec3(-BL+s*.5,BY+TH,BW),.004));
  d=min(d,beam(q,vec3(BL-s*.5,BY+TH,-BW),vec3(BL-s*.5,BY+TH,BW),.004));
  d=min(d,sdRBox(q-vec3(0.,BY+.001,0.),vec3(BL,.003,BW-.003),.001));            /* deck */
  return d; }
float piersD(vec3 q){ return min(sdRBox(q-vec3(-BL+.02,BY*.5-.002,0.),vec3(.03,BY*.5-.002,BW+.02),.003),
                                 sdRBox(q-vec3(BL-.02,BY*.5-.002,0.),vec3(.03,BY*.5-.002,BW+.02),.003)); }
/* a drawing compass standing open: hinge at the top, a needle leg and a pencil leg */
vec3 cpQ(vec3 p){ return place(p,vec3(.33,0.,-.04),-.4); }
float compassD(vec3 q){ vec3 h=vec3(0.,.19,0.);
  vec3 f1=vec3(-.05,.002,0.), f2=vec3(.05,.004,0.);
  float d=sdCapsule(q,h,mix(h,f1,.9),.0045);
  d=min(d,sdCapsule(q,mix(h,f1,.9),f1,.0012));                                  /* needle */
  d=min(d,sdCapsule(q,h,mix(h,f2,.78),.0045));
  d=min(d,sdCapsule(q,mix(h,f2,.72),mix(h,f2,.96),.0034));                      /* pencil lead holder */
  d=min(d,sdCapsule(q,mix(h,f2,.96),f2,.0012));
  d=min(d,sdCylZ(q-h,.011,.006)-.001);                                          /* hinge disc */
  d=min(d,sdCapsule(q,h,h+vec3(0.,.03,0.),.0035));                              /* handle */
  return d; }
/* three sticks pinned into a triangle, lying flat in front */
vec3 stQ(vec3 p){ return place(p,vec3(.02,0.,-.17),-.15); }
vec3 TA(){ return vec3(-.1,.005,-.02); } vec3 TB(){ return vec3(.08,.005,-.03); } vec3 TC(){ return vec3(-.03,.005,.07); }
float sticksD(vec3 q){ return min(min(beam(q,TA(),TB(),.0045),beam(q,TB(),TC(),.0045)),beam(q,TC(),TA(),.0045)); }
float pinsD(vec3 q){ float d=1e5; d=min(d,sdCylY(q-TA()-vec3(0.,.004,0.),.006,.002)-.001);
  d=min(d,sdCylY(q-TB()-vec3(0.,.004,0.),.006,.002)-.001); d=min(d,sdCylY(q-TC()-vec3(0.,.004,0.),.006,.002)-.001); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.6-dot(p.xz-CAM_TGT.xz,normalize(CAM_TGT.xz-CAM_POS.xz)),2.);
  vec3 b=brQ(p);
  r=U(r,bridgeD(b),3.);
  r=U(r,piersD(b),4.);
  r=U(r,compassD(cpQ(p)),5.);
  vec3 s=stQ(p);
  r=U(r,sticksD(s),6.);
  r=U(r,pinsD(s),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return .62+.1*grain(brQ(p),40.);
  if(id==4.) return .78;
  if(id==5.){ vec3 q=cpQ(p); return q.y>.17?.3:.55; }
  if(id==6.) return .5;
  if(id==7.) return .25;
  return .7; }
