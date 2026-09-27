/* Room s2 "Communities and Illinois" — pencil still life: a wooden toy barn with a round
   grain silo beside it (the farm towns of Illinois), two ears of corn with their husks
   pulled back. */
#define CAM_POS vec3(-0.2627,0.3841,-0.7624)
#define CAM_TGT vec3(-0.1344,-0.0295,0.0994)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
vec3 brQ(vec3 p){ return place(p,vec3(-.02,0.,.09),-.35); }
float barnD(vec3 q){ float body=sdRBox(q-vec3(0.,.045,0.),vec3(.065,.045,.05),.002);
  /* gambrel roof in the xy profile, extruded along z */
  vec2 u=q.xy-vec2(0.,.09); float roof=max(max((u.y-(.06-abs(u.x)*.42))*.92,(u.y-(.072-abs(u.x))*2.9)*.33),-u.y);
  float r3=extrude(roof,q.z,.056,.002);
  float door=sdRBox(q-vec3(0.,.03,-.05),vec3(.022,.03,.004),.001);
  float loft=sdRBox(q-vec3(0.,.105,-.052),vec3(.01,.01,.004),.001);
  float d=min(body,r3); d=max(d,-door); d=max(d,-loft);
  return d; }
float siloD(vec3 p){ vec3 q=p-vec3(.1,0.,.12); float c=sdCylY(q-vec3(0.,.075,0.),.032,.075)-.001;
  float dome=length(q-vec3(0.,.15,0.))-.033; dome=max(dome,-(q.y-.15));
  return min(c,dome); }
float cornEar(vec3 q){ /* ear along +x from the stalk end at 0 */
  float t=clamp(q.x/.13,0.,1.); float R=.018*(1.-.45*t*t);
  float ear=max(length(q.yz)-R,abs(q.x-.065)-.065)*.8;
  ear=smin(ear,length(q-vec3(.13,0.,0.))-.009,.008);
  float kern=.0012*sin(q.x*650.)*sin(atan(q.z,q.y)*14.);
  ear+=kern*step(.004,q.x);
  return ear; }
float husk(vec3 q,float a){ vec3 h=q; h.yz=rot(a)*h.yz; float t=clamp(-h.x/.08,0.,1.);
  float w=.02*sin(t*3.1416)+.004; float d=max(max(abs(h.z)-w,abs(h.y-.015-.012*t)-.0012),max(h.x,-.085-h.x));
  return d*.8; }
float cornD(vec3 p){ vec3 a=p-vec3(.13,.018,-.1); a.xz=rot(2.6)*a.xz; vec3 b=p-vec3(.2,.018,-.03); b.xz=rot(2.1)*b.xz;
  return min(cornEar(a),cornEar(b)); }
float husksD(vec3 p){ vec3 a=p-vec3(.13,.018,-.1); a.xz=rot(2.6)*a.xz; vec3 b=p-vec3(.2,.018,-.03); b.xz=rot(2.1)*b.xz;
  float d=1e5; for(int i=0;i<3;i++){ float an=-1.2+1.2*float(i); d=min(d,husk(a,an)); d=min(d,husk(b,an+.4)); } return d; }
#define MB vec3(-.15,0.,-.02)
float mailD(vec3 p){ vec3 q=(p-MB)/.75; q.xz=rot(1.2)*q.xz;
  float post=sdRBox(q-vec3(0.,.05,0.),vec3(.006,.05,.006),.001);
  float foot=sdRBox(q-vec3(0.,.004,0.),vec3(.025,.004,.025),.001);
  vec3 b=q-vec3(0.,.112,0.); float box=max(length(vec2(b.x,max(b.y,0.)))-.02,abs(b.z)-.035); box=min(box,max(max(abs(b.x)-.02,abs(b.z)-.035),max(b.y,-b.y-.014)));
  float flag=sdRBox(q-vec3(.023,.125,.01),vec3(.0015,.012,.004),.0005); flag=min(flag,sdRBox(q-vec3(.023,.137,.018),vec3(.0015,.004,.01),.0005));
  return min(min(post,foot),min(box,flag))*.75; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=brQ(p);
  r=U(r,barnD(q),3.);
  r=U(r,siloD(p),4.);
  r=U(r,cornD(p),5.);
  r=U(r,husksD(p),6.);

  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=brQ(p); if(q.y>.09) return .35+.1*step(.5,fract(q.y/.01));
    if(q.z<-.048&&abs(q.x)<.024&&q.y<.062){ if(abs(abs(q.x)-abs(q.y-.03)*.7)<.002) return .9; return .7; }
    return .5+.06*grain(p.zyx,60.); }
  if(id==4.){ vec3 q=p-vec3(.1,0.,.12); if(q.y>.15) return .6; return fract(q.y/.015)<.12?.45:.78; }
  if(id==5.) return .78;
  if(id==6.) return .6;
  if(id==7.) return .5;
  return .7; }
