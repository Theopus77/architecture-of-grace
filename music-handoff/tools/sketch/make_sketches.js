/* AOG-SKETCH-MUSIC-V1 (2026-10-04) — pencil drawings for The Studio (the home door for every instrument), The Mixing Desk
   (the 8-track) and The Drum Kit, in the manner of the site's other music banners (img/banners/music-*-pencil-*): graphite
   on warm paper, the subject to the right, a soft cast shadow, a faint ruled line top left. Each is an SVG (wobbly strokes
   through feTurbulence + feDisplacementMap, hatched shading, paper grain), photographed by Chromium at 1600 × 534 and
   900 × 300, then written as -1600.webp, -900.webp and -900.jpg by ffmpeg.
     node music-handoff/tools/sketch/make_sketches.js                  (writes aog-deploy/img/banners/)              */
const path=require("path"), fs=require("fs"), cp=require("child_process");
const pw=require(cp.execSync("npm root -g").toString().trim()+"/playwright");
const OUT=path.resolve(__dirname,"../../../aog-deploy/img/banners"), TMP=require("os").tmpdir();
const INK="#2b2926", W=1600, H=534;
const defs=`<defs>
  <filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 .55  0 0 0 0 .5  0 0 0 0 .44  0 0 0 .07 0"/><feComposite in2="SourceGraphic" operator="in"/><feBlend in="SourceGraphic" mode="multiply"/></filter>
  <filter id="pencil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7" result="w"/>
    <feDisplacementMap in="SourceGraphic" in2="w" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="2" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.25" result="gm"/>
    <feComposite in="d" in2="gm" operator="in"/></filter>
  <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(32)"><line x1="0" y1="0" x2="0" y2="7" stroke="${INK}" stroke-width="1.5" opacity=".75"/></pattern>
  <pattern id="hatch2" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)"><line x1="0" y1="0" x2="0" y2="5" stroke="${INK}" stroke-width="1.3" opacity=".7"/></pattern>
  <radialGradient id="shadow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#3f3b35" stop-opacity=".42"/><stop offset="1" stop-color="#4a463f" stop-opacity="0"/></radialGradient>
</defs>`;
const L=`fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round" stroke-width="4.35"`;
const frame=(body)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs}
  <rect width="${W}" height="${H}" fill="#f1ece2" filter="url(#paper)"/>
  <path d="M0 90 L760 12" ${L} stroke-width="2.9" opacity=".35" filter="url(#pencil)"/>
  <g filter="url(#pencil)">${body}</g></svg>`;
/* the parts */
const shadow=(cx,cy,rx,ry)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#shadow)"/>`;
function desk(x,y,w){   /* a mixing desk seen from the front and above: a sloped top with faders and knobs, a front panel */
  const h=w*0.42, d=w*0.13; let s=shadow(x+w*0.5, y+h+d+18, w*0.62, 26);
  s+=`<path d="M${x} ${y+h} L${x+w*0.08} ${y} L${x+w*0.92} ${y} L${x+w} ${y+h} Z" fill="#ece6da" ${L} stroke-width="4.35"/>`;
  s+=`<path d="M${x} ${y+h} L${x} ${y+h+d} L${x+w} ${y+h+d} L${x+w} ${y+h}" fill="url(#hatch)" ${L} stroke-width="4.35"/>`;
  const n=8; for(let i=0;i<n;i++){ const t=(i+0.5)/n, fx=x+w*0.08+(w*0.84)*t, top=y+h*0.38, bot=y+h*0.88, kx=x+w*0.08+(w*0.84)*t;
    s+=`<line x1="${fx}" y1="${top}" x2="${fx+ (t-0.5)*10}" y2="${bot}" ${L} stroke-width="2.9"/>`;
    const cap=top+(bot-top)*(0.25+0.5*((i*37)%10)/10); s+=`<rect x="${fx-9}" y="${cap-6}" width="18" height="12" rx="3" fill="url(#hatch2)" ${L} stroke-width="2.9"/>`;
    for(let k=0;k<2;k++) s+=`<circle cx="${kx}" cy="${y+h*(0.1+0.12*k)}" r="7" fill="#e6dfd1" ${L} stroke-width="2.9"/>`; }
  s+=`<rect x="${x+w*0.68}" y="${y+h*0.06}" width="${w*0.2}" height="${h*0.16}" rx="4" fill="url(#hatch2)" ${L} stroke-width="2.9"/>`;
  return s;
}
function headphones(x,y,r){ return shadow(x, y+r*0.9, r*1.2, 14)+`<path d="M${x-r} ${y+r*0.3} A${r} ${r*0.95} 0 0 1 ${x+r} ${y+r*0.3}" ${L} stroke-width="7.25"/>
  <rect x="${x-r-14}" y="${y+r*0.2}" width="26" height="${r*0.62}" rx="12" fill="url(#hatch)" ${L} stroke-width="4.35"/><rect x="${x+r-12}" y="${y+r*0.2}" width="26" height="${r*0.62}" rx="12" fill="url(#hatch)" ${L} stroke-width="4.35"/>`; }
function mic(x,y,h){ return shadow(x, y+h+8, 70, 12)+`<line x1="${x}" y1="${y+40}" x2="${x}" y2="${y+h}" ${L} stroke-width="5.8"/><path d="M${x-60} ${y+h} L${x} ${y+h-14} L${x+60} ${y+h}" ${L} stroke-width="4.35"/>
  <rect x="${x-22}" y="${y-40}" width="44" height="80" rx="22" fill="url(#hatch2)" ${L} stroke-width="4.35"/>${[0,1,2,3].map(i=>`<line x1="${x-18}" y1="${y-26+i*14}" x2="${x+18}" y2="${y-26+i*14}" ${L} stroke-width="2.17"/>`).join("")}`; }
function guitar(x,y,s){   /* an acoustic guitar leaning back, as the site's guitar drawing */
  return shadow(x+40*s, y+150*s, 190*s, 18)+`<g transform="translate(${x} ${y}) rotate(-62) scale(${s})">
    <path d="M0 0 C-70 0 -80 70 -45 95 C-90 120 -85 210 0 210 C85 210 90 120 45 95 C80 70 70 0 0 0 Z" fill="#ebe5d8" ${L} stroke-width="4.35"/>
    <circle cx="0" cy="88" r="24" fill="url(#hatch)" ${L} stroke-width="3.62"/><rect x="-22" y="150" width="44" height="10" rx="3" ${L} stroke-width="3.62"/>
    <rect x="-9" y="-190" width="18" height="190" fill="url(#hatch2)" ${L} stroke-width="3.62"/><path d="M-14 -190 L-16 -250 L16 -250 L14 -190 Z" fill="#e6dfd1" ${L} stroke-width="3.62"/>
    ${[0,1,2].map(i=>`<circle cx="-22" cy="${-240+i*18}" r="5" ${L} stroke-width="2.9"/><circle cx="22" cy="${-240+i*18}" r="5" ${L} stroke-width="2.9"/>`).join("")}</g>`; }
function keys(x,y,w){ const h=w*0.18; let s=shadow(x+w/2, y+h+14, w*0.6, 16)+`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#ece6da" ${L} stroke-width="4.35"/>`;
  const n=17, kw=(w-20)/n; for(let i=0;i<n;i++) s+=`<rect x="${x+10+i*kw}" y="${y+h*0.32}" width="${kw}" height="${h*0.6}" fill="#f4efe5" ${L} stroke-width="2.32"/>`;
  [0,1,3,4,5,7,8,10,11,12,14,15].forEach(i=>{ s+=`<rect x="${x+10+(i+0.68)*kw}" y="${y+h*0.32}" width="${kw*0.64}" height="${h*0.36}" fill="url(#hatch)" ${L} stroke-width="2.03"/>`; }); return s; }
function drum(cx,cy,rx,ry,d,hatch){ return shadow(cx, cy+d+ry*0.8, rx*1.2, 16)+`<path d="M${cx-rx} ${cy} L${cx-rx} ${cy+d} A${rx} ${ry} 0 0 0 ${cx+rx} ${cy+d} L${cx+rx} ${cy}" fill="url(#${hatch||"hatch"})" ${L} stroke-width="4.35"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#f1ece2" ${L} stroke-width="4.35"/><ellipse cx="${cx}" cy="${cy}" rx="${rx-7}" ry="${ry-5}" ${L} stroke-width="2.17"/>
  ${[0.12,0.3,0.5,0.7,0.88].map(t=>{ const a=Math.PI*t, x=cx-rx*Math.cos(a), yy=cy+ry*Math.sin(a); return `<line x1="${x}" y1="${yy+6}" x2="${x}" y2="${yy+d-6}" ${L} stroke-width="4.35"/>`; }).join("")}`; }
function cymbal(cx,cy,rx,ry,standTo){ return (standTo?`<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${standTo}" ${L} stroke-width="4.35"/>`:"")+`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#hatch2)" ${L} stroke-width="3.62"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx*0.62}" ry="${ry*0.62}" ${L} stroke-width="1.74" opacity=".6"/><ellipse cx="${cx}" cy="${cy-2}" rx="${rx*0.2}" ry="${ry*0.4}" fill="#e6dfd1" ${L} stroke-width="2.9"/>`; }
function sticks(x,y){ return `<line x1="${x}" y1="${y}" x2="${x+300}" y2="${y-8}" ${L} stroke-width="13.05"/><line x1="${x}" y1="${y}" x2="${x+300}" y2="${y-8}" stroke="#f1ece2" stroke-width="7.25" stroke-linecap="round"/>
  <line x1="${x+60}" y1="${y+40}" x2="${x+270}" y2="${y-60}" ${L} stroke-width="13.05"/><line x1="${x+60}" y1="${y+40}" x2="${x+270}" y2="${y-60}" stroke="#f1ece2" stroke-width="7.25" stroke-linecap="round"/>`; }
function kit(x,y,s){   /* a small kit: bass drum from the front, a tom on it, a snare, a hi-hat and a cymbal */
  let o=`<g transform="translate(${x} ${y}) scale(${s})">`;
  o+=cymbal(-150,-40,110,22,190)+cymbal(380,-90,130,26,190);
  o+=shadow(120,215,240,22)+`<ellipse cx="120" cy="100" rx="120" ry="112" fill="#f1ece2" ${L} stroke-width="5.08"/><ellipse cx="120" cy="100" rx="104" ry="96" fill="url(#hatch2)" ${L} stroke-width="2.9"/><ellipse cx="120" cy="100" rx="42" ry="38" fill="#f1ece2" ${L} stroke-width="2.9"/>`;
  o+=drum(140,-30,78,24,46)+drum(-120,70,92,28,40)+drum(330,90,95,30,70,"hatch2");
  o+=`<line x1="-120" y1="110" x2="-120" y2="215" ${L} stroke-width="4.35"/><line x1="330" y1="160" x2="330" y2="215" ${L} stroke-width="4.35"/>`;
  return o+`</g>`; }
const SKETCHES={
  /* The Studio: every instrument in one room — the keys, a guitar, a small kit, headphones */
  "music-studio": frame(keys(560,330,400)+headphones(690,262,44)+guitar(1040,170,0.85)+kit(1300,250,0.55)),
  /* The Mixing Desk: the eight-track's desk, headphones, a microphone */
  "music-mixdesk": frame(desk(760,170,560)+headphones(1430,330,52)+mic(650,150,250)),
  /* The Drum Kit: a kit and a pair of sticks */
  "music-kit": frame(kit(930,250,0.95)+sticks(560,420)),
};
(async()=>{
  const b=await pw.chromium.launch(), p=await (await b.newContext({viewport:{width:W,height:H}})).newPage();
  for(const [name, svg] of Object.entries(SKETCHES)){
    await p.setContent(`<html><body style="margin:0">${svg}</body></html>`); await p.waitForTimeout(150);
    const png=path.join(TMP, name+".png"); await p.screenshot({path:png, clip:{x:0,y:0,width:W,height:H}});
    const ff=(args)=>cp.execSync(`ffmpeg -v error -y ${args}`);
    ff(`-i "${png}" -c:v libwebp -quality 72 "${OUT}/${name}-pencil-1600.webp"`);
    ff(`-i "${png}" -vf scale=900:-2 -c:v libwebp -quality 70 "${OUT}/${name}-pencil-900.webp"`);
    ff(`-i "${png}" -vf scale=900:-2 -q:v 5 "${OUT}/${name}-pencil-900.jpg"`);
    console.log("wrote", name);
  }
  await b.close();
})();
