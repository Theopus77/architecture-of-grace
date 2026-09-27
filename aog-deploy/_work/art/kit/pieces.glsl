/* AOG render kit — reusable scene pieces (pieces.glsl). Include after lib.glsl.
   Every piece returns a distance you then U()-merge in map() with your own material ids. */

/* --- a broadleaf tree. b = base of trunk, H = trunk height to crown, C = crown radius.
       trunk distance in .x, canopy distance in .y. The canopy is a cluster of noisy lobes. */
vec2 sdTree(vec3 p,vec3 b,float H,float C,float seed){
  vec3 q=p-b;
  float tr=sdCone(q-vec3(0,H*.5,0),C*.09,C*.05,H*.5);
  /* three main limbs into the crown */
  for(int i=0;i<3;i++){ float a=seed*7.+float(i)*2.1; vec3 e=vec3(cos(a)*C*.55,H+C*.35,sin(a)*C*.55);
    tr=smin(tr,sdCapsule(q,vec3(0,H*.75,0),e,C*.035),C*.05); }
  float bound=length(q-vec3(0,H+C*.45,0))-C*1.55;
  float cn=1e5;
  if(bound<C*.6){
    for(int i=0;i<12;i++){ float fi=float(i); float a=seed*3.+fi*2.39996; float r=C*(i==0?0.:.35+.35*fract(fi*.618));
      vec3 c=vec3(cos(a)*r,H+C*(.5+.45*fract(fi*.382+seed)),sin(a)*r*.85);
      cn=smin(cn,length(q-c)-C*(.5-.06*mod(fi,3.)),C*.15); }
    vec3 w=q/C;
    cn+=(fbm3(w*2.2+seed)-.5)*C*.40;
    cn+=(vn3(w*9.+seed)-.5)*C*.07;
    cn*=.55;
  } else cn=bound;
  return vec2(tr,cn);
}
/* --- a distant tree line / hedgerow as a height offset (for heightfields) */
float treeLine(vec2 xz,float scale){ float n=fbm(xz/scale); float c=vn(xz/(scale*.18));
  return smoothstep(.45,.7,n)*(.6+.6*c); }
/* --- water surface normal: small wind ripples */
vec3 waterN(vec2 xz,float t){ float e=.02, s=.9; vec2 q=xz*s;
  float h=fbm(q*vec2(1.,2.2)); float hx=fbm((q+vec2(e,0))*vec2(1.,2.2)), hz=fbm((q+vec2(0,e))*vec2(1.,2.2));
  float k=.035/(1.+t*.03);
  return normalize(vec3(-(hx-h)/e*k,1.,-(hz-h)/e*k)); }
/* --- a rainbow: centre direction c (the antisolar point), angular radius rDeg */
vec3 rainbow(vec3 rd,vec3 c,float rDeg,float strength){
  float a=degrees(acos(clamp(dot(rd,normalize(c)),-1.,1.)));
  float x=(a-rDeg)/2.2;            /* ~2 deg wide primary */
  vec3 col=vec3(smoothstep(.2,.9,x)*smoothstep(1.45,.95,x), smoothstep(-.35,.25,x)*smoothstep(.95,.35,x),
                smoothstep(-.95,-.45,x)*smoothstep(.2,-.35,x));
  float inner=smoothstep(0.,-3.,x)*.06;   /* the sky is brighter inside the bow */
  return (col*vec3(1.,.9,1.1)+inner)*strength;
}
