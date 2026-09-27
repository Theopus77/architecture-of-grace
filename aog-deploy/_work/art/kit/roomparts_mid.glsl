/* Parts for the practice-room pencil still lifes (params_rooms2c.json). Include after
   studio.glsl and medparts_a.glsl (sdEll, place, pencilD2, bookD). Every part takes a local
   point q (already moved and turned), in metres. */
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
/* distance to the nearest grid line, lines every u, one on 0 */
float gridLn(float v,float u){ return abs(v-u*floor(v/u+.5)); }
/* cut shallow grooves where g<w, only within dep of the surface of d */
float groove(float d,float g,float w,float dep){ return max(d,-max(g-w,-d-dep)); }
/* base-ten blocks, unit edge u, resting on y=0 and centred on x,z */
float flatD(vec3 q,float u){ float d=sdRBox(q-vec3(0.,u*.5,0.),vec3(5.*u,u*.5,5.*u),.0012);
  float g=min(gridLn(q.x,u),gridLn(q.z,u)); return groove(d,g,.0006,.0007); }
float rodD(vec3 q,float u){ float d=sdRBox(q-vec3(0.,u*.5,0.),vec3(5.*u,u*.5,u*.5),.0012);
  return groove(d,gridLn(q.x,u),.0006,.0007); }
float unitD(vec3 q,float u){ return sdRBox(q-vec3(0.,u*.5,0.),vec3(u*.5),.0015); }
/* painted grid tone: dark on the lines */
float gridTone(vec2 v,float u,float base){ float g=min(gridLn(v.x,u),gridLn(v.y,u)); return g<.0011?base-.35:base; }
/* extrude a 2D distance along z to half-thickness h */
float extrude(float d2,float z,float h){ vec2 w=vec2(d2,abs(z)-h); return min(max(w.x,w.y),0.)+length(max(w,0.)); }
/* a candlestick: round foot, turned stem, drip cup and a candle, base at y=0 */
float candlestickD(vec3 q,float H){
  float r=length(q.xz);
  float foot=sdCylY(q-vec3(0.,.006,0.),.034,.006)-.003;
  foot=smin(foot,sdCylY(q-vec3(0.,.016,0.),.018,.006)-.003,.008);
  float y=q.y/H; float prof=.007+.004*sin(y*18.)*smoothstep(.1,.3,y)+.006*exp(-pow((y-.5)*9.,2.));
  float stem=max(r-prof,abs(q.y-H*.5)-H*.5)*.8;
  float cup=sdCylY(q-vec3(0.,H,0.),.02,.004)-.002;
  return min(min(foot,stem),cup); }
float candleD(vec3 q,float H,float L){ return sdCylY(q-vec3(0.,H+L*.5,0.),.0085,L*.5)-.0008; }
