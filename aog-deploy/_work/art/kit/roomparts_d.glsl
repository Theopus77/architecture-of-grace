/* Parts for the practice-room pencil still lifes (batch rooms4). Include after studio.glsl
   and medparts_a.glsl. Every part takes a local point q (already moved and turned), metres. */
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
/* a coin lying flat, base at y=0, with a raised rim */
float coinD(vec3 q,float R,float H){
  float d=sdCylY(q-vec3(0.,H*.5,0.),R,H*.5)-.0008;
  float rim=sdTorus(q-vec3(0.,H,0.),R-.0015,.0009);
  return min(d,rim); }
/* a stack of n coins, a little jittered */
float coinStack(vec3 q,float R,float H,int n){ float d=1e5;
  for(int i=0;i<16;i++){ if(i>=n) break; float fi=float(i);
    vec3 o=vec3(.0015*sin(fi*2.3),fi*H,.0015*cos(fi*1.7)); d=min(d,coinD(q-o,R,H*.9)); }
  return d; }
/* a spur gear lying flat (axis y), centre at q=0, thickness 2h */
float gearD(vec3 q,float R,float teeth,float h){
  float a=atan(q.z,q.x); float r=length(q.xz);
  float t=smoothstep(-.3,.3,cos(a*teeth));
  float d=max(r-(R+.006*t)+.0,abs(q.y)-h)-.001;
  d=max(d,-(r-R*.22));                     /* axle hole */
  float web=max(abs(r-R*.6)-R*.14,abs(q.y)-h*.5); /* recess the web */
  d=max(d,-max(web,-q.y-h*.2));
  return d; }
/* a cylindrical glass jar standing on y=0, open (lid optional) */
float jarD(vec3 q,float R,float H){
  float o=sdCylY(q-vec3(0.,H*.5,0.),R,H*.5)-.003;
  float i=sdCylY(q-vec3(0.,H*.5+.006,0.),R-.004,H*.5);
  float d=max(o,-i);
  d=min(d,sdTorus(q-vec3(0.,H,0.),R-.001,.004));
  return d; }
/* a plain round bowl on a foot, base at y=0 */
float bowlD(vec3 q,float R,float H){
  vec3 c=q-vec3(0.,H*1.05,0.);
  float s=length(c*vec3(1.,R/H,1.))-R; s=abs(s)-.003; s=max(s,q.y-H*1.05);
  float foot=sdCylY(q-vec3(0.,.004,0.),R*.45,.004)-.001;
  return min(s*.8,foot); }
/* the vowels, in the same -0.5..0.5 box as glyph(): A E I O U (65 69 73 79 85) */
float glyphV(vec2 p,int g){
  if(g==65) return glyph(p,65);
  if(g==69){ float d=seg(p,vec2(-.2,-.4),vec2(-.2,.4)); d=min(d,seg(p,vec2(-.2,.4),vec2(.22,.4)));
    d=min(d,seg(p,vec2(-.2,0.),vec2(.14,0.))); return min(d,seg(p,vec2(-.2,-.4),vec2(.22,-.4))); }
  if(g==73){ float d=seg(p,vec2(0.,-.4),vec2(0.,.4)); d=min(d,seg(p,vec2(-.14,.4),vec2(.14,.4))); return min(d,seg(p,vec2(-.14,-.4),vec2(.14,-.4))); }
  if(g==79){ return abs(length(p*vec2(1.,.78))-.3); }
  if(g==85){ float d=seg(p,vec2(-.24,.4),vec2(-.24,-.12)); d=min(d,seg(p,vec2(.24,.4),vec2(.24,-.12)));
    return min(d,arc(p,vec2(0.,-.12),.24,PI,2.*PI)); }
  return 1e3; }
float carveV(float d3,vec2 uv,int g,float sz,float w,float z,float dep){
  float gd=glyphV(uv/sz,g)*sz-w; return max(d3,-max(gd,abs(z)-dep)); }
