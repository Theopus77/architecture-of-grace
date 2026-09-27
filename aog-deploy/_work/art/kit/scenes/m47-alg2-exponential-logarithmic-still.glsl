/* Room m47 "Algebra II: Exponential and Logarithmic Functions" — pencil still life: a
   nautilus shell standing on its edge (its spiral grows by the same factor every turn:
   exponential growth you can hold), and a wooden slide rule lying in front, its scales
   spaced by logarithms, with the clear cursor on it. */
#define CAM_POS vec3(-0.2795,0.3460,-0.7123)
#define CAM_TGT vec3(-0.1589,-0.0423,0.0969)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 240
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
#define NC vec3(.02,.118,.08)
#define SB .175
#define SA .0049
#define PHM 18.3
vec3 nQ(vec3 p){ vec3 q=p-NC; q.xz=rot(-.2)*q.xz; q.xy=rot(.9)*q.xy; return q; }
float shellD(vec3 q,out float phi){ float r=max(length(q.xy),1e-4); float th=atan(q.y,q.x); float d=1e5; phi=0.;
  float n0=floor((log(r/(SA*.667))/SB-th)/6.2832+.5);
  for(int k=-1;k<=1;k++){ float ph=th+6.2832*(n0+float(k)); if(ph>PHM||ph<0.) continue;
    float Ro=SA*exp(SB*ph); float Rc=Ro*.667, rho=Ro*.333;
    float t=(length(vec2(r-Rc,q.z*1.55))-rho)*.62; if(t<d){ d=t; phi=ph; } }
  return d; }
float shell(vec3 p){ float ph; return shellD(nQ(p),ph); }
vec3 srQ(vec3 p){ vec3 q=p-vec3(.0,.0,-.1); q.xz=rot(-.1)*q.xz; return q; }
float srD(vec3 q){ float st=sdRBox(q-vec3(0.,.005,0.),vec3(.14,.005,.03),.0015);
  st=max(st,-sdBox(q-vec3(0.,.009,0.),vec3(.15,.003,.012)));
  float slide=sdRBox(q-vec3(.035,.0065,0.),vec3(.14,.0028,.0115),.001);
  return min(st,slide); }
float cursorD(vec3 q){ vec3 c=q-vec3(-.04,.0115,0.); float f=sdRBox(c,vec3(.018,.0016,.034),.001);
  f=max(f,-sdBox(c,vec3(.014,.01,.028)));
  float glass=sdBox(c-vec3(0.,.0,0.),vec3(.015,.0006,.03));
  return min(f,glass); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,shell(p),3.);
  vec3 s=srQ(p);
  r=U(r,srD(s),4.);
  r=U(r,cursorD(s),5.);
  return r; }
float logTicks(float x,float L){ float u=(x+L)/(2.*L); if(u<0.||u>1.) return 0.; float v=pow(10.,u);
  float f=abs(v-floor(v+.5)); float dv=v*log(10.)/(2.*L)*.0009; if(f<dv*1.2) return 1.;
  float f2=abs(v*2.-floor(v*2.+.5)); if(v<5.&&f2<dv*2.) return .5; return 0.; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=nQ(p); float ph; float d=shellD(q,ph); float Ro=SA*exp(SB*ph); float r=length(q.xy);
    float rel=(r-Ro*.334)/(Ro*.667);
    float stripe=sin(ph*7.+rel*5.)*.5+.5; if(ph>PHM-3.5) stripe=1.;
    if(abs(q.z)<.004&&rel<.06) return .3;
    return (stripe<.35&&rel>.35)?.45:.86; }
  if(id==4.){ vec3 q=srQ(p); if(q.y>.0085){ float t;
      if(q.z>.012&&q.z<.03){ t=logTicks(q.x,.125); if(t>0.&&q.z<(t>.9?.024:.018)) return .25; }
      if(q.z>-.0115&&q.z<.0115&&q.y>.0088){ t=logTicks(q.x-.035,.125); if(t>0.&&q.z>(t>.9?-.004:.002)) return .25; }
    } return .85; }
  if(id==5.){ vec3 q=srQ(p)-vec3(-.04,.0115,0.); if(abs(q.x)<.0008) return .2; if(abs(q.x)<.014&&abs(q.z)<.028) return .95; return .55; }
  return .7; }
