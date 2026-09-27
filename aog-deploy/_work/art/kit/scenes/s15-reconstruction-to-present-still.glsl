/* Room "Reconstruction to the Present" — pencil still life: an old travel suitcase with two
   straps and a handle (families moving north and to new cities), a round-topped tabletop radio
   of the 1930s with a cloth grille and two knobs, and a railroad spike. */
#define CAM_POS vec3(-0.3636,0.2729,-0.6192)
#define CAM_TGT vec3(-0.1491,0.0125,0.0549)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define SU vec3(-.06,0.,.1)
#define RD vec3(.2,0.,-.02)
vec3 suQ(vec3 p){ return place(p,SU,.2); }
float caseD(vec3 p){ vec3 q=suQ(p);
  float body=sdRBox(q-vec3(0.,.045,0.),vec3(.13,.045,.06),.01);
  float seam=abs(q.y-.062)-.0015; body=max(body,-max(seam,-(body+.002)));
  float straps=sdRBox(vec3(abs(q.x)-.07,q.y-.045,q.z),vec3(.008,.047,.062),.002);
  float bk=sdRBox(vec3(abs(q.x)-.07,q.y-.06,q.z+.062),vec3(.01,.008,.002),.001);
  vec3 h=q-vec3(0.,.095,0.); float handle=max(length(vec2(length(h.xy*vec2(1.,1.6))-.025,h.z))-.005,-h.y);
  float corners=length(vec3(abs(q.x)-.12,abs(q.y-.045)-.035,abs(q.z)-.05))-.012;
  return min(min(min(body,straps),min(bk,handle)),corners); }
vec3 rdQ(vec3 p){ return place(p,RD,-.45)/1.3; }
float radioD(vec3 p){ vec3 q=rdQ(p);
  /* cathedral shape: a box with a round-arched top */
  vec2 u=q.xy-vec2(0.,.065); float arch=length(max(vec2(abs(u.x)-.0,u.y),0.)*vec2(1.,1.))-.0;
  float prof=u.y<0.?abs(u.x)-.06:length(u*vec2(1.,.9))-.06;
  prof=max(prof,-q.y);
  float d=max(prof,abs(q.z)-.035)-.003;
  /* the grille: recessed arch window on the front */
  vec2 g=q.xy-vec2(0.,.075); float gp=g.y<0.?abs(g.x)-.035:length(g*vec2(1.,.9))-.035; gp=max(gp,-(q.y-.05));
  d=max(d,-max(gp,-(q.z+.03)));
  float kn=min(length(vec3(q.x+.025,q.y-.025,q.z+.038))-.008,length(vec3(q.x-.025,q.y-.025,q.z+.038))-.008);
  float dial=sdCylZ(q-vec3(0.,.028,-.036),.011,.002);
  return min(min(d,kn),dial); }
vec3 spQ(vec3 p){ vec3 q=p-vec3(.02,.006,-.1); q.xz=rot(-.3)*q.xz; return q; }
float spikeD(vec3 p){ vec3 q=spQ(p);
  float shaft=sdRBox(q,vec3(.06,.0055,.0055),.001); shaft=max(shaft,(q.x-.06)+abs(q.y)*1.5);
  float head=sdRBox(q-vec3(-.064,.0,-.0),vec3(.004,.008,.012),.002);
  return min(shaft,head); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,caseD(p),3.);
  r=U(r,radioD(p)*1.3,4.);
  r=U(r,spikeD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=suQ(p); if(abs(abs(q.x)-.07)<.009) return .3; if(length(vec3(abs(q.x)-.12,abs(q.y-.045)-.035,abs(q.z)-.05))<.015) return .35; return .62+.06*fbm(q.xy*150.); }
  if(id==4.){ vec3 q=rdQ(p); if(q.z<-.028){ vec2 g=q.xy-vec2(0.,.075); float gp=g.y<0.?abs(g.x)-.035:length(g*vec2(1.,.9))-.035; if(gp<0.&&q.y>.05) return abs(fract(q.x/.008)-.5)<.15?.3:.6; }
    return .4+.15*grain(q,80.); }
  if(id==5.) return .35;
  return .7; }
