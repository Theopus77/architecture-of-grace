/* Practice room "Ecosystems" — pencil still life: a small fern growing out of a glass jar of
   soil and moss, a pinecone, and a mushroom (producer, the forest floor, a decomposer). */
#define CAM_POS vec3(-0.2908,0.3415,-0.6735)
#define CAM_TGT vec3(-0.1748,-0.0318,0.1044)
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
#define JAR vec3(0.,0.,.05)
#define JH .08
#define CONE vec3(-.15,.028,-.06)
#define MUSH vec3(.15,0.,-.07)
float jarG(vec3 q){ float d=sdCylY(q-vec3(0.,JH*.5,0.),.058,JH*.5)-.003; d=max(d,-sdCylY(q-vec3(0.,JH*.5+.006,0.),.053,JH*.5)); 
  d=min(d,sdTorus(q-vec3(0.,JH,0.),.056,.0035)); return d; }
float mossD(vec3 q){ return sdCylY(q-vec3(0.,JH*.5,0.),.054,JH*.5-.012)-.004*fbm(q.xz*120.); }
/* one fern frond: a rachis arching up and out along direction a, with paired leaflets */
float frond(vec3 q,float a,float L,float up){
  q.xz=rot(a)*q.xz;                            /* frond plane is x-y, leaning out along +x */
  float bd=length(q-vec3(L*.35,L*.45,0.))-L*.75; if(bd>.02) return bd;
  float d=1e3;
  for(int i=0;i<12;i++){ float t=float(i)/11.;
    float ang=mix(up,-.2,t); vec3 c=vec3(L*.6*t*t+L*.25*t,L*sin(t*1.6)*.75,0.);
    float w=L*.2*(1.-t*.85);
    vec2 dir=vec2(cos(ang),sin(ang));
    vec3 n=vec3(-dir.y,dir.x,0.)*.3+vec3(0.,0.,1.);
    d=min(d,sdCapsule(q,c,c+normalize(vec3(0.,-.25,1.))*w,.0032));
    d=min(d,sdCapsule(q,c,c+normalize(vec3(0.,-.25,-1.))*w,.0032));
    if(i<11){ float t2=float(i+1)/11.; vec3 c2=vec3(L*.6*t2*t2+L*.25*t2,L*sin(t2*1.6)*.75,0.); d=min(d,sdCapsule(q,c,c2,.0018)); } }
  return d; }
float fernD(vec3 p){ vec3 q=p-JAR-vec3(0.,JH-.01,0.);
  float d=frond(q,.3,.125,1.3); d=min(d,frond(q,2.5,.115,1.3)); d=min(d,frond(q,-1.6,.105,1.3)); d=min(d,frond(q,1.3,.09,1.4));
  return d; }
vec3 coneQ(vec3 p){ vec3 q=p-CONE; q.xz=rot(.6)*q.xz; q.xy=rot(1.45)*q.xy; return q; }
vec2 scl(vec3 q){ float a=atan(q.z,q.x)/(2.*PI); return vec2(fract(q.y*55.+a*8.),fract(q.y*55.-a*13.)); }
float coneD(vec3 q){ vec2 f=scl(q); float e=min(min(f.x,1.-f.x),min(f.y,1.-f.y));
  float bump=.006*smoothstep(0.,.25,e);
  float d=sdEll(q,vec3(.03,.052,.03))-bump*smoothstep(-.052,-.03,q.y);
  d=min(d,sdCapsule(q,vec3(0.,.045,0.),vec3(0.,.06,0.),.004));
  return d*.7; }
float mushStem(vec3 q){ return sdCone(q-vec3(0.,.025,0.),.013,.009,.025)-.001; }
float mushCap(vec3 q){ vec3 c=q-vec3(0.,.048,0.); float d=sdEll(c,vec3(.042,.028,.042)); d=max(d,-c.y+.002); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 j=p-JAR;
  r=U(r,jarG(j),3.);
  r=U(r,mossD(j),4.);
  r=U(r,fernD(p),5.);
  r=U(r,coneD(coneQ(p)),6.);
  vec3 m=place(p,MUSH,.3);
  r=U(r,mushStem(m),7.);
  r=U(r,mushCap(m),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-JAR; if(q.y<JH-.014) return .45+.2*fbm(q.xy*150.); return .9; }  /* soil seen through the glass */
  if(id==4.) return .35+.25*vn(p.xz*500.);
  if(id==5.) return .45;
  if(id==6.){ vec3 q=coneQ(p); vec2 f=scl(q); float e=min(min(f.x,1.-f.x),min(f.y,1.-f.y)); return e<.07?.2:.55+.2*e; }
  if(id==7.) return .85;
  if(id==8.){ vec3 c=place(p,MUSH,.3)-vec3(0.,.048,0.); if(c.y<.004) return .35; return .6+.15*fbm(c.xz*80.); }
  return .7; }
