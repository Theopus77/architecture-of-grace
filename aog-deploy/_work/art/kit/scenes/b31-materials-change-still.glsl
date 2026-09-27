/* b31 "Materials and How They Change" — a lit candle in a saucer holder with a drip of wax,
   a shallow dish of melting ice cubes in a little water, and a burnt match. */
#define CAM_POS vec3(-0.3499,0.2354,-0.6247)
#define CAM_TGT vec3(-0.1238,-0.0057,0.0835)
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
#define CD vec3(-.05,0.,.1)
float holder(vec3 p){ vec3 q=p-CD;
  float s=sdCylY(q-vec3(0.,.008,0.),.07,.004)-.003;
  s=min(s,sdTorus(q-vec3(0.,.014,0.),.07,.004));
  float cup=sdCylY(q-vec3(0.,.025,0.),.03,.014)-.002; cup=max(cup,-sdCylY(q-vec3(0.,.04,0.),.026,.01));
  vec3 h=q-vec3(.085,.012,0.); float ring=sdTorus(h.xzy*vec3(1.,1.,1.),.017,.0035);
  return min(min(s,cup),ring); }
float candle(vec3 p){ vec3 q=p-CD;
  float c=sdCylY(q-vec3(0.,.075,0.),.026,.05)-.002;
  float a=atan(q.z,q.x);
  c-=.004*smoothstep(.13,.12,q.y)*smoothstep(.02,.0,abs(a+1.8))*smoothstep(.07,.12,q.y);   /* a wax drip */
  c=smin(c,sdCapsule(q,vec3(.024*cos(-1.8),.12,.024*sin(-1.8)),vec3(.027*cos(-1.8),.08,.027*sin(-1.8)),.004),.004);
  c=max(c,-sdCylY(q-vec3(0.,.13,0.),.02,.006));
  float wick=sdCapsule(q,vec3(0.,.12,0.),vec3(.001,.138,0.),.0012);
  return min(c,wick); }
float flame(vec3 p){ vec3 q=p-CD-vec3(0.,.15,0.);
  float k=clamp((q.y+.012)/.05,0.,1.);
  return length(vec3(q.x,q.y*.42,q.z))-(.009*(1.-k*k)+.001); }
#define DS vec3(.15,0.,-.02)
float dish(vec3 p){ vec3 q=p-DS;
  float o=sdCylY(q-vec3(0.,.012,0.),.095+q.y*.3,.012)-.002;
  float i=sdCylY(q-vec3(0.,.018,0.),.09+q.y*.3,.012);
  return max(o,-i); }
float ice(vec3 p){ vec3 q=p-DS; float d=1e5;
  for(int i=0;i<3;i++){ float fi=float(i); vec3 c=vec3(cos(fi*2.2+.4)*.042,.036-.005*fi,sin(fi*2.2+.4)*.036);
    vec3 k=q-c; k.xz=rot(fi*.7+.3)*k.xz; k.xy=rot(.12*fi)*k.xy;
    d=min(d,sdRBox(k,vec3(.026-.004*fi),.003+.003*fi)); }
  return d; }
float water(vec3 p){ vec3 q=p-DS; return max(sdCylY(q-vec3(0.,.011,0.),.088,.003),-1.); }
vec3 mQ(vec3 p){ vec3 q=p-vec3(.04,.003,-.12); q.xz=rot(.35)*q.xz; return q; }
float match(vec3 p){ vec3 q=mQ(p);
  float st=sdRBox(q,vec3(.045,.0022,.0022),.0008);
  float head=sdEll(q-vec3(.047,0.,0.),vec3(.007,.0035,.0035));
  float curl=length(q-vec3(.056,.002,0.))-.0028;
  return min(st,min(head,curl)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,holder(p),3.);
  r=U(r,candle(p),4.);
  r=U(r,flame(p),5.);
  r=U(r,dish(p),6.);
  r=U(r,ice(p),7.);
  r=U(r,water(p),8.);
  r=U(r,match(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .38;
  if(id==4.){ vec3 q=p-CD; if(q.y>.136) return .15; return .9; }
  if(id==5.){ vec3 q=p-CD-vec3(0.,.15,0.); return q.y<-.004?.55:.97; }
  if(id==6.) return .8;
  if(id==7.){ return abs(n.y)>.8?.95:.78; }
  if(id==8.) return .7;
  if(id==9.){ vec3 q=mQ(p); return q.x>.03?.12:.72; }
  return .7; }
