/* FCS bench "The Kitchen" (fcs-shop.html) — a whole classroom kitchen counter in pencil, drawn
   at 1600x1000 so each object can be tapped. Every tappable object has its own material id; the
   page reads the id buffer to place its hotspots (pencil/bench.py).
   3 sink  4 faucet  5 soap pump  6 towel  7 cooktop  8 skillet  9 skillet handle  10 cutting board
   11 chef's knife  12 dry measuring cups  13 measuring spoons  14 liquid measuring cup  15 mixing bowl
   16 flour canister  17 recipe card  18 food thermometer  19 refrigerator  20 burner knob
   21 raw-meat board  */
#define CAM_POS vec3(0.21,1.0,-1.1)
#define CAM_TGT vec3(0.21,0.0,0.03)
#define CAM_FOV 38.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
vec3 place(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
#define WALLZ .44
/* ---- sink: a basin cut into the counter, with a steel rim ---- */
#define SK vec3(-.44,0.,.12)
float basinHole(vec3 p){ return sdRBox(p-SK-vec3(0.,-.09,0.),vec3(.155,.1,.125),.035); }
float rimD(vec3 p){ vec3 q=p-SK; float o=sdRBox(q-vec3(0.,.003,0.),vec3(.18,.003,.15),.02); return max(o,-sdRBox(q,vec3(.152,.02,.122),.03)); }
float drainD(vec3 p){ vec3 q=p-SK-vec3(0.,-.188,0.); return max(sdTorus(q,.018,.004),q.y-.004); }
/* ---- faucet: base, gooseneck and a lever ---- */
float faucetD(vec3 p){ vec3 q=p-vec3(SK.x,0.,.31);
  float base=sdCylY(q-vec3(0.,.012,0.),.028,.012)-.003;
  float col=sdCylY(q-vec3(0.,.11,0.),.014,.1);
  /* the neck: an arc in the y-z plane from the column top toward the basin */
  vec3 a=q-vec3(0.,.21,-.07); float arcD=length(vec2(length(a.yz)-.07,a.x))-.012; arcD=max(arcD,-a.y);
  float spout=sdCylY(q-vec3(0.,.18,-.14),.013,.03);
  float tip=sdCylY(q-vec3(0.,.148,-.14),.016,.006)-.002;
  float lever=sdCapsule(q,vec3(.02,.1,0.),vec3(.085,.13,-.01),.007);
  return min(min(min(base,col),min(arcD,spout)),min(tip,lever)); }
/* ---- soap pump bottle ---- */
float soapD(vec3 p){ vec3 q=place(p,vec3(-.2,0.,.33),.3);
  float body=sdRBox(q-vec3(0.,.07,0.),vec3(.035,.07,.024),.018);
  float neck=sdCylY(q-vec3(0.,.15,0.),.011,.012);
  float pump=sdCylY(q-vec3(0.,.172,0.),.007,.014);
  float head=sdRBox(q-vec3(-.012,.19,0.),vec3(.022,.006,.009),.004);
  return min(min(body,neck),min(pump,head)); }
/* ---- a folded towel lying at the front of the sink ---- */
float towelD(vec3 p){ vec3 q=place(p,vec3(-.47,0.,-.2),-.12);
  float d=sdRBox(q-vec3(0.,.014,0.),vec3(.11,.014,.07),.01)+.0015*sin(q.x*90.)*smoothstep(.04,.07,abs(q.z));
  float fold=sdCapsule(q,vec3(-.11,.02,.07),vec3(.11,.02,.07),.012);
  return min(d,fold); }
/* ---- cooktop with two grates and knobs ---- */
#define CT vec3(-.01,0.,.13)
#define B1 vec3(-.1,0.,.06)
#define B2 vec3(.1,0.,.22)
float cooktopD(vec3 p){ vec3 q=p-CT;
  float slab=sdRBox(q-vec3(0.,.011,0.),vec3(.2,.011,.19),.008);
  float d=slab;
  for(int i=0;i<2;i++){ vec3 b=p-(i==0?B1:B2);
    float cap=sdCylY(b-vec3(0.,.026,0.),.028,.005)-.002;
    float ring=sdTorus(b-vec3(0.,.024,0.),.045,.004);
    vec3 g=b; g.xz=abs(g.xz);
    float bars=min(sdRBox(g-vec3(.065,.034,0.),vec3(.03,.004,.005),.002),sdRBox(g-vec3(0.,.034,.065),vec3(.005,.004,.03),.002));
    float feet=sdRBox(g-vec3(.07,.026,0.),vec3(.004,.008,.004),.001);
    d=min(d,min(min(cap,ring),min(bars,feet))); }
  return d; }
float knobD(vec3 p){ vec3 q=p-vec3(-.1,0.,-.04);
  float k=sdCylY(q-vec3(0.,.03,0.),.02,.008)-.003; k=min(k,sdRBox(q-vec3(0.,.043,0.),vec3(.004,.006,.017),.002));
  vec3 q2=p-vec3(.1,0.,-.04); float k2=sdCylY(q2-vec3(0.,.03,0.),.02,.008)-.003; k2=min(k2,sdRBox(q2-vec3(0.,.043,0.),vec3(.004,.006,.017),.002));
  return min(k,k2); }
/* ---- skillet on the front burner, handle turned in (toward the back, over the counter) ---- */
#define PANA 2.2
float panD(vec3 p){ vec3 q=p-B1-vec3(0.,.04,0.);
  float r=length(q.xz); float outer=max(r-.105-q.y*.18,abs(q.y-.02)-.02)-.002;
  float inner=max(r-.098-q.y*.18,abs(q.y-.026)-.02);
  return max(outer,-inner); }
float handleD(vec3 p){ vec3 q=place(p,B1,PANA);
  return sdCapsule(q,vec3(.11,.058,0.),vec3(.27,.075,0.),.011); }
/* ---- cutting board and chef's knife ---- */
#define BD vec3(.37,0.,.08)
float boardD(vec3 p){ vec3 q=place(p,BD,.08); float d=sdRBox(q-vec3(0.,.012,0.),vec3(.18,.012,.12),.01);
  return max(d,-(length(q.xz-vec2(-.15,.085))-.012)); }
vec3 kQ(vec3 p){ vec3 q=place(p,BD+vec3(.0,.024,-.02),.08+.22); return q; }
float knifeD(vec3 p){ vec3 q=kQ(p);
  /* blade: x from -.14 (tip) to .06, heel at the bolster; spine at +z, edge at -z curving up to the tip */
  float t=clamp((q.x+.14)/.2,0.,1.); float w=.024*sqrt(t)+.002;
  float blade=max(max(abs(q.z-(.024-w))-w,abs(q.y-.002)-.0014),abs(q.x+.04)-.1);
  float bolster=sdRBox(q-vec3(.066,.004,.01),vec3(.006,.006,.016),.003);
  float hdl=sdRBox(q-vec3(.13,.006,.01),vec3(.06,.008,.012),.007);
  return min(blade,min(bolster,hdl)); }
/* ---- measuring cups (nested, one full and level) and spoons on a ring ---- */
float mcup(vec3 p,vec3 c,float r,float h,float a){ vec3 q=p-c; q.xz=rot(a)*q.xz;
  float rr=r*(.85+.15*clamp(q.y/h,0.,1.));
  float outer=sdCylY(q-vec3(0.,h*.5,0.),rr,h*.5)-.002; float inner=sdCylY(q-vec3(0.,h*.5+.004,0.),rr-.004,h*.5);
  float cup=max(outer,-inner);
  float handle=sdRBox(q-vec3(r+.045,h-.003,0.),vec3(.05,.0025,.011),.002);
  return min(cup,max(handle,-(length(q.xz-vec2(r+.085,0.))-.005))); }
#define MC vec3(.16,0.,-.21)
float cupsD(vec3 p){ float d=mcup(p,MC,.055,.055,-2.6);
  d=min(d,mcup(p,MC+vec3(.13,0.,.03),.045,.045,-2.9));
  d=min(d,max(sdCylY(p-MC-vec3(0.,.03,0.),.05,.024),p.y-MC.y-.053)); return d; }
float spoonsD(vec3 p){ vec3 o=vec3(.38,.0,-.34); float d=1e5;
  for(int i=0;i<4;i++){ float fi=float(i); float a=2.1+fi*.42; vec3 q=p-o; q.xz=rot(a)*q.xz;
    float r=.027-fi*.004; vec3 b=q-vec3(-.07-r,r,0.); float bowl=max(abs(length(b)-r)-.0018,b.y);
    float hdl=sdRBox(q-vec3(-.033,.0035+fi*.0012,0.),vec3(.037,.0018,.006),.0015);
    d=min(d,min(bowl,hdl)); }
  return min(d,sdTorus((p-o-vec3(.0,.008,0.)).xzy,.011,.002)); }
/* ---- glass liquid measuring cup with a spout and handle ---- */
#define LC vec3(.66,0.,.17)
vec3 lq(vec3 p){ return place(p,LC,2.6); }
float liqD(vec3 p){ vec3 q=lq(p); float r=.055+q.y*.05+.01*smoothstep(.1,.13,q.y)*smoothstep(-.02,-.05,q.x);
  float wall=max(abs(length(q.xz)-r)-.0025,abs(q.y-.065)-.065); float bot=sdCylY(q-vec3(0.,.004,0.),.055,.004);
  vec3 h=q-vec3(.07,.075,0.); float handle=max(sdRBox(h,vec3(.028,.045,.007),.006),-sdRBox(h-vec3(.008,0.,0.),vec3(.018,.034,.02),.004));
  return min(min(wall,bot),max(handle,.055-q.x)); }
/* ---- mixing bowl ---- */
float bowlD(vec3 p){ vec3 q=p-vec3(.6,0.,-.15); float r=length(q.xz);
  vec3 c=q-vec3(0.,.15,0.); float s=abs(length(c)-.15)-.003; s=max(s,q.y-.085);
  float foot=sdTorus(q-vec3(0.,.006,0.),.05,.005);
  float lip=sdTorus(q-vec3(0.,.085,0.),sqrt(.15*.15-.065*.065),.005);
  return min(min(s,foot),lip); }
/* ---- flour canister with a lid ---- */
float canD(vec3 p){ vec3 q=p-vec3(.5,0.,.33);
  float body=sdCylY(q-vec3(0.,.08,0.),.065,.08)-.003;
  float lid=sdCylY(q-vec3(0.,.168,0.),.07,.008)-.003;
  float knob=length(q-vec3(0.,.185,0.))-.014;
  return min(min(body,lid),knob); }
/* ---- recipe card on a little stand, leaning back toward the wall ---- */
vec3 rq(vec3 p){ vec3 q=place(p,vec3(.24,0.,.36),-.05); q.yz=rot(.22)*q.yz; return q; }
float cardD(vec3 p){ vec3 q=rq(p); float c=sdRBox(q-vec3(0.,.09,0.),vec3(.085,.07,.0015),.002);
  float stand=sdRBox(p-vec3(.24,.006,.33),vec3(.07,.006,.02),.004); return min(c,stand); }
/* ---- a probe food thermometer lying at the front ---- */
vec3 tq(vec3 p){ return place(p,vec3(-.02,0.,-.37),-.12); }
float thermoD(vec3 p){ vec3 q=tq(p);
  float dial=sdCylY(q-vec3(-.1,.012,0.),.028,.008)-.003;
  float stem=sdCapsule(q,vec3(-.07,.008,0.),vec3(.12,.004,0.),.0035);
  float clip=sdRBox(q-vec3(-.06,.012,.0),vec3(.012,.003,.006),.002);
  return min(min(dial,stem),clip); }
/* ---- raw chicken on its own (separate) board ---- */
#define RB vec3(-.22,0.,-.24)
float meatBoardD(vec3 p){ vec3 q=place(p,RB,-.1);
  float b=sdRBox(q-vec3(0.,.008,0.),vec3(.1,.008,.07),.008);
  vec3 m=q-vec3(-.01,.028,0.); m.xz=rot(.5)*m.xz;
  float drum=smin(sdEll(m-vec3(-.02,0.,0.),vec3(.045,.02,.028)),sdCapsule(m,vec3(.01,-.002,0.),vec3(.06,-.004,0.),.008),.02);
  float bone=length(m-vec3(.068,-.004,0.))-.011;
  return min(b,min(drum,bone)); }
/* ---- a refrigerator standing at the right end of the counter ---- */
float fridgeD(vec3 p){ vec3 q=p-vec3(1.0,0.,.14);
  float body=sdRBox(q-vec3(0.,.5,0.),vec3(.2,.5,.26),.02);
  float seam=sdBox(q-vec3(0.,.46,-.26),vec3(.21,.004,.01));
  body=max(body,-seam);
  float h1=sdRBox(q-vec3(-.15,.36,-.285),vec3(.008,.07,.01),.006);
  float h2=sdRBox(q-vec3(-.15,.12,-.285),vec3(.008,.07,.01),.006);
  return min(body,min(h1,h2)); }
vec2 map(vec3 p){
  float hole=basinHole(p);
  float tab=max(p.y,-hole);
  vec2 r=vec2(tab,(p.y<-.004)?3.:1.);
  r=U(r,WALLZ-p.z,2.);
  r=U(r,rimD(p),3.);
  r=U(r,drainD(p),3.);
  r=U(r,faucetD(p),4.);
  r=U(r,soapD(p),5.);
  r=U(r,towelD(p),6.);
  r=U(r,cooktopD(p),7.);
  r=U(r,panD(p),8.);
  r=U(r,handleD(p),9.);
  r=U(r,boardD(p),10.);
  r=U(r,knifeD(p),11.);
  r=U(r,cupsD(p),12.);
  r=U(r,spoonsD(p),13.);
  r=U(r,liqD(p),14.);
  r=U(r,bowlD(p),15.);
  r=U(r,canD(p),16.);
  r=U(r,cardD(p),17.);
  r=U(r,thermoD(p),18.);
  r=U(r,fridgeD(p),19.);
  r=U(r,knobD(p),20.);
  r=U(r,meatBoardD(p),21.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .74;
  if(id==2.){ /* tiled backsplash: a few joint lines */
    vec2 u=p.xy/vec2(.15,.075); u.x+=.5*mod(floor(u.y),2.);
    vec2 f=abs(fract(u)-.5); return (min(f.x*.15,f.y*.075)<.0025)?.62:.9; }
  if(id==3.) return p.y<-.004?.58:.8;
  if(id==4.) return .78;
  if(id==5.){ vec3 q=place(p,vec3(-.2,0.,.33),.3); if(q.y>.14) return .4; if(abs(q.y-.07)<.028&&q.z<0.) return .92; return .62; }
  if(id==6.){ vec3 q=place(p,vec3(-.47,0.,-.2),-.12); return abs(abs(q.x)-.07)<.008?.45:.85; }
  if(id==7.){ vec3 q=p-CT; return q.y>.024?.3:.45; }
  if(id==8.) return .3;
  if(id==9.) return .32;
  if(id==10.) return .66+.1*grain(place(p,BD,.08),60.);
  if(id==11.){ vec3 q=kQ(p); return q.x>.058?.22:.86; }
  if(id==12.) return .68;
  if(id==13.) return .7;
  if(id==14.){ vec3 q=lq(p); if(q.z<-.02&&q.x<.04){ for(int i=1;i<6;i++){ float y=float(i)*.021; if(abs(q.y-y)<.0014&&abs(q.x)<(i%2==0?.022:.012)) return .15; } } return .95; }
  if(id==15.) return .82;
  if(id==16.){ vec3 q=p-vec3(.5,0.,.33); return q.y>.158?.5:(abs(q.y-.09)<.03&&q.z<0.?.92:.72); }
  if(id==17.){ vec3 q=rq(p); if(q.z>0.||q.y<.02) return .6; vec2 u=q.xy-vec2(0.,.09);
    if(abs(u.y-.045)<.004&&abs(u.x)<.05) return .2;
    for(int i=0;i<5;i++){ float y=.02-float(i)*.018; if(abs(u.y-y)<.002&&u.x>-.06&&u.x<.05-float(i%2)*.02) return .45; }
    return .95; }
  if(id==18.){ vec3 q=tq(p); if(length(q.xz-vec2(-.1,0.))<.024&&q.y>.018) return .95; return .45; }
  if(id==19.){ vec3 q=p-vec3(1.0,0.,.14); return q.x<-.13&&q.z<-.27?.35:(abs(q.y-.46)<.01&&q.z<-.25?.4:.86); }
  if(id==20.) return .35;
  if(id==21.){ vec3 q=place(p,RB,-.1); return q.y>.016?.72:.5; }
  return .7; }
