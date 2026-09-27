/* Room m31 "Angles, Triangles and Scale Drawings" — pencil still life: a clear half-circle
   protractor standing on its straight edge, and in front two model houses of exactly the same
   shape, one twice the size of the other (a scale model), with a set square lying flat. */
#define CAM_POS vec3(-0.3361,0.2329,-0.7612)
#define CAM_TGT vec3(-0.1412,-0.0153,0.0807)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define PRR .14
vec3 prQ(vec3 p){ vec3 q=p-vec3(.0,.004,.1); q.xz=rot(.12)*q.xz; return q; }
float protractor(vec3 q){
  float d=max(length(q.xy)-PRR,-q.y); d=max(d,-max(length(q.xy)-PRR*.5,.014-q.y));
  return max(d,abs(q.z)-.003)-.0015; }
/* a model house: walls, a gable roof with eaves and a chimney; s = scale, base at y=0,
   ridge along x */
float houseD(vec3 q,float s){ q/=s;
  float w=sdRBox(q-vec3(0.,.035,0.),vec3(.05,.035,.035),.002);
  vec2 u=vec2(q.z,q.y-.07); float roof=max(-u.y+.0,(abs(u.x)*.034+u.y*.045-.034*.045)/.0564);
  roof=max(roof,abs(q.x)-.056); roof=max(roof,-(u.y+.004))-.002;
  float ch=sdRBox(q-vec3(.028,.1,.01),vec3(.008,.02,.008),.001);
  return min(min(w,roof),ch)*s; }
float houseTone(vec3 q,float s,vec3 n){ q/=s;
  if(q.y>.0705){ float f=fract((q.y-.07)/.009); return f<.18?.35:.55; }   /* shingle rows on the roof */
  if(q.z<-.034){                                                         /* front wall: door and two windows */
    if(abs(q.x+.018)<.009&&q.y<.042) return abs(q.x+.018)>.0075||q.y>.04?.2:.4;
    vec2 w=vec2(q.x-.02,q.y-.038); if(max(abs(w.x)-.011,abs(w.y)-.01)<0.){ if(abs(w.x)<.0008||abs(w.y)<.0008||max(abs(w.x)-.0095,abs(w.y)-.0085)>0.) return .2; return .45; }
  }
  if(q.x>.049){ vec2 w=vec2(q.z,q.y-.038); if(max(abs(w.x)-.01,abs(w.y)-.01)<0.) return max(abs(w.x)-.0085,abs(w.y)-.0085)>0.?.2:.45; }
  return .86; }
vec3 bigQ(vec3 p){ return place(p,vec3(.19,0.,-.04),-.3); }
vec3 smQ(vec3 p){ return place(p,vec3(-.15,0.,-.07),-.3); }
vec3 ssQ(vec3 p){ return place(p,vec3(.05,0.,-.2),.2); }
float setsq(vec3 q){ vec2 u=q.xz; float L=.13;
  float tri=max(max(-u.x,-u.y),(u.x+u.y)/1.414-L*.707);
  float hole=max(max(.028-u.x,.028-u.y),(u.x+u.y)/1.414-L*.707+.04);
  tri=max(tri,-hole);
  return max(tri,abs(q.y-.003)-.002)-.001; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,6.-p.z,2.);
  r=U(r,protractor(prQ(p)),3.);
  r=U(r,houseD(bigQ(p),1.6),4.);
  r=U(r,houseD(smQ(p),.8),5.);
  r=U(r,setsq(ssQ(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=prQ(p); float r=length(q.xy); float a=atan(q.y,q.x); float deg=a/PI*180.;
    float f=abs(fract(deg/10.+.5)-.5)*10.*PI/180.*r, g=abs(fract(deg/2.+.5)-.5)*2.*PI/180.*r;
    if(r>PRR-.03&&f<.0014) return .12; if(r>PRR-.015&&g<.0008) return .35;
    if(abs(r-PRR*.72)<.0012) return .4;
    if(abs(q.x)<.0012&&q.y<PRR*.5) return .3;                         /* centre mark */
    return .84; }
  if(id==4.) return houseTone(bigQ(p),1.6,n);
  if(id==5.) return houseTone(smQ(p),.8,n);
  if(id==6.){ vec3 q=ssQ(p); float f=fract(q.x/.01); if(q.z<.012&&q.x>.03&&q.x<.12&&f<.15) return .2; return .6; }
  return .7; }
