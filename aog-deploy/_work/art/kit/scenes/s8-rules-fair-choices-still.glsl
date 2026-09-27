/* s8 "Rules and Fair Choices" — fair and even, for the youngest citizens: a wooden toy
   seesaw resting level on its stand with one block carved A and one carved B on its two ends,
   and an apple cut into two equal halves on a small plate in front.
   @params {"mat":{"3":[0.55,1.3,1.0],"4":[0.45,1.3,1.0],"5":[0.72,1.3,1.0],"6":[0.72,1.3,1.0],"7":[0.88,1.1,0.8],"8":[0.72,1.2,0.9]},
            "texlines":{"3":[0.12,0.4,0.5],"5":[0.12,0.4,0.85],"6":[0.12,0.4,0.85],"8":[0.12,0.4,0.7]}} */
#define CAM_POS vec3(-0.3912,0.4013,-0.8587)
#define CAM_TGT vec3(-0.2479,-0.0596,0.1020)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
float sdTri2(vec2 p,vec2 p0,vec2 p1,vec2 p2){
  vec2 e0=p1-p0,e1=p2-p1,e2=p0-p2,v0=p-p0,v1=p-p1,v2=p-p2;
  vec2 pq0=v0-e0*clamp(dot(v0,e0)/dot(e0,e0),0.,1.),pq1=v1-e1*clamp(dot(v1,e1)/dot(e1,e1),0.,1.),pq2=v2-e2*clamp(dot(v2,e2)/dot(e2,e2),0.,1.);
  float s=sign(e0.x*e2.y-e0.y*e2.x);
  vec2 d=min(min(vec2(dot(pq0,pq0),s*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(pq1,pq1),s*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(pq2,pq2),s*(v2.x*e2.y-v2.y*e2.x)));
  return -sqrt(d.x)*sign(d.y); }
#define SS vec3(.0,0.,.1)
#define SSR .16
vec3 ssQ(vec3 p){ vec3 q=p-SS; q.xz=rot(SSR)*q.xz; return q; }
#define PH .075
float plank(vec3 p){ vec3 q=ssQ(p)-vec3(0.,PH+.012,0.);
  float d=sdRBox(q,vec3(.24,.007,.035),.004);
  vec3 h=q; h.x=abs(h.x)-.2;                                   /* two little handles */
  float hd=max(length(vec2(length(h.xy-vec2(0.,.012))-.014,h.z))-.004,-h.y+.004);
  return d; }
float stand(vec3 p){ vec3 q=ssQ(p);
  float tri=sdTri2(q.xy,vec2(-.055,0.),vec2(.055,0.),vec2(0.,PH));
  float d=max(tri-.006,abs(q.z)-.02)-.003;
  d=min(d,sdCylZ(q-vec3(0.,PH,0.),.011,.04)-.002);             /* the pivot pin */
  d=min(d,sdRBox(q-vec3(0.,.006,0.),vec3(.075,.006,.045),.004));
  return d; }
#define BH .036
vec3 blkQ(vec3 p,float x,float ry){ vec3 q=ssQ(p)-vec3(x,PH+.019+BH,0.); q.xz=rot(ry)*q.xz; return q; }
float block(vec3 p,float x,float ry,int g,int g2){ vec3 q=blkQ(p,x,ry);
  float d=sdRBox(q,vec3(BH),.005); if(d>.02) return d;
  d=carve(d,q.xy,g,.056,.0048,q.z+BH,.003);
  d=carve(d,vec2(-q.z,q.y),g2,.054,.0046,q.x-BH,.003);
  return d; }
float ink(vec3 p,float x,float ry,int g,int g2){ vec3 q=blkQ(p,x,ry);
  if(q.z<-BH+.006&&glyph(q.xy/.056,g)*.056<.0064) return .15;
  if(q.x>BH-.006&&glyph(vec2(-q.z,q.y)/.054,g2)*.054<.0062) return .15;
  vec2 f=q.z<-BH+.003?q.xy:q.x>BH-.003?vec2(q.z,q.y):q.xz;
  if(abs(max(abs(f.x),abs(f.y))-BH*.84)<.0018) return .45;
  return .78; }
/* a small plate with an apple cut into two halves, cut faces up and out */
#define PL vec3(.1,0.,-.14)
float plate(vec3 p){ vec3 q=p-PL; float r=length(q.xz);
  float d=max(abs(q.y-.004-.03*max(r-.05,0.))-.0025,r-.085);
  return min(d,sdTorus(q-vec3(0.,.0062+.03*.035,0.),.085,.003)); }
vec3 hfQ(vec3 p,float s){ vec3 q=p-PL-vec3(s*.036,.03,s*.004); q.xz=rot(s*.35)*q.xz; q.yz=rot(-.3)*q.yz; return q; }
float half1(vec3 p,float s){ vec3 q=hfQ(p,s);
  float a=atan(q.x,q.z);                                     /* the dip where the stem grows */
  float d=length(q*vec3(1.,1.06,1.))-.034*(1.-.14*exp(-a*a*6.));
  d=max(d*.85,q.y);
  float stem=sdCapsule(q,vec3(0.,-.002,.026),vec3(.003,-.001,.042),.0022);
  return min(d,stem); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,plank(p),3.);
  r=U(r,stand(p),4.);
  r=U(r,block(p,-.17,.1,65,66),5.);
  r=U(r,block(p,.17,-.12,66,67),6.);
  r=U(r,plate(p),7.);
  r=U(r,min(half1(p,-1.),half1(p,1.)),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return .58+.16*(grain(ssQ(p).zyx,50.)-.5);
  if(id==4.) return .45;
  if(id==5.) return ink(p,-.17,.1,65,66);
  if(id==6.) return ink(p,.17,-.12,66,67);
  if(id==7.){ vec3 q=p-PL; float r=length(q.xz); if(abs(r-.06)<.0015) return .6; return .9; }
  if(id==8.){ float s=p.x<PL.x?-1.:1.; vec3 q=hfQ(p,s);
    if(q.z>.027) return .3;                                              /* stem */
    if(q.y>-.0015){ vec2 u=q.xz; float r=length(u);                      /* the cut face */
      float star=r-.009*(1.+.35*cos(5.*atan(u.x,u.y)));
      if(abs(star)<.0013) return .35;                                     /* the core */
      vec2 v=vec2(abs(u.x),u.y)-vec2(.0045,.003); if(length(v*vec2(1.6,1.))<.0035) return .12;   /* seeds */
      if(r>.03) return .35;                                               /* skin */
      return .97; }
    return .4+.15*fbm(vec2(atan(q.z,q.x)*3.,q.y*40.)); }
  return .7; }
