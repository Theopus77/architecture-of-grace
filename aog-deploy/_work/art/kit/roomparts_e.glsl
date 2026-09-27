/* Parts for the practice-room pencil still lifes (rooms batch 4b). Include after studio.glsl
   (self-contained: works beside medparts_a.glsl or spafcs.glsl). Every part takes a local point q, metres. */
float ellD(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
vec3 plc(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
/* extrude a 2D distance d2 to half-thickness h */
float extrude(float d2,float z,float h){ vec2 w=vec2(d2,abs(z)-h); return min(max(w.x,w.y),0.)+length(max(w,0.)); }
/* a lace-up ankle boot standing on y=0, toe along +x */
float bootD(vec3 q){
  vec3 sq=q-vec3(-.03,.105,0.); sq.xz*=1.+.12*(sq.y/.1); float shaft=sdRBox(sq,vec3(.04,.1,.037),.034);
  float foot=sdRBox(q-vec3(.02,.034,0.),vec3(.085,.032,.042),.03);
  float toe=ellD(q-vec3(.085,.03,0.),vec3(.05,.034,.043));
  float d=smin(smin(shaft,foot,.035),toe,.02);
  d=max(d,-(ellD(q-vec3(-.03,.21,0.),vec3(.034,.02,.031))));   /* the opening */
  d=max(d,.012-q.y);
  float tab=sdTorus((q-vec3(-.071,.2,0.)).yxz,.009,.0025);          /* pull loop at the back */
  return min(d,tab); }
float bootSole(vec3 q){
  float fp=min(sdBox2(q.xz-vec2(-.01,0.),vec2(.07,.04))-.006,(length((q.xz-vec2(.085,0.))/vec2(.055,.047))-1.)*.047);
  float s=extrude(fp,q.y-.006,.006)-.001;
  s=min(s,sdRBox(q-vec3(-.05,.012,0.),vec3(.03,.012,.044),.004));   /* heel */
  return max(s,-q.y); }
float bootTone(vec3 q,vec3 n){
  if(q.y<.02) return .25;
  /* laces up the front: two rows of eyelets and criss-crossing lace */
  float fx=q.x-.0; vec2 f=vec2(q.z,q.y);
  if(q.x>-.005&&q.y>.05){ float row=fract((q.y-.05)/.024);
    if(abs(abs(q.z)-.014)<.003&&abs(row-.5)<.16) return .05;
    float lz=abs(q.z); float t=(row-.5)*2.;
    if(lz<.014&&abs(abs(q.z)-abs(t)*.014)<.0032) return .08; }
  if(abs(q.y-.075+.03*smoothstep(-.02,.12,q.x))<.0016) return .3;       /* a stitched seam */
  return .55; }
/* a cupcake in a ridged paper cup with a swirl of frosting and a cherry; base at y=0 */
float cupcakeCup(vec3 q){ float a=atan(q.z,q.x); float r=length(q.xz);
  float R=mix(.03,.039,clamp(q.y/.04,0.,1.))+.0012*cos(a*20.);
  return max(max(r-R,-q.y),q.y-.04)-.0005; }
float cupcakeTop(vec3 q){
  float d=ellD(q-vec3(0.,.043,0.),vec3(.043,.014,.043));
  d=smin(d,sdTorus(q-vec3(0.,.056,0.),.026,.011),.008);
  d=smin(d,sdTorus(q-vec3(0.,.072,0.),.015,.009),.006);
  d=smin(d,ellD(q-vec3(0.,.085,0.),vec3(.011,.012,.011)),.005);
  return d; }
float cherry(vec3 q){ return min(length(q-vec3(0.,.103,0.))-.011,sdCapsule(q,vec3(0.,.11,0.),vec3(.012,.135,.004),.0015)); }
/* a flat plate with a raised rim, base at y=0 */
float plateD(vec3 q,float R){ float r=length(q.xz);
  float d=max(abs(q.y-.004)-.004,r-R);
  float rim=length(vec2(r-R*.86,q.y-.004-.006*smoothstep(R*.6,R,r)))-.003;
  d=max(d,-(max(r-R*.62,.004-q.y+.003)));
  return min(d,max(sdTorus(q-vec3(0.,.008,0.),R*.9,.004),0.)); }
/* a small table lamp: round foot, a turned stem and a cone shade; base at y=0 */
float lampFoot(vec3 q){ float d=sdCylY(q-vec3(0.,.008,0.),.042,.008)-.003;
  d=min(d,sdCylY(q-vec3(0.,.02,0.),.022,.006)-.002);
  d=min(d,sdCapsule(q,vec3(0.,.02,0.),vec3(0.,.15,0.),.006));
  return d; }
float lampShade(vec3 q){ vec2 r=vec2(length(q.xz),q.y);
  float d=sdSeg2(r,vec2(.078,.115),vec2(.046,.205))-.002;
  return d; }
/* a round cereal bowl on a foot ring, base at y=0, radius R */
float bowlE(vec3 q,float R){ vec2 r=vec2(length(q.xz),q.y);
  float w=min(min(sdSeg2(r,vec2(0.,.004),vec2(R*.45,.004)),sdSeg2(r,vec2(R*.45,.004),vec2(R*.85,R*.38))),sdSeg2(r,vec2(R*.85,R*.38),vec2(R,R*.62)))-.0035;
  float foot=max(abs(r.x-R*.4)-.004,abs(r.y-.003)-.003);
  return min(w,foot); }
/* a spoon: bowl at q=0, handle along +x rising by lift */
float spoonE(vec3 q,float lift){
  float b=ellD(q,vec3(.02,.006,.013)); b=max(b,-ellD(q-vec3(0.,.004,0.),vec3(.018,.005,.011)));
  float h=sdCapsule(q,vec3(.018,.002,0.),vec3(.12,.002+lift,0.),.0028);
  return min(b,h); }
/* 2D jigsaw piece, square of half size s centred at 0; knobs (+1) or holes (-1) on +x,-x,+z,-z */
float jig2(vec2 u,float s,vec4 k){ float d=sdBox2(u,vec2(s))-.004; float r=s*.34;
  vec2 c[4]; c[0]=vec2(s+r*.55,0.); c[1]=vec2(-s-r*.55,0.); c[2]=vec2(0.,s+r*.55); c[3]=vec2(0.,-s-r*.55);
  for(int i=0;i<4;i++){ float kk=k[i]; if(kk>.5) d=min(d,length(u-c[i])-r);
    if(kk<-.5) d=max(d,-(length(u-c[i]+(c[i]/length(c[i]))*r*1.1)-r-.002)); }
  return d; }
/* a hand bell: flared brass bell, mouth down at y=0, with a turned wooden handle */
float bellE(vec3 q){ vec2 r=vec2(length(q.xz),q.y);
  float w=min(min(sdSeg2(r,vec2(.05,.004),vec2(.043,.02)),sdSeg2(r,vec2(.043,.02),vec2(.032,.06))),sdSeg2(r,vec2(.032,.06),vec2(.0,.078)))-.0035;
  float lip=length(r-vec2(.05,.005))-.0055;
  return min(w,lip); }
float bellHandle(vec3 q){ vec2 r=vec2(length(q.xz),q.y);
  float d=sdCapsule(q,vec3(0.,.075,0.),vec3(0.,.14,0.),.009);
  d=smin(d,length(q-vec3(0.,.145,0.))-.016,.01);
  d=min(d,sdCylY(q-vec3(0.,.082,0.),.013,.005)-.002);
  return d; }
/* a star with n long points in 2D (radius R, inner radius ri) */
float star2(vec2 u,float n,float R,float ri){ float a=atan(u.y,u.x); float s=PI/n; float m=mod(a+s*.0,2.*s)-s;
  vec2 v=length(u)*vec2(cos(m),abs(sin(m)));
  vec2 A=vec2(R,0.), B=vec2(ri*cos(s),ri*sin(s)); vec2 e=B-A; vec2 w=v-A;
  float h=clamp(dot(w,e)/dot(e,e),0.,1.); float d=length(w-e*h);
  return (e.x*w.y-e.y*w.x)>0.?-d:d; }
/* a toy house: floor at y=0, half width w (x), half depth dd (z), wall height h, roof rise k */
float houseE(vec3 q,float w,float dd,float h,float k){
  float walls=sdRBox(q-vec3(0.,h*.5,0.),vec3(w,h*.5,dd),.003);
  vec2 r=vec2(abs(q.x),q.y-h); float roof2=max(dot(r,normalize(vec2(k,w+.012)))-k*(w+.012)/length(vec2(k,w+.012)),-r.y);
  float roof=max(roof2,abs(q.z)-dd-.01);
  float chim=sdRBox(q-vec3(w*.45,h+k*.7,dd*.3),vec3(.008,k*.4,.008),.002);
  return min(min(walls,roof-.002),chim); }
