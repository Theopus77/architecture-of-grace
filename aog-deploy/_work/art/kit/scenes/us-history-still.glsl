/* Practice room "U.S. History, Grades 6–8" — pencil still life of the long story on one table:
   a stack of three old clothbound history books, a brass explorer's spyglass lying across the
   top book, and a toy covered wagon on spoked wheels beside them (heading west). */
#define CAM_POS vec3(-0.3007,0.4549,-0.8978)
#define CAM_TGT vec3(-0.0964,-0.0425,0.0689)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
/* three books, each a board cover wrapped round a page block, spine toward the viewer */
vec3 bkQ(vec3 p,int i){ float fi=float(i);
  vec3 c=vec3(-.02+.012*sin(fi*2.3),.022+fi*.044-.002*fi,.05); vec3 q=p-c; q.xz=rot(.18-.16*fi+.04*fi*fi)*q.xz; return q; }
vec3 bkS(int i){ return i==0?vec3(.15,.021,.105):i==1?vec3(.13,.02,.095):vec3(.115,.019,.085); }
vec2 book(vec3 p,int i){ vec3 q=bkQ(p,i); vec3 s=bkS(i);
  float cov=sdRBox(q,s,.004);
  cov=max(cov,-sdBox(q-vec3(.006,0.,.006),vec3(s.x-.001,s.y-.0035,s.z)));    /* hollow: page block sits inside */
  float spine=sdCylX(vec3(q.x,q.y*.9,q.z+s.z-.004),s.y*1.02,s.x-.001);          /* rounded spine on the near side */
  cov=min(cov,max(spine,q.z+s.z-.004));
  float pg=sdRBox(q-vec3(.004,0.,.004),vec3(s.x-.008,s.y-.004,s.z-.006),.0015);
  return vec2(cov,pg); }
/* a brass spyglass: three drawn tubes with rings, lying across the top book */
vec3 spQ(vec3 p){ vec3 q=p-vec3(-.02,.135,.03); q.xz=rot(.42)*q.xz; q.xy=rot(.04)*q.xy; return q; }
float spyD(vec3 p){ vec3 q=spQ(p);
  float d=sdCylX(q-vec3(-.07,0.,0.),.017,.075)-.001;                  /* big barrel */
  d=min(d,sdCylX(q-vec3(.04,0.,0.),.0135,.045)-.001);                  /* middle draw */
  d=min(d,sdCylX(q-vec3(.11,0.,0.),.0105,.03)-.001);                   /* eyepiece draw */
  d=min(d,sdCylX(q-vec3(-.145,0.,0.),.0205,.008)-.001);                /* objective hood */
  d=min(d,sdCylX(q-vec3(.005,0.,0.),.0195,.006)-.001);                 /* barrel end ring */
  d=min(d,sdCylX(q-vec3(.083,0.,0.),.016,.005)-.001);
  d=min(d,sdCylX(q-vec3(.142,0.,0.),.0125,.004)-.001);
  d=max(d,-sdCylX(q-vec3(-.153,0.,0.),.015,.004));                     /* hollow of the lens hood */
  return d; }
/* a toy covered wagon: a plank bed, a canvas bonnet on hoops, spoked wheels and a tongue */
vec3 wgQ(vec3 p){ vec3 q=p-vec3(.29,0.,-.06); q.xz=rot(-.5)*q.xz; return q; }
float wheel(vec3 q,float R){ float d=sdTorus(q.xzy,R-.005,.005); d=min(d,sdCylZ(q,.011,.012)-.002);
  float a=atan(q.y,q.x); float sa=mod(a+PI/10.,PI/5.)-PI/10.; vec2 u=length(q.xy)*vec2(cos(sa),sin(sa));
  d=min(d,max(max(abs(u.y)-.0025,abs(q.z)-.003),max(u.x-R+.005,.01-u.x))); return d; }
float wagD(vec3 q){ float d=sdRBox(q-vec3(0.,.085,0.),vec3(.1,.022,.048),.003);
  d=max(d,-sdBox(q-vec3(0.,.1,0.),vec3(.094,.02,.042)));                                  /* open box bed */
  d=min(d,sdCylZ(q-vec3(-.065,.056,0.),.004,.06)); d=min(d,sdCylZ(q-vec3(.065,.05,0.),.004,.06));   /* axles */
  d=min(d,sdCapsule(q,vec3(.1,.052,0.),vec3(.2,.012,-.01),.0045));                        /* tongue */
  return d; }
float wheels(vec3 q){ float d=1e3;
  d=min(d,wheel(q-vec3(-.065,.056,-.058),.056)); d=min(d,wheel(q-vec3(-.065,.056,.058),.056));
  d=min(d,wheel(q-vec3(.065,.042,-.056),.042)); d=min(d,wheel(q-vec3(.065,.042,.056),.042));
  return d; }
float bonnet(vec3 q){ float fl=1.+.3*pow(abs(q.x)/.11,4.);               /* flares open at the ends */
  vec2 c=vec2(q.z,q.y-.1); float r=.05*fl;
  float d=abs(length(c*vec2(1.,.85))-r)-.0025;
  d=max(d,max(-(q.y-.1),abs(q.x)-.11));
  d-=.0012*smoothstep(.3,1.,abs(sin(q.x*PI/.034)));                    /* canvas sags between the hoops */
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  for(int i=0;i<3;i++){ vec2 b=book(p,i); r=U(r,b.x,3.+float(i)); r=U(r,b.y,6.); }
  r=U(r,spyD(p),7.);
  vec3 w=wgQ(p); r=U(r,wagD(w),8.); r=U(r,wheels(w),9.); r=U(r,bonnet(w),10.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id>=3.&&id<=5.){ int i=int(id)-3; vec3 q=bkQ(p,i); vec3 s=bkS(i);
    float a=i==0?.42:i==1?.6:.35;
    if(q.z<-s.z+.012){ /* spine bands */
      float x=q.x/s.x; if(abs(abs(x)-.62)<.035||abs(abs(x)-.7)<.015) return .15;
      if(abs(x)<.35&&abs(q.y)<s.y*.35) return a+.2; }
    return a; }
  if(id==6.) return fract(p.y/.0025)<.5?.86:.95;
  if(id==7.){ vec3 q=spQ(p); if(abs(q.x+.07)<.06&&q.x<-.02) return .35; return .7; }   /* leather grip on the barrel */
  if(id==8.){ vec3 q=wgQ(p); return fract(q.y/.011)<.12?.3:.5; }        /* plank seams */
  if(id==9.) return .35;
  if(id==10.){ vec3 q=wgQ(p); float h=abs(fract(q.x/.034+.5)-.5)*.034; return h<.0022?.55:.93; }   /* canvas, hoop lines */
  return .7; }
