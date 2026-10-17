/* AOG-ONEBUTTON-V1 (2026-10-12) — One-button and big-switch play. Jimmy picked: "Any instrument can be played with one
   large button, a switch or the space bar, and the Studio keeps it in key and in time. Every learner can make real music."
   In each instrument room (Piano, Guitar, Bass, Band, Drum Machine, Drum Kit), on its own and inside the Studio:
   · closed at first; its engine (aog-onebutton-play.js) is fetched only when it is opened; nothing sounds until a press;
   · turned on: the big button, a pointer, Space, a game controller (a stub) and a MIDI keyboard (a stub, with Any key
     plays) each play the next one; chords and notes are in the key and in order (I–V–vi–IV, Twinkle, the five-note scale,
     the bass's roots and walking notes, the Drum Machine's beats, the Kit's kick and snare and its groove);
   · Help with timing: presses land on the beat (±10 ms of the grid); off: a press plays at once;
   · Wait before a press counts, Ignore repeat presses, two switches (next / stop), hold sustains on the piano;
   · a take hears the presses; Learn a song's chords and tune are followed; the room's own keys still work;
   · silent treatment: no timer while idle (callbacks counted for 3 s), aog-hush lets go and stops the controller polling;
   · iPhone and iPad inside the Studio: the big button in view without scrolling once on; Spanish; readable (check-contrast's
     probe) and calm (check-calm's probe) in light and dark; no page errors.
   Ports 9309 (rooms on their own) and 9310 (the Studio). */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const P1 = 9309, P2 = 9310, U1 = "http://localhost:" + P1 + "/", U2 = "http://localhost:" + P2 + "/";
const srv1 = require("../srv.js")(P1), srv2 = require("../srv.js")(P2);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* stand-ins: a game controller, a MIDI keyboard, and a count of every timer and frame callback */
const INIT = () => {
  try { localStorage.setItem("aog.lang", "en"); } catch (e) {}
  window.__pads = []; navigator.getGamepads = () => window.__pads;
  window.__gp = (i, on) => { let g = window.__pads[0];
    if (!g) { g = window.__pads[0] = { index: 0, id: "Switch Interface (Vendor: 1234 Product: 5678)", connected: true, buttons: [0, 1, 2, 3].map(() => ({ pressed: false, value: 0 })) };
      const e = new Event("gamepadconnected"); e.gamepad = g; window.dispatchEvent(e); }
    if (i != null) { g.buttons[i] = { pressed: on, value: on ? 1 : 0 }; } };
  window.__gpOut = () => { window.__pads = []; window.dispatchEvent(new Event("gamepaddisconnected")); };
  const ins = new Map(); ins.set("a", { id: "a", name: "Keystation 49", onmidimessage: null });
  window.__midi = { inputs: ins, onstatechange: null }; navigator.requestMIDIAccess = () => Promise.resolve(window.__midi);
  window.__send = (d) => { const i = window.__midi.inputs.get("a"); if (i && i.onmidimessage) i.onmidimessage({ data: d }); };
  window.__cb = 0; const st = window.setTimeout, si = window.setInterval, ra = window.requestAnimationFrame;
  window.setTimeout = function (f, ...a) { return st.call(window, typeof f === "function" ? function () { window.__cb++; return f.apply(this, arguments); } : f, ...a); };
  window.setInterval = function (f, ...a) { return si.call(window, typeof f === "function" ? function () { window.__cb++; return f.apply(this, arguments); } : f, ...a); };
  if (ra) window.requestAnimationFrame = function (f) { return ra.call(window, function (t) { window.__cb++; return f(t); }); };
};
/* what each room sounds, with the time it was asked to start */
const SPY = () => {
  window.__ev = []; const w = (n, fn) => { const o = window[n]; if (typeof o !== "function" || o.__spy) return; window[n] = function () { try { window.__ev.push(fn.apply(null, arguments)); } catch (e) {} return o.apply(this, arguments); }; window[n].__spy = 1; };
  const r = window.AOGOneRoom.room;
  if (r === "piano" || r === "band") w("makeVoice", (c, ch, id, m, v, when) => ({ m: m, at: when, now: c.currentTime }));
  if (r === "guitar" || r === "bass") w("pluckCell", (s, f, v, when) => ({ m: TUNING[s] + f, at: when, now: ac.currentTime }));
  if (r === "pads") w("trigger", (bi, pi, vel, when) => ({ m: bi + ":" + pi, at: when, now: ac.currentTime }));
  if (r === "kit") w("sound", (b, id, when) => ({ m: id, at: when, now: ac.currentTime }));
};
const groups = (ev, gap) => { const g = []; ev.slice().sort((a, b) => a.at - b.at).forEach(e => { const l = g[g.length - 1]; if (l && e.at - l.at0 < (gap || 0.12)) l.ev.push(e); else g.push({ at0: e.at, ev: [e] }); }); return g; };
const pcs = g => [...new Set(g.ev.map(e => ((e.m % 12) + 12) % 12))].sort((a, b) => a - b).join(",");
const MAJ = [0, 2, 4, 5, 7, 9, 11];
const CH = ["0,4,7", "2,7,11", "0,4,9", "0,5,9"];   /* C G Am F */

async function newCtx(b, o) {
  const c = await b.newContext(Object.assign({ viewport: { width: 1280, height: 900 } }, o || {}));
  await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await c.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  await c.addInitScript(INIT);
  c.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message)));
  return c;
}
async function openRoom(b, page, o) {
  const c = await newCtx(b, o); const p = await c.newPage();
  await p.goto(U1 + page); await p.waitForTimeout(1400);
  return { c, p };
}
/* open the block and turn it on, as a hand would */
async function turnOn(p) {
  const pre = await p.evaluate(() => ({ closed: !document.getElementById("obBox").open, engine: !!(window.AOGOne && AOGOne.ready), tag: !!document.querySelector('script[src*="aog-onebutton-play"]') }));
  await p.evaluate(() => document.getElementById("obSum").scrollIntoView({ block: "center" }));
  await p.click("#obSum");
  await p.waitForFunction(() => window.AOGOne && AOGOne.ready && document.getElementById("obOn"), null, { timeout: 10000 });
  await p.evaluate(() => document.getElementById("obOn").scrollIntoView({ block: "center" }));
  await p.click("#obOn"); await p.waitForTimeout(300);
  return pre;
}
const press = async (p, key, hold) => { await p.keyboard.down(key); await sleep(hold || 120); await p.keyboard.up(key); };
async function bigTap(p, hold) {
  const r = await p.evaluate(() => { const e = document.getElementById("obBig").getBoundingClientRect(); return { x: e.left + e.width / 2, y: e.top + e.height / 2 }; });
  await p.mouse.move(r.x, r.y); await p.mouse.down(); await sleep(hold || 120); await p.mouse.up();
}
const set = (p, o) => p.evaluate(o => { AOGOne._t.set(o); AOGOne._t.reset(); window.__ev = []; }, o);
const ev = p => p.evaluate(() => window.__ev.slice());
const readyRoom = async (p, room) => {
  if (room === "band") await p.evaluate(async () => { await loadSound(S.sound); });
  if (room === "guitar" || room === "bass") await p.waitForTimeout(1500);
  if (room === "pads") await p.waitForFunction(() => isReady(0), null, { timeout: 30000 });
  if (room === "kit") await p.waitForFunction(() => ready(), null, { timeout: 30000 });
};

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* ── 1 · the chord rooms on their own: Piano, Guitar, Band ── */
  for (const [room, page] of [["piano", "music-piano.html"], ["guitar", "music-guitar.html"], ["band", "music-band.html"]]) {
    console.log("== " + room);
    const { c, p } = await openRoom(b, page); await readyRoom(p, room);
    const pre = await turnOn(p);
    ok(pre.closed && !pre.engine && !pre.tag, room + ": One button is closed at first, and its engine is fetched only when it is opened");
    await p.evaluate(SPY); await p.waitForTimeout(600);
    const st = await p.evaluate(() => ({ on: AOGOne._t.on(), big: !document.getElementById("obBig").hidden, n: window.__ev.length, label: document.getElementById("obOn").textContent }));
    ok(st.on && st.big && st.n === 0 && st.label === "Turn off one button", room + ": turned on, the big button shows and nothing sounds before a press " + JSON.stringify(st));
    /* four presses, four ways: the big button, Space, a game controller, a MIDI key (with Any key plays) */
    await set(p, { what: "chord", prog: "a", time: false, any: true });
    await p.evaluate(() => { const mb = document.getElementById("midiBtn"); if (mb) mb.click(); }); await p.waitForTimeout(200);
    await bigTap(p); await sleep(250);
    await p.evaluate(() => document.getElementById("obBig").focus()); await press(p, "Space"); await sleep(250);
    await p.evaluate(() => __gp()); await sleep(120); await p.evaluate(() => __gp(0, true)); await sleep(200); await p.evaluate(() => __gp(0, false)); await sleep(250);
    const gpOn = await p.evaluate(() => AOGOne._t.timers().gp);
    await p.evaluate(() => { __send([0x90, 60, 100]); }); await sleep(150); await p.evaluate(() => __send([0x80, 60, 0])); await sleep(400);
    let g = groups(await ev(p));
    ok(g.length === 4 && g.map(pcs).join(" | ") === CH.join(" | "), room + ": the big button, Space, a game controller and a MIDI key play C, G, Am, F in turn: " + g.map(pcs).join(" | "));
    ok(gpOn, room + ": the game controller is looked at while it is connected");
    if (room === "piano") ok(await p.evaluate(() => !LIVE.has("m60")), "piano: with Any key plays on, the MIDI key plays One button, not the key itself");
    /* timing help: presses land on the beat of the tempo; off: at once */
    await set(p, { what: "chord", time: true, grid: 1, any: false });
    await p.evaluate(() => document.getElementById("obBig").focus());
    for (const gap of [230, 410, 170, 520, 300]) { await press(p, "Space", 90); await sleep(gap); }
    await sleep(900);
    const beat = await p.evaluate(() => 60 / AOGOneRoom.bpm());
    g = groups(await ev(p), 0.1);
    const offs = g.map(x => { const d = (x.at0 - g[0].at0) / beat; return Math.abs(d - Math.round(d)) * beat; });
    ok(g.length >= 4 && offs.every(x => x <= 0.010), `${room}: with Help with timing, every press lands on the beat (${(beat * 1000).toFixed(0)} ms): ${offs.map(x => (x * 1000).toFixed(1)).join(", ")} ms off the grid`);
    await set(p, { time: false });
    await press(p, "Space", 90); await sleep(300);
    let e1 = groups(await ev(p)).map(x => x.ev[0]);
    ok(e1.length === 1 && e1.every(e => Math.abs(e.at - e.now) < 0.03), room + ": with timing help off, a press plays at once (" + e1.map(e => ((e.at - e.now) * 1000).toFixed(1)).join(",") + " ms)");
    /* the next note of a tune: Twinkle in the key; a note that fits: the five-note scale, walking gently */
    await set(p, { what: "tune", tune: "twinkle", time: false });
    for (let i = 0; i < 7; i++) { await press(p, "Space", 60); await sleep(110); }
    await sleep(200);
    const tw = groups(await ev(p), 0.05).map(x => ((x.ev[0].m % 12) + 12) % 12).join(",");
    ok(tw === "0,0,7,7,9,9,7", room + ": the next note of a tune plays Twinkle in C: " + tw);
    await set(p, { what: "fit", time: false });
    for (let i = 0; i < 10; i++) { await press(p, "Space", 60); await sleep(100); }
    await sleep(200);
    const fm = groups(await ev(p), 0.05).map(x => x.ev[0].m);
    ok(fm.length === 10 && fm.every(m => [0, 2, 4, 7, 9].indexOf(m % 12) >= 0) && fm.every((m, i) => !i || Math.abs(m - fm[i - 1]) <= 5), room + ": a note that fits stays in the five-note scale and moves gently: " + fm.join(" "));
    /* the song's key: G major moves the chords */
    await p.evaluate(() => { const k = document.getElementById("keySel"); k.value = "7"; k.dispatchEvent(new Event("change", { bubbles: true })); });
    await set(p, { what: "chord", prog: "a", time: false });
    for (let i = 0; i < 2; i++) { await press(p, "Space", 60); await sleep(200); }
    await sleep(200);
    g = groups(await ev(p));
    ok(g.map(pcs).join(" | ") === "2,7,11 | 2,6,9", room + ": in G major the next chords are G and D: " + g.map(pcs).join(" | "));
    await p.evaluate(() => { const k = document.getElementById("keySel"); k.value = "0"; k.dispatchEvent(new Event("change", { bubbles: true })); });
    /* AOG-ONEBUTTON-12-V1: the strip's 12 chords: patterns that use the newer six, and all 12 one after another */
    await p.evaluate(() => document.getElementById("obWhat").dispatchEvent(new Event("focus")));
    const popts = await p.evaluate(() => [...document.querySelectorAll("#obProg option")].map(o => o.value + "=" + o.textContent));
    ok(popts.length >= 9 && popts.some(o => /^e=C – B♭ – F – C/.test(o)) && popts.some(o => /^g=Dm – G7 – C – C/.test(o)) && popts.some(o => o === "strip=All 12 chords, one after another"), room + ": The next chord offers patterns with the newer chords and all 12: " + popts.slice(4).join(" · "));
    await set(p, { what: "chord", prog: "e", time: false });
    await p.evaluate(() => document.getElementById("obBig").focus());
    for (let i = 0; i < 2; i++) { await press(p, "Space", 60); await sleep(200); }
    await sleep(200);
    g = groups(await ev(p));
    ok(g.map(pcs).join(" | ") === "0,4,7 | 2,5,10", room + ": I–♭VII–IV–I plays C, then B♭: " + g.map(pcs).join(" | "));
    await set(p, { what: "chord", prog: "strip", time: false });
    for (let i = 0; i < 8; i++) { await press(p, "Space", 60); await sleep(200); }
    await sleep(200);
    g = groups(await ev(p)); const sp = g.map(pcs), sub = (a, s) => a.split(",").every(x => s.indexOf(+x) >= 0);
    ok(sp.length === 8 && sp.slice(0, 6).join(" | ") === "0,4,7 | 2,5,9 | 4,7,11 | 0,5,9 | 2,7,11 | 0,4,9" && sub(sp[6], [2, 5, 11]) && /11/.test(sp[6]) && /5/.test(sp[6]) && sub(sp[7], [2, 5, 7, 11]) && /5/.test(sp[7]) && /7/.test(sp[7]),
      room + ": all 12 chords: C Dm Em F G Am, then Bdim and G7: " + sp.join(" | "));
    if (room === "piano") {
      /* hold sustains; let go, it ends */
      await set(p, { what: "chord", time: false });
      await p.keyboard.down("Space"); await sleep(400);
      const held = await p.evaluate(() => [...LIVE.keys()].filter(k => k[0] === "o").length);
      await p.keyboard.up("Space"); await sleep(250);
      const after = await p.evaluate(() => [...LIVE.keys()].filter(k => k[0] === "o").length);
      ok(held === 4 && after === 0, `piano: holding the button holds the chord (${held} notes), letting go ends it (${after})`);
      /* Wait before a press counts; Ignore repeat presses */
      await set(p, { hold: 0.2, time: false });
      await press(p, "Space", 50); await sleep(300);
      const quick = (await ev(p)).length;
      await press(p, "Space", 320); await sleep(200);
      const slow = groups(await ev(p)).length;
      ok(quick === 0 && slow === 1, `piano: with Wait 0.2 s, a quick tap is left out (${quick}) and a held press counts (${slow})`);
      await set(p, { hold: 0, guard: 0.5, time: false });
      await press(p, "Space", 60); await sleep(120); await press(p, "Space", 60); await sleep(700); await press(p, "Space", 60); await sleep(300);
      ok(groups(await ev(p)).length === 2, "piano: Ignore repeat presses 0.5 s leaves out a second press 0.18 s later, not one 0.7 s later: " + groups(await ev(p)).length);
      /* two switches: Enter moves to the next one, or stops the sound */
      await set(p, { guard: 0, two: true, two2: "next", time: false });
      await press(p, "Space"); await sleep(200); await press(p, "Enter"); await sleep(200); await press(p, "Space"); await sleep(300);
      g = groups(await ev(p));
      ok(g.map(pcs).join(" | ") === CH[0] + " | " + CH[2], "piano: two switches: Space plays C, Enter moves past G, Space plays Am: " + g.map(pcs).join(" | "));
      await set(p, { two: true, two2: "stop", time: false });
      await p.keyboard.down("Space"); await sleep(300); await press(p, "Enter"); await sleep(200);
      const stopped = await p.evaluate(() => [...LIVE.keys()].filter(k => k[0] === "o").length);
      await p.keyboard.up("Space");
      const nx = await p.evaluate(() => ({ shown: !document.getElementById("obNext").hidden, t: document.getElementById("obNext").textContent }));
      ok(stopped === 0 && nx.shown && nx.t === "■ Stop", "piano: switch 2 set to stop lets the held chord go, and its own button shows: " + JSON.stringify(nx));
      await set(p, { two: true, two2: "next" });
      await p.evaluate(() => __gp()); await p.evaluate(() => __gp(1, true)); await sleep(150); await p.evaluate(() => __gp(1, false)); await sleep(150);
      await p.evaluate(() => __gp(0, true)); await sleep(150); await p.evaluate(() => __gp(0, false)); await sleep(300);
      g = groups(await ev(p));
      ok(g.map(pcs).join(" | ") === CH[1], "piano: on a game controller button B is switch 2 (past C), button A plays G: " + g.map(pcs).join(" | "));
      await set(p, { two: false });
      /* a take hears the presses */
      await p.evaluate(() => AOGStudioRec.toggle()); await sleep(400);
      for (let i = 0; i < 3; i++) { await press(p, "Space", 150); await sleep(250); }
      await p.evaluate(() => AOGStudioRec.toggle());
      await p.waitForFunction(() => !AOGStudioRec.on() && !AOGStudioRec.busy() && AOGStudioRec.last(), null, { timeout: 15000 });
      const tk = await p.evaluate(() => AOGStudioRec.last());
      ok(tk && tk.notes >= 12, "piano: a take holds the notes the button played: " + JSON.stringify(tk));
      /* the room's own keys: letters still play its notes; with One button off, Space starts its pattern again */
      await p.evaluate(() => document.activeElement.blur());
      await p.evaluate(() => { window.__ev = []; }); await press(p, "KeyA"); await sleep(200);
      ok(await p.evaluate(() => window.__ev.length === 1 && window.__ev[0].m === KB.lo), "piano: with One button on, the letter keys still play their own notes");
      await p.evaluate(() => { const o = document.getElementById("obOn"); o.click(); const ps = document.getElementById("progSel"); ps.value = PRESETS[0].id; ps.onchange(); });
      await p.evaluate(() => document.activeElement.blur()); await press(p, "Space"); await sleep(400);
      const pl = await p.evaluate(() => S.playing); await press(p, "Space"); await sleep(200);
      ok(pl && !(await p.evaluate(() => S.playing)), "piano: with One button off, Space starts and stops the pattern as before");
      /* Learn a song: its chords and its tune */
      await p.evaluate(() => new Promise(res => { const r = indexedDB.open("aog-learn", 1); r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains("songs")) r.result.createObjectStore("songs", { keyPath: "id" }); };
        r.onsuccess = () => { const db = r.result, tx = db.transaction("songs", "readwrite");
          tx.objectStore("songs").put({ id: "one-test", name: "Test song", src: "audio", blob: new Blob([new Uint8Array(8)]), fixes: { chords: { 3: { root: 7, q: "maj" } } }, speed: 100, loop: null, follow: null, at: Date.now(),
            lesson: { v: 1, src: "audio", name: "Test song", sec: 8, sr: 44100, bpm: 120, beats: [0, .5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5], downbeats: [0, 2, 4, 6], meter: { num: 4, den: 4 }, key: { key: 0, minor: false, conf: 0.9 },
              chords: [{ t: 0, d: 2, root: 2, q: "min", conf: .9 }, { t: 2, d: 2, root: 5, q: "maj", conf: .9 }, { t: 4, d: 2, root: 0, q: "maj", conf: .9 }, { t: 6, d: 2, root: 9, q: "min", conf: .9 }],
              bass: [], melody: [{ t: 0, d: .4, m: 64, conf: .5 }, { t: .5, d: .4, m: 62, conf: .5 }, { t: 1, d: .4, m: 60, conf: .5 }], tracks: [] } });
          tx.oncomplete = () => { db.close(); localStorage.setItem("aog.learn.last.piano.v1", "one-test"); res(); }; }; }));
      await p.evaluate(() => { document.getElementById("lgBox").open = true; });
      await p.waitForFunction(() => AOGLearnUI.test.state().open, null, { timeout: 10000 });
      await p.evaluate(() => document.getElementById("obOn").click());
      await p.waitForFunction(() => AOGOne._t.song() && AOGOne._t.song().chords.length, null, { timeout: 5000 });
      await p.evaluate(() => document.getElementById("obWhat").dispatchEvent(new Event("focus")));
      const songOpt = await p.evaluate(() => [...document.querySelectorAll("#obProg option")].some(o => o.value === "song") && [...document.querySelectorAll("#obTune option")].some(o => o.value === "song"));
      await set(p, { what: "chord", prog: "song", time: false });
      await p.evaluate(() => document.getElementById("obBig").focus());
      for (let i = 0; i < 4; i++) { await press(p, "Space", 60); await sleep(200); }
      await sleep(200);
      g = groups(await ev(p));
      ok(songOpt && g.map(pcs).join(" | ") === "2,5,9 | 0,5,9 | 0,4,7 | 2,7,11", "piano: with a song open in Learn a song, the button follows its chords (Dm F C, and the fixed G): " + g.map(pcs).join(" | "));
      await set(p, { what: "tune", tune: "song", time: false });
      for (let i = 0; i < 3; i++) { await press(p, "Space", 60); await sleep(150); }
      await sleep(200);
      ok(groups(await ev(p), 0.05).map(x => x.ev[0].m).join(",") === "64,62,60", "piano: and the song's tune, note by note");
      await set(p, { what: "chord", prog: "a" });
    }
    /* Spanish */
    await p.evaluate(() => document.getElementById("langBtn").click()); await sleep(250);
    const es = await p.evaluate(() => ({ sum: document.getElementById("obSum").textContent, on: document.getElementById("obOn").textContent, what: document.querySelector("#obBox [data-w=what]").textContent, opt: document.querySelector("#obWhat option").textContent, say: document.getElementById("obSay").textContent }));
    ok(es.sum === "Un botón" && /un botón$/.test(es.on) && es.what === "Cada pulsación toca" && es.opt === "El siguiente acorde" && es.say === "Pulsa para tocar", room + ": in Spanish " + JSON.stringify(es));
    await p.evaluate(() => document.getElementById("langBtn").click());
    /* silent treatment: idle, nothing of ours runs; hushed, it lets go and stops looking at the controller */
    await p.evaluate(() => { window.__gpOut(); }); await sleep(200);
    const idle = await p.evaluate(async () => { const t0 = AOGOne._t.ticks(); await new Promise(r => setTimeout(r, 3000)); return { ticks: AOGOne._t.ticks() - t0, timers: AOGOne._t.timers() }; });
    ok(idle.ticks === 0 && !idle.timers.gp && !idle.timers.click, room + ": turned on and idle for 3 s, One button runs no timer at all " + JSON.stringify(idle));
    await p.evaluate(() => __gp()); await sleep(150);
    await p.keyboard.down("Space"); await sleep(150);
    await p.evaluate(() => window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: true } }))); await sleep(150);
    const hushed = await p.evaluate(() => AOGOne._t.timers());
    await p.keyboard.up("Space");
    await p.evaluate(() => window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: false } }))); await sleep(150);
    const woke = await p.evaluate(() => AOGOne._t.timers());
    ok(!hushed.gp && hushed.held === 0 && hushed.live === 0 && woke.gp, room + ": hushed, it lets go of the held press and stops looking at the controller; awake, it looks again " + JSON.stringify({ hushed, woke }));
    await p.evaluate(() => window.__gpOut());
    await c.close();
  }

  /* ── 2 · the Bass: the next low note, walking notes ── */
  { console.log("== bass");
    const { c, p } = await openRoom(b, "music-bass.html"); await readyRoom(p, "bass"); await turnOn(p); await p.evaluate(SPY);
    const kinds = await p.evaluate(() => [...document.querySelectorAll("#obWhat option")].map(o => o.value).join(","));
    ok(kinds === "root,walk,fit", "bass: one press plays the next low note, walking notes, or a note that fits: " + kinds);
    await set(p, { what: "root", prog: "a", time: false });
    await p.evaluate(() => document.getElementById("obBig").focus());
    for (let i = 0; i < 4; i++) { await press(p, "Space", 60); await sleep(150); }
    await sleep(200);
    let ms = groups(await ev(p), 0.05).map(x => x.ev[0].m);
    ok(ms.map(m => m % 12).join(",") === "0,7,9,5" && ms.every(m => m < 48), "bass: the next low note of C G Am F: " + ms.join(" "));
    await set(p, { what: "walk", time: false });
    for (let i = 0; i < 8; i++) { await press(p, "Space", 60); await sleep(180); }
    await sleep(900);
    const g = groups(await ev(p), 0.05); ms = g.map(x => x.ev[0].m);
    ok(ms.length === 8 && ms.every(m => MAJ.indexOf(m % 12) >= 0) && ms.slice(0, 3).map(m => m % 12).join(",") === "0,4,7" && Math.abs(ms[3] - ms[4]) <= 2 && ms[4] % 12 === 7, "bass: walking notes stay in the key: C E G, a step next to G, then G …: " + ms.join(" "));
    await c.close(); }

  /* ── 3 · the Drum Machine: the next beat; start and stop ── */
  { console.log("== drum machine");
    const { c, p } = await openRoom(b, "music-pads.html"); await readyRoom(p, "pads"); await turnOn(p); await p.evaluate(SPY);
    await p.evaluate(() => { S.bars = 1; S.ev = [{ b: 0, p: 0, t: 0, v: 1, len: 0 }, { b: 0, p: 8, t: 48, v: 0.8, len: 0 }, { b: 0, p: 1, t: 96, v: 1, len: 0 }, { b: 0, p: 8, t: 240, v: 0.8, len: 0 }]; S.swing = 50; SEQ.map = null; });
    await set(p, { what: "beat", time: true });
    const bpm = await p.evaluate(() => S.bpm), sec = 60 / bpm;
    await p.evaluate(() => document.getElementById("obBig").focus());
    for (const gap of [300, 500, 260, 420]) { await press(p, "Space", 80); await sleep(gap); }
    await sleep(800);
    const e = (await ev(p)).sort((a, b) => a.at - b.at);
    const t0 = e[0].at, grid = e.map(x => { const d = (x.at - t0) / (sec / 2); return Math.abs(d - Math.round(d)) * sec / 2; });
    ok(e.map(x => x.m).join(" ") === "0:0 0:8 0:1 0:8" && grid.every(x => x < 0.01), "drum machine: four presses play beats 1 to 4 of the loop (kick, hat on the and, snare, the last hat), on the grid: " + e.map(x => x.m).join(" ") + " · " + grid.map(x => (x * 1000).toFixed(1)).join(","));
    await set(p, { what: "startstop" });
    await press(p, "Space"); await sleep(300);
    const on = await p.evaluate(() => SEQ.on); await press(p, "Space"); await sleep(200);
    ok(on && !(await p.evaluate(() => SEQ.on)), "drum machine: start and stop the beat: one press starts the loop, the next stops it");
    await set(p, { what: "beat" });
    await p.evaluate(() => document.activeElement.blur()); await p.evaluate(() => { window.__ev = []; }); await press(p, "KeyZ"); await sleep(200);
    ok((await ev(p)).some(x => x.m === "0:0"), "drum machine: its own keys (Z) still play a pad while One button is on");
    await p.evaluate(() => AOGStudioRec.toggle()); await sleep(300);
    await p.evaluate(() => document.getElementById("obBig").focus());
    for (let i = 0; i < 3; i++) { await press(p, "Space", 80); await sleep(300); }
    await p.evaluate(() => AOGStudioRec.toggle());
    await p.waitForFunction(() => !AOGStudioRec.on() && !AOGStudioRec.busy() && AOGStudioRec.last(), null, { timeout: 15000 });
    ok((await p.evaluate(() => AOGStudioRec.last().sec)) > 0.3, "drum machine: a take hears the beats the button played");
    await c.close(); }

  /* ── 4 · the Drum Kit: kick and snare, the next hit, start and stop ── */
  { console.log("== drum kit");
    const { c, p } = await openRoom(b, "music-kit.html"); await readyRoom(p, "kit"); await turnOn(p); await p.evaluate(SPY);
    await set(p, { what: "alt", time: false });
    await p.evaluate(() => document.getElementById("obBig").focus());
    for (let i = 0; i < 3; i++) { await press(p, "Space", 60); await sleep(150); }
    await sleep(200);
    ok((await ev(p)).map(x => x.m).join(" ") === "kick snare kick", "drum kit: kick and snare, in turn: " + (await ev(p)).map(x => x.m).join(" "));
    await set(p, { what: "groove", time: false });
    const want = await p.evaluate(() => AOGOneRoom.groove().slice(0, 3).map(x => x.ids.join("+")).join(" "));
    for (let i = 0; i < 3; i++) { await press(p, "Space", 60); await sleep(150); }
    await sleep(200);
    const got = groups(await ev(p), 0.01).map(x => x.ev.map(e => e.m).join("+")).join(" ");
    ok(got === want && got.length > 0, "drum kit: the next hit of the beat that is picked: " + got);
    await set(p, { what: "startstop" });
    await press(p, "Space"); await sleep(300); const on = await p.evaluate(() => BT.on); await press(p, "Space"); await sleep(200);
    ok(on && !(await p.evaluate(() => BT.on)), "drum kit: start and stop the beat");
    await p.evaluate(() => document.activeElement.blur()); await p.evaluate(() => { window.__ev = []; }); await press(p, "KeyS"); await sleep(200);
    ok((await ev(p)).some(x => x.m === "snare"), "drum kit: its own keys (S the snare) still play while One button is on");
    await c.close(); }

  /* ── 5 · inside the Studio, on an iPhone and an iPad, light and dark ── */
  for (const [dev, vp] of [["iPhone", { width: 390, height: 844 }], ["iPad", { width: 820, height: 1180 }]]) {
    for (const room of ["piano", "guitar", "bass", "band", "pads", "kit"]) {
      const c = await newCtx(b, { viewport: vp, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); const p = await c.newPage();
      await p.goto(U2 + "the-studio#" + room);
      await p.waitForFunction(r => { const f = document.getElementById("room"), d = f && f.contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && d.getElementById("obSum"); }, room, { timeout: 30000 });
      await p.waitForTimeout(1200);
      const f = await (await p.$("#room")).contentFrame();
      await f.evaluate(() => document.getElementById("obSum").scrollIntoView({ block: "center" }));
      await f.tap("#obSum");
      await f.waitForFunction(() => window.AOGOne && AOGOne.ready && document.getElementById("obOn"), null, { timeout: 10000 });
      await f.evaluate(() => document.getElementById("obOn").scrollIntoView({ block: "center" }));
      await f.tap("#obOn"); await p.waitForTimeout(400);
      const vis = await p.evaluate(() => { const fr = document.getElementById("room"), fb = fr.getBoundingClientRect(), d = fr.contentDocument, e = d.getElementById("obBig").getBoundingClientRect();
        const top = fb.top + e.top, bot = fb.top + e.bottom; return { top: Math.round(top), bot: Math.round(bot), h: Math.round(e.height), w: Math.round(e.width), vh: innerHeight, inFrame: e.top >= -1 && e.bottom <= fr.contentWindow.innerHeight + 1, inView: top >= -1 && bot <= innerHeight + 1 }; });
      ok(vis.inFrame && vis.inView && vis.h >= 180, `${dev} · ${room} in the Studio: once on, the big button is in view without scrolling ` + JSON.stringify(vis));
      if (room === "piano" || room === "kit") {
        /* the Studio passes Space on to the room */
        await f.evaluate(SPY); await f.evaluate(() => AOGOne._t.set({ time: false }));
        await p.evaluate(() => { if (document.activeElement) document.activeElement.blur(); document.body.focus(); });
        await p.keyboard.down("Space"); await sleep(120); await p.keyboard.up("Space"); await sleep(300);
        ok((await f.evaluate(() => window.__ev.length)) > 0, `${dev} · ${room}: with the Studio holding the keyboard, Space plays One button`);
        await f.evaluate(() => { AOGOne._t.set({ two: true, two2: "next" }); document.getElementById("obMore").open = true; });
        for (const theme of ["light", "dark"]) {
          await f.evaluate(t => { document.documentElement.setAttribute("data-theme", t); document.documentElement.classList.toggle("dark", t === "dark"); }, theme); await p.waitForTimeout(250);
          const bad = await f.evaluate(new Function("return (" + PROBE + ")()"));
          const mine = bad;
          ok(mine.length === 0, `${dev} · ${room} · ${theme}: One button reads at 3:1 or better ` + JSON.stringify(mine.slice(0, 3)));
          const calm = await f.evaluate(new Function("return (" + CALM + ")()"));
          ok(calm.length === 0, `${dev} · ${room} · ${theme}: calm (check-calm's probe) ` + JSON.stringify(calm));
        }
      }
      await c.close();
    }
  }

  ok(errs.length === 0, "no page errors " + errs.slice(0, 5).join(" | "));
  console.log(fails ? fails + " failed" : "all passed");
  await b.close(); srv1.close(); srv2.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + (e && e.stack || e)); process.exit(1); });
