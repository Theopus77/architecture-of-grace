/* The Unseen Realm Unit 10 "The Gods of the Nations" — pencil still life: a tall clay scroll
   jar from Qumran with its bowl-shaped lid and four little loop handles, a leather scroll lying
   in front, partly unrolled to show columns of hint-lines (Deuteronomy 32 in the Dead Sea
   Scrolls), and a clay bowl heaped with earth (Naaman's two loads of soil). */
#define CAM_POS vec3(-0.5677,0.3825,-1.1942)
#define CAM_TGT vec3(-0.3195,0.0240,0.1018)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define JAR vec3(.03,0.,.1)
#define SCR vec3(-.07,0.,-.1)
#define BWL vec3(.2,0.,-.05)
float sdB2(vec2 p,vec2 b,float r){ vec2 d=abs(p)-b+r; return length(max(d,0.))+min(max(d.x,d.y),0.)-r; }
/* the jar: a tall rounded cylinder, a short neck, a rim, a bowl lid, four loop handles */
float jarD(vec3 p){ vec3 q=p-JAR; float r=length(q.xz);
  float wob=.0015*fbm(q.xz*40.+q.y*20.);
  float body=sdB2(vec2(r/(.84+.16*smoothstep(.0,.22,q.y)),q.y-.14),vec2(.078,.14),.05);
  float neck=sdB2(vec2(r,q.y-.29),vec2(.05,.02),.006);
  float d=smin(body,neck,.02)+wob;
  vec3 h=q; float a=atan(h.z,h.x); float aa=q.x>0.?0.:3.1416;
  vec3 hq=vec3(dot(h.xz,vec2(cos(aa),sin(aa))),h.y,dot(h.xz,vec2(-sin(aa),cos(aa))));
  float hd=sdTorus((hq-vec3(.072,.235,0.)).xzy,.014,.0045);          /* small loop handle on the shoulder */
  hd=max(hd,-(hq.x-.068));
  return min(d,hd); }
float lidD(vec3 p){ vec3 q=p-JAR-vec3(0.,.3,0.); float r=length(q.xz);
  float cap=sdEll(q-vec3(0.,.0,0.),vec3(.075,.036,.075)); cap=max(cap,-q.y);
  cap=max(cap,-sdEll(q-vec3(0.,-.004,0.),vec3(.067,.029,.067)));
  float rim=sdTorus(q-vec3(0.,.001,0.),.071,.0045);
  float knob=sdCylY(q-vec3(0.,.048,0.),.018,.006)-.003;
  return min(cap,rim); }
/* the scroll: a leather roll lying along x, with its end sheet laid flat to the left */
vec3 scrQ(vec3 p){ vec3 q=p-SCR; q.xz=rot(-.12)*q.xz; return q; }
float scrollD(vec3 p){ vec3 q=scrQ(p);
  float R=.024; vec3 c=q-vec3(.06,R,0.);
  float roll=sdCylX(c,R,.075)-.001+.0008*sin(atan(c.y,c.z)*5.+c.x*30.);
  float edge=max(abs(length(c.yz)-R*.55)-.0012,abs(c.x)-.0765);           /* the spiral at the ends */
  roll=max(roll,-max(length(c.yz)-R*.35,abs(c.x)-.0765+.004));
  float sheet=sdRBox(q-vec3(-.07,.0016+.002*sin(q.x*40.),0.),vec3(.12,.0012,.074),.0008);
  sheet=max(sheet,q.x-.06);
  float d=min(roll,sheet); d=min(d,edge);
  return d; }
float cordD(vec3 p){ vec3 q=scrQ(p)-vec3(.06,.024,0.);
  float t=sdTorus(q.yxz,.0255,.0022);
  t=max(t,abs(q.x-.02)-.0025);
  float e=sdCapsule(q,vec3(.02,-.018,-.018),vec3(.05,-.022,-.045),.0018);
  return min(sdTorus((q-vec3(.02,0.,0.)).yxz,.0255,.0022),e); }
/* the bowl of soil */
float bowlD(vec3 p){ vec3 q=p-BWL; float r=length(q.xz);
  float o=sdEll(q-vec3(0.,.05,0.),vec3(.085,.052,.085));
  float i=sdEll(q-vec3(0.,.056,0.),vec3(.077,.05,.077));
  float d=max(max(o,-i),q.y-.05); d=max(d,-q.y);
  d=min(d,sdTorus(q-vec3(0.,.05,0.),.081,.0035));
  return d; }
float soilD(vec3 p){ vec3 q=p-BWL; float r=length(q.xz);
  float heap=sdEll(q-vec3(0.,.038,0.),vec3(.074,.05,.074));
  heap+=.004*(fbm(q.xz*60.)-.5)+.003*vn(q.xz*180.);
  return max(heap,r-.078); }
float clodD(vec3 p){ float d=1e3;
  for(int i=0;i<4;i++){ vec3 c=BWL+vec3(-.1+float(i)*.022,.006,-.07+.012*sin(float(i)*2.));
    d=min(d,sdEll(p-c,vec3(.009,.006,.008))+.001*vn3(p*300.)); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,jarD(p),3.);
  r=U(r,lidD(p),4.);
  r=U(r,scrollD(p),5.);
  r=U(r,cordD(p),6.);
  r=U(r,bowlD(p),7.);
  r=U(r,min(soilD(p),clodD(p)),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-JAR; float a=.66+.08*fbm(q.xy*25.+q.z*10.);
    if(abs(q.y-.215)<.002) a=.48;      /* throwing rings */
    return a; }
  if(id==4.){ vec3 q=p-JAR-vec3(0.,.3,0.); return abs(length(q.xz)-.04)<.0025&&q.y>.02?.5:.68; }
  if(id==5.){ vec3 q=scrQ(p); float a=.82+.06*fbm(q.xz*50.);
    if(q.x<.035&&q.y<.006){ float cx=q.x+.19; float c=floor(cx/.075), f=fract(cx/.075);
      if(q.x>-.18&&f>.12&&f<.88&&abs(q.z)<.058){ float l=fract((q.z+.06)/.008); if(l<.25&&h1(vec2(c,floor((q.z+.06)/.008)))>.1) a=.5; } }
    if(q.x>.035){ vec3 c=q-vec3(.06,.024,0.); if(abs(c.x)>.07) return fract(length(c.yz)/.006)<.35?.35:.7; return .7+.08*sin(atan(c.y,c.z)*5.); }
    return a; }
  if(id==6.) return .35;
  if(id==7.){ vec3 q=p-BWL; if(q.y>.04) return .5; return .62+.06*fbm(q.xy*30.); }
  if(id==8.){ return .4+.2*vn(p.xz*260.)+.1*fbm(p.xz*50.); }
  return .7; }
