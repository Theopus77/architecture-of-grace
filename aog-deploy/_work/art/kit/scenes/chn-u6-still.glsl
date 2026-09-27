/* Chinese Classics Unit 6 "Key Teachings of the Dao" — pencil still life: a round stone
   disc carved with the yin-yang, standing in a low wooden stand; a rough, uncarved block of
   wood (pu, simplicity); and a shallow bowl of still water. */
#define CAM_POS vec3(-0.4561,0.2388,-0.8907)
#define CAM_TGT vec3(-0.2327,0.0256,0.1145)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define DC vec3(0.,.145,.12)
#define DR .12
#define DRY -.25
vec3 dQ(vec3 p){ vec3 q=p-DC; q.xz=rot(DRY)*q.xz; return q; }
/* signed yin-yang: <0 on the dark half */
float yy(vec2 u){ float r=DR*.86; float s=u.x<0.?1.:-1.;
  float d=u.x; float top=length(u-vec2(0.,r*.5))-r*.5, bot=length(u-vec2(0.,-r*.5))-r*.5;
  float yin=u.x>0.?1.:-1.; if(top<0.) yin=-1.; if(bot<0.) yin=1.;
  return yin; }
float disc(vec3 p){ vec3 q=dQ(p);
  float d=sdCylZ(q,DR,.014)-.003;
  float rim=abs(length(q.xy)-DR*.9)-.003; d=max(d,-max(rim,-(-q.z-.013)));   /* a cut ring round the face */
  /* the S-curve and the two eyes, cut into the front face */
  float r=DR*.86; vec2 u=q.xy;
  float s=u.x>0.?abs(length(u-vec2(0.,r*.5))-r*.5):abs(length(u-vec2(0.,-r*.5))-r*.5);
  s=max(s,length(u)-r);
  float eye=min(abs(length(u-vec2(0.,r*.5))-r*.13),abs(length(u-vec2(0.,-r*.5))-r*.13));
  float g=min(s,eye)-.0025; d=max(d,-max(g,-(-q.z-.013)));
  return d; }
float stand(vec3 p){ vec3 q=p-vec3(DC.x,0.,DC.z); q.xz=rot(DRY)*q.xz;
  float d=sdRBox(q-vec3(0.,.018,0.),vec3(.08,.018,.035),.006);
  d=max(d,-(length(q.xy-vec2(0.,.145))-DR-.004));
  vec3 f=vec3(abs(q.x)-.06,q.y-.003,q.z); d=min(d,sdRBox(f,vec3(.018,.004,.04),.003));
  return d; }
#define BK vec3(-.25,0.,-.02)
float block(vec3 p){ vec3 q=p-BK; q.xz=rot(.45)*q.xz;
  float d=sdRBox(q-vec3(0.,.045,0.),vec3(.06,.045,.045),.012);
  d+=.003*(fbm3(q*25.)-.5); return d; }
#define BW vec3(.27,0.,-.02)
float bowl(vec3 p){ vec3 q=p-BW;
  vec3 b=q-vec3(0.,.075,0.);
  float d=(length(b/vec3(.085,.075,.085))-1.)*.075; d=max(d,b.y-.0);
  d=max(d,-((length(b/vec3(.078,.068,.078))-1.)*.068)); d=max(d,-q.y+.004);
  d=min(d,sdTorus(b,.0815,.004));
  d=min(d,sdCylY(q-vec3(0.,.006,0.),.04,.006));
  return d; }
float water(vec3 p){ vec3 q=p-BW; return max(q.y-.066,(length((q-vec3(0.,.075,0.))/vec3(.078,.068,.078))-1.)*.068); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,disc(p),3.);
  r=U(r,stand(p),4.);
  r=U(r,block(p),5.);
  r=U(r,bowl(p),6.);
  r=U(r,water(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=dQ(p); if(q.z>-.012) return .5; float r=DR*.86; vec2 u=q.xy; float l=length(u);
    if(l>r+.002) return .55; if(l>r-.002) return .25;
    float yin=u.x>0.?1.:-1.; if(length(u-vec2(0.,r*.5))<r*.5) yin=-1.; if(length(u-vec2(0.,-r*.5))<r*.5) yin=1.;
    if(length(u-vec2(0.,r*.5))<r*.13) yin=1.; if(length(u-vec2(0.,-r*.5))<r*.13) yin=-1.;
    return yin<0.?.2:.82; }
  if(id==4.) return .4+.15*grain(p,40.);
  if(id==5.) return .55+.2*grain(p.zyx,25.);
  if(id==6.) return .78;
  if(id==7.){ vec3 q=p-BW; float r=length(q.xz); return fract(r/.018)<.12&&r<.06?.6:.85; }
  return .7; }
