/* AOG-MUSIC-TOUCH-V1 — wake Safari's audio on the first touch, every time it sleeps */
(function(){ function wake(){ try{ if(typeof actx!=="undefined"&&actx&&actx.state!=="running") actx.resume(); }catch(e){} }
  ["touchstart","pointerdown","keydown"].forEach(function(t){ document.addEventListener(t, wake, {capture:true, passive:true}); }); })();
/* ══ AOG-DECKS-ALBUM-V1 (2026-10-28) — Jimmy: "play multiple songs on a record … upload whole albums to play on vinyl, just for
   a nostalgia / cool factor". + A whole album takes many songs at once, reads each one's name, album and number from the file
   (MP3 and iTunes AAC tags; the file names otherwise), keeps them in the library with the album, and puts it on as a record:
   Side A and Side B (an album of four songs or more), a gap in the grooves between songs, the arm moving in across the side,
   the album's name on the label. At the end of a song the needle runs on into the next one; at the end of a side the record
   stops and asks to be flipped. Only the song playing is opened in memory. ══ */
(function(){
  const ALB = { loading:false, ready:null, adv:{} };
  CRATE.albums = [];
  const nat = (a, b)=>String(a).localeCompare(String(b), undefined, { numeric:true, sensitivity:"base" });
  const bare = n=>String(n || "").replace(/\.[^.]+$/, "").replace(/^\s*\d{1,3}\s*[-._)]?\s+/, "").trim() || String(n || "");
  function dec(b, enc){ try{ const nm = enc===0 ? "iso-8859-1" : enc===3 ? "utf-8" : enc===2 ? "utf-16be" : (b[0]===0xFE && b[1]===0xFF ? "utf-16be" : "utf-16le");
    return new TextDecoder(nm).decode(b).replace(/^\uFEFF/, "").replace(/\0+$/g, "").split("\0")[0].trim(); }catch(e){ return ""; } }
  async function id3(f){
    const h = new Uint8Array(await f.slice(0, 10).arrayBuffer()); if(h[0]!==73 || h[1]!==68 || h[2]!==51 || h[3] < 3) return {};
    const v = h[3], ss = (a,i)=>(a[i]&127)<<21 | (a[i+1]&127)<<14 | (a[i+2]&127)<<7 | (a[i+3]&127);
    const b = new Uint8Array(await f.slice(10, 10 + Math.min(ss(h, 6), 1<<20)).arrayBuffer()), o = {};
    let p = (h[5] & 0x40) ? (v===4 ? ss(b, 0) : ((b[0]<<24 | b[1]<<16 | b[2]<<8 | b[3]) >>> 0) + 4) : 0;
    while(p + 10 <= b.length){ const id = String.fromCharCode(b[p], b[p+1], b[p+2], b[p+3]); if(!/^[A-Z0-9]{4}$/.test(id)) break;
      const sz = v===4 ? ss(b, p+4) : ((b[p+4]<<24 | b[p+5]<<16 | b[p+6]<<8 | b[p+7]) >>> 0); if(!(sz > 0)) break;
      if(/^(TIT2|TALB|TPE1|TPE2|TRCK|TPOS)$/.test(id)){ const body = b.subarray(p+10, p+10+sz); o[id] = dec(body.subarray(1), body[0]); }
      p += 10 + sz; }
    return { title:o.TIT2, album:o.TALB, artist:o.TPE2 || o.TPE1, n:parseInt(o.TRCK, 10) || 0, disc:parseInt(o.TPOS, 10) || 0 };
  }
  async function mp4(f){   /* moov › udta › meta › ilst: ©nam, ©alb, ©ART / aART, trkn, disk */
    let at = 0, moov = null;
    for(let k = 0; k < 64 && at + 8 <= f.size; k++){ const hd = new DataView(await f.slice(at, at + 16).arrayBuffer()); let sz = hd.getUint32(0);
      const ty = String.fromCharCode(hd.getUint8(4), hd.getUint8(5), hd.getUint8(6), hd.getUint8(7));
      if(sz === 1) sz = hd.getUint32(8) * 4294967296 + hd.getUint32(12); else if(sz === 0) sz = f.size - at;
      if(sz < 8) break; if(ty === "moov"){ if(sz > (8<<20)) return {}; moov = new DataView(await f.slice(at, at + sz).arrayBuffer()); break; } at += sz; }
    if(!moov) return {};
    const kids = (v, a, b)=>{ const out = []; let p = a; while(p + 8 <= b){ const sz = v.getUint32(p); if(sz < 8 || p + sz > b) break;
      out.push({ ty:String.fromCharCode(v.getUint8(p+4), v.getUint8(p+5), v.getUint8(p+6), v.getUint8(p+7)), a:p + 8, b:p + sz }); p += sz; } return out; };
    const find = (list, ty)=>list.find(x=>x.ty === ty);
    const ud = find(kids(moov, 8, moov.byteLength), "udta"); if(!ud) return {};
    const me = find(kids(moov, ud.a, ud.b), "meta"); if(!me) return {};
    const il = find(kids(moov, me.a + 4, me.b), "ilst"); if(!il) return {};
    const o = {};
    kids(moov, il.a, il.b).forEach(it=>{ const dt = find(kids(moov, it.a, it.b), "data"); if(!dt) return; const a = dt.a + 8, n = dt.b - a; if(n <= 0) return;
      const raw = new Uint8Array(moov.buffer, moov.byteOffset + a, n);
      if(it.ty === "trkn" || it.ty === "disk"){ if(n >= 4) o[it.ty] = (raw[2] << 8) | raw[3]; }
      else o[it.ty] = dec(raw, 3); });
    return { title:o["\u00A9nam"], album:o["\u00A9alb"], artist:o.aART || o["\u00A9ART"], n:o.trkn || 0, disc:o.disk || 0 };
  }
  async function tagsOf(f){ try{ const h = new Uint8Array(await f.slice(0, 12).arrayBuffer());
    if(h[0]===73 && h[1]===68 && h[2]===51) return await id3(f);
    if(String.fromCharCode(h[4], h[5], h[6], h[7]) === "ftyp") return await mp4(f); }catch(e){} return {}; }
  /* an album's songs are never pushed out of the library by new ones */
  function keepLib(){ const held = new Set(); CRATE.albums.forEach(a=>a.tracks.forEach(x=>held.add(x.id)));
    let free = 0; CRATE.lib = CRATE.lib.filter(r=>held.has(r.id) || ++free <= 60); }
  const sides = a=>{ const n = a.tracks.length; if(n < 4 || a.mix) return [[0, n]];   /* AOG-DECKS-MIX-V1: a record you made plays straight through */ const h = Math.ceil(n/2); return [[0, h], [h, n]]; };
  const keyOf = d=>"aog.decks.alb."+d.id;
  function grooves(n){ if(n < 2) return ""; const c = "var(--gapc,#1f1f1f)", g = [];
    for(let k = 1; k < n; k++){ const p = 93 - 46*k/n; g.push(`transparent 0 ${p.toFixed(1)}%, ${c} ${(p+.4).toFixed(1)}% ${(p+1.2).toFixed(1)}%, transparent ${(p+1.6).toFixed(1)}%`); }
    return "radial-gradient(circle closest-side, " + g.join(", ") + ")"; }
  function paintAlb(d){
    const bar = document.querySelector('[data-alb="'+d.id+'"]'); if(!bar) return;
    const A = d.album; if(!A){ if(!bar.hidden){ bar.hidden = true; bar.innerHTML = ""; } return; }
    const al = CRATE.albums.find(x=>x.id === A.id); if(!al){ d.album = null; paintAlb(d); return; }
    const [a, b] = sides(al)[A.side], n = b - a, two = sides(al).length > 1;
    const say = A.over ? (A.side === 0 && two ? t("albOver") : t("albDone")) : "";
    const tr = al.tracks[A.i] || {};
    const h = `<p class="albnow">💿 <b>${esc(al.name)}</b>${al.artist ? " · " + esc(al.artist) : ""}<br>${two ? esc(t("albSide").replace("%s", "AB"[A.side])) + " · " : ""}${esc(t("albOf").replace("%i", A.i - a + 1).replace("%n", n))} · ${esc(tr.title || "")}</p>`
      + (say ? `<p class="albsay" aria-live="polite">${esc(say)}</p>` : "")
      + `<div class="row"><button type="button" class="ghost sm" data-albgo="-1">${t("albPrev")}</button><button type="button" class="ghost sm" data-albgo="1">${t("albNext")}</button>`
      + `${two || A.over ? `<button type="button" class="ghost sm" data-albflip="1">${t("albFlip")}</button>` : ""}</div>`
      + `<details${bar._open ? " open" : ""}><summary>${t("albList")}</summary><div class="albtr">${al.tracks.slice(a, b).map((x, k)=>`<button type="button" data-albtr="${a + k}"${a + k === A.i ? ' aria-current="true"' : ""}>${a + k - a + 1}. ${esc(x.title)}</button>`).join("")}</div></details>`;
    if(bar._h !== h){ bar._h = h; bar.innerHTML = h; }
    bar.hidden = false;
    const v = document.querySelector("#deck"+d.id+" .vinyl"); if(v){ const g = grooves(n); if(v._g !== g){ v._g = g; if(g) v.style.setProperty("--gaps", g); else v.style.removeProperty("--gaps"); } }
  }
  function forget(d){ d.album = null; try{ localStorage.removeItem(keyOf(d)); }catch(e){} const v = document.querySelector("#deck"+d.id+" .vinyl"); if(v){ v._g = ""; v.style.removeProperty("--gaps"); } paintAlb(d); }
  async function play(d, al, side, i, go){
    const rec = CRATE.lib.find(r=>r.id === al.tracks[i].id); if(!rec){ d.note = t("nope").replace("%s", al.tracks[i].title); paintDeck(d); return; }
    clearTimeout(ALB.adv[d.id]); ALB.loading = true;
    try{ await loadFile(d, crateFile(rec)); }finally{ ALB.loading = false; }
    if(!d.buf) return;
    d.album = { id:al.id, name:al.name, side, i, n:sides(al)[side][1] - sides(al)[side][0], over:false };
    try{ localStorage.setItem(keyOf(d), JSON.stringify({ id:al.id, side, i })); }catch(e){}
    const v = document.querySelector("#deck"+d.id+" .vinyl"); if(v) v._rk = "";
    paintRecord(d); paintAlb(d); d._albAt = performance.now();
    /* the engine's last word about the song before can still be on its way: start once the new one is in */
    if(go){ await new Promise(r=>setTimeout(r, 150)); if(d.album && d.album.i === i) await startDeck(d); }
  }
  function step(d, dir, go){
    const A = d.album, al = A && CRATE.albums.find(x=>x.id === A.id); if(!al) return;
    const [a, b] = sides(al)[A.side], j = A.i + dir;
    if(dir < 0 && d.buf && d.pos / d.buf.sampleRate > 3){ play(d, al, A.side, A.i, go); return; }   /* Back, partway in: this song from its start */
    if(j < a || j >= b) return; play(d, al, A.side, j, go);
  }
  function flip(d){ const A = d.album, al = A && CRATE.albums.find(x=>x.id === A.id); if(!al) return; const S2 = sides(al), s = S2.length > 1 ? 1 - A.side : 0; play(d, al, s, S2[s][0], true); }
  /* the needle runs on: at the end of a song, after the quiet groove between songs, the next one on this side */
  const hr = window.hear; if(typeof hr === "function") window.hear = function(d, m){ const was = d.motor; const r = hr.apply(this, arguments);
    if(was && !d.motor && m && m.ended && d.album && !d.album.over && performance.now() - (d._albAt || 0) > 600){ const A = d.album, al = CRATE.albums.find(x=>x.id === A.id);
      if(al){ const [, b] = sides(al)[A.side]; clearTimeout(ALB.adv[d.id]);
        if(A.i + 1 < b) ALB.adv[d.id] = setTimeout(()=>{ if(d.album === A && !d.motor) play(d, al, A.side, A.i + 1, true); }, al.mix ? 700 : 1800);
        else { A.over = true; paintAlb(d); } } }
    return r; };
  /* any other record put on this deck takes the album off it */
  const po = window.putOn; if(typeof po === "function") window.putOn = function(d, buf, L, R, o){ const r = po.apply(this, arguments);
    if(!ALB.loading){ if(o && o.restore){ const k = d.id; ALB.ready.then(()=>reattach(d, k)); } else if(d.album) forget(d); }
    return r; };
  const cf = window.crateForget; if(typeof cf === "function") window.crateForget = function(d){ const r = cf.apply(this, arguments); forget(d); return r; };
  function reattach(d){ let s; try{ s = JSON.parse(localStorage.getItem(keyOf(d)) || "null"); }catch(e){ s = null; } if(!s) return;
    const al = CRATE.albums.find(x=>x.id === s.id), tr = al && al.tracks[s.i];
    if(!tr || !d.trackKey || d.trackKey.indexOf(tr.id + "·") !== 0){ forget(d); return; }
    const S2 = sides(al); if(!S2[s.side]) return;
    d.album = { id:al.id, name:al.name, side:s.side, i:s.i, n:S2[s.side][1] - S2[s.side][0], over:false };
    const v = document.querySelector("#deck"+d.id+" .vinyl"); if(v) v._rk = ""; paintRecord(d); paintAlb(d); }
  ALB.ready = crateGet("albums").then(v=>{ CRATE.albums = Array.isArray(v) ? v : []; paintDocks(); });
  /* the arm moves in across the whole side, not just one song */
  const pd = window.paintDeck; if(typeof pd === "function") window.paintDeck = function(d){ const r = pd.apply(this, arguments);
    if(d.album && d.buf && d.$ && d.$.mv){ const A = d.album, al = CRATE.albums.find(x=>x.id === A.id);
      if(al){ const [a] = sides(al)[A.side], f = Math.min(1, ((A.i - a) + Math.min(1, d.pos/d.buf.length)) / A.n); setA(d.$.mv.arm, Math.round((16 + 13*f)*10)*100); } }
    return r; };
  async function addAlbum(d, files, box){
    files = files.filter(f=>f && f.size > 0); if(!files.length) return;
    const recs = [], tags = [];
    for(let k = 0; k < files.length; k++){ const f = files[k];
      d.note = t("albMaking").replace("%i", k + 1).replace("%n", files.length); paintDeck(d);
      tags.push(await tagsOf(f)); recs.push({ id:crateId(f), name:f.name, blob:await crateCopy(f), at:Date.now() }); }
    const order = recs.map((r, k)=>k).sort((x, y)=>(tags[x].disc||0) - (tags[y].disc||0) || ((tags[x].n||1e4) - (tags[y].n||1e4)) || nat(recs[x].name, recs[y].name));
    const names = tags.map(g=>g.album).filter(Boolean), name = names.length ? names.sort((a, b)=>names.filter(x=>x===b).length - names.filter(x=>x===a).length)[0]
      : (t("albMine") + " " + (CRATE.albums.length + 1));
    const artist = (tags.find(g=>g.artist) || {}).artist || "";
    const al = { id:"al" + Date.now().toString(36), name, artist, at:Date.now(), tracks:order.map(k=>({ id:recs[k].id, title:tags[k].title || bare(recs[k].name) })) };
    CRATE.lib = recs.concat(CRATE.lib.filter(x=>!recs.some(r=>r.id === x.id)));
    CRATE.albums = [al].concat(CRATE.albums); keepLib();
    await cratePut("lib", CRATE.lib); await cratePut("albums", CRATE.albums);
    d.note = ""; paintDocks(); if(box) box.hidden = true;
    play(d, al, 0, 0, false);
  }
  const pk = window.paintDocks; if(typeof pk === "function") window.paintDocks = function(){ const r = pk.apply(this, arguments);
    document.querySelectorAll(".dock").forEach(box=>{ const id = box.id.slice(4), d = decks.find(x=>x.id === id); if(!d) return;
      box.querySelectorAll("[data-dalb]").forEach(b=>{ if(box.classList.contains("editing")) b.classList.add("rm");
        b.onclick = ()=>{ const al = CRATE.albums[+b.getAttribute("data-dalb")]; if(!al) return;
          if(box.classList.contains("editing")){ CRATE.albums = CRATE.albums.filter(x=>x !== al); cratePut("albums", CRATE.albums); decks.forEach(x=>{ if(x.album && x.album.id === al.id) forget(x); }); paintDocks(); return; }
          dockShut(id); play(d, al, 0, sides(al)[0][0], false); }; });
      const inp = box.querySelector("[data-albload]"); if(inp) inp.onchange = ()=>{ const fs = [...(inp.files || [])]; inp.value = ""; addAlbum(d, fs, box); };
      mixDock(box, d); });
    return r; };
  /* ══ AOG-DECKS-MIX-V1 (2026-10-28) — Jimmy: "more than one song to play as a option on a 'record' … 5-10 songs a record (as a
     mix more or less)". + Make a record: tap 2 to 10 of your songs in the order they play, give it a name if you like, Put it
     on. It is kept with your albums and plays straight through on one side, the needle running on with a short gap. ══ */
  function mixDock(box, d){
    const row = box.querySelector(".dockrow"); if(!row) return;
    if(!box.querySelector("[data-mkrec]")){ const b = document.createElement("button"); b.type = "button"; b.className = "ghost"; b.setAttribute("data-mkrec", "1"); b.textContent = t("mkRec");
      b.onclick = ()=>{ box.classList.remove("editing"); box._pick = []; box.classList.add("picking"); paintDocks(); }; row.appendChild(b); }
    if(!box.classList.contains("picking")) return;
    const pick = box._pick || (box._pick = []);
    box.querySelectorAll("[data-dsong]").forEach(b=>{ const r = CRATE.lib[+b.getAttribute("data-dsong")]; if(!r) return;
      const k = pick.indexOf(r.id); b.classList.toggle("pk", k >= 0); if(k >= 0) b.setAttribute("data-n", k + 1); else b.removeAttribute("data-n");
      b.setAttribute("aria-pressed", String(k >= 0));
      b.onclick = ()=>{ const j = pick.indexOf(r.id); if(j >= 0) pick.splice(j, 1); else if(pick.length < 10) pick.push(r.id); paintDocks(); }; });
    const list = box.querySelector(".docklist"); if(!list) return;
    const bar = document.createElement("div"); bar.className = "mkbar";
    bar.innerHTML = `<p>${esc(t("mkHint"))} <b>${esc(t("mkCount").replace("%n", pick.length))}</b></p><input type="text" data-mkname maxlength="40" placeholder="${esc(t("mkName"))}" aria-label="${esc(t("mkName"))}" value="${esc(box._mkName || "")}">`
      + `<button type="button" class="go" data-mkgo${pick.length < 2 ? " disabled" : ""}>${esc(t("mkGo"))}</button><button type="button" class="ghost" data-mkx>${esc(t("mkCancel"))}</button>`;
    list.before(bar);
    const nm = bar.querySelector("[data-mkname]"); nm.oninput = ()=>{ box._mkName = nm.value; };
    bar.querySelector("[data-mkx]").onclick = ()=>{ box.classList.remove("picking"); box._pick = []; box._mkName = ""; paintDocks(); };
    bar.querySelector("[data-mkgo]").onclick = async ()=>{ if(pick.length < 2) return;
      const recs = pick.map(id=>CRATE.lib.find(r=>r.id === id)).filter(Boolean), titles = [];
      for(const r of recs){ const g = await tagsOf(r.blob); titles.push(g.title || bare(r.name)); }
      const n = (CRATE.albums || []).filter(a=>a.mix).length + 1;
      const al = { id:"mx" + Date.now().toString(36), name:(box._mkName || "").trim() || (t("mkMine") + " " + n), artist:"", mix:true, at:Date.now(),
                   tracks:recs.map((r, k)=>({ id:r.id, title:titles[k] })) };
      CRATE.albums = [al].concat(CRATE.albums); keepLib(); await cratePut("albums", CRATE.albums);
      box.classList.remove("picking"); box._pick = []; box._mkName = ""; box.hidden = true;
      const tg = document.querySelector(`[data-dock="${d.id}"]`); if(tg) tg.setAttribute("aria-expanded", "false");
      paintDocks(); play(d, al, 0, 0, false); };
  }
  document.addEventListener("click", e=>{ const b = e.target.closest && e.target.closest(".albbar button, .albbar summary"); if(!b) return;
    const bar = b.closest(".albbar"), d = decks.find(x=>x.id === bar.getAttribute("data-alb")); if(!d || !d.album) return;
    if(b.tagName === "SUMMARY"){ setTimeout(()=>{ const dt = bar.querySelector("details"); bar._open = !!(dt && dt.open); }, 0); return; }
    const go = d.motor;
    if(b.hasAttribute("data-albgo")) step(d, +b.getAttribute("data-albgo"), go);
    else if(b.hasAttribute("data-albflip")) flip(d);
    else if(b.hasAttribute("data-albtr")){ const al = CRATE.albums.find(x=>x.id === d.album.id); if(al) play(d, al, d.album.side, +b.getAttribute("data-albtr"), go); } });
  const bd = window.bind; if(typeof bd === "function") window.bind = function(){ const r = bd.apply(this, arguments); decks.forEach(d=>{ const v = document.querySelector("#deck"+d.id+" .vinyl"); if(v) v._g = ""; paintAlb(d); }); return r; };
})();
/* ══ AOG-DECKS-1210-V1 (2026-10-28) — the 1210's own controls: Reset puts the pitch back on 0 (its light shows when it is
   there), the needle light, and the Start and Brake knobs (how long the platter takes to come up to speed, and to stop;
   kept on the device). Nothing here runs until a hand touches it. ══ */
(function(){
  const KEY = "aog.decks.t12.v1", R = { up:[0.2, 3, 0.5], down:[0.2, 6, 1.3] };   /* seconds: least, most, as it comes */
  let T = {}; try{ T = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; }catch(e){ T = {}; }
  const val = (id, w)=>{ const v = T[id] && +T[id][w]; return v > 0 ? v : R[w][2]; };
  const torque = (d)=>send(d, { t:"torque", up:val(d.id, "up")/3, down:val(d.id, "down")/3 });
  decks.forEach(d=>{ if(T[d.id]) torque(d); });
  function led(d){ const el = document.querySelector('[data-pled="'+d.id+'"]'); if(el) el.classList.toggle("on", Math.abs(d.pitch - 1) < 1e-6); }
  function knobs(){
    document.querySelectorAll(".t12-k").forEach(k=>{ const id = k.getAttribute("data-tk"), w = k.getAttribute("data-w"), v = val(id, w), r = R[w];
      k.style.setProperty("--a", (-135 + 270*(v - r[0])/(r[1] - r[0])) + "deg");
      k.setAttribute("aria-valuemin", r[0]); k.setAttribute("aria-valuemax", r[1]); k.setAttribute("aria-valuenow", v); k.setAttribute("aria-valuetext", v.toFixed(1) + " s");
      const o = document.querySelector('[data-tkv="'+id+w+'"]'); if(o && o.textContent !== v.toFixed(1)+" s") o.textContent = v.toFixed(1) + " s"; });
    decks.forEach(led);
  }
  function setK(id, w, v){ const r = R[w]; v = Math.round(Math.max(r[0], Math.min(r[1], v))*10)/10; if(v === val(id, w)) return;
    (T[id] = T[id] || {})[w] = v; try{ localStorage.setItem(KEY, JSON.stringify(T)); }catch(e){}
    const d = decks.find(x=>x.id === id); if(d) torque(d); knobs(); }
  const sp = window.setPitch; if(typeof sp === "function") window.setPitch = function(d){ const r = sp.apply(this, arguments); led(d); return r; };
  const bd = window.bind; if(typeof bd === "function") window.bind = function(){ const r = bd.apply(this, arguments); knobs(); return r; };
  document.addEventListener("click", e=>{
    const b = e.target.closest && e.target.closest("[data-preset],[data-tl],[data-wide]"); if(!b) return;
    if(b.hasAttribute("data-preset")){ const inp = document.querySelector('[data-speed="'+b.getAttribute("data-preset")+'"]'); if(inp){ inp.value = "1"; inp.dispatchEvent(new Event("input")); } }
    else if(b.hasAttribute("data-tl")){ const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(on)); const pl = b.closest(".t12-pl"); if(pl) pl.classList.toggle("lit", on); }
    else { const d = decks.find(x=>x.id === b.getAttribute("data-wide")); if(d) led(d); }
  });
  /* AOG-DECKS-PITCH-V1: the pitch fader follows the finger up and down itself (an iPad does not slide a turned slider, and
     scrolled the page instead); the input underneath keeps the value, the keys and everything that listens to it */
  let fdrag = null;
  const fset = (e)=>{ const f = fdrag, r = f.fd.getBoundingClientRect(), mn = +f.inp.min, mx = +f.inp.max, st = +f.inp.step || 0.005;
    let v = mn + Math.max(0, Math.min(1, (e.clientY - r.top - 10)/(r.height - 20))) * (mx - mn);
    v = Math.round((v - mn)/st)*st + mn; v = +v.toFixed(4);
    if(Math.abs(v - +f.inp.value) > 1e-6){ f.inp.value = String(v); f.inp.dispatchEvent(new Event("input")); } };
  document.addEventListener("pointerdown", e=>{ const fd = e.target.closest && e.target.closest(".t12-fd"); if(!fd) return;
    const inp = fd.querySelector("input"); if(!inp) return; fdrag = { fd, inp, p:e.pointerId };
    try{ fd.setPointerCapture(e.pointerId); }catch(x){} e.preventDefault(); fset(e); });
  document.addEventListener("pointermove", e=>{ if(fdrag && e.pointerId === fdrag.p){ e.preventDefault(); fset(e); } });
  ["pointerup","pointercancel"].forEach(t=>document.addEventListener(t, e=>{ if(fdrag && e.pointerId === fdrag.p) fdrag = null; }));
  document.addEventListener("touchstart", e=>{ if(e.target.closest && e.target.closest(".t12-fd, .t12-k") && e.cancelable) e.preventDefault(); }, { passive:false });
  let drag = null;
  document.addEventListener("pointerdown", e=>{ const k = e.target.closest && e.target.closest(".t12-k"); if(!k) return;
    const id = k.getAttribute("data-tk"), w = k.getAttribute("data-w"); drag = { k, id, w, y:e.clientY, v:val(id, w), p:e.pointerId };
    try{ k.setPointerCapture(e.pointerId); }catch(x){} e.preventDefault(); });
  document.addEventListener("pointermove", e=>{ if(!drag || e.pointerId !== drag.p) return; const r = R[drag.w];
    setK(drag.id, drag.w, drag.v + (drag.y - e.clientY)/140*(r[1] - r[0])); });
  ["pointerup","pointercancel"].forEach(t=>document.addEventListener(t, e=>{ if(drag && e.pointerId === drag.p) drag = null; }));
  document.addEventListener("keydown", e=>{ const k = e.target.closest && e.target.closest(".t12-k"); if(!k) return;
    const d = {ArrowUp:1, ArrowRight:1, ArrowDown:-1, ArrowLeft:-1}[e.key]; if(!d) return; e.preventDefault();
    const id = k.getAttribute("data-tk"), w = k.getAttribute("data-w"); setK(id, w, val(id, w) + d*0.1); });
  knobs();
})();
/* AOG-SOUND-HANDOFF-V1 — a sound sent from the oscilloscope goes into Up next */
(function(){ if(!/[?&]take=1/.test(location.search)||!window.aogHandoffTake) return;
  setTimeout(function(){ window.aogHandoffTake().then(function(v){ if(!v||!v.blob) return; const f=new File([v.blob], v.name||"scope.wav", {type:"audio/wav"});
    CRATE.next.push({ id:crateId(f), name:f.name, blob:f, at:Date.now() }); cratePut("next", CRATE.next); paintCrate(); }); }, 1200); })();
