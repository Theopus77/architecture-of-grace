/* e15 "Tone and Voice" — an old desk microphone with a ribbed grille on a stand, a sealed
   letter in its envelope, and a fountain pen lying across it. */
#define CAM_POS vec3(-0.4890,0.3506,-0.8584)
#define CAM_TGT vec3(-0.1799,0.0208,0.1105)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
#define MC vec3(-.02,0.,.1)
#define MH .2
vec3 mQ(vec3 p){ vec3 q=place(p,MC,.35)-vec3(0.,MH,0.); q.yz=rot(.25)*q.yz; return q; }
float stand(vec3 p){ vec3 q=place(p,MC,.35);
  float b=sdCylY(q-vec3(0.,.01,0.),.065,.007)-.004;
  b=min(b,sdCylY(q-vec3(0.,.022,0.),.03,.006)-.003);
  float rod=sdCylY(q-vec3(0.,.075,0.),.006,.06);
  vec3 y=q-vec3(0.,MH,0.); float yoke=max(sdTorus(y.xzy*vec3(1.,1.,1.),.05,.004),y.y+.0);   /* U under the mic */
  yoke=max(sdTorus(vec3(y.x,y.z,y.y),.05,.004),y.y);
  float col=sdCylY(q-vec3(0.,MH-.075,0.),.009,.02);
  return min(min(b,rod),min(yoke,col)); }
float mic(vec3 p){ vec3 q=mQ(p);
  float body=sdEll(q,vec3(.042,.062,.036));
  float ring=sdTorus(q,.044,.004);
  float knob=sdCylX(q,.008,.052)-.001;
  return min(min(body,ring),knob); }
vec3 eQ(vec3 p){ vec3 q=p-vec3(.17,.002,-.02); q.xz=rot(-.2)*q.xz; return q; }
float env(vec3 p){ vec3 q=eQ(p); return sdRBox(q,vec3(.1,.0022,.064),.0012); }
vec3 fQ(vec3 p){ vec3 q=p-vec3(.14,.0075,-.13); q.xz=rot(.15)*q.xz; return q; }
float pen(vec3 p){ vec3 q=fQ(p);
  float body=sdCapsule(q,vec3(-.06,0.,0.),vec3(.04,0.,0.),.0075);
  float grip=sdCone(vec3(q.y,-(q.x-.052),q.z),.0065,.004,.012);
  vec3 n=q-vec3(.07,0.,0.); float nib=max(sdEll(n,vec3(.012,.0028,.005)),-n.y-.0);
  nib=min(nib,sdEll(n,vec3(.012,.0012,.0045)));
  float clip=sdRBox(q-vec3(-.035,.008,0.),vec3(.022,.0012,.0018),.001);
  float band=sdCylX(q-vec3(.036,0.,0.),.0079,.0022);
  return min(min(body,grip),min(min(nib,clip),band)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,stand(p),3.);
  r=U(r,mic(p),4.);
  r=U(r,env(p),5.);
  r=U(r,pen(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .4;
  if(id==4.){ vec3 q=mQ(p); if(abs(q.x)>.05) return .35; if(length(vec3(q.x,0.,q.z))>.043&&abs(q.y)<.006) return .45;
    return fract(q.y/.007)<.35?.3:.78; }
  if(id==5.){ vec3 q=eQ(p); vec2 u=q.xz; float a=.93;
    if(q.y>.001){ float v=abs(u.y-.064+abs(u.x)*.62); if(v<.0018&&u.y>-.01) a=.4;       /* flap */
      if(length(u-vec2(0.,-.001))<.011) a=.28;                                        /* wax seal */
      if(abs(sdBox2(u-vec2(.075,.035),vec2(.013,.015)))<.0016) a=.35; }  /* stamp */
    return a; }
  if(id==6.){ vec3 q=fQ(p); if(q.x>.06) return .7; if(q.x>.034&&q.x<.039) return .8; return .25; }
  return .7; }
