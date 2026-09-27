/* Home page door 01 "The Atrium" — pencil still life: an open arched doorway built from
   wooden blocks (two piers and a round arch of wedge blocks with a keystone), a brass
   microscope beside it and a small stack of books. Every subject, hands-on tools. */
#define CAM_POS vec3(-0.8354,0.3286,-1.2046)
#define CAM_TGT vec3(-0.3656,0.0155,0.1524)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* ---- the block arch: local frame, turned a little toward the viewer ---- */
#define AC vec3(0.,0.,.08)
vec3 aq(vec3 p){ vec3 q=p-AC; q.xz=rot(-.15)*q.xz; return q; }
#define PB .025          /* plinth height */
#define PH .06           /* one pier block */
#define SPR (PB+3.*PH)   /* springing line of the arch */
#define RI .07
#define RO .122
#define AZ .032          /* half depth of the blocks */
float plinthD(vec3 q){ return sdRBox(q-vec3(0.,PB*.5,0.),vec3(.165,PB*.5,.058),.005); }
float pierD(vec3 q){ float d=1e5; float xc=(RI+RO)*.5;
  for(int i=0;i<3;i++){ float y=PB+PH*(float(i)+.5);
    vec3 b=vec3(abs(q.x)-xc,q.y-y,q.z);
    d=min(d,sdRBox(b,vec3((RO-RI)*.5-.001,PH*.5-.0015,AZ),.004)); }
  return d; }
vec2 archD(vec3 q){ /* x: wedge blocks, y: keystone */
  vec2 p=q.xy-vec2(0.,SPR); float r=length(p);
  float ann=max(max(r-RO,RI-r),abs(q.z)-AZ);
  float a=atan(p.y,max(p.x,-1e3)); float N=7., w=PI/N;
  float k=clamp(floor(a/w),0.,N-1.);
  float best=1e5, key=1e5;
  for(int j=-1;j<=1;j++){ float kk=k+float(j); if(kk<0.||kk>N-1.) continue;
    float a0=kk*w, a1=a0+w;
    vec2 n0=vec2(-sin(a0),cos(a0)), n1=vec2(-sin(a1),cos(a1));
    float g=.0018;
    float piece=max(ann,max(-dot(p,n0)+g,dot(p,n1)+g))-.0035;
    piece=max(piece,-(p.y+.0005));
    if(kk==3.){ /* the keystone stands a little proud */
      float ks=max(max(max(r-RO-.012,RI-.008-r),abs(q.z)-AZ-.004),max(-dot(p,n0)+g,dot(p,n1)+g))-.003;
      key=min(key,ks); }
    else best=min(best,piece); }
  return vec2(best,key); }
/* ---- the microscope (the Microscope Lab parts, moved to the right) ---- */
#define MC vec3(.27,0.,-.07)
vec3 mq(vec3 p){ vec3 q=p-MC; q.xz=rot(-1.05)*q.xz; return q; }
vec3 tq(vec3 q){ vec3 t=q-vec3(0.,.2,.035); t.yz=rot(.38)*t.yz; return t; }
float baseD(vec3 q){
  float d=sdRBox(q-vec3(0.,.012,.04),vec3(.075,.012,.07),.008);
  d=max(d,-(sdCylY(q-vec3(0.,.012,-.05),.035,.03)));
  float plinth=sdRBox(q-vec3(0.,.028,.075),vec3(.03,.008,.03),.004);
  return min(d,plinth); }
float armD(vec3 q){
  float pil=sdRBox(q-vec3(0.,.075,.085),vec3(.018,.045,.016),.005);
  vec3 a=q-vec3(0.,.12,.03);
  float arm=max(sdRBox(vec3(a.x,length(a.yz)-.075,0.),vec3(.014,.012,1.),.004),-(a.y+.01));
  arm=max(arm,-a.z+.0);
  float kn=sdCylX(q-vec3(0.,.14,.075),.022,.04)-.002;
  kn=min(kn,sdCylX(q-vec3(0.,.14,.075),.013,.052)-.001);
  return min(min(pil,arm),kn); }
float stageD(vec3 q){
  float s=sdRBox(q-vec3(0.,.1,.0),vec3(.058,.005,.052),.003);
  s=max(s,-sdCylY(q-vec3(0.,.1,0.),.008,.02));
  float clip=sdRBox(q-vec3(-.035,.107,-.012),vec3(.004,.0015,.022),.001);
  clip=min(clip,sdRBox(q-vec3(.035,.107,-.012),vec3(.004,.0015,.022),.001));
  float mir=sdCylY(q-vec3(0.,.055,0.),.022,.003)-.002;
  float mfork=sdRBox(q-vec3(0.,.06,.04),vec3(.004,.004,.04),.002);
  return min(min(s,clip),min(mir,mfork)); }
float tubeD(vec3 q){ vec3 t=tq(q);
  float body=sdCylY(t-vec3(0.,.02,0.),.017,.075)-.001;
  float collar=sdCylY(t-vec3(0.,.098,0.),.02,.006)-.001;
  float eye=sdCylY(t-vec3(0.,.125,0.),.012,.025)-.001;
  float cup=sdCylY(t-vec3(0.,.152,0.),.016,.006)-.002;
  float tur=sdCylY(t-vec3(0.,-.06,0.),.028,.008)-.003;
  float o1=sdCone(t-vec3(0.,-.085,0.),.007,.011,.018);
  vec3 t2=t-vec3(.02,-.08,0.); t2.xy=rot(-.35)*t2.xy; float o2=sdCone(t2,.006,.01,.014);
  vec3 t3=t-vec3(-.02,-.08,0.); t3.xy=rot(.35)*t3.xy; float o3=sdCone(t3,.006,.01,.011);
  return min(min(min(body,collar),min(eye,cup)),min(tur,min(o1,min(o2,o3)))); }
/* ---- a stack of three books on the left, each a little turned ---- */
#define BC vec3(-.27,0.,-.1)
vec3 bk(vec3 p,int i){ vec3 q=p-BC; float a=i==0?.1:(i==1?-.12:.22);
  float y=i==0?.024:(i==1?.066:.102); vec3 o=i==0?vec3(0.):(i==1?vec3(.01,0.,-.005):vec3(-.008,0.,.004));
  q-=o; q.y-=y; q.xz=rot(a)*q.xz; return q; }
vec3 bsz(int i){ return i==0?vec3(.125,.024,.09):(i==1?vec3(.108,.018,.08):vec3(.09,.017,.066)); }
vec2 books(vec3 p){ float cv=1e5, pg=1e5;
  for(int i=0;i<3;i++){ vec3 q=bk(p,i); vec3 s=bsz(i);
    /* hard cover: two boards joined by the spine on -x; the page block shows on three sides */
    float boards=max(sdRBox(q,s,.003),-sdBox(q-vec3(.009,0.,0.),vec3(s.x,s.y-.0032,s.z+.01)));
    cv=min(cv,boards);
    pg=min(pg,sdBox(q-vec3(.002,0.,0.),vec3(s.x-.006,s.y-.0034,s.z-.005))); }
  return vec2(cv,pg); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 a=aq(p);
  r=U(r,plinthD(a),3.);
  r=U(r,pierD(a),4.);
  vec2 ar=archD(a); r=U(r,ar.x,5.); r=U(r,ar.y,6.);
  vec3 q=mq(p);
  r=U(r,baseD(q),7.);
  r=U(r,armD(q),8.);
  r=U(r,stageD(q),9.);
  r=U(r,tubeD(q),10.);
  vec2 b=books(p); r=U(r,b.x,11.); r=U(r,b.y,12.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  vec3 a=aq(p);
  if(id==3.) return .5+.08*grain(a.zyx,30.);
  if(id==4.){ float i=floor((a.y-PB)/PH); float s=sign(a.x);
    float t=mod(i+(s>0.?1.:0.),2.)<.5?.66:.56;
    return t+.07*grain(a,34.); }
  if(id==5.){ vec2 pp=a.xy-vec2(0.,SPR); float k=floor(atan(pp.y,pp.x)/(PI/7.));
    return (mod(k,2.)<.5?.64:.55)+.07*grain(vec3(length(pp)*3.,a.y,a.z),30.); }
  if(id==6.) return .48;
  vec3 q=mq(p);
  if(id==7.) return .3;
  if(id==8.) return .45;
  if(id==9.) return .25;
  if(id==10.){ vec3 t=tq(q);
    if(abs(t.y-.05)<.003||abs(t.y+.0)<.002) return .25;
    return t.y<-.07?.35:.6; }
  if(id==11.){ for(int i=0;i<3;i++){ vec3 b=bk(p,i); vec3 s=bsz(i);
      if(abs(b.y)<s.y+.002&&abs(b.x)<s.x+.002&&abs(b.z)<s.z+.002){
        /* two bands across the spine */
        if(b.x<-s.x+.01&&(abs(b.z-s.z*.6)<.004||abs(b.z+s.z*.6)<.004)) return .25;
        return i==1?.52:(i==0?.38:.45); } }
    return .4; }
  if(id==12.){ vec3 b=bk(p,0); float l=fract(p.y/.0028); return l<.35?.8:.93; }
  return .7; }
