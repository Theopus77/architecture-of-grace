/* FACS project 5 "Felt bookmark with a running stitch" — pencil still life: a long felt
   bookmark with a pointed end and a tassel, lying on the table, an even pale running stitch all
   round its edge, the floss running on to a blunt tapestry needle, a ruler behind it and a stick
   of chalk in front. */
#define CAM_POS vec3(-0.2071,0.2590,-0.3961)
#define CAM_TGT vec3(-0.0795,-0.0342,0.0781)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "projparts.glsl"
/* bookmark-local: x along its length, z across, y up from the table */
#define BC vec3(.0,0.,.03)
#define BR .32
vec3 bmL(vec3 p){ vec3 q=p-BC; q.xz=rot(BR)*q.xz; return q; }
vec3 bmW(vec3 l){ l.xz=rot(-BR)*l.xz; return l+BC; }
float stitchMask(vec3 l){ vec2 h=vec2(.083,.017); vec2 a=abs(l.xz);
  float dl=abs(max(a.x-h.x,a.y-h.y)); if(a.x-h.x>0.&&a.y-h.y>0.) dl=length(a-h);
  float s=a.x>h.x-.0005?(h.x+a.y):a.x; s+=l.x<0.?.2:0.; s+=l.z<0.?.37:0.;
  float dash=step(fract(s/.013),.55);
  return dash*smoothstep(.0024,.0009,dl); }
float bookmark(vec3 p){ vec3 l=bmL(p);
  float d=sdRBox(l-vec3(0.,.0024,0.),vec3(.092,.0024,.026),.0015);
  d=max(d,dot(vec2(abs(l.z),l.x),normalize(vec2(1.,1.)))-.092*.7071-.0001);   /* a pointed end */
  return d; }
float tassel(vec3 p){ vec3 e=bmW(vec3(-.09,.0025,0.)); float d=length((p-e)*vec3(1.,1.2,1.))-.0055;
  vec3 k=bmW(vec3(-.108,.004,0.)); d=min(d,sdEll(p-k,vec3(.007,.0055,.0065)));
  for(int i=0;i<7;i++){ float a=(float(i)-3.)*.12; vec3 t=bmW(vec3(-.15-.004*abs(float(i)-3.),.0016,.0)); t.xz=k.xz+rot(a)*(t.xz-k.xz);
    d=min(d,sdCapsule(p,k,t,.0017)); }
  return d; }
#define NP vec3(.15,.004,-.07)
float needle(vec3 p){ vec3 q=p-NP; q.xz=rot(-.2)*q.xz;
  float d=sdCapsule(q,vec3(-.035,0.,0.),vec3(.035,0.,0.),.0024);
  d=smin(d,sdEll(q-vec3(-.036,0.,0.),vec3(.006,.0024,.0034)),.002);
  d=max(d,-sdRBox(q-vec3(-.037,0.,0.),vec3(.0035,.01,.0011),.0008));
  return d; }
float floss(vec3 p){
  vec3 a=bmW(vec3(.083,.005,-.017)), b=bmW(vec3(.1,.0016,-.035)), c=(b+NP)*.5+vec3(0.,0.,.012);
  vec3 ne=NP; ne.xz+=rot(.2)*vec2(-.037,0.);
  float d=sdCapsule(p,a,b,.0011);
  d=min(d,sdCapsule(p,b,c,.0011));
  d=min(d,sdCapsule(p,c,ne,.0011));
  return d; }
float ruler(vec3 p){ vec3 q=p-vec3(.02,0.,.1); q.xz=rot(.1)*q.xz; return sdRBox(q-vec3(0.,.0025,0.),vec3(.16,.0025,.017),.001); }
float chalk(vec3 p){ vec3 q=p-vec3(-.04,.005,-.07); q.xz=rot(.2)*q.xz; return sdCapsule(q,vec3(-.022,0.,0.),vec3(.022,0.,0.),.005); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  { float b=bookmark(p); vec3 l=bmL(p); r=U(r,b,4.); }
  r=U(r,tassel(p),5.);
  r=U(r,floss(p),5.);
  r=U(r,needle(p),6.);
  r=U(r,ruler(p),7.);
  r=U(r,chalk(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==4.){ vec3 l=bmL(p); return stitchMask(l)>.3?.97:.5; }
  if(id==5.) return .45;
  if(id==6.) return .55;
  if(id==7.){ vec3 q=p-vec3(.02,0.,.1); q.xz=rot(.1)*q.xz;
    float t=fract(q.x/.01); float big=step(.9,fract(q.x/.05+.1));
    return (q.y>.004&&q.z>.017-(big>0.?.011:.006)&&t<.12)?.3:.82; }
  if(id==8.) return .95;
  return .7; }
