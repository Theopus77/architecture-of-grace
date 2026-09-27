/* ssceco.glsl — shared shapes for the Social Studies (ssc) and Economics (eco) pencil
   scenes. Include after lib.glsl and studio.glsl. All sizes in metres. */
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
/* gable house in local space: floor at y=0, walls w x h x d (half sizes), roof pitch k (rise/run),
   ridge along x. returns (walls, roof) */
vec2 gableHouse(vec3 q,vec3 b,float k,float over){
  float body=sdRBox(q-vec3(0.,b.y,0.),vec3(b.x,b.y,b.z),.003);
  vec2 nn=normalize(vec2(k,1.));
  float gab=max(abs(q.x)-b.x+.002,max(nn.x*abs(q.z)+nn.y*(q.y-2.*b.y)-nn.x*b.z,2.*b.y-q.y));
  body=min(body,gab);
  float az=abs(q.z);
  float roof=max(abs(nn.x*az+nn.y*(q.y-2.*b.y)-nn.x*b.z-.006)-.005,max(abs(q.x)-b.x-over,az-b.z-over))-.001;
  return vec2(body,roof); }
/* a closed hardback book lying flat, centred at q, half sizes b (x along spine side) */
float bookD(vec3 q,vec3 b){
  float cov=sdRBox(q,b,.003);
  float pages=sdBox(q-vec3(.004,0.,0.),b-vec3(.002,.004,.005));
  return max(cov,-max(sdBox(q-vec3(.006,0.,0.),vec3(b.x,b.y-.0045,b.z-.004)),-pages)); }
/* a coin lying flat (axis y), radius r, half thickness t, milled rim */
float coinD(vec3 q,float r,float t){
  float d=sdCylY(q,r,t)-.0006;
  float face=sdCylY(q-vec3(0.,t,0.),r*.82,.0006);
  return max(d,-face*1.); }
/* a stack of n coins with a small random offset */
float coinStack(vec3 q,float r,float t,int n,float seed){
  float d=1e5;
  for(int i=0;i<12;i++){ if(i>=n) break; float fi=float(i);
    vec2 o=(h22(vec2(fi,seed))-.5)*r*.12;
    d=min(d,coinD(q-vec3(o.x,t+fi*2.*t*1.02,o.y),r,t*.96)); }
  return d; }
/* slatted wooden crate, open top, half sizes b */
float crateD(vec3 q,vec3 b){
  float o=sdRBox(q-vec3(0.,b.y,0.),b,.003);
  o=max(o,-sdBox(q-vec3(0.,b.y+.008,0.),b-vec3(.008,0.,.008)));
  return o; }
/* sphere-with-meridian globe on a stand. c = centre of ball, r = radius, tilt */
vec3 globeQ(vec3 p,vec3 c,float tilt,float spin){ vec3 q=p-c; q.xy=rot(tilt)*q.xy; q.xz=rot(spin)*q.xz; return q; }
/* painted continents on a unit direction (rough but recognisable blobs) */
float landMask(vec3 d){
  float lat=asin(clamp(d.y,-1.,1.)), lon=atan(d.z,d.x);
  float m=0.;
  /* Americas */
  m=max(m,1.-smoothstep(0.,.1,length(vec2((lon-1.2)*1.6,(lat-.75)*1.))-.55));
  m=max(m,1.-smoothstep(0.,.1,length(vec2((lon-1.45)*1.9,(lat+.35)*.9))-.45));
  m=max(m,1.-smoothstep(0.,.1,length(vec2((lon-1.35)*3.,(lat-.2)*2.))-.3));
  /* Africa and Eurasia */
  m=max(m,1.-smoothstep(0.,.1,length(vec2((lon+.3)*1.6,(lat-.05)*1.1))-.5));
  m=max(m,1.-smoothstep(0.,.1,length(vec2((lon+1.3)*.8,(lat-.85)*1.4))-.6));
  m=max(m,1.-smoothstep(0.,.1,length(vec2((lon+2.4)*1.7,(lat+.45)*1.8))-.35));
  m*=smoothstep(.25,.55,fbm(vec2(lon*3.,lat*3.))+.35);
  return m; }
