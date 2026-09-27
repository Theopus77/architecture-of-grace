/* r9 "Sikhism, Jainism, and the Traditions of Africa and the Americas" — objects only, no
   figures: a carved wooden hand drum with a laced skin head (traditions carried by voice and
   ceremony), a plain steel plate and bowl from a shared community meal, and a steel bracelet
   lying beside them.
   @params {"mat":{"3":[0.5,1.3,1.0],"4":[0.82,1.1,0.8],"5":[0.4,1.3,0.9],"6":[0.3,1.0,0.6],"7":[0.45,1.4,1.0],"8":[0.6,1.4,1.0]},
            "texlines":{"3":[0.12,0.4,0.7],"4":[0.12,0.4,0.5],"5":[0.12,0.4,0.7]}} */
#define CAM_POS vec3(-0.4032,0.5174,-1.0259)
#define CAM_TGT vec3(-0.2333,-0.0297,0.1141)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* djembe: goblet body, skin head, rope ring and lacing */
#define DJ vec3(-.02,0.,.12)
#define DH .24
float djR(float y){ float t=clamp(y/DH,0.,1.);
  float bowl=.078*sqrt(max(1.-pow((t-.78)/.32,2.),0.));
  float stem=.034+.02*smoothstep(.45,.0,t)+.012*smoothstep(.12,.0,t);
  return max(bowl,stem); }
float drum(vec3 p){ vec3 q=p-DJ; float r=length(q.xz);
  float d=(r-djR(q.y))*.75; d=max(d,max(-q.y,q.y-DH+.004));
  d=max(d,-max(r-djR(q.y)+.006,max(-q.y+.004,-(q.y-.02))*-1.));
  return d; }
float head(vec3 p){ vec3 q=p-DJ-vec3(0.,DH,0.); return sdCylY(q+vec3(0.,.003,0.),.074,.004)-.002; }
float rope(vec3 p){ vec3 q=p-DJ; float r=length(q.xz); float a=atan(q.z,q.x);
  float ring=min(sdTorus(q-vec3(0.,DH-.012,0.),.079,.0042),sdTorus(q-vec3(0.,.1,0.),djR(.1)+.004,.004));
  /* diagonal cords between the two rings, wrapped on the bowl */
  float y=q.y; float t=clamp((y-.1)/(DH-.012-.1),0.,1.);
  float n=14.; float ph=a*n/6.2832+t*.5; float c1=abs(fract(ph)-.5), c2=abs(fract(a*n/6.2832-t*.5)-.5);
  float cord=(min(c1,c2)/n*6.2832*r)-.0022;
  cord=max(cord,r-djR(y)-.0035); cord=max(cord,abs(y-(.1+DH-.012)*.5)-(DH-.012-.1)*.5);
  cord=max(cord,-(r-djR(y)-.0005));
  return min(ring,cord); }
/* steel plate (thali) with a small bowl on it */
#define TH vec3(.17,0.,-.03)
float plate(vec3 p){ vec3 q=p-TH; float r=length(q.xz);
  float d=max(abs(q.y-.003)-.0018,r-.1);
  d=min(d,max(max(abs(q.y-.01)-.008,abs(r-.098)-.0018),-q.y));
  d=min(d,sdTorus(q-vec3(0.,.018,0.),.098,.0025));
  return d; }
float katori(vec3 p){ vec3 q=p-TH-vec3(.025,.005,.035); float r=length(q.xz);
  float o=max(r-.036+.006*smoothstep(.028,0.,q.y),abs(q.y-.014)-.014)-.001;
  float i=max(r-.032+.006*smoothstep(.028,0.,q.y-.003),q.y-.03);
  float d=max(o,-max(i,-(q.y-.004)));
  return min(d,sdTorus(q-vec3(0.,.028,0.),.035,.0018)); }
float kara(vec3 p){ vec3 q=p-vec3(.06,.0045,-.14); q.xz=rot(.4)*q.xz; q.xy=rot(.05)*q.xy;
  vec2 w=vec2(length(q.xz)-.034,q.y); return length(w*vec2(1.,.7))-.0045; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,drum(p),3.);
  r=U(r,head(p),4.);
  r=U(r,rope(p),5.);
  r=U(r,plate(p),6.);
  r=U(r,katori(p),7.);
  r=U(r,kara(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-DJ; float a=atan(q.z,q.x);
    if(q.y<.1&&q.y>.025&&abs(fract(a*3./6.2832)-.5)<.12&&abs(fract(q.y/.018)-.5)<.2) return .25;   /* carved bands */
    return .48+.14*(grain(vec3(q.y,0.,a*.1),30.)-.5); }
  if(id==4.){ vec3 q=p-DJ; return .8+.06*fbm(q.xz*80.); }
  if(id==5.) return .38;
  if(id==6.){ vec3 q=p-TH; float r=length(q.xz); if(n.y>.8&&abs(r-.075)<.0025) return .3; if(n.y>.8&&abs(atan(q.z,q.x)+2.4)<.25&&r<.085&&r>.02) return .92; return .5; }
  if(id==7.){ vec3 q=p-TH-vec3(.025,.005,.035); if(n.y>.5&&length(q.xz)<.03) return .3; if(abs(atan(q.z,q.x)+2.3)<.2) return .95; return .62; }
  if(id==8.) return .6;
  return .7; }
