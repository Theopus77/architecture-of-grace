/* The Unseen Realm Unit 11 "The Satan, Demons and Dark Powers" — pencil still life, calm and
   light: a brass balance scale with two hanging pans (the accuser in the heavenly court, "the
   satan" as a title), a lit candle in a low holder (light that darkness cannot put out), and a
   small rolled document tied with a cord and a round seal (the charge brought to court). */
#define CAM_POS vec3(-0.6386,0.4261,-1.2765)
#define CAM_TGT vec3(-0.3728,0.0421,0.1115)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define SCL vec3(0.,0.,.08)
#define CND vec3(.21,0.,.02)
#define DOC vec3(-.13,0.,-.1)
#define TILT -.07
/* the scale: stepped round foot, turned post, a beam with end hooks, three cords to each pan */
vec3 beamPt(float sx){ return SCL+vec3(sx*.15*cos(TILT),.31+sx*.15*sin(TILT),0.); }
float scaleFrame(vec3 p){ vec3 q=p-SCL; float r=length(q.xz);
  float foot=sdCylY(q-vec3(0.,.008,0.),.075,.008)-.002;
  foot=min(foot,sdCylY(q-vec3(0.,.022,0.),.055,.007)-.002);
  foot=min(foot,sdCone(q-vec3(0.,.04,0.),.03,.012,.012));
  float post=sdCylY(q-vec3(0.,.18,0.),.0075+.002*smoothstep(.3,.05,q.y),.14);
  post=min(post,sdTorus(q-vec3(0.,.1,0.),.0095,.003));
  post=min(post,length(q-vec3(0.,.345,0.))-.013);
  float piv=sdCylZ(q-vec3(0.,.31,0.),.012,.006)-.002;
  vec3 b=q-vec3(0.,.31,0.); b.xy=rot(-TILT)*b.xy;
  float beam=sdCapsule(b,vec3(-.15,0.,0.),vec3(.15,0.,0.),.0055);
  beam=min(beam,sdCone(vec3(abs(b.x)-.075,b.y,b.z).yxz,.008,.005,.07)*.9);
  vec3 e=b; e.x=abs(e.x)-.15; float hook=sdTorus(e.xzy,.007,.0022);
  float d=min(min(foot,post),min(piv,min(beam,hook)));
  float ptr=sdCone(b-vec3(0.,.035,0.),.004,.001,.03);                     /* the needle */
  return min(d,ptr); }
float panY(float sx){ return beamPt(sx).y-.2; }
float panD(vec3 p,float sx){ vec3 c=vec3(beamPt(sx).x,panY(sx),SCL.z); vec3 q=p-c;
  float o=sdEll(q,vec3(.068,.026,.068)); o=max(o,q.y);
  o=max(o,-sdEll(q-vec3(0.,.003,0.),vec3(.062,.022,.062)));
  o=min(o,sdTorus(q,.066,.0028));
  return o; }
float cordsD(vec3 p,float sx){ vec3 top=beamPt(sx)-vec3(0.,.008,0.); float d=1e3; float y=panY(sx);
  for(int i=0;i<3;i++){ float a=float(i)*2.094+.5; vec3 bt=vec3(top.x+.064*cos(a),y+.002,SCL.z+.064*sin(a));
    d=min(d,sdCapsule(p,top,bt,.0014)); }
  return d; }
/* a few coins weighed in the right-hand pan */
float coinsD(vec3 p){ vec3 c=vec3(beamPt(1.).x,panY(1.)-.016,SCL.z); float d=1e3;
  for(int i=0;i<3;i++){ vec3 o=c+vec3(-.018+.02*float(i),.002+.004*float(i%2),.01*sin(float(i)*2.3));
    d=min(d,sdCylY(p-o,.013,.0022)-.0008); }
  return d; }
/* the candle and holder */
float holderD(vec3 p){ vec3 q=p-CND; float r=length(q.xz);
  float dish=sdCylY(q-vec3(0.,.008,0.),.055,.006)-.003;
  dish=max(dish,-sdCylY(q-vec3(0.,.016,0.),.047,.004));
  dish=min(dish,sdTorus(q-vec3(0.,.016,0.),.052,.0035));
  float cup=sdCylY(q-vec3(0.,.03,0.),.022,.018)-.002; cup=max(cup,-sdCylY(q-vec3(0.,.045,0.),.018,.01));
  vec3 h=q-vec3(.068,.016,0.); float ring=sdTorus(h.xzy,.014,.003);
  return min(dish,min(cup,ring)); }
float candleD(vec3 p){ vec3 q=p-CND; float d=sdCylY(q-vec3(0.,.13,0.),.017,.1)-.001;
  d=smin(d,sdEll(q-vec3(.012,.19,-.012),vec3(.006,.03,.006)),.006);        /* a soft drip */
  float wick=sdCapsule(q,vec3(0.,.23,0.),vec3(.001,.24,0.),.0014);
  return min(d,wick); }
float flameD(vec3 p){ vec3 q=p-CND-vec3(0.,.25,0.);
  float t=clamp((q.y+.01)/.04,0.,1.); float rr=.0075*pow(sin(3.1416*pow(t,.6)),.8);
  return max(length(q.xz)-rr,abs(q.y-.01)-.02)*.7; }
/* the rolled document with its cord and wax seal */
vec3 docQ(vec3 p){ vec3 q=p-DOC; q.xz=rot(.35)*q.xz; return q; }
float docD(vec3 p){ vec3 q=docQ(p)-vec3(0.,.019,0.);
  float roll=sdCylX(q,.019,.085)-.001;
  roll=max(roll,-max(length(q.yz)-.009,abs(q.x)-.082));
  return roll; }
float sealD(vec3 p){ vec3 q=docQ(p)-vec3(.0,.019,0.);
  float band=max(abs(length(q.yz)-.0205)-.0018,abs(q.x)-.006);
  float s=sdCylZ(q-vec3(0.,-.004,-.021),.014,.003)-.002;
  float tail=sdCapsule(q,vec3(.004,-.012,-.022),vec3(.03,-.018,-.045),.0016);
  tail=min(tail,sdCapsule(q,vec3(-.004,-.012,-.022),vec3(-.022,-.018,-.05),.0016));
  return min(min(band,s),tail); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,scaleFrame(p),3.);
  r=U(r,min(panD(p,-1.),panD(p,1.)),4.);
  r=U(r,min(cordsD(p,-1.),cordsD(p,1.)),5.);
  r=U(r,coinsD(p),6.);
  r=U(r,holderD(p),7.);
  r=U(r,candleD(p),8.);
  r=U(r,flameD(p),9.);
  r=U(r,docD(p),10.);
  r=U(r,sealD(p),11.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-SCL; if(q.y<.03&&abs(length(q.xz)-.062)<.0025) return .35; return .5; }
  if(id==4.){ return .55; }
  if(id==5.) return .3;
  if(id==6.){ return .45; }
  if(id==7.){ return .5; }
  if(id==8.) { vec3 q=p-CND; return q.y>.235?.2:.9; }
  if(id==9.) return .97;
  if(id==10.){ vec3 q=docQ(p)-vec3(0.,.019,0.); if(abs(q.x)>.083) return fract(length(q.yz)/.005)<.4?.45:.8; return .86; }
  if(id==11.){ vec3 q=docQ(p)-vec3(0.,.019,0.); if(q.z<-.022&&abs(length(q.xy-vec2(0.,-.004))-.008)<.0015) return .25; return .38; }
  return .7; }
