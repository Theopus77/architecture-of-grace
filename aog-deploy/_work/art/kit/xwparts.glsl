/* Shared parts for the crosswalk page drawings (page-xw-*): a pencil, a closed book, a ruler,
   a candle. Sizes in metres. Include after selparts.glsl. */
/* pencil lying along local x, tip at +x */
float xwPencilD(vec3 q,float L){ vec3 c=q-vec3(0.,.0045,0.);
  float body=sdCylX(c,.0045,L)-.0004;
  float t=clamp((L+.022-c.x)/.022,0.,1.);
  float tip=max(length(c.yz)-.0046*t,abs(c.x-L-.011)-.011)*.7;
  return min(body,tip); }
float xwPencilT(vec3 q,float L){ if(q.x>L+.016) return .25; if(q.x>L) return .85; if(q.x<-L+.012) return .4; return .55; }
/* closed hardback book lying flat, spine on -x; returns cover (x) and pages (y) */
vec2 xwBookD(vec3 q,vec3 s){ vec3 c=q-vec3(0.,s.y,0.);
  float cov=sdRBox(c,s,.003);
  cov=max(cov,-sdBox(c-vec3(.012,0.,0.),vec3(s.x,s.y-.0035,s.z-.004)));
  float pg=sdRBox(c-vec3(.002,0.,0.),vec3(s.x-.004,s.y-.0035,s.z-.005),.001);
  return vec2(cov,pg); }
float xwPagesT(vec3 q){ return abs(fract(q.y*900.)-.5)<.12?.75:.93; }
/* flat ruler along local x */
float xwRulerD(vec3 q,float L){ return sdRBox(q-vec3(0.,.0025,0.),vec3(L,.0022,.016),.0008); }
float xwRulerT(vec3 q,float L){ float u=(q.x+L)/.01; float f=fract(u);
  float tall=mod(floor(u+.5),5.)<.5?.009:.005;
  if(q.z>.016-tall&&(f<.09||f>.91)) return .3;
  return .8; }
/* candle in a small dish: returns (dish+candle, flame) */
vec2 xwCandleD(vec3 q){ float dish=sdCylY(q-vec3(0.,.005,0.),.038,.004)-.002;
  dish=min(dish,sdTorus(q-vec3(0.,.01,0.),.036,.003));
  float can=sdCylY(q-vec3(0.,.045,0.),.014,.04)-.001;
  float wick=sdCapsule(q,vec3(0.,.085,0.),vec3(0.,.092,0.),.0009);
  vec3 f=q-vec3(0.,.103,0.); f.y*=.55; float fl=(length(f)-.0062);
  fl=smin(fl,sdCapsule(q,vec3(0.,.1,0.),vec3(0.,.122,0.),.0008),.006);
  return vec2(min(min(dish,can),wick),fl); }
