/* AOG-STUDIO-SEND-V1 · AOG-STUDIO-INBOX-V1 — Jimmy: "All the instruments should be able to record and send their tracks over
   to the STUDIO." In one browser (one IndexedDB): record a short take on the piano, the drum machine, the guitar (twice), the
   bass, The Band and the turntables, and press Send to the Studio on each. Then the Studio lists every take under "Takes sent
   here", newest first, named in plain words with its length; the menu of recordings puts the two guitar takes on two tracks; Play
   and Make the mix both carry both of them; a reload keeps the tracks; the 17th take pushes out the oldest and the Studio says
   so plainly; a take can be removed (asked first) while its track keeps its copy; Spanish; an iPhone (390 px) with nothing
   sideways, readable and calm in light and dark; an iPad; no page errors. Port 9241. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9241, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
/* the Netlify address /studio opens the Studio here too */
async function routes(ctx) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/studio(\?.*)?$/, r => r.fulfill({ path: path.join(ROOT, "music-studio.html"), contentType: "text/html" }));
}
/* ● Record through the page's REC, something played, Stop; the new take's number */
async function record(p, play) {
  const n = await p.evaluate(() => REC.takes.length);
  await p.evaluate(async () => { await REC.toggle(); });
  await p.waitForTimeout(250);
  await play();
  await p.evaluate(() => REC.toggle());
  await p.waitForFunction(k => REC.takes.length === Math.min(3, k + 1) && !REC.closing && REC.takes[0], n, { timeout: 8000 });
  return p.evaluate(() => REC.takes[0].n);
}
/* Send to the Studio on take n; the line it leaves */
async function toStudio(p, list, line, n) {
  await p.click(`#${list} [data-aogrec-studio="${n}"]`);
  await p.waitForFunction(id => /^(Sent to the Mixing Desk|Enviada a la mesa de mezclas|That did not work|No funcionó|This device has no room|Este (aparato|dispositivo) no tiene)/.test(document.getElementById(id).textContent.trim()), line, { timeout: 10000 });
  return p.evaluate(id => { const el = document.getElementById(id), a = el.querySelector("a"); return { text: el.textContent.trim(), href: a ? a.getAttribute("href") : null }; }, line);
}
const acts = (p, list) => p.evaluate(l => { const r = document.querySelector(`#${l} .aogrec-take`); return r ? [...r.querySelectorAll("a,button")].map(e => e.textContent).join(" | ") : ""; }, list);
const inboxNames = p => p.evaluate(() => [...document.querySelectorAll("#inbox .st-rec b")].map(b => b.textContent));
/* a short .wav made in the page, for the takes that fill the list up to 16 */
const FILL = `(async (k, from, n) => { const sr = 44100, len = Math.floor(0.6 * sr), ab = new ArrayBuffer(44 + len * 4), v = new DataView(ab);
  const s = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  s(0, "RIFF"); v.setUint32(4, 36 + len * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, len * 4, true);
  for (let i = 0; i < len; i++) { const x = Math.round(9000 * Math.sin(2 * Math.PI * (220 + 20 * k) * i / sr) * Math.exp(-i / sr * 3)); v.setInt16(44 + i * 4, x, true); v.setInt16(46 + i * 4, x, true); }
  const names = { piano: ["Piano take ", "Toma de piano "], bass: ["Bass take ", "Toma de bajo "], band: ["Band take ", "Toma de la banda "] };
  await AOGHandoff.add(AOGHandoff.INBOX, { from, n, name: { en: names[from][0] + n, es: names[from][1] + n }, sec: 0.6, bpm: 100, at: Date.now(), take: true,
    wav: new Blob([ab], { type: "audio/wav" }) }, { key: "fill|" + from + "|" + n + "|" + k });
})`;

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage();
  const sent = [];

  /* 1 · the piano */
  await p.goto(U + "music-piano.html"); await p.waitForTimeout(900);
  await p.selectOption("#soundSel", "epwarm");
  await record(p, async () => { await p.evaluate(() => noteOn("k", 60, 0.7)); await p.waitForTimeout(900); await p.evaluate(() => noteOff("k", 60)); });
  ok(await acts(p, "takes") === "Save as .wav | Send to the turntables | Send to the drum machine | Send to the Mixing Desk | Delete", "the piano's take: " + await acts(p, "takes"));
  let ln = await toStudio(p, "takes", "recLine", 1);
  ok(ln.text === "Sent to the Mixing Desk. Open the Mixing Desk" && ln.href === "/studio", "the piano's line after sending: \"" + ln.text + "\" (" + ln.href + ")");
  await p.evaluate(() => paintText()); await p.waitForTimeout(100);
  ok((await p.textContent("#recLine")).trim() === "Sent to the Mixing Desk. Open the Mixing Desk", "the line stays when the page repaints its words");
  sent.push("Piano take 1");

  /* 2 · the drum machine: its own takes go to the Studio too (not to a drum pad) */
  await p.goto(U + "music-drums.html"); await p.waitForTimeout(1300);
  await p.click('.sp-pad[data-pad="kick"]'); await p.waitForTimeout(1500);
  await record(p, async () => { for (const id of ["kick", "snare", "kick", "snare"]) { await p.click(`.sp-pad[data-pad="${id}"]`); await p.waitForTimeout(230); } await p.waitForTimeout(300); });
  ok(await acts(p, "takeList") === "Save as .wav | Send to the turntables | Send to the Mixing Desk | Delete", "the drum machine's take: " + await acts(p, "takeList"));
  ln = await toStudio(p, "takeList", "takeLine", 1);
  await p.evaluate(() => paint()); await p.waitForTimeout(100);
  ok(ln.text === "Sent to the Mixing Desk. Open the Mixing Desk" && (await p.textContent("#takeLine")).trim() === ln.text, "the drum machine's line, kept through a repaint: " + ln.text);
  sent.push("Drum take 1");

  /* 3 · the guitar, twice: a C chord, then a G chord */
  await p.goto(U + "music-guitar.html"); await p.waitForTimeout(900);
  await record(p, async () => { await p.evaluate(() => playChord(pads()[0], 0.8)); await p.waitForTimeout(1600); });
  await toStudio(p, "takes", "recLine", 1); sent.push("Guitar take 1");
  await record(p, async () => { await p.evaluate(() => playChord(pads()[4], 0.8)); await p.waitForTimeout(1600); });
  ln = await toStudio(p, "takes", "recLine", 2); sent.push("Guitar take 2");
  ok(ln.text === "Sent to the Mixing Desk. Open the Mixing Desk" && await p.evaluate(() => REC.takes.map(k => k.n).join()) === "2,1", "the guitar sends two takes: " + ln.text);
  /* the same take sent twice is kept once */
  await toStudio(p, "takes", "recLine", 2);
  const twice = await p.evaluate(async () => (await AOGHandoff.list(AOGHandoff.INBOX)).items.map(x => x.from + x.n).join());
  ok(twice === "guitar2,guitar1,drums1,piano1", "pressing Send to the Studio twice on one take keeps it once: " + twice);

  /* 4 · the bass, and Send to the turntables still fills its own shelf */
  await p.goto(U + "music-bass.html"); await p.waitForTimeout(900);
  await record(p, async () => { await p.evaluate(() => playChord(pads()[0], 0.8)); await p.waitForTimeout(1300); });
  await toStudio(p, "takes", "recLine", 1); sent.push("Bass take 1");
  await p.click('#takes [data-aogrec-send="1"]'); await p.waitForTimeout(500);
  const bshelf = await p.evaluate(async () => { const x = await AOGHandoff.get("bassbench"); return x && { name: x.name, take: x.take, line: document.getElementById("recLine").textContent }; });
  ok(bshelf && bshelf.take && /^Bass · my playing · Take 1 · 0:0\d$/.test(bshelf.name) && /^Sent\. Open the turntables/.test(bshelf.line), "Send to the turntables works as before: " + JSON.stringify(bshelf));

  /* 5 · The Band */
  await p.goto(U + "music-band.html"); await p.waitForTimeout(900);
  await p.waitForFunction(() => soundReady(S.sound), null, { timeout: 30000 });
  await record(p, async () => { await p.evaluate(() => padDown(0, 0.8)); await p.waitForTimeout(900); await p.evaluate(() => padUp(0)); await p.waitForTimeout(300); });
  ln = await toStudio(p, "takes", "recLine", 1); sent.push("Band take 1");
  ok(ln.text === "Sent to the Mixing Desk. Open the Mixing Desk", "The Band sends its take: " + ln.text);

  /* 6 · the turntables: a mix recorded with their own Record */
  await p.goto(U + "music-decks.html"); await p.waitForTimeout(1200);
  await p.evaluate(() => loadMade(decks.find(d => d.id === "A"), "house"));
  await p.waitForFunction(() => { const d = decks.find(x => x.id === "A"); return d.buf && d.bpm > 0 && d.made === "house" && (d.node || d.core); }, null, { timeout: 60000 });
  await p.click('[data-play="A"]'); await p.waitForTimeout(600);
  await p.click("#recBtn"); await p.waitForTimeout(2200); await p.click("#recBtn"); await p.waitForTimeout(700);
  await p.click('[data-play="A"]');
  const drow = await p.evaluate(() => { const r = document.querySelector("#takes .take"); return r && { onto: r.querySelectorAll("[data-totake]").length, btn: (r.querySelector("[data-tostudio]") || {}).textContent, bpm: TAPE.takes[0].bpm }; });
  ok(drow && drow.onto === 3 && drow.btn === "Send to the Mixing Desk" && Math.abs(drow.bpm - 125) < 0.5, "the turntables' take: Onto deck A, B, C and Send to the Studio; its tempo is the MASTER deck's: " + JSON.stringify(drow));
  await p.click('#takes [data-tostudio="1"]');
  await p.waitForFunction(() => /^(Sent to the Mixing Desk|That did not work)/.test(document.getElementById("takeLine").textContent.trim()), null, { timeout: 10000 });
  const dl = await p.evaluate(() => ({ text: document.getElementById("takeLine").textContent.trim(), href: document.querySelector("#takeLine a").getAttribute("href") }));
  ok(dl.text === "Sent to the Mixing Desk. Open the Mixing Desk" && dl.href === "/studio", "the turntables' line: \"" + dl.text + "\" (" + dl.href + ")");
  sent.push("Turntables take 1");

  /* 7 · the Studio, through the line's own link */
  await Promise.all([p.waitForNavigation({ timeout: 15000 }), p.click("#takeLine a")]);
  await p.waitForFunction(() => window.__aogStudio && __aogStudio.INBOX.items.length >= 7, null, { timeout: 10000 });
  ok(/\/studio$/.test(p.url()) && await p.evaluate(() => document.getElementById("mastH").textContent) === "The Mixing Desk", "Open the Studio opens the Studio (" + p.url().replace(U, "/") + ")");
  const names = await inboxNames(p);
  const want = sent.slice().reverse();
  ok(names.join(" | ") === want.join(" | "), "Takes sent here, newest first: " + names.join(" | "));
  const rows = await p.evaluate(() => [...document.querySelectorAll("#inbox .st-rec")].map(r => r.querySelector(".st-cn").textContent));
  ok(rows.length === 7 && rows.every(s => /^From the (turntables|band|bass|guitar|drum machine|piano) · 0:0\d · made at \d{1,2}:\d\d (AM|PM)$/.test(s.replace(/ /g, " "))),
    "each says where it came from, its length and when it was made: " + rows.slice(0, 3).join(" | ") + " …");
  const head = await p.evaluate(() => ({ h: document.querySelector("#inboxBlk h2").textContent, n: document.querySelector("#inbox > .st-line").textContent }));
  ok(head.h === "Takes sent here" && head.n === "7 of 16 takes, newest first.", "the heading and the count: " + JSON.stringify(head));
  const menu = await p.evaluate(() => { const s = document.getElementById("srcSel"); return { lab: document.getElementById(s.getAttribute("aria-labelledby")).textContent, groups: [...s.querySelectorAll("optgroup")].map(g => g.label + ": " + [...g.children].map(o => o.textContent.split(" · ")[0]).join(", ")),
    picked: s.options[s.selectedIndex].textContent, btn: document.getElementById("putBtn").textContent, info: document.getElementById("srcInfo").textContent }; });
  ok(menu.lab === "Put a recording on this track" && menu.groups.length === 2 && menu.groups[0] === "Takes sent here: " + want.join(", ") && menu.groups[1] === "Sent to the turntables: From the bass" && /^Turntables take 1 · 0:0\d · /.test(menu.picked) && menu.btn === "Put it on track 1",
    "the menu of recordings (a drop-down): " + menu.groups.join(" / ") + "; picked: " + menu.picked);
  ok(/^From the turntables · 0:0\d · 125 beats a minute · made at /.test(menu.info), "the line about the picked recording: " + menu.info);

  /* two takes from the guitar on two tracks */
  const val = name => p.evaluate(nm => [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === nm).value, name);
  await p.selectOption("#srcSel", await val("Guitar take 1")); await p.click("#putBtn");
  await p.waitForFunction(() => __aogStudio.SONG.tracks[0].clip && !__aogStudio.S.busy, null, { timeout: 15000 });
  await p.selectOption("#trackSel", "1");
  await p.selectOption("#srcSel", await val("Guitar take 2")); await p.click("#putBtn");
  await p.waitForFunction(() => __aogStudio.SONG.tracks[1].clip && !__aogStudio.S.busy, null, { timeout: 15000 });
  const tr = await p.evaluate(() => { const T = __aogStudio.SONG.tracks; return { a: T[0].clip && [T[0].clip.src, T[0].clip.from, T[0].clip.tn].join(), b: T[1].clip && [T[1].clip.src, T[1].clip.from, T[1].clip.tn].join(),
    opts: [...document.querySelectorAll("#trackSel option")].slice(0, 3).map(o => o.textContent), lanes: [...document.querySelectorAll("#timeline .st-clip")].map(x => x.textContent),
    on: [...document.querySelectorAll("#inbox .st-rec")].map(r => r.querySelector("b").textContent + (r.querySelector(".st-on") ? " (" + r.querySelector(".st-on").textContent + ")" : "")).filter(s => /\(/.test(s)),
    box: document.querySelector("#clipBox .st-cc b").textContent, sub: document.querySelector("#clipBox .st-cn").textContent }; });
  ok(tr.a === "studioinbox,guitar,1" && tr.b === "studioinbox,guitar,2", "Guitar take 1 is on track 1 and Guitar take 2 on track 2: " + tr.a + " / " + tr.b);
  ok(tr.opts.join(" | ") === "Track 1 · Guitar take 1 | Track 2 · Guitar take 2 | Track 3 · empty" && tr.lanes.join(" | ") === "Guitar take 1 | Guitar take 2", "the Track menu and the song name them: " + tr.opts.join(" | "));
  ok(tr.on.join(" | ") === "Guitar take 2 (On track 2) | Guitar take 1 (On track 1)" && tr.box === "Guitar take 2" && /^From the guitar · 0:0\d$/.test(tr.sub), "the list says which track holds each: " + tr.on.join(" | ") + "; the track's card: " + tr.box + " · " + tr.sub);
  /* take 2 starts at bar 3, so each can be heard on its own */
  await p.click('#clipBox [data-act="start+"]'); await p.click('#clipBox [data-act="start+"]');
  const bar = await p.evaluate(() => ({ s: __aogStudio.barSec(), at: __aogStudio.SONG.tracks[1].clip.startBar, bpm: __aogStudio.SONG.tracks[0].clip.bpm }));
  ok(bar.at === 3 && bar.bpm > 0 && Math.abs(bar.s - 240 / bar.bpm) < 1e-9, `track 2 starts at bar ${bar.at}; the song's tempo is the guitar take's (${bar.bpm} beats a minute, a bar is ${bar.s.toFixed(3)} s)`);
  const w1 = [0.1, 1.4], w2 = [2 * bar.s + 0.1, 2 * bar.s + 1.4], gap = [1.9 + 0.6, 2 * bar.s - 0.15];

  /* Play: both are heard, each in its place */
  const live = await p.evaluate(async ([w1, w2]) => {
    const st = __aogStudio; st.play();
    const ac = st.LIVE.c, d = new Float32Array(1024), lv = { a: 0, b: 0 };
    await new Promise(res => { const iv = setInterval(() => { const now = ac.currentTime - st.PLAY.T0; let pk = 0; for (const a of st.AN.a) { a.getFloatTimeDomainData(d); for (const x of d) pk = Math.max(pk, Math.abs(x)); }
      if (now >= w1[0] && now <= w1[1]) lv.a = Math.max(lv.a, pk); if (now >= w2[0] && now <= w2[1]) lv.b = Math.max(lv.b, pk); if (!st.PLAY.on || now > w2[1] + 0.2) { clearInterval(iv); res(); } }, 40); });
    st.stop(); return lv; }, [w1, w2]);
  ok(live.a > 0.02 && live.b > 0.02, `Play: track 1 is heard at the start (peak ${live.a.toFixed(3)}) and track 2 at bar 3 (peak ${live.b.toFixed(3)})`);

  /* Make the mix: both are in it; with track 2 muted, only track 1 */
  const mixOf = async () => { await p.click("#mixBtn"); await p.waitForFunction(() => /ready|did not/.test(document.getElementById("mixLine").textContent), null, { timeout: 30000 });
    return p.evaluate(async ([w1, w2, gap]) => { const m = __aogStudio.MIX; const buf = await new OfflineAudioContext(2, 1, 44100).decodeAudioData(await m.wav.arrayBuffer()), d = buf.getChannelData(0), sr = buf.sampleRate;
      const rms = ([a, z]) => { let s = 0, n = 0; for (let i = Math.floor(a * sr); i < Math.min(d.length, Math.floor(z * sr)); i++) { s += d[i] * d[i]; n++; } return n ? 10 * Math.log10(s / n + 1e-12) : -120; };
      return { a: +rms(w1).toFixed(1), b: +rms(w2).toFixed(1), gap: +rms(gap).toFixed(1), sec: +buf.duration.toFixed(2), line: document.getElementById("mixLine").textContent }; }, [w1, w2, gap]); };
  const mix = await mixOf();
  ok(mix.a > -40 && mix.b > -40 && mix.gap < mix.b - 20 && /^Your mix is ready\.$/.test(mix.line), `Make the mix: take 1 at the start (${mix.a} dB), take 2 at bar 3 (${mix.b} dB), quiet between (${mix.gap} dB); ${mix.sec} s`);
  await p.evaluate(() => document.querySelector('.st-strip[data-tr="1"] [data-ms="mute"]').click());
  const mix2 = await mixOf();
  ok(mix2.a > -40 && mix2.b < mix.b - 30 && /track 2/.test(mix2.line), `with track 2 muted, bar 3 goes quiet (${mix2.b} dB) and the line says so: ${mix2.line}`);
  await p.evaluate(() => document.querySelector('.st-strip[data-tr="1"] [data-ms="mute"]').click());
  /* the Studio's own mix still goes to the turntables, and is offered here too, beside the takes */
  await p.click("#mixBtn"); await p.waitForFunction(() => /ready|did not/.test(document.getElementById("mixLine").textContent), null, { timeout: 30000 });
  await p.click("#sendBtn"); await p.waitForFunction(() => /Sent|did not/.test(document.getElementById("sendLine").textContent), null, { timeout: 10000 });
  await p.waitForFunction(() => [...document.querySelectorAll("#srcSel option")].some(o => /^Your last mix from the mixing desk/.test(o.textContent)), null, { timeout: 5000 }).catch(() => {});
  const sb = await p.evaluate(async () => { const x = await AOGHandoff.get("studiobench"); return { shelf: !!(x && x.wav && x.wav.size > 44), line: document.getElementById("sendLine").textContent.trim(),
    grp: [...document.querySelectorAll("#srcSel optgroup")].map(g => g.label + ": " + [...g.children].map(o => o.textContent.split(" · ")[0]).join(", ")).pop() }; });
  ok(sb.shelf && sb.line === "Sent. Open the turntables to play it. The turntables" && sb.grp === "Sent to the turntables: Your last mix from the mixing desk, From the bass",
    "the Studio's mix still goes to the turntables (\"" + sb.line + "\"), and is offered here too: " + sb.grp);

  /* a reload keeps both tracks */
  await p.reload(); await p.waitForFunction(() => window.__aogStudio && __aogStudio.INBOX.items.length >= 7 && __aogStudio.BUF.size >= 2 && !__aogStudio.S.decoding, null, { timeout: 20000 });
  const re = await p.evaluate(() => { const T = __aogStudio.SONG.tracks; return { a: T[0].clip && T[0].clip.from + T[0].clip.tn, b: T[1].clip && T[1].clip.from + T[1].clip.tn + "@" + T[1].clip.startBar,
    opts: [...document.querySelectorAll("#trackSel option")].slice(0, 2).map(o => o.textContent).join(" | "), play: !document.getElementById("playBtn").disabled, bufs: T.slice(0, 2).every(x => __aogStudio.BUF.has(x.clip.id)) }; });
  ok(re.a === "guitar1" && re.b === "guitar2@3" && re.bufs && re.play && re.opts === "Track 1 · Guitar take 1 | Track 2 · Guitar take 2", "after a reload both takes are still on their tracks: " + JSON.stringify(re));

  /* 8 · the 17th take: fill the list to 16, then send one more from the piano, with the Studio open */
  await p.evaluate(`(async()=>{ const add=${FILL}; for (let k=0; k<9; k++) await add(k, ["piano","bass","band"][k%3], 10+k); })()`);
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 16, null, { timeout: 5000 });
  ok(await p.evaluate(() => document.querySelector("#inbox > .st-line").textContent) === "16 of 16 takes, newest first." && !(await p.textContent("#goneLine")).trim(),
    "an open Studio shows new takes at once: 16 of 16, and nothing has gone yet");
  const q = await c.newPage(); await q.goto(U + "music-piano.html"); await q.waitForTimeout(900); await q.selectOption("#soundSel", "epwarm");
  await record(q, async () => { await q.evaluate(() => noteOn("k", 64, 0.7)); await q.waitForTimeout(700); await q.evaluate(() => noteOff("k", 64)); });
  await toStudio(q, "takes", "recLine", 1);
  await p.waitForFunction(() => /oldest/.test(document.getElementById("goneLine").textContent), null, { timeout: 5000 });
  const g = await p.evaluate(() => ({ line: document.getElementById("goneLine").textContent, n: document.querySelector("#inbox > .st-line").textContent, first: document.querySelector("#inbox .st-rec b").textContent,
    piano1: [...document.querySelectorAll("#inbox .st-rec b")].filter(b => b.textContent === "Piano take 1").length, tracks: __aogStudio.SONG.tracks.slice(0, 2).every(x => x.clip) }));
  ok(/^The Mixing Desk keeps 16 takes\. To make room for a new one, the oldest went: Piano take 1 \(made at \d{1,2}:\d\d (AM|PM)\)\.$/.test(g.line.replace(/\u202f/g, " ")) && g.n === "16 of 16 takes, newest first." && g.first === "Piano take 1" && g.piano1 === 1 && g.tracks,
    "the 17th take pushes out the oldest, and the Studio says so plainly: \"" + g.line + "\" (the newest piano take is first; the tracks are untouched)");
  await q.close();

  /* 9 · Remove: asked first; Keep it keeps it; Yes takes it out, and its track keeps its copy */
  const g1 = await p.evaluate(() => [...document.querySelectorAll("#inbox .st-rec")].find(r => r.querySelector("b").textContent === "Guitar take 1").getAttribute("data-take"));
  await p.click(`#inbox [data-drop="${g1}"]`);
  const ask = await p.evaluate(() => ({ q: document.querySelector("#inbox .st-q p").textContent, yes: document.querySelector("#inbox [data-dropyes]").textContent, no: document.querySelector("#inbox [data-dropno]").textContent, focus: document.activeElement.getAttribute("data-dropno") }));
  ok(ask.q === "Remove Guitar take 1 from this list? It stays on track 1." && ask.yes === "Yes, remove it" && ask.no === "Keep it" && ask.focus === g1, "Remove asks first: " + JSON.stringify(ask));
  await p.click(`#inbox [data-dropno="${g1}"]`);
  ok(await p.evaluate(id => !document.querySelector("#inbox .st-q") && !!document.querySelector(`#inbox [data-drop="${id}"]`) && __aogStudio.INBOX.items.length === 16, g1), "Keep it keeps it");
  await p.click(`#inbox [data-drop="${g1}"]`); await p.click(`#inbox [data-dropyes="${g1}"]`);
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 15, null, { timeout: 5000 });
  const rm = await p.evaluate(id => ({ line: document.getElementById("inboxLine").textContent, gone: document.getElementById("goneLine").textContent, there: !!document.querySelector(`#inbox [data-take="${id}"]`),
    track: __aogStudio.SONG.tracks[0].clip && __aogStudio.SONG.tracks[0].clip.from + __aogStudio.SONG.tracks[0].clip.tn, buf: __aogStudio.BUF.has(__aogStudio.SONG.tracks[0].clip.id),
    stored: null }), g1);
  rm.stored = await p.evaluate(async id => !!(await AOGHandoff.item(AOGHandoff.INBOX, id)), g1);
  ok(rm.line === "Guitar take 1 is out of the list." && !rm.there && !rm.stored && rm.track === "guitar1" && rm.buf && !rm.gone,
    "Yes takes it out (and out of this device's list); track 1 keeps its copy; the note about the oldest is cleared: " + JSON.stringify(rm));

  /* 10 · Spanish */
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(200);
  const es = await p.evaluate(() => ({ h: document.querySelector("#inboxBlk h2").textContent, n: document.querySelector("#inbox > .st-line").textContent, names: [...document.querySelectorAll("#inbox .st-rec b")].map(b => b.textContent),
    sub: [...document.querySelectorAll("#inbox .st-rec .st-cn")].map(x => x.textContent.replace(/ /g, " ")).find(s => /tocadiscos/.test(s)) || "", rm: document.querySelector("#inbox [data-drop]").textContent,
    lab: document.getElementById(document.querySelector("#srcSel").getAttribute("aria-labelledby")).textContent, grp: [...document.querySelectorAll("#srcSel optgroup")].map(g => g.label).join(" / "),
    put: document.getElementById("putBtn").textContent, opts: [...document.querySelectorAll("#trackSel option")].slice(0, 2).map(o => o.textContent).join(" | "), on: (document.querySelector("#inbox .st-on") || {}).textContent }));
  ok(es.h === "Tomas enviadas aquí" && es.n === "15 de 16 tomas, la más nueva primero." && es.rm === "Quitar" && es.lab === "Pon una grabación en esta pista" && es.grp === "Tomas enviadas aquí / Enviado a los platos" && es.put === "Ponla en la pista 2",
    "in Spanish: " + [es.h, es.n, es.rm, es.lab, es.grp, es.put].join(" · "));
  ok(es.names.indexOf("Toma de los tocadiscos 1") >= 0 && es.names.indexOf("Toma de la banda 1") >= 0 && es.names.indexOf("Toma de ritmos 1") >= 0 && es.names.indexOf("Toma de guitarra 2") >= 0 && es.on === "En la pista 2" &&
    /^De los tocadiscos · 0:0\d · hecha a las \d{1,2}:\d\d/.test(es.sub) && es.opts === "Pista 1 · Toma de guitarra 1 | Pista 2 · Toma de guitarra 2", "the takes in Spanish: " + es.names.slice(0, 4).join(", ") + " … " + es.sub + "; " + es.opts);
  await p.evaluate(() => document.getElementById("langBtn").click());
  /* an instrument in Spanish */
  const r = await c.newPage(); await r.addInitScript(() => { try { localStorage.setItem("aog.lang", "es"); } catch (e) {} });
  await r.goto(U + "music-guitar.html"); await r.waitForTimeout(900);
  await record(r, async () => { await r.evaluate(() => playChord(pads()[0], 0.8)); await r.waitForTimeout(900); });
  const esActs = await acts(r, "takes"); const esLn = await toStudio(r, "takes", "recLine", 1);
  ok(esActs === "Guardar como .wav | Enviar a los platos | Enviar a la caja de ritmos | Enviar a la mesa de mezclas | Borrar" && esLn.text === "Enviada a la mesa de mezclas. Abrir la mesa de mezclas", "the guitar in Spanish: " + esActs + " → " + esLn.text);
  await r.evaluate(() => { try { localStorage.setItem("aog.lang", "en"); } catch (e) {} }); await r.close();
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();

  /* 11 · an iPhone (390 px), light and dark: the instruments' take rows, the turntables' line and the Studio fit, read and are calm */
  for (const theme of ["light", "dark"]) {
    const cx = await b.newContext({ ...pw.devices["iPhone 13"], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage();
    await m.goto(U + "music-bass.html"); await m.waitForTimeout(900);
    await record(m, async () => { await m.evaluate(() => playChord(pads()[0], 0.8)); await m.waitForTimeout(900); });
    await toStudio(m, "takes", "recLine", 1);
    await m.locator("#takes").scrollIntoViewIfNeeded(); await m.waitForTimeout(200);
    const fit = await m.evaluate(() => { const bt = document.querySelector('#takes [data-aogrec-studio="1"]').getBoundingClientRect(); return { h: Math.round(bt.height), right: Math.round(bt.right), iw: innerWidth, sw: document.scrollingElement.scrollWidth }; });
    const bc = await m.evaluate(`(${PROBE})()`), bk = await m.evaluate(`(${CALM})()`);
    ok(fit.h >= 44 && fit.right <= fit.iw && fit.sw <= fit.iw && !bc.length && !bk.filter(x => !/aog-calm/.test(x)).length,
      `iPhone, ${theme}: the bass's take row with Send to the Studio fits (${JSON.stringify(fit)}), reads (${bc.length} unreadable ${JSON.stringify(bc.slice(0, 2))}) and is calm (${bk.join("; ") || "ok"})`);
    await m.screenshot({ path: `studiosend-bass-${theme}.png` });
    await m.goto(U + "music-decks.html"); await m.waitForTimeout(1200);
    await m.evaluate(() => { const s = document.querySelector(".viewpick select.aogdd-sel"); if (s) { s.value = [...s.options].find(o => /Mixer/.test(o.text)).value; s.dispatchEvent(new Event("change")); } });
    await m.waitForTimeout(200);
    await m.click("#recBtn"); await m.waitForTimeout(1200); await m.click("#recBtn"); await m.waitForTimeout(700);
    await m.click('#takes [data-tostudio="1"]'); await m.waitForFunction(() => /^(Sent to the Mixing Desk|That did not work)/.test(document.getElementById("takeLine").textContent.trim()), null, { timeout: 10000 });
    await m.locator("#takeLine").scrollIntoViewIfNeeded(); await m.waitForTimeout(200);
    const dfit = await m.evaluate(() => { const bt = document.querySelector('#takes [data-tostudio="1"]').getBoundingClientRect(); return { h: Math.round(bt.height), right: Math.round(bt.right), iw: innerWidth, sw: document.scrollingElement.scrollWidth, line: document.getElementById("takeLine").textContent.trim() }; });
    const dc = await m.evaluate(`(${PROBE})()`), dk = await m.evaluate(`(${CALM})()`);
    ok(dfit.h >= 40 && dfit.right <= dfit.iw && dfit.sw <= dfit.iw && dfit.line === "Sent to the Mixing Desk. Open the Mixing Desk" && !dc.length && !dk.length,
      `iPhone, ${theme}: the turntables' take row and its line fit (${JSON.stringify(dfit)}), read (${dc.length} unreadable ${JSON.stringify(dc.slice(0, 2))}) and are calm (${dk.join("; ") || "ok"})`);
    await m.screenshot({ path: `studiosend-decks-${theme}.png` });
    /* the Studio with a full list, a take on a track and a question open */
    await m.goto(U + "music-studio.html"); await m.waitForTimeout(800);
    await m.evaluate(`(async()=>{ const add=${FILL}; for (let k=0; k<15; k++) await add(k, ["piano","bass","band"][k%3], 20+k); })()`);
    await m.waitForFunction(() => __aogStudio.INBOX.items.length === 16 && /oldest/.test(document.getElementById("goneLine").textContent), null, { timeout: 8000 });
    await m.selectOption("#srcSel", await m.evaluate(() => document.querySelector("#srcSel option").value)); await m.click("#putBtn");
    await m.waitForFunction(() => __aogStudio.SONG.tracks[0].clip && !__aogStudio.S.busy, null, { timeout: 15000 });
    await m.evaluate(() => { const b = document.querySelector("#inbox [data-drop]"); b.click(); });
    await m.locator("#inboxBlk").scrollIntoViewIfNeeded(); await m.waitForTimeout(200);
    const sfit = await m.evaluate(() => { const r = el => el.getBoundingClientRect(), sel = document.getElementById("srcSel"), put = document.getElementById("putBtn"), rm = [...document.querySelectorAll("#inbox [data-drop], #inbox [data-dropyes], #inbox [data-dropno]")];
      return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, sel: { h: Math.round(r(sel).height), fs: getComputedStyle(sel).fontSize, right: Math.round(r(sel).right) }, put: { h: Math.round(r(put).height), right: Math.round(r(put).right) },
        rm: Math.min(...rm.map(b => Math.round(r(b).height))), rmRight: Math.max(...rm.map(b => Math.round(r(b).right))), rows: document.querySelectorAll("#inbox .st-rec").length, gone: document.getElementById("goneLine").textContent }; });
    const sc = await m.evaluate(`(${PROBE})()`), sk = await m.evaluate(`(${CALM})()`);
    ok(sfit.sw <= sfit.iw && sfit.sel.h >= 44 && parseFloat(sfit.sel.fs) >= 16 && sfit.sel.right <= sfit.iw && sfit.put.h >= 44 && sfit.put.right <= sfit.iw && sfit.rm >= 44 && sfit.rmRight <= sfit.iw && sfit.rows === 16,
      `iPhone, ${theme}: the Studio with 16 takes, its menu and a question open fits, nothing sideways: ${JSON.stringify(sfit)}`);
    ok(!sc.length && !sk.length, `iPhone, ${theme}: the Studio reads (${sc.length} unreadable ${JSON.stringify(sc.slice(0, 3))}) and is calm (${sk.join("; ") || "ok"})`);
    await m.screenshot({ path: `studiosend-studio-${theme}.png`, fullPage: true });
    await cx.close();
  }
  /* 12 · an iPad: the Studio's list (Remove beside each take) and its menu sit comfortably; nothing sideways */
  {
    const cx = await b.newContext({ ...pw.devices["iPad (gen 7)"] }); watch(cx); await routes(cx);
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(800);
    await m.evaluate(`(async()=>{ const add=${FILL}; for (let k=0; k<6; k++) await add(k, ["piano","bass","band"][k%3], 40+k); })()`);
    await m.waitForFunction(() => __aogStudio.INBOX.items.length === 6, null, { timeout: 8000 });
    await m.click("#putBtn"); await m.waitForFunction(() => __aogStudio.SONG.tracks[0].clip && !__aogStudio.S.busy, null, { timeout: 15000 });
    await m.locator("#inboxBlk").scrollIntoViewIfNeeded(); await m.waitForTimeout(200);
    const f = await m.evaluate(() => { const r = el => el.getBoundingClientRect(), rows = [...document.querySelectorAll("#inbox .st-rec")];
      return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, rows: rows.length, sel: Math.round(r(document.getElementById("srcSel")).width),
        beside: rows.every(x => { const bt = r(x.querySelector("[data-drop]")), tx = r(x.querySelector(".st-rtx")); return bt.left >= tx.right - 1 && bt.top < tx.bottom; }) }; });
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    ok(f.sw <= f.iw && f.rows === 6 && f.beside && !pc.length && !pk.length,
      `iPad (${f.iw} px): the list and the menu (${f.sel} px wide) fit, read and are calm: ${JSON.stringify(f)} ${JSON.stringify(pc.slice(0, 2))} ${pk.join("; ")}`);
    await m.screenshot({ path: "studiosend-studio-ipad.png" });
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the phone or the iPad " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
