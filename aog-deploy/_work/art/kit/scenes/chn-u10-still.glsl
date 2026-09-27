/* Chinese Classics Unit 10 "The Daoist Texts" — pencil still life: a bronze "hill censer"
   (boshan lu), its lid shaped as layered mountain peaks, on a stem in a round dish; beside it
   a rolled bundle and a short unrolled run of bamboo slips like the Guodian texts. */
#define CAM_POS vec3(-0.3603,0.2474,-0.9684)
#define CAM_TGT vec3(-0.1260,0.0131,0.0853)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define CC vec3(0.,0.,.14)
float censer(vec3 p){ vec3 q=p-CC;
  /* dish */
  float r=length(q.xz);
  float dish=max(abs(q.y-.01-r*r*1.2)-.004,r-.11)-.001;
  /* stem with a knop */
  float stem=sdCone(q-vec3(0.,.055,0.),.02,.012,.045);
  stem=smin(stem,length((q-vec3(0.,.07,0.))/vec3(1.,.6,1.))*.6-.014,.01);
  /* cup */
  vec3 c=q-vec3(0.,.14,0.);
  float cup=(length(c/vec3(.075,.05,.075))-1.)*.05; cup=max(cup,c.y);
  float band=sdTorus(c,.075,.004);
  /* lid: layered peaks rising to a point */
  float a=atan(c.z,c.x); float lid=1e5;
  for(int k=0;k<4;k++){ float fk=float(k); float y0=fk*.02; float r0=.076-fk*.016;
    float wav=.022*pow(abs(sin(a*(2.+fk)+fk*1.7)),2.);        /* each tier is a ring of hill-tops */
    vec3 t=c-vec3(0.,y0,0.); float hgt=.03+wav;
    float cone=max(length(t.xz)-(r0*(1.-clamp(t.y/hgt,0.,1.)*.55)),max(-t.y,t.y-hgt));
    lid=min(lid,cone*.8); }
  lid=min(lid,length(c-vec3(0.,.115,0.))-.012);
  float d=min(dish,smin(stem,cup,.01)); d=min(d,min(band,lid));
  return d; }
#define SC vec3(.22,0.,-.06)
#define SW .015
vec3 sQ(vec3 p){ vec3 q=p-SC; q.xz=rot(-.35)*q.xz; return q; }
float slips0(vec3 p){ vec3 q=sQ(p);
  float i=clamp(floor(q.x/SW+.5),0.,5.);
  float d=sdRBox(q-vec3(i*SW,.003,0.),vec3(SW*.44,.003,.11),.0013);
  vec3 r=q-vec3(-SW*.5-.022,.022,0.); d=min(d,sdCylZ(r,.022,.11)-.001);
  for(int k=0;k<2;k++){ float z=k==0?-.06:.06; d=min(d,sdTorus((r-vec3(0.,0.,z)).xzy,.0235,.002));
    d=min(d,max(abs(q.y-.0068)-.0012,max(abs(q.z-z)-.002,max(-q.x-.02,q.x-5.5*SW)))-.0005); }
  return d; }
float slips(vec3 p){ return slips0((p-SC)/1.5+SC)*1.5; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,censer(p),3.);
  r=U(r,slips(p),4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-CC; vec3 c=q-vec3(0.,.14,0.); if(abs(c.y)<.005) return .3;
    if(c.y>0.){ return .5+.12*fbm(q.xy*90.); }
    return .45; }
  if(id==4.){ vec3 q=sQ((p-SC)/1.5+SC); if(q.x<-SW*.5) return .62+.12*step(.5,fract(length(q.xy-vec2(-SW*.5-.022,.022))/.004));
    float i=floor(q.x/SW+.5); float u=q.x-i*SW; if(abs(u)>SW*.4) return .4;
    if(n.y>.8&&abs(u)<.0025&&abs(q.z)<.09&&abs(abs(q.z)-.06)>.01){ float cell=floor(q.z/.015); if(fract(q.z/.015)<.45&&h1(vec2(i,cell))>.5) return .35; }
    return .8; }
  return .7; }
