/* Bible Unit 6 "The Land, the Judges and the Kings" - a sheaf of wheat tied with a cord, a sickle and a clay jar (Ruth gleaning). */
#define CAM_POS vec3(-0.4780,0.4982,-0.9834)
#define CAM_TGT vec3(-0.3113,-0.0253,0.1231)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.68,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* ---- still-life object kit (local frame: origin on the table, y up, metres) ---- */
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/max(k1,1e-5); }
float hl(float v,float s,float w){ return fract(v/s)<w?1.:0.; }   /* hint-line stripes */
/* a revolved vessel: radius r at height y, wall w, open at top when w>0 */
float vessel(vec3 q,float r,float H,float w,float k){
  float d=max((length(q.xz)-r)*k,max(-q.y,q.y-H));
  if(w>0.) d=max(d,-max((length(q.xz)-(r-w))*k,max(.006-q.y,q.y-H-1.)));
  return d; }
/* ------------ flame (base at origin, point up) ------------ */
float o_flame(vec3 q){ float t=clamp((q.y+.004)/.05,0.,1.); float r=.0105*pow(sin(3.1416*pow(t,.62)),.8)*(1.-.15*t);
  float d=length(q.xz)-r; d=max(d,max(-q.y-.004,q.y-.046)); return d*.7; }
float t_flame(vec3 q){ return .97; }
/* ------------ clay oil lamp (spout toward +x) ------------ */
float o_lamp(vec3 q){
  float body=(length((q-vec3(0,.026,0))/vec3(.058,.03,.05))-1.)*.03;
  float spout=sdCapsule(q,vec3(.03,.035,0),vec3(.085,.045,0),.012);
  spout=max(spout,-sdCapsule(q,vec3(.06,.05,0),vec3(.09,.056,0),.006));
  float b2=smin(body,spout,.01); b2=max(b2,-(length(q-vec3(-.005,.064,0))-.012));
  float handle=sdTorus((q-vec3(-.06,.035,0)).xzy,.017,.004);
  float foot=sdCylY(q-vec3(0,.004,0),.03,.004);
  return min(min(b2,handle),foot); }
float t_lamp(vec3 q){ return abs(length(q.xz-vec2(-.005,0.))-.024)<.002&&q.y>.05?.35:.55; }
/* ------------ open book lying on the table, tipped toward us; kind 0 two columns, 1 centre block + commentary ------------ */
vec3 obQ(vec3 q){ q.y-=.03; q.yz=rot(-.26)*q.yz; return q; }
float o_bookpages(vec3 q){ q=obQ(q); float x=abs(q.x);
  float lift=.028*sin(clamp(x/.15,0.,1.)*1.9)-.018*exp(-x*50.)+.008;
  return sdBox(vec3(x-.078,q.y-lift*.5,q.z),vec3(.076,max(lift*.5,.003),.108))-.0015; }
float o_bookc(vec3 q,vec3 b){ q.y-=b.y; float c=sdRBox(q,b,.004); float pg=sdBox(q-vec3(.006,0,.006),vec3(b.x,b.y-.005,b.z)); return max(c,-max(pg,-(sdBox(q,b-vec3(.006,.0,.006))))); }
float t_bookc(vec3 q,vec3 b){ q.y-=b.y; if(abs(q.y)<b.y-.006&&(q.x>b.x-.007||q.z>b.z-.007)) return hl(q.y,.003,.4)>0.?.72:.9;
  if(q.z<-b.z+.004&&(abs(q.x-b.x*.6)<.004||abs(q.x+b.x*.6)<.004)) return .2; return .35; }
/* ------------ double scroll lying along x ------------ */
float o_scroll(vec3 q){ float d=1e5;
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 c=q-vec3(0.,.024,s*.03);
    d=min(d,sdCylX(c,.022,.085)-.001); d=min(d,sdCylX(c,.005,.125));
    d=min(d,sdCylX(c-vec3(.1,0,0),.017,.003)-.001); d=min(d,sdCylX(c+vec3(.1,0,0),.017,.003)-.001);
    d=min(d,length(c-vec3(.13,0,0))-.008); d=min(d,length(c+vec3(.13,0,0))-.008); }
  return min(d,sdBox(q-vec3(0.,.0015,0.),vec3(.085,.0012,.03))); }
float t_scroll(vec3 q){ if(abs(q.x)>.087) return .35; if(q.y<.004&&fract(q.x/.01)<.3&&abs(q.x)<.07) return .6; return .88; }
/* ------------ open scroll: two rolls wide apart, sheet between, with column hint-lines ------------ */
float o_scrollopen(vec3 q){ float d=1e5;
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 c=q-vec3(s*.13,.026,0.);
    d=min(d,sdCylZ(c,.024,.075)-.001); d=min(d,sdCylZ(c,.005,.115));
    d=min(d,sdCylZ(c-vec3(0,0,.09),.019,.003)-.001); d=min(d,sdCylZ(c+vec3(0,0,.09),.019,.003)-.001);
    d=min(d,length(c-vec3(0,0,.118))-.008); d=min(d,length(c+vec3(0,0,.118))-.008); }
  return min(d,sdBox(q-vec3(0.,.0015,0.),vec3(.13,.0012,.074))); }
float t_scrollopen(vec3 q){ if(abs(q.z)>.077) return .35; if(abs(q.x)>.108) return .85;
  if(q.y<.004){ float cx=abs(abs(q.x)-.045); if(cx<.034&&abs(q.z)<.06&&fract(q.z/.0085)<.28) return .6; } return .92; }
/* ------------ storage jar (Qumran style when tall), H height ------------ */
float jarR(float y,float H){ float t=clamp(y/H,0.,1.);
  return H*(.18+.13*sin(3.1416*pow(t,.8))-.02*smoothstep(.85,1.,t)+.03*smoothstep(.96,1.,t)); }
float o_jar(vec3 q,float H){ float r=jarR(q.y,H); float d=vessel(q,r,H,.006,.6);
  float rim=sdTorus(q-vec3(0.,H,0.),jarR(H,H)-.003,.006); return min(d,rim); }
float t_jar(vec3 q,float H){ float t=q.y/H; if(abs(t-.62)<.012||abs(t-.66)<.008) return .32; if(t>.97) return .4; return .6; }
/* a jar lid like a shallow bowl upside down */
float o_jarlid(vec3 q,float H){ vec3 c=q-vec3(0.,H+.004,0.); float d=max(sdEll(c,vec3(jarR(H,H)+.018,.032,jarR(H,H)+.018)),-c.y);
  d=min(d,sdCylY(c-vec3(0,.03,0),.018,.006)); return d; }
float t_jarlid(vec3 q){ return .5; }
/* ------------ pitcher with a handle on -x ------------ */
float pitR(float y){ float t=clamp(y/.2,0.,1.); return .045+.035*sin(3.1416*pow(t,.9))-.015*smoothstep(.7,1.,t)+.012*smoothstep(.92,1.,t); }
float o_pitcher(vec3 q){ float d=vessel(q,pitR(q.y),.2,.005,.6);
  d=min(d,sdTorus(q-vec3(0,.2,0),pitR(.2)-.002,.005));
  float h=sdTorus((q-vec3(-.07,.12,0.)).xzy,.045,.008); h=max(h,-(q.x+.07)); d=min(d,h);
  float sp=sdCapsule(q,vec3(.035,.19,0),vec3(.07,.21,0),.01); sp=max(sp,-sdCapsule(q,vec3(.035,.2,0),vec3(.075,.222,0),.006)); return min(d,sp); }
float t_pitcher(vec3 q){ float t=q.y/.2; if(abs(t-.55)<.015||abs(t-.62)<.01) return .35; return .58; }
/* ------------ cup on a stem (kiddush cup), H .14 ------------ */
float cupR(float y){ if(y<.012) return .038-.02*y/.012; if(y<.06) return .01+.003*sin(y*200.); float t=(y-.06)/.08; return .012+.03*sqrt(clamp(t,0.,1.)); }
float o_cup(vec3 q){ float d=(length(q.xz)-cupR(q.y))*.5; d=max(d,max(-q.y,q.y-.14));
  d=max(d,-max(length(q.xz)-(cupR(q.y)-.003),.08-q.y)); return min(d,sdTorus(q-vec3(0,.14,0),.041,.0025)); }
float t_cup(vec3 q){ if(q.y>.1&&q.y<.106) return .3; if(q.y>.056&&q.y<.064) return .35; return .7; }
/* ------------ candlestick with candle, candle top at y .3 ------------ */
float csR(float y){ if(y<.015) return .05-.025*smoothstep(0.,.015,y); if(y<.03) return .02; if(y<.14) return .012+.004*sin(y*120.)*smoothstep(.03,.05,y);
  if(y<.16) return .012+.02*smoothstep(.14,.16,y); return 0.; }
float o_candlestick(vec3 q){ float d=(length(q.xz)-csR(q.y))*.6; d=max(d,max(-q.y,q.y-.165)); return min(d,sdTorus(q-vec3(0,.16,0),.028,.004)); }
float t_candlestick(vec3 q){ if(abs(q.y-.03)<.004||abs(q.y-.14)<.005) return .25; return .45; }
float o_candle(vec3 q){ float d=sdCylY(q-vec3(0,.225,0),.013,.065)-.001; d=min(d,sdCapsule(q,vec3(0,.29,0),vec3(0,.302,0),.0015)); return d; }
float t_candle(vec3 q){ return q.y>.294?.2:.93; }
/* ------------ braided loaf (challah) along x ------------ */
float o_challah(vec3 q){ float d=1e5;
  for(int i=0;i<7;i++){ float x=-.12+float(i)*.04; float s=1.-abs(x)/.16; float sd=(i%2==0)?-1.:1.;
    d=smin(d,sdEll(q-vec3(x,.03*s+.012,sd*.022*s),vec3(.03,.028*s+.006,.032*s+.006)),.012); }
  return max(d,-q.y); }
float t_challah(vec3 q){ return .6; }
/* a cloth over something: flat rounded slab */
float o_cloth(vec3 q,vec3 b){ return sdRBox(q-vec3(0,b.y,0),b,b.y*.9)+.0015*sin(q.x*120.)*sin(q.z*90.); }
float t_cloth(vec3 q){ return abs(fract(q.x/.03)-.5)<.05||abs(fract(q.z/.03)-.5)<.05?.7:.9; }
/* ------------ woven basket, oval, open top (the ark in the reeds) ------------ */
float o_basket(vec3 q){ vec3 c=q-vec3(0,.06,0); float d=sdEll(c,vec3(.15,.075,.085)); d=max(d,c.y-.045);
  d=max(d,-sdEll(c-vec3(0,.012,0),vec3(.138,.07,.074))); d=min(d,sdTorus(vec3(c.x*.567,c.y-.045,c.z),.0445,.006));
  return max(d,-q.y)*.8; }
float t_basket(vec3 q){ vec3 c=q-vec3(0,.06,0); float a=atan(c.z,c.x*.567); float row=floor(c.y/.011); float w=fract(a*40./6.2832+row*.5);
  if(c.y>.038) return .4; return w<.45?.35:.66; }
/* reeds: a clump of tall stems and blades */
float o_reeds(vec3 q){ float d=1e5;
  for(int i=0;i<11;i++){ float fi=float(i); vec2 b=vec2(sin(fi*2.4)*.05,cos(fi*1.7)*.035); float h=.2+.12*fract(fi*.618);
    vec3 lean=vec3(.05*sin(fi*3.1),0.,.03*cos(fi*2.));
    vec3 m=vec3(b.x,0.,b.y)+lean*.3+vec3(0,h*.5,0); vec3 top=vec3(b.x,0.,b.y)+lean+vec3(0,h,0);
    d=min(d,sdCapsule(q,vec3(b.x,0.,b.y),m,.003)); d=min(d,sdCapsule(q,m,top,.0025));
    if(i%3==0) d=min(d,sdEll(q-top-vec3(0,.015,0),vec3(.006,.024,.006)));
    if(i%2==1){ vec3 lt=vec3(b.x,0.,b.y)+lean*2.2+vec3(.03*sin(fi),h*.65,0.); d=min(d,sdCapsule(q,vec3(b.x,.02,b.y),lt,.0028)); } }
  return d; }
/* ------------ pebbles: five smooth stones in a loose group ------------ */
float o_stones(vec3 q){ float d=1e5;
  for(int i=0;i<5;i++){ float fi=float(i); vec3 c=vec3(sin(fi*2.3)*.05+fi*.012,0.,cos(fi*1.9)*.035); vec3 r=vec3(.026,.017,.02)*(1.+.2*sin(fi*5.));
    vec3 p=q-c-vec3(0,r.y,0); p.xz=rot(fi)*p.xz; d=min(d,sdEll(p,r)); }
  return d; }
float t_stones(vec3 q){ return .5+.1*sin(q.x*300.+q.z*200.); }
/* a leather sling: pouch and two cords curling over the table */
float o_sling(vec3 q){ float d=sdEll(q-vec3(0,.006,0),vec3(.028,.006,.02));
  for(int s=-1;s<=1;s+=2){ float fs=float(s); for(int i=0;i<6;i++){ float a=float(i)*.45; vec3 A=vec3(fs*(.025+.03*float(i)),.003,.02*sin(a)*fs); vec3 B=vec3(fs*(.025+.03*float(i+1)),.003,.02*sin(a+.45)*fs);
    d=min(d,sdCapsule(q,A,B,.0025)); } }
  return d; }
float t_sling(vec3 q){ return .4; }
/* ------------ crown: a band with points and small knobs ------------ */
float o_crown(vec3 q){ float r=length(q.xz); float a=atan(q.z,q.x);
  float band=max(abs(r-.07)-.004,abs(q.y-.022)-.022);
  float pt=fract(a*8./6.2832)-.5; float tip=.05+.035*(1.-2.*abs(pt));
  float points=max(abs(r-.07)-.003,max(q.y-tip,-q.y));
  float d=min(band,points*.8);
  vec2 ka=vec2(cos((floor(a*8./6.2832)+.5)*6.2832/8.),sin((floor(a*8./6.2832)+.5)*6.2832/8.))*.07;
  d=min(d,length(q-vec3(ka.x,.088,ka.y))-.007);
  d=min(d,sdTorus(q-vec3(0,.003,0),.071,.005)); d=min(d,sdTorus(q-vec3(0,.043,0),.071,.004)); return d; }
float t_crown(vec3 q){ float a=atan(q.z,q.x); if(q.y<.042&&q.y>.012&&fract(a*16./6.2832)<.18) return .25; return .6; }
/* ------------ lyre (kinnor) standing, strings in the xy plane ------------ */
float o_lyre(vec3 q){ vec3 p=q; p.x=abs(p.x);
  float box=sdRBox(q-vec3(0,.04,0),vec3(.085,.04,.022),.012);
  box=max(box,-(length(q.xy-vec2(0,.05))-.012)*1.);
  float arm=1e5; for(int i=0;i<6;i++){ float t0=float(i)/6.,t1=float(i+1)/6.;
    vec3 A=vec3(.06+.045*sin(t0*2.2),.07+t0*.23,0.), B=vec3(.06+.045*sin(t1*2.2),.07+t1*.23,0.); arm=min(arm,sdCapsule(p,A,B,.011-.004*t0)); }
  float bar=sdCylX(q-vec3(0,.285,0),.008,.125); bar=min(bar,length(p-vec3(.128,.285,0))-.011);
  float st=1e5; for(int i=0;i<7;i++){ float x=-.045+float(i)*.015; st=min(st,sdCapsule(q,vec3(x,.06,.024),vec3(x*1.2,.285,.009),.0012)); }
  float br=sdRBox(q-vec3(0,.055,.024),vec3(.05,.004,.004),.001);
  return min(min(min(box,arm),bar),min(st,br)); }
float t_lyre(vec3 q){ if(abs(q.z-.022)<.006&&q.y>.06&&q.y<.28) return .25; if(q.y<.082&&q.z<-.015) return .45; return .5+.1*sin(q.y*300.); }
/* ------------ wheat sheaf lying along x, ears toward +x ------------ */
float o_sheaf(vec3 q){ vec3 c=q-vec3(0,.04,0); float ang=abs(c.x)<.02?0.:0.;
  float fan=.04+.02*smoothstep(-.02,-.16,c.x)+.035*smoothstep(0.02,.14,c.x);
  float stalks=max(length(c.yz*vec2(1.3,1.))-fan,abs(c.x)-.14);
  float n=fbm3(q*120.)*.012; float ears=sdEll(c-vec3(.17,.0,0),vec3(.08,.045,.07))+n;
  float d=smin(stalks,ears,.02)+.002*sin(c.y*900.+c.z*700.);
  d=min(d,sdTorus((c-vec3(-.01,0,0)).yxz,.041,.006));
  return max(d,-q.y)*.8; }
float t_sheaf(vec3 q){ vec3 c=q-vec3(0,.04,0); if(abs(c.x+.01)<.007) return .3; if(c.x>.1) return .45+.2*step(.5,fract(c.x/.009+c.y*40.)); return fract((c.y+c.z)*140.)<.3?.45:.7; }
/* ------------ sickle lying flat ------------ */
float o_sickle(vec3 q){ vec3 c=q-vec3(.02,.004,0); float r=length(c.xz); float a=atan(c.z,c.x);
  float blade=max(abs(r-.07)-.006*(1.-smoothstep(1.5,3.2,a)),abs(c.y)-.0025); blade=max(blade,-a+.0); blade=max(blade,a-3.1);
  float h=sdCapsule(q,vec3(.09,.009,0.),vec3(.2,.009,-.01),.009); return min(blade,h); }
float t_sickle(vec3 q){ return q.x>.085?.4:.3; }
/* ------------ round flat breads (a stack) ------------ */
float o_breads(vec3 q){ float d=1e5; for(int i=0;i<3;i++){ float fi=float(i); d=min(d,sdEll(q-vec3(fi*.012,.009+fi*.016,fi*.006),vec3(.08,.009,.08))); } return d; }
float t_breads(vec3 q){ return .62-.2*step(.85,fbm(q.xz*140.)); }
/* loaves: rounded buns with a score line */
float o_loaf(vec3 q){ return sdEll(q-vec3(0,.02,0),vec3(.055,.032,.04)); }
float t_loaf(vec3 q){ return abs(q.z+.1*q.x*0.)<.003&&q.y>.035?.3:.6; }
/* ------------ fish lying on its side, head toward +x ------------ */
float o_fish(vec3 q){ vec3 c=q-vec3(0,.016,0); float b=sdEll(c,vec3(.07,.016,.028));
  vec3 t=c-vec3(-.085,0,0); float tail=max(sdBox(t,vec3(.02,.004,.03)),abs(t.z)-.005-(-t.x+.02)*.9); tail=max(tail,-(abs(t.z)-.02*( .02-t.x)/.04+.00)*0.+abs(t.y)-.004);
  return min(b,tail); }
float t_fish(vec3 q){ vec3 c=q-vec3(0,.016,0); if(length(c.xz-vec2(.048,.007))<.004&&c.y>0.) return .15; if(abs(c.x-.04)<.002) return .3; return fract(c.x/.008+abs(c.z)*60.)<.25?.45:.68; }
/* ------------ coins: disc with raised rim, wreath band ------------ */
float o_coin(vec3 q){ float d=sdCylY(q-vec3(0,.003,0),.022,.003)-.0006; d=min(d,max(abs(length(q.xz)-.021)-.0015,abs(q.y-.004)-.0028)); return d; }
float t_coin(vec3 q){ float r=length(q.xz); float a=atan(q.z,q.x); if(r>.012&&r<.017&&fract(a*14./6.2832)<.45) return .3; if(r<.006) return .35; return .55; }
/* leather purse: a pinched sack with a drawstring */
float o_purse(vec3 q){ float y=q.y; float r=.055*sin(3.1416*clamp(y/.1,0.,1.)*.75)+.01; r=y>.075?.018+.03*smoothstep(.09,.12,y):r;
  float d=(length(q.xz*vec2(1.,1.2))-r)*.6; d=max(d,max(-y,y-.12)); d=min(d,sdTorus(q-vec3(0,.078,0),.02,.004)); return d+.002*fbm3(q*90.); }
float t_purse(vec3 q){ return abs(q.y-.078)<.006?.25:.45; }
/* ------------ broken stone stele with rounded top, standing, face toward -z ------------ */
float o_stele(vec3 q){ vec3 c=q-vec3(0,.13,0); float d=sdRBox(c,vec3(.085,.13,.02),.006);
  d=min(d,max(sdCylZ(c-vec3(0,.13,0),.085,.02)-.004,-c.y+.13));
  float brk=dot(c,normalize(vec3(.8,.6,0)))-.06+.012*fbm(c.xy*60.); d=max(d,brk);
  d=max(d,-(abs(c.z+.02)-.002)*0.-1e5); d+=.0015*fbm3(q*80.);
  return d; }
float t_stele(vec3 q){ vec3 c=q-vec3(0,.13,0); if(c.z<-.017&&abs(c.x)<.07&&c.y<.12&&c.y>-.1&&fract(c.y/.017)<.22) return .35; return .55; }
/* a potsherd (curved shell piece) lying on the table */
float o_sherd(vec3 q){ vec3 c=q-vec3(0,-.04,0); float d=abs(length(c)-.05)-.004; d=max(d,sdBox(q-vec3(0,.012,0),vec3(.035,.012,.028))); return d; }
float t_sherd(vec3 q){ return .5; }
/* ------------ clay tablet with wedge rows ------------ */
float o_tablet(vec3 q){ vec3 c=q-vec3(0,.016,0); return sdEll(c,vec3(.075,.017,.1))*.5+sdRBox(c,vec3(.068,.012,.09),.01)*.5; }
float t_tablet(vec3 q){ if(q.y>.02&&abs(q.x)<.058&&abs(q.z)<.08){ float r=fract(q.z/.014); float w=fract(q.x/.011+floor(q.z/.014)*.37); if(r<.35&&w<.4) return .25; } return .58; }
/* ------------ stone tablets of the covenant: two slabs with rounded tops, leaning back ------------ */
float o_tablets(vec3 q){ vec3 c=q; c.yz=rot(.12)*c.yz; float d=1e5;
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 t=c-vec3(s*.058,.1,0.);
    float a=sdRBox(t,vec3(.052,.1,.014),.004); a=min(a,max(sdCylZ(t-vec3(0,.1,0),.052,.014)-.003,-(t.y-.1)));
    a=max(a,t.y-.17); d=min(d,a+.0008*fbm3(q*120.)); }
  return max(d,-q.y); }
float t_tablets(vec3 q){ vec3 c=q; c.yz=rot(.12)*c.yz; float x=abs(c.x)-.058; if(c.z<-.012&&abs(x)<.034&&c.y>.03&&c.y<.21&&fract(c.y/.019)<.2) return .28;
  if(c.z<-.012&&abs(abs(x)-.043)<.0022&&c.y>.02&&c.y<.2) return .4; return .66; }
/* ------------ inkwell, quill, pen ------------ */
float o_inkwell(vec3 q){ float r=q.y<.035?.032:.014; float d=sdRBox(q-vec3(0,.018,0),vec3(.032,.018,.032),.007);
  d=min(d,sdCylY(q-vec3(0,.04,0),.014,.006)-.002); d=max(d,-sdCylY(q-vec3(0,.046,0),.009,.012)); return d; }
float t_inkwell(vec3 q){ return q.y>.044&&length(q.xz)<.01?.1:.3; }
float o_quill(vec3 q){ /* shaft from origin (tip in the inkwell) up and out along +x */
  vec3 d0=normalize(vec3(.85,.5,.15)); float t=clamp(dot(q,d0),0.,.26); vec3 c=q-d0*t;
  float shaft=length(c)-.0022;
  vec3 s=vec3(dot(q,d0), dot(q,normalize(cross(d0,vec3(0,0,1)))), dot(q,normalize(cross(d0,cross(d0,vec3(0,0,1))))));
  float u=clamp((s.x-.08)/.18,0.,1.); float vane=max(max(abs(s.z)-.0012,abs(s.y+.004*u)-.022*sin(3.1416*pow(u,.7))*step(.08,s.x)),max(.08-s.x,s.x-.265));
  return min(shaft,vane*.8); }
float t_quill(vec3 q){ vec3 d0=normalize(vec3(.85,.5,.15)); float x=dot(q,d0); return fract(x/.006+dot(q,vec3(0,1,0))*30.)<.35?.6:.9; }
/* ------------ magnifying glass lying flat ------------ */
float o_magnifier(vec3 q){ float ring=sdTorus(q-vec3(0,.006,0),.05,.006); float lens=sdEll(q-vec3(0,.006,0),vec3(.048,.003,.048));
  float h=sdCapsule(q,vec3(.056,.008,0),vec3(.16,.012,-.02),.008); return min(min(ring,lens),h); }
float t_magnifier(vec3 q){ if(length(q.xz)<.046) return .96; return length(q.xz)<.058?.25:.35; }
/* ------------ gavel lying, and its round block ------------ */
float o_gavel(vec3 q){ vec3 c=q-vec3(0,.022,0); float head=sdCylZ(c,.021,.045)-.002; head=min(head,sdCylZ(c-vec3(0,0,.047),.023,.004)); head=min(head,sdCylZ(c+vec3(0,0,.047),.023,.004));
  float h=sdCapsule(q,vec3(.02,.02,0),vec3(.2,.01,.02),.0075); return min(head,h); }
float t_gavel(vec3 q){ vec3 c=q-vec3(0,.022,0); if(abs(abs(c.z)-.047)<.004&&abs(c.x)<.03) return .25; return .42+.15*sin(q.x*300.+sin(q.z*90.)*3.); }
float o_block(vec3 q){ return sdCylY(q-vec3(0,.014,0),.06,.014)-.002; }
float t_block(vec3 q){ return abs(q.y-.014)<.003?.35:.5; }
/* ------------ paint brush lying ------------ */
float o_brush(vec3 q){ vec3 a=vec3(-.13,.007,0),b=vec3(.07,.007,0); float h=sdCapsule(q,a,b,.006-.002*clamp((q.x+.13)/.2,0.,1.));
  float f=sdCylX(q-vec3(.085,.007,0),.0065,.016); float br=max(sdEll(q-vec3(.12,.007,0),vec3(.035,.007,.007)),-(q.x-.1)); return min(min(h,f),br); }
float t_brush(vec3 q){ if(q.x>.1) return q.x>.14?.15:.35; if(q.x>.068) return .75; return .3; }
/* ------------ seder plate with six small cups ------------ */
float o_plate(vec3 q){ float r=length(q.xz); float d=max(r-.16,abs(q.y-.006)-.006); d=max(d,-max(r-.14,-(q.y-.009)));
  d=min(d,sdTorus(q-vec3(0,.012,0),.152,.006));
  for(int i=0;i<6;i++){ float a=float(i)*1.0472+.3; vec3 c=q-vec3(cos(a)*.09,.012,sin(a)*.09); float b=max(sdCylY(c,.028,.012),-sdCylY(c-vec3(0,.006,0),.024,.012)); d=min(d,b); }
  return d; }
float t_plate(vec3 q){ float r=length(q.xz); float a=atan(q.z,q.x); if(r>.142&&r<.158&&fract(a*24./6.2832)<.3) return .35; return .8; }
/* matzah: thin square crackers stacked, rows of dots */
float o_matzah(vec3 q){ float d=1e5; for(int i=0;i<3;i++){ float fi=float(i); vec3 c=q-vec3(0,.004+fi*.008,0); c.xz=rot(fi*.25)*c.xz; d=min(d,sdRBox(c,vec3(.09,.0035,.09),.003)+.0008*fbm(c.xz*200.)); } return d; }
float t_matzah(vec3 q){ int i=int(clamp(floor((q.y)/.008),0.,2.)); vec3 c=q; c.xz=rot(float(i)*.25)*c.xz; if(fract(c.x/.018)<.15) return .45; if(fract(c.z/.009)<.3&&fract(c.x/.018)>.4&&fract(c.x/.018)<.6) return .5; return .76; }
/* ------------ yad (pointer) lying ------------ */
float o_yad(vec3 q){ float t=clamp((q.x+.1)/.2,0.,1.); float r=.006-.003*t+.001*sin(q.x*300.); float d=sdCapsule(q,vec3(-.1,.008,0),vec3(.1,.006,0),r);
  d=min(d,length(q-vec3(-.105,.009,0))-.009); d=min(d,length(q-vec3(.108,.005,0))-.005); return d; }
float t_yad(vec3 q){ return fract(q.x/.012)<.25?.3:.55; }
/* ------------ shofar: tapering curved horn on the table ------------ */
vec3 shP(float t){ return vec3(-.13+.28*t, .02+.07*t*t, .05*sin(t*3.1416)); }
float o_shofar(vec3 q){ float d=1e5;
  for(int i=0;i<10;i++){ float t0=float(i)/10.,t1=float(i+1)/10.; float r=.006+.028*t0*t0; d=smin(d,sdCapsule(q,shP(t0),shP(t1),r),.004); }
  vec3 e=shP(1.); d=max(d,-(length(q-e-vec3(.012,.006,0))-.028)); return d; }
float t_shofar(vec3 q){ float t=clamp((q.x+.13)/.28,0.,1.); return fract(t*18.)<.18?.35:.55-.15*t; }
/* ------------ firewood bundle along x, tied twice ------------ */
float o_wood(vec3 q){ float d=1e5; for(int i=0;i<7;i++){ float fi=float(i); vec2 o=vec2(sin(fi*2.4),cos(fi*2.4))*(i==0?0.:.026); float r=.012+.003*sin(fi*3.);
    d=min(d,sdCylX(q-vec3(.01*sin(fi*5.),.034+o.y,o.x),r,.14+.015*sin(fi*7.))+.001*fbm3(q*vec3(20.,200.,200.))); }
  d=min(d,sdTorus((q-vec3(-.07,.034,0)).yxz,.043,.004)); d=min(d,sdTorus((q-vec3(.07,.034,0)).yxz,.043,.004)); return max(d,-q.y); }
float t_wood(vec3 q){ if(abs(abs(q.x)-.07)<.006) return .3; if(abs(q.x)>.12) return fract(length(q.yz-vec2(.034,0.))*300.)<.3?.5:.75; return fract(q.z*250.+sin(q.x*80.))<.3?.4:.6; }
/* ------------ wooden yoke: a beam with two bows ------------ */
float o_yoke(vec3 q){ vec3 c=q-vec3(0,.1,0); float bend=.02*(c.x*c.x)/.04; float beam=sdRBox(c-vec3(0,bend,0),vec3(.2,.018,.02),.008);
  float bows=1e5; for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 b=c-vec3(s*.1,-.01,0); float t=max(abs(length(b.xy)-.055)-.006,abs(b.z)-.006); t=max(t,b.y); bows=min(bows,t);
    bows=min(bows,sdCylY(c-vec3(s*.1+s*.05,.016,0),.004,.012)); }
  return min(beam,bows); }
float t_yoke(vec3 q){ return .45+.2*step(.5,fract(q.y*120.+sin(q.x*40.)*2.)); }
/* ------------ shepherd's staff lying, crook at +x ------------ */
float o_staff(vec3 q){ float s=sdCapsule(q,vec3(-.3,.011,0),vec3(.15,.011,0),.009);
  vec3 h=q-vec3(.15,.011,-.035); float hk=sdTorus(h,.035,.009); hk=max(hk,-h.x*1.+0.*h.z); return min(s,hk); }
float t_staff(vec3 q){ return .45+.15*step(.5,fract(q.x*60.+sin(q.z*300.))); }
/* ------------ a bell on a loop of cord ------------ */
float bellR(float y){ float t=clamp(y/.07,0.,1.); return .038-.022*t+.006*exp(-y*300.); }
float o_bell(vec3 q){ float d=vessel(q,bellR(q.y),.07,-1.,.6); d=max(d,-max(length(q.xz)-bellR(q.y)+.004,q.y-.06)); d=min(d,sdTorus((q-vec3(0,.08,0)).xzy,.01,.003)); return d; }
float t_bell(vec3 q){ return q.y<.008?.3:.5; }
/* ------------ plumb line: a wooden stand with a string and a pointed bob ------------ */
float o_plumbstand(vec3 q){ float base=sdRBox(q-vec3(0,.01,0),vec3(.07,.01,.05),.004); float post=sdRBox(q-vec3(-.05,.15,0),vec3(.01,.14,.01),.003);
  float arm=sdRBox(q-vec3(.01,.285,0),vec3(.07,.009,.009),.003); return min(min(base,post),arm); }
float t_plumbstand(vec3 q){ return .5+.15*step(.5,fract(q.y*90.+q.x*20.)); }
float o_plumbbob(vec3 q){ float s=sdCapsule(q,vec3(.07,.12,0),vec3(.07,.285,0),.0012); vec3 b=q-vec3(.07,.09,0);
  float cone=max(sdCone(b,.0,.018,.03),-b.y-.03); cone=min(cone,sdCylY(b-vec3(0,.034,0),.018,.004)); return min(s,cone); }
float t_plumbbob(vec3 q){ return .3; }
/* ------------ shallow bowl with fruit (summer fruit / figs) or seeds ------------ */
float bowlR(float y){ return .06+.04*sqrt(clamp(y/.05,0.,1.)); }
float o_bowl(vec3 q){ float d=vessel(q,bowlR(q.y),.05,.005,.6); return min(d,sdTorus(q-vec3(0,.05,0),.098,.004)); }
float t_bowl(vec3 q){ return abs(q.y-.03)<.004?.3:.55; }
float o_figs(vec3 q){ float d=1e5; for(int i=0;i<6;i++){ float fi=float(i); vec3 c=vec3(sin(fi*2.4)*.045,.05+.012*cos(fi),cos(fi*2.4)*.04)*(i==0?0.:1.)+vec3(0,i==0?.065:0.,0);
    d=min(d,sdEll(q-c,vec3(.024,.027,.024))); d=min(d,sdCapsule(q,c+vec3(0,.025,0),c+vec3(.004,.034,0),.0025)); } return d; }
float t_figs(vec3 q){ return .5+.1*sin(atan(q.z,q.x)*30.); }
float o_seeds(vec3 q){ return sdEll(q-vec3(0,.04,0),vec3(.09,.028,.09))+.002*(vn(q.xz*400.)); }
float t_seeds(vec3 q){ return vn(q.xz*500.)>.6?.35:.62; }
/* ------------ lampstand: turned stand holding the lamp, lamp top at y .2 ------------ */
float lsR(float y){ if(y<.012) return .055; if(y<.16) return .013+.006*sin(y*80.)*.5+.01*smoothstep(.04,.012,y); return .013+.035*smoothstep(.16,.175,y); }
float o_lampstand(vec3 q){ float d=(length(q.xz)-lsR(q.y))*.6; return max(d,max(-q.y,q.y-.18)); }
float t_lampstand(vec3 q){ return abs(q.y-.012)<.003||abs(q.y-.16)<.004?.25:.45; }
/* ------------ rolled letter tied with a cord and a wax seal ------------ */
float o_letter(vec3 q){ float d=sdCylX(q-vec3(0,.018,0),.017,.11)-.001; d=min(d,sdTorus((q-vec3(0,.018,0)).yxz,.0185,.0025));
  d=min(d,sdCylZ(q-vec3(0,.018,-.021),.011,.003)-.001); return d; }
float t_letter(vec3 q){ if(q.z<-.017&&length(q.xy-vec2(0,.018))<.013) return .2; if(abs(q.x)<.004) return .35; if(abs(q.x)>.1) return fract(length(q.yz-vec2(.018,0.))*400.)<.3?.6:.85; return .88; }
/* a folded letter lying flat with a seal */
float o_folded(vec3 q){ float d=sdRBox(q-vec3(0,.005,0),vec3(.09,.005,.06),.002); d=min(d,sdCylY(q-vec3(0,.011,0),.014,.002)-.001); return d; }
float t_folded(vec3 q){ if(length(q.xz)<.015&&q.y>.009) return .2; if(abs(q.z-q.x*.66)<.002||abs(q.z+q.x*.66)<.002) return .6; return .9; }
/* ------------ hand drum (timbrel) lying, and a short flute ------------ */
float o_drum(vec3 q){ float d=max(abs(length(q.xz)-.09)-.006,abs(q.y-.022)-.022); d=min(d,sdCylY(q-vec3(0,.042,0),.088,.0015));
  for(int i=0;i<5;i++){ float a=float(i)*1.2566; d=min(d,sdCylZ(vec3(q.x-cos(a)*.097,q.y-.022,q.z-sin(a)*.097)*1.,.008,.0015)); } return d; }
float t_drum(vec3 q){ if(q.y>.04&&length(q.xz)<.086) return .9; return .45+.15*step(.5,fract(q.y*200.)); }
float o_flute(vec3 q){ return sdCapsule(q,vec3(-.12,.009,0),vec3(.12,.009,0),.009); }
float t_flute(vec3 q){ if(q.y>.012&&abs(q.z)<.004&&fract((q.x+.12)/.028)<.2&&q.x>-.05) return .15; return fract(q.x/.1)<.05?.3:.6; }
/* ------------ bedroll: a rolled blanket tied, along x ------------ */
float o_bedroll(vec3 q){ vec3 c=q-vec3(0,.04,0); float d=sdCylX(c,.038,.12)-.004; d=min(d,sdTorus((c-vec3(-.07,0,0)).yxz,.042,.004)); d=min(d,sdTorus((c-vec3(.07,0,0)).yxz,.042,.004)); return d; }
float t_bedroll(vec3 q){ vec3 c=q-vec3(0,.04,0); if(abs(abs(c.x)-.07)<.006) return .3; if(abs(c.x)>.12) return fract(length(c.yz)*120.)<.35?.4:.75; return fract(c.x/.03)<.25?.5:.72; }
/* ------------ mezuzah case: a slim case with a round top, lying on the table ------------ */
float o_mezuzah(vec3 q){ vec3 c=q-vec3(0,.012,0); float d=sdRBox(c,vec3(.075,.01,.015),.008); d=min(d,length(c-vec3(.06,.009,0))-.008); return d; }
float t_mezuzah(vec3 q){ vec3 c=q-vec3(0,.012,0); if(abs(c.x)<.05&&fract(c.x/.012)<.2&&c.y>.004) return .25; return .5; }
/* a small parchment roll */
float o_parch(vec3 q){ return sdCylX(q-vec3(0,.009,0),.009,.05)-.0005; }
float t_parch(vec3 q){ return abs(q.x)>.047?.6:.9; }
/* ------------ scroll case (megillah case): cylinder with a domed cap, lying along x; strip of parchment out of +x ------------ */
float o_scase(vec3 q){ vec3 c=q-vec3(0,.028,0); float d=sdCylX(c,.026,.1)-.002; d=min(d,sdEll(c+vec3(.1,0,0),vec3(.022,.024,.024)));
  d=min(d,length(c+vec3(.125,0,0))-.009); for(int i=-1;i<=1;i++) d=min(d,sdTorus((c-vec3(float(i)*.06,0,0)).yxz,.028,.003)); return d; }
float t_scase(vec3 q){ vec3 c=q-vec3(0,.028,0); if(abs(c.x)<.05&&fract(atan(c.y,c.z)*8./6.2832+c.x*10.)<.2) return .3; return .45; }
float o_strip(vec3 q){ float x=q.x-.1; float y=.02*exp(-x*30.)+.001; return sdBox(vec3(x-.11,q.y-y,q.z),vec3(.11,.0012,.045)); }
float t_strip(vec3 q){ float x=q.x-.1; if(x>.04&&abs(abs(q.z)-.0)<.036&&fract(q.z/.008)<.3&&fract(x/.07)<.8) return .6; return .93; }
/* ------------ torch: stick with a wrapped head and a flame ------------ */
float o_torch(vec3 q){ float s=sdCapsule(q,vec3(-.14,.012,0),vec3(.1,.02,0),.009); vec3 h=q-vec3(.12,.021,0); float w=sdEll(h,vec3(.035,.02,.02))+.002*sin(h.x*400.+h.y*100.); return min(s,w); }
float t_torch(vec3 q){ return q.x>.085?(fract(q.x*250.+q.y*80.)<.4?.25:.45):.5; }
/* ------------ groups ------------ */
float o_loaves(vec3 q){ float d=1e5; for(int i=0;i<5;i++){ float fi=float(i); vec3 c=i<3?vec3(-.1+fi*.1,0.,.03):vec3(-.05+(fi-3.)*.1,.035,.02); c.z+=i<3?0.:-.0;
  vec3 r=q-c; r.xz=rot(fi*.7)*r.xz; d=min(d,o_loaf(r)); } return d; }
float t_loaves(vec3 q){ float d=1e5; float t=.6; for(int i=0;i<5;i++){ float fi=float(i); vec3 c=i<3?vec3(-.1+fi*.1,0.,.03):vec3(-.05+(fi-3.)*.1,.035,.02); vec3 r=q-c; r.xz=rot(fi*.7)*r.xz;
  float e=o_loaf(r); if(e<d){ d=e; t=(abs(r.x)<.0035&&r.y>.03)||(abs(r.x-.022)<.003&&r.y>.028)||(abs(r.x+.022)<.003&&r.y>.028)?.3:.62; } } return t; }
float o_fishes(vec3 q){ vec3 a=q-vec3(0,0,-.03); a.xz=rot(.15)*a.xz; vec3 b=q-vec3(.02,.0,.035); b.xz=rot(3.3)*b.xz; return min(o_fish(a),o_fish(b)); }
float t_fishes(vec3 q){ vec3 a=q-vec3(0,0,-.03); a.xz=rot(.15)*a.xz; vec3 b=q-vec3(.02,.0,.035); b.xz=rot(3.3)*b.xz; return o_fish(a)<o_fish(b)?t_fish(a):t_fish(b); }
vec3 cP(int i){ return vec3(float(i)*.05-.05,0.,sin(float(i)*2.1)*.03)+vec3(0,i==3?.006:0.,0)+(i==3?vec3(-.035,0,.0):vec3(0)); }
float o_coins(vec3 q){ float d=1e5; for(int i=0;i<4;i++) d=min(d,o_coin(q-cP(i))); return d; }
float t_coins(vec3 q){ float d=1e5; float t=.5; for(int i=0;i<4;i++){ float e=o_coin(q-cP(i)); if(e<d){d=e;t=t_coin(q-cP(i));} } return t; }
/* a single rolled scroll along x on its own rod */
float o_roll(vec3 q){ vec3 c=q-vec3(0,.024,0); float d=sdCylX(c,.022,.09)-.001; d=min(d,sdCylX(c,.005,.12)); d=min(d,length(c-vec3(.125,0,0))-.008); d=min(d,length(c+vec3(.125,0,0))-.008);
  d=min(d,sdCylX(c-vec3(.1,0,0),.017,.003)-.001); d=min(d,sdCylX(c+vec3(.1,0,0),.017,.003)-.001); d=min(d,sdTorus(c.yxz,.0232,.0022)); return d; }
float t_roll(vec3 q){ vec3 c=q-vec3(0,.024,0); if(abs(c.x)>.092) return .35; if(abs(c.x)<.003) return .25; return .88; }
vec3 rP(int i,int n){ return n==5?(i<3?vec3(0,0,float(i-1)*.047):vec3(0,.041,float(i-3)*.047+.0235)):(i<2?vec3(0,0,float(i)*.047-.0235):vec3(0,.041,0)); }
float o_rolls(vec3 q,int n){ float d=1e5; for(int i=0;i<5;i++){ if(i>=n) break; vec3 r=q-rP(i,n); r.x+=sin(float(i)*3.)*.012; d=min(d,o_roll(r)); } return d; }
float t_rolls(vec3 q,int n){ float d=1e5,t=.8; for(int i=0;i<5;i++){ if(i>=n) break; vec3 r=q-rP(i,n); r.x+=sin(float(i)*3.)*.012; float e=o_roll(r); if(e<d){d=e;t=t_roll(r);} } return t; }
/* a mason's trowel lying flat */
float o_trowel(vec3 q){ vec2 u=q.xz; float blade=max(sdBox2(vec2(u.x+.05,u.y),vec2(.06,.035-.03*clamp(-(u.x+.05)/.06,0.,1.)*0.))-.002,abs(q.y-.003)-.0015);
  blade=max(blade,dot(vec2(abs(u.y),-u.x),normalize(vec2(1.,.55)))-.045);
  float neck=sdCapsule(q,vec3(.01,.004,0),vec3(.03,.02,0),.003); float h=sdCapsule(q,vec3(.03,.02,0),vec3(.12,.022,0),.009); return min(min(blade,neck),h); }
float t_trowel(vec3 q){ return q.x>.028?.4:.7; }
float t_bookcover(vec3 q){ return q.y<.03&&abs(q.z-.09)<.035?.8:.35; }

vec3 Q3(vec3 p){  vec3 q=p-vec3(0.02,0.,0.03); q.xz=rot(0.25)*q.xz; q/=1.4; return q; }
vec3 Q4(vec3 p){  vec3 q=p-vec3(-0.28,0.,-0.1); q.xz=rot(0.4)*q.xz; q/=1.; return q; }
vec3 Q5(vec3 p){  vec3 q=p-vec3(0.33,0.,0.16); q/=1.; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  { r=U(r,o_sheaf(Q3(p))*1.4,3.); }
  { r=U(r,o_sickle(Q4(p))*1.,4.); }
  { r=U(r,o_jar(Q5(p),.22)*1.,5.); }
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return t_sheaf(Q3(p));
  if(id==4.) return t_sickle(Q4(p));
  if(id==5.) return t_jar(Q5(p),.22);
  return .7; }
