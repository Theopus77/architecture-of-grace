/* Practice room "Then and Now" — pencil still life: an hourglass with its sand half run through
   (time passing), an old iron key, and a small wooden picture frame leaning back (a keepsake;
   the picture is only a soft landscape, no people). */
#define CAM_POS vec3(-0.3948,0.3896,-0.7907)
#define CAM_TGT vec3(-0.2603,-0.0432,0.1116)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define HG vec3(0.,0.,.05)
#define HH .19
#define FR vec3(-.15,0.,.07)
#define KY vec3(.08,.006,-.1)
float capsD(vec3 q){ float d=cylS(q,.05,.012,.003); d=min(d,cylS(q-vec3(0.,HH-.012,0.),.05,.012,.003));
  for(int i=0;i<3;i++){ float a=float(i)*2.094+.4; d=min(d,sdCylY(q-vec3(cos(a)*.04,HH*.5,sin(a)*.04),.004,HH*.5-.01)); } return d; }
float glassR(float y){ float t=(y-HH*.5)/(HH*.5-.012); return .006+.03*pow(abs(t),.8); }
float glassD(vec3 q){ float y=clamp(q.y,.012,HH-.012); return max(length(q.xz)-glassR(y),abs(q.y-HH*.5)-(HH*.5-.012)); }
float sandD(vec3 q){ float top=max(length(q.xz)-glassR(q.y)+.002,max(q.y-(HH*.5+.035),HH*.5+.006-q.y));
  float bot=max(length(q.xz)-glassR(q.y)+.002,max(q.y-(.012+.025+.02*exp(-dot(q.xz,q.xz)/.0003)),.012-q.y));
  return min(top,bot); }
vec3 frQ(vec3 p){ vec3 q=p-FR; q.xz=rot(-.35)*q.xz; q.yz=rot(.28)*q.yz; return q; }
float frameD(vec3 q){ float d=sdRBox(q-vec3(0.,.065,0.),vec3(.055,.065,.006),.003); d=max(d,-sdBox(q-vec3(0.,.065,-.006),vec3(.04,.05,.004))); return d; }
float photoD(vec3 q){ return sdBox(q-vec3(0.,.065,-.002),vec3(.041,.051,.001)); }
float legD(vec3 p){ vec3 q=p-FR; q.xz=rot(-.35)*q.xz; return sdCapsule(q,vec3(0.,.07,.03),vec3(0.,.003,.065),.003); }
vec3 kyQ(vec3 p){ vec3 q=p-KY; q.xz=rot(.3)*q.xz; return q/1.5; }
float keyD(vec3 q){ float d=sdCylX(q,.0045,.045); vec3 b=q-vec3(-.06,0.,0.); d=min(d,max(abs(length(b.xz)-.016)-.004,abs(b.y)-.004));
  d=min(d,sdRBox(q-vec3(.036,0.,.01),vec3(.009,.0035,.01),.001)); d=min(d,sdCylX(q-vec3(-.042,0.,0.),.007,.003)-.001); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 h=place(p,HG,.3);
  r=U(r,capsD(h),3.);
  r=U(r,glassD(h),4.);
  r=U(r,sandD(h),5.);
  vec3 f=frQ(p);
  r=U(r,min(frameD(f),legD(p)),6.);
  r=U(r,photoD(f),7.);
  r=U(r,keyD(kyQ(p))*1.5,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .5+.12*grain(place(p,HG,.3),60.);
  if(id==4.) return .93;
  if(id==5.) return .6;
  if(id==6.) return .45;
  if(id==7.){ vec3 f=frQ(p); vec2 u=f.xy-vec2(0.,.065); float hill=-.01+.012*sin(u.x*60.)+.006*sin(u.x*140.+1.);
    if(abs(u.y-hill)<.0015) return .35; if(u.y<hill) return .62; if(length(u-vec2(.02,.03))<.008) return .7; return .88; }
  if(id==8.) return .35;
  return .7; }
