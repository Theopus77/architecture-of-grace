/* AOG-LOCKER-V2, V3 — the locker script (aog-deploy/AoG-Studio-Locker.gs) run in node against a pretend Google (../lib/fakegas.js).
   Checks: setup and link print one device link (and say what to do when the script cannot know its address yet); the key
   is checked for every action, old and new, and never logged by a request; the size limits; a song keeps its last 3 saves
   and nothing else goes; list shows each song once with its earlier saves, device and time; remove takes every save of
   that song only; check answers the newest save and the takes from other devices; a take is passed, then removed once
   received, or after 7 days; a send that stopped halfway goes after a day; today's desk (v1 requests) still works; and
   newKey shuts out the old key. No browser, no port. */
const fs = require("fs"), path = require("path");
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const SRC = fs.readFileSync(path.join(ROOT, "AoG-Studio-Locker.gs"), "utf8");
const fakeGas = require("../lib/fakegas.js");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const EXEC = "https://script.google.com/macros/s/AKfycbTESTdeployment_123456/exec";

/* 1 · setup, link, the address */
let G = fakeGas(SRC);
const s1 = G.run("setup"), KEY = G.props.LOCKER_KEY;
ok(/^[a-f0-9]{32}$/.test(KEY) && s1[0] === "Your locker key: " + KEY, "setup makes a key and prints it, as before");
ok(s1.some(l => /Deploy ▸ New deployment ▸ Web app/.test(l)) && s1.some(l => /pick "link"/.test(l)) && !s1.some(l => /#locker=/.test(l)),
  "before it is deployed, setup says the next steps plainly: Deploy, then run link");
ok(G.root() && G.root().name === "Mixing Desk songs", "setup makes the folder in Drive");
const l0 = G.run("link");
ok(l0.some(l => /could not find this script's web address/.test(l)) && l0.some(l => /WEB_APP_URL/.test(l)) && !l0.join(" ").includes(KEY),
  "link before deploying says how to give it the address, and never shows the key: " + l0[0]);
G.url = "https://script.google.com/macros/s/AKfycbTESTdeployment_123456/dev";
ok(G.run("link").some(l => /could not find/.test(l)), "a /dev address is not taken for the device link");
G.url = EXEC;
const l1 = G.run("link"), dl = l1.find(l => /#locker=/.test(l)) || "";
ok(dl === "https://architectureofgrace.com/the-studio#locker=" + encodeURIComponent(EXEC) + "&k=" + KEY, "after deploying, link prints one device link: " + dl.slice(0, 80) + "…");
ok(l1.some(l => /only to your own devices or your family's/.test(l)), "the words around the link say to send it only to your own or family devices");
const s2 = G.run("setup");
ok(G.props.LOCKER_KEY === KEY && s2.some(l => l === dl), "setup again keeps the key, and prints the same device link once deployed");
const G2 = fakeGas(SRC.replace("var WEB_APP_URL = '';", "var WEB_APP_URL = '" + EXEC + "';")); G2.run("setup");
ok(G2.run("link").some(l => l.includes("#locker=" + encodeURIComponent(EXEC))), "WEB_APP_URL, when filled in, gives the link");
ok(G.get().ok === true && G.get().locker === 3, "doGet still answers {ok, locker}, now version 3");

/* 2 · the key, for every action */
const ACTIONS = ["hello", "list", "begin", "part", "finish", "get", "remove", "check", "takeBegin", "takePart", "takeFinish", "takeGet", "takeDone", "have", "recPart", "songPut", "songGet", "recGet", "nonsense"];
const logs0 = G.logs.length;
let refused = ACTIONS.filter(a => { const r = G.post({ key: "wrong" + KEY.slice(5), action: a, size: 10, parts: 1 }); return r.ok === false && r.error === "key"; });
ok(refused.length === ACTIONS.length, "a wrong key is refused for every action, old and new (" + refused.length + "/" + ACTIONS.length + ")");
refused = ACTIONS.filter(a => { const r = G.post({ action: a }); return r.ok === false && r.error === "key"; });
ok(refused.length === ACTIONS.length, "no key is refused for every action");
ok(G.post("not json").error === "bad request", "a request that is not JSON is refused");
const G3 = fakeGas(SRC); ok(G3.post({ key: "", action: "hello" }).error === "key" && G3.post({ key: "anything", action: "list" }).error === "key", "before setup, nothing gets in");
ok(G.post({ key: KEY, action: "hello" }).locker === 3 && G.post({ key: KEY, action: "nonsense" }).error === "unknown action", "the right key: hello says v3; an unknown action is told");
ok(G.logs.length === logs0, "no request ever logs anything (so the key is never logged)");

/* 3 · a song: saves, sizes, 3 kept */
const K = { key: KEY };
const P = (b) => G.post(Object.assign({}, K, b));
function save(name, bytes, extra) {
  const parts = Math.ceil(bytes.length / 4), b = P(Object.assign({ action: "begin", name, size: bytes.length, parts }, extra || {}));
  if (!b.ok) return b;
  for (let i = 0; i < parts; i++) { const r = P({ action: "part", id: b.id, n: i, data: bytes.slice(i * 4, i * 4 + 4).toString("base64") }); if (!r.ok) return r; }
  const f = P({ action: "finish", id: b.id }); return Object.assign({ id: b.id }, f);
}
function fetchSong(id, parts) { const out = []; for (let i = 0; i < parts; i++) { const r = P({ action: "get", id, n: i }); if (!r.ok) return null; out.push(Buffer.from(r.data, "base64")); } return Buffer.concat(out); }
ok(P({ action: "begin", name: "x", size: 401 * 1024 * 1024, parts: 3 }).error === "That song is too big for the locker.", "a song over 400 MB is refused");
ok(P({ action: "begin", name: "x", size: 1000, parts: 201 }).error === "That song is too big for the locker." && P({ action: "begin", name: "x", size: 1000, parts: 1.5 }).error === "That song is too big for the locker.", "too many pieces, or half a piece, is refused");
const bb = P({ action: "begin", name: "Big", size: 10, parts: 2 });
ok(P({ action: "part", id: bb.id, n: 0, data: "A".repeat(8 * 1024 * 1024 + 4) }).error === "bad part", "a piece over 8 MB of text is refused");
ok(P({ action: "part", id: bb.id, n: 2, data: "AAAA" }).error === "bad part" && P({ action: "part", id: bb.id, n: -1, data: "AAAA" }).error === "bad part", "a piece number out of range is refused");
ok(P({ action: "finish", id: bb.id }).error === "A piece of the song did not arrive. Try again.", "finish with a piece missing says so");
ok(P({ action: "get", id: "../../etc", n: 0 }).error === "bad id" && P({ action: "takeGet", id: "s123456789", n: 0 }).error === "bad id", "ids are checked");

const SID = "abc123def456", OTHER = "zzz999yyy888";
const old1 = save("Old song", Buffer.from("an old song from v1"));   /* today's desk: no sid, no device */
ok(old1.ok && /^s[a-z0-9]{20}$/.test(old1.id), "a save from today's desk (no song id, no device) works as before");
const saves = [];
for (let i = 0; i < 5; i++) { G.clock.now += 60000; saves.push(save("Rainy day", Buffer.from("rainy day, save " + i), { sid: SID, dev: ["iPhone", "iPad", "Mac", "Windows", "Android"][i] })); }
G.clock.now += 60000; const oth = save("Other song", Buffer.from("other song"), { sid: OTHER, dev: "computer" });
ok(saves.every(s => s.ok && s.id.startsWith("s" + SID)) && saves[4].at === G.clock.now - 60000, "five saves of one song, each with its own id; finish answers the time");
const live = G.live().filter(f => f.name !== "takes").map(f => f.name);
ok(live.filter(n => n.startsWith("s" + SID)).length === 3 && saves.slice(2).every(s => live.includes(s.id)) && !live.includes(saves[0].id) && !live.includes(saves[1].id),
  "the song keeps its newest 3 saves; the 2 older ones went to the Drive trash");
ok(live.includes(old1.id) && live.includes(oth.id) && live.includes(bb.id) && live.length === 6, "nothing else went: the v1 song, the other song and a save still on its way stay (" + live.length + " folders)");
const sf = G.root().folders.find(f => f.name === saves[4].id);
ok(sf.files.filter(f => f.name === "song.json").length === 1 && JSON.parse(sf.files.find(f => f.name === "song.json").bytes).done === true, "song.json is changed in place: one file, marked done");
ok(fetchSong(saves[4].id, saves[4].ok ? Math.ceil(("rainy day, save 4").length / 4) : 0).toString() === "rainy day, save 4", "a save comes back byte for byte");

const L = P({ action: "list" });
const rd = L.songs.find(s => s.sid === SID);
ok(L.ok && L.locker === 3 && L.songs.length === 3 && L.songs[0].id === oth.id, "list: each song once, newest first (" + L.songs.map(s => s.name).join(", ") + ")");
ok(rd && rd.id === saves[4].id && rd.dev === "Android" && rd.name === "Rainy day" && rd.earlier.length === 2 && rd.earlier[0].id === saves[3].id && rd.earlier[0].dev === "Windows" && rd.earlier[1].id === saves[2].id,
  "list: the newest save, its device and time, and two earlier saves");
const o1 = L.songs.find(s => s.id === old1.id);
ok(o1 && typeof o1.size === "number" && o1.parts >= 1 && o1.at > 0 && o1.earlier.length === 0, "list still gives today's desk id, name, at, size and parts");
ok(P({ action: "begin", name: "x", size: 4, parts: 1, sid: "../evil", dev: "<b>" }).ok && JSON.parse(G.root().folders.slice(-1)[0].files[0].bytes).sid === "" && JSON.parse(G.root().folders.slice(-1)[0].files[0].bytes).dev === "",
  "a song id or device that is not one of ours is not kept");
G.clock.now += 2 * 864e5; P({ action: "list" });
ok(G.live().filter(f => f.name !== "takes").length === 5, "a save that stopped halfway goes to the trash after a day");

/* 4 · check: the newest save of this song */
let C = P({ action: "check", sid: SID, did: "ipad0device" });
ok(C.ok && C.locker === 3 && C.song && C.song.id === saves[4].id && C.song.dev === "Android" && C.song.at === saves[4].at, "check answers the newest save of the song, with its device and time");
ok(P({ action: "check", sid: "nosuchsong12" }).song === null && P({ action: "check" }).song === null, "a song not in the locker: no save");

/* 5 · takes between devices */
const TAKE = Buffer.from("RIFF....WAVEfmt a take from the iPhone, with its dry voice");
function sendTake(bytes, extra) {
  const parts = Math.ceil(bytes.length / 16), b = P(Object.assign({ action: "takeBegin", size: bytes.length, parts, dev: "iPhone", did: "iphone0device", meta: { name: "Voice 1", from: "vocal", sec: 4.2 } }, extra || {}));
  if (!b.ok) return b;
  for (let i = 0; i < parts; i++) P({ action: "takePart", id: b.id, n: i, data: bytes.slice(i * 16, i * 16 + 16).toString("base64") });
  return Object.assign({ id: b.id, parts }, P({ action: "takeFinish", id: b.id }));
}
ok(P({ action: "takeBegin", size: 121 * 1024 * 1024, parts: 30 }).error === "That take is too big for the locker." && P({ action: "takeBegin", size: 100, parts: 41 }).error === "That take is too big for the locker.",
  "a take over 120 MB, or in more than 40 pieces, is refused");
ok(P({ action: "takeBegin", size: 100, parts: 1, meta: { name: "x".repeat(5000) } }).ok, "a long name is cut short, not stored whole");
const tk = sendTake(TAKE);
ok(tk.ok && /^k[a-z0-9]{20}$/.test(tk.id), "a take goes up in pieces");
C = P({ action: "check", sid: SID, did: "iphone0device" });
ok(!C.takes.some(x => x.id === tk.id), "the iPhone that sent it is not handed its own take back");
C = P({ action: "check", sid: SID, did: "ipad0device" });
const ct = C.takes.find(x => x.id === tk.id);
ok(ct && ct.dev === "iPhone" && ct.meta.name === "Voice 1" && ct.meta.from === "vocal" && ct.meta.sec === 4.2 && ct.parts === tk.parts && ct.size === TAKE.length, "the iPad is told about it: from your iPhone, its name and size");
ok(C.takes.filter(x => x.size === 100).length === 0, "a take whose send never finished is not handed out");
const got = []; for (let i = 0; i < tk.parts; i++) got.push(Buffer.from(P({ action: "takeGet", id: tk.id, n: i }).data, "base64"));
ok(Buffer.concat(got).equals(TAKE), "the take comes down byte for byte");
ok(P({ action: "takeDone", id: tk.id }).ok && !P({ action: "check", did: "macdevice00" }).takes.some(x => x.id === tk.id), "once received, it is out of the locker");
ok(P({ action: "takeGet", id: tk.id, n: 0 }).error === "That take is not in the locker.", "and cannot be fetched again");
const tk2 = sendTake(TAKE);
G.clock.now += 6 * 864e5; ok(P({ action: "check", did: "ipad0device" }).takes.some(x => x.id === tk2.id), "a take nobody received is still there after 6 days");
G.clock.now += 1.1 * 864e5; ok(!P({ action: "check", did: "ipad0device" }).takes.some(x => x.id === tk2.id), "after 7 days it goes to the trash");
const tf = G.live(G.root().folders.find(f => f.name === "takes"));
ok(tf.length === 0, "the takes folder holds nothing live now (" + tf.length + ")");
ok(!P({ action: "list" }).songs.some(s => s.name === undefined || s.id === "takes"), "the takes folder is never listed as a song");

/* 6 · remove: every save of that song, and nothing else */
G.clock.now += 60000; save("Rainy day", Buffer.from("rainy day, save 5"), { sid: SID, dev: "iPad" });
const before = G.live().length;
ok(P({ action: "remove", id: P({ action: "list" }).songs.find(s => s.sid === SID).id }).ok, "remove");
const after = G.live().map(f => f.name);
ok(!after.some(n => n.startsWith("s" + SID)) && after.includes(oth.id) && after.includes(old1.id) && after.length === before - 3, "remove takes every save of that song to the trash, and nothing else");

/* 7 · newKey */
const nk = G.run("newKey"), KEY2 = G.props.LOCKER_KEY;
ok(KEY2 !== KEY && nk.some(l => l.includes("&k=" + KEY2)) && P({ action: "hello" }).error === "key" && G.post({ key: KEY2, action: "hello" }).ok, "newKey: a new key and link; the old key is shut out");

/* 8 · v1 → v2: what v1 left in Drive opens with v2 */
const V1 = fakeGas(fs.readFileSync(path.join(__dirname, "../studio/fixtures/AoG-Studio-Locker-v1.gs"), "utf8"));
V1.run("setup"); const VK = V1.props.LOCKER_KEY;
const vb = V1.post({ key: VK, action: "begin", name: "From v1", size: 4, parts: 1 }); V1.post({ key: VK, action: "part", id: vb.id, n: 0, data: Buffer.from("v1!!").toString("base64") }); V1.post({ key: VK, action: "finish", id: vb.id });
const V2 = fakeGas(SRC); Object.assign(V2.props, V1.props);
/* the same Drive and the same script properties: v2 finds v1's folder by the id v1 kept */
const v1root = V1.root(); V2.sandbox.DriveApp.getFolderById = id => { if (id === v1root.id) return v1root; throw new Error("none"); };
const v2l = V2.post({ key: VK, action: "list" });
ok(v2l.ok && v2l.songs.length === 1 && v2l.songs[0].name === "From v1" && Buffer.from(V2.post({ key: VK, action: "get", id: vb.id, n: 0 }).data, "base64").toString() === "v1!!",
  "after the update, the same key opens the songs v1 saved");

/* 9 · AOG-LOCKER-V3: each recording once. A recording's id is its clip id, its size and the CRC32 of its bytes. */
{
  const zlib = require("zlib");
  const T = fakeGas(SRC); T.run("setup"); const K3 = T.props.LOCKER_KEY, LOGS0 = T.logs.length;
  let locks = 0; const realLock = T.sandbox.LockService.getScriptLock;
  T.sandbox.LockService.getScriptLock = () => { const l = realLock(); return { waitLock() { locks++; }, releaseLock() {} }; };
  const Q = b => T.post(Object.assign({ key: K3 }, b));
  const rid = (clip, buf) => clip + "-" + buf.length + "-" + (zlib.crc32(buf) >>> 0).toString(16).padStart(8, "0");
  const PIECE = 4;   /* tiny pieces here; the desk sends 4 MB */
  const rec = (clip, text) => { const b = Buffer.from(text); return { clip, b, rid: rid(clip, b), parts: Math.ceil(b.length / PIECE) }; };
  const want = r => ({ rid: r.rid, size: r.b.length, parts: r.parts, piece: PIECE });
  const piece = (r, n) => Q({ action: "recPart", rid: r.rid, n, data: r.b.slice(n * PIECE, n * PIECE + PIECE).toString("base64") });
  const recsDir = () => T.root().folders.find(f => f.name === "Recordings" && !f.isTrashed());
  const liveRecs = () => recsDir() ? T.live(recsDir()).map(f => f.name).sort() : [];
  const index = () => JSON.parse(recsDir().files.find(f => f.name === "index.json" && !f.trashed).bytes).r;
  const MAN = (name, recs) => JSON.stringify({ kind: "aog-song", v: 3, song: { name }, clips: recs.map(r => ({ id: r.clip, size: r.b.length, rid: r.rid })) });
  const put = (sid, name, recs, dev) => Q({ action: "songPut", sid, name, dev: dev || "iPhone", song: MAN(name, recs), recs: recs.map(r => r.rid) });
  function upload(r, order) { Q({ action: "have", begin: true, recs: [want(r)] }); (order || [...Array(r.parts).keys()]).forEach(n => piece(r, n)); }
  function fetchRec(r) { const g = []; for (let n = 0; n < r.parts; n++) { const x = Q({ action: "recGet", rid: r.rid, n }); if (!x.ok) return null; g.push(Buffer.from(x.data, "base64")); } return Buffer.concat(g); }

  ok(Q({ action: "hello" }).locker === 3, "v3: hello says 3");

  /* which recordings it has */
  const A = rec("cdrums00001", "the drum machine's loop, eight bars"), B = rec("cbass000002", "the bass line under it"), V = rec("cvoice00003", "a long turntables take");
  let h = Q({ action: "have", ids: [A.rid, B.rid] });
  ok(h.ok && h.have.length === 0 && Object.keys(h.part).length === 0 && !recsDir(), "have, asked first: none of them, and the question alone makes nothing in Drive");
  locks = 0;
  h = Q({ action: "have", begin: true, recs: [want(A), want(B)] });
  ok(h.ok && h.have.length === 0 && h.part[A.rid].length === 0 && h.part[B.rid].length === 0 && liveRecs().join() === [A.rid, B.rid].sort().join() && locks === 1,
    "have with begin: both made ready (a folder each in Recordings), under the lock once");

  /* pieces in parallel: out of order, without the lock, and the last one makes it whole */
  locks = 0;
  [3, 0, 8, 1, 7, 2, 6, 5, 4].filter(n => n < A.parts).forEach(n => ok(piece(A, n).ok, "piece " + n + " of the drum loop"));
  ok(locks === 0, "pieces never wait for the lock, so 3 can arrive at once (" + locks + ")");
  ok(index()[A.rid].d === 0 && Q({ action: "have", ids: [A.rid] }).part[A.rid].length === A.parts, "every piece arrived; have says so (whole once a save or a have begin sees it)");
  ok(piece(A, 0).ok && recsDir().folders.find(f => f.name === A.rid).files.filter(f => f.name === "part-000" && !f.trashed).length === 1,
    "a piece sent twice is kept once");

  /* resume: pieces that arrived are kept; have says which */
  B.parts > 2 || ok(false, "the bass needs 3 pieces for this test");
  piece(B, 0); piece(B, 2);
  h = Q({ action: "have", ids: [B.rid] });
  ok(JSON.stringify(h.part[B.rid]) === "[0,2]", "a recording whose pieces partly arrived: have names them (" + JSON.stringify(h.part[B.rid]) + ")");
  h = Q({ action: "have", begin: true, recs: [want(B)] });
  ok(JSON.stringify(h.part[B.rid]) === "[0,2]" && !h.have.includes(B.rid), "beginning it again keeps them: the desk sends only the rest");
  ok(Q({ action: "recGet", rid: B.rid, n: 0 }).error === "That recording is not in the locker.", "a recording not yet whole cannot be read");

  /* a save: a manifest, and only once every recording is whole */
  let p = put("song00000001", "Rainy day", [A, B]);
  ok(p.ok && JSON.stringify(p.missing) === JSON.stringify([B.rid]) && !T.live().some(f => f.name.startsWith("ssong00000001")), "a save with a recording missing says which, and saves nothing");
  for (let n = 1; n < B.parts; n += 2) piece(B, n);
  for (let n = 0; n < B.parts; n++) piece(B, n);
  p = put("song00000001", "Rainy day", [A, B, A]);
  ok(p.ok && /^ssong00000001[a-z0-9]{8}$/.test(p.id) && p.at === T.clock.now && !p.missing, "the rest sent: the save goes (" + p.id + ")");
  const sv = T.root().folders.find(f => f.name === p.id), info = JSON.parse(sv.files.find(f => f.name === "song.json").bytes);
  ok(info.v === 3 && info.done && info.parts === 0 && JSON.stringify(info.recs) === JSON.stringify([A.rid, B.rid]) && info.dev === "iPhone" && info.size === A.b.length + B.b.length + MAN("Rainy day", [A, B, A]).length,
    "song.json: v3, the recordings it uses once each, its device, and its size");
  ok(sv.files.find(f => f.name === "manifest.json").bytes.toString() === MAN("Rainy day", [A, B, A]) && sv.files.length === 2, "manifest.json: the song, as it was sent; nothing else in the save");
  ok(index()[A.rid].d === 1 && index()[B.rid].d === 1, "both recordings are whole in the index");
  ok(fetchRec(A).equals(A.b) && fetchRec(B).equals(B.b), "each recording comes back byte for byte");
  const g = Q({ action: "songGet", id: p.id });
  ok(g.ok && g.song === MAN("Rainy day", [A, B, A]) && g.recs[A.rid].size === A.b.length && g.recs[A.rid].parts === A.parts && g.recs[A.rid].piece === PIECE && g.recs[B.rid].parts === B.parts,
    "songGet: the song and, for each recording, its size and pieces");
  const before = recsDir().folders.find(f => f.name === A.rid).files.filter(f => !f.trashed).length;
  ok(piece(A, 0).done === true && recsDir().folders.find(f => f.name === A.rid).files.filter(f => !f.trashed).length === before, "a whole recording is never written over");

  /* a fader moved: only the manifest */
  T.clock.now += 60000;
  const n0 = liveRecs().length; p = put("song00000001", "Rainy day", [A, B]);
  ok(p.ok && p.id && liveRecs().length === n0, "the next save of the song: a manifest, no recording sent again");

  /* v2 desks do not see v3 saves; v3 desks see both */
  const old = Q({ action: "begin", name: "From the v2 desk", size: 8, parts: 2, sid: "song00000002", dev: "Mac" });
  Q({ action: "part", id: old.id, n: 0, data: Buffer.from("v2!!").toString("base64") }); Q({ action: "part", id: old.id, n: 1, data: Buffer.from("song").toString("base64") }); Q({ action: "finish", id: old.id });
  const l2 = Q({ action: "list" }), l3 = Q({ action: "list", v: 3 });
  ok(l2.songs.length === 1 && l2.songs[0].id === old.id && !l2.songs[0].v, "a v2 desk's list: only the save it can open");
  const r3 = l3.songs.find(s => s.sid === "song00000001");
  ok(l3.songs.length === 2 && r3 && r3.v === 3 && r3.id === p.id && r3.earlier.length === 1 && r3.earlier[0].v === 3 && l3.songs.some(s => s.id === old.id && !s.v), "a v3 desk's list: both, the v3 save and its earlier one marked v3");
  ok(Q({ action: "check", sid: "song00000001", v: 3 }).song.id === p.id && Q({ action: "check", sid: "song00000001" }).song === null, "check: the newest v3 save for a v3 desk; none for a v2 desk");
  ok(Q({ action: "get", id: p.id, n: 0 }).error === "bad part", "a v2 desk's get on a v3 save is refused, not broken");
  ok(Buffer.from(Q({ action: "get", id: old.id, n: 1 }).data, "base64").toString() === "song", "a v2 save in a v3 locker still opens");

  /* 3 saves kept; a new take sends only itself */
  T.clock.now += 60000; upload(V); p = put("song00000001", "Rainy day", [A, B, V]);
  ok(p.ok && T.live().filter(f => f.name.startsWith("ssong00000001")).length === 3, "3 saves kept");
  T.clock.now += 60000; p = put("song00000001", "Rainy day", [B, V]);   /* the drum loop taken off */
  T.clock.now += 60000; p = put("song00000001", "Rainy day", [B, V]);
  T.clock.now += 60000; p = put("song00000001", "Rainy day", [B, V]);
  ok(T.live().filter(f => f.name.startsWith("ssong00000001")).length === 3 && liveRecs().includes(A.rid), "the saves that used the drum loop went; the loop waits (no save uses it now)");

  /* tidying after 7 days */
  const P2 = rec("cpartial0004", "half sent and left"); Q({ action: "have", begin: true, recs: [want(P2)] }); piece(P2, 0);
  recsDir().createFolder("cstray000005-3-00000000");
  T.clock.now += 6 * 864e5; Q({ action: "list", v: 3 });
  ok(liveRecs().includes(A.rid) && liveRecs().includes(P2.rid) && !liveRecs().includes("cstray000005-3-00000000"), "after 6 days the loop and the half-sent one stay; a folder the index does not know goes");
  recsDir().createFolder("cstray000006-3-00000000");
  T.clock.now += 3 * 3600e3; Q({ action: "list", v: 3 });
  ok(liveRecs().includes("cstray000006-3-00000000"), "the tidying runs at most once in 6 hours: 3 hours later, nothing is looked at");
  T.clock.now += 1.2 * 864e5; Q({ action: "list", v: 3 });
  ok(!liveRecs().includes(A.rid) && !liveRecs().includes(P2.rid) && !index()[A.rid] && !index()[P2.rid] && !liveRecs().includes("cstray000006-3-00000000"), "after 7 days, the loop no save uses and the half-sent one go to the trash");
  ok(liveRecs().includes(B.rid) && liveRecs().includes(V.rid) && Q({ action: "songGet", id: p.id }).ok, "recordings a save uses stay, however old");

  /* deleting a song with a shared recording */
  const S = rec("cshared0006", "a take two songs use"), O = rec("conly000007", "a take only the other song uses");
  upload(S); upload(O);
  const pA = put("songaaaaaaaa", "Song A", [S, V]), pB = put("songbbbbbbbb", "Song B", [S, O]);
  ok(pA.ok && pB.ok, "two songs share a recording");
  ok(Q({ action: "remove", id: pA.id }).ok && !T.live().some(f => f.name.startsWith("ssongaaaaaaaa")), "Song A out of the locker: its saves go");
  ok(liveRecs().includes(S.rid) && liveRecs().includes(V.rid) && index()[S.rid], "the shared take stays, and so does the take Rainy day still uses");
  ok(Q({ action: "songGet", id: pB.id }).ok && fetchRec(S).equals(S.b), "Song B still opens, byte for byte");
  Q({ action: "remove", id: pB.id });
  ok(!liveRecs().includes(S.rid) && !liveRecs().includes(O.rid) && !index()[S.rid] && !index()[O.rid], "Song B out too: now nothing uses them, so they go");
  Q({ action: "remove", id: p.id });
  ok(liveRecs().length === 0 && Object.keys(index()).length === 0 && T.live().filter(f => f.name.startsWith("s")).map(f => f.name).join() === old.id, "Rainy day out: its saves and recordings go; the v2 song stays");

  /* key and limits */
  const W = { key: "wrong" + K3.slice(5) };
  ok(["have", "recPart", "songPut", "songGet", "recGet"].every(a => T.post(Object.assign({}, W, { action: a, rid: V.rid, n: 0, ids: [V.rid] })).error === "key"), "a wrong key is refused for every v3 action, so a recording can only be read with the key");
  const bad = ["../../etc", "c1234-5-0000000g", "C12345-5-00000000", "c12345-0-00000000", "c12345-05-00000000", "c12345-419430401-00000000", "c12345-5-000000001", "c12345-5-00000000/x", "c" + "a".repeat(41) + "-5-00000000", "__proto__", ""];
  ok(bad.every(b => Q({ action: "have", ids: [b] }).error === "bad id" && Q({ action: "recGet", rid: b, n: 0 }).error === "bad id" && Q({ action: "recPart", rid: b, n: 0, data: "AAAA" }).error === "bad id"),
    "content ids that are not one of ours are refused: " + bad.length + " kinds");
  ok(Q({ action: "songPut", sid: "song00000009", song: "{}", recs: [bad[0]] }).error === "bad id", "a save naming a bad id is refused");
  ok(Q({ action: "have", ids: Array.from({ length: 201 }, (x, i) => "c1234" + i + "-5-00000000") }).error === "bad list" && Q({ action: "have", ids: [] }).error === "bad list", "at most 200 recordings in one question");
  ok(Q({ action: "songPut", sid: "song00000009", song: "{}", recs: [] }).error === "bad list" && Q({ action: "songPut", sid: "song00000009", song: "{}", recs: Array(201).fill(V.rid) }).error === "bad list", "a save names 1 to 200 recordings");
  ok(Q({ action: "songPut", sid: "song00000009", song: "x".repeat(2 * 1024 * 1024 + 1), recs: [V.rid] }).error === "That song is too big for the locker." && Q({ action: "songPut", sid: "song00000009", song: 5, recs: [V.rid] }).error === "That song is too big for the locker.",
    "the song itself is at most 2 MB of text");
  const big = "cbig0000008-" + (400 * 1024 * 1024) + "-0000abcd";
  ok(Q({ action: "have", begin: true, recs: [{ rid: big, piece: 7 * 1024 * 1024, parts: 58 }] }).error === "That recording is too big for the locker.", "a piece over 6 MB is refused");
  ok(Q({ action: "have", begin: true, recs: [{ rid: big, piece: 1024 * 1024, parts: 400 }] }).error === "That recording is too big for the locker.", "more than 200 pieces is refused");
  const F = rec("cfresh00011", "a fresh take, never sent");
  ok(Q({ action: "have", begin: true, recs: [{ rid: F.rid, piece: PIECE, parts: F.parts + 1 }] }).error === "That recording is too big for the locker.", "a count of pieces that does not fit the size is refused");
  const Z = rec("czzz000009", "twelve bytes"); Q({ action: "have", begin: true, recs: [want(Z)] });
  ok(Q({ action: "recPart", rid: Z.rid, n: 0, data: Buffer.from("abc").toString("base64") }).error === "bad part" && Q({ action: "recPart", rid: Z.rid, n: 0, data: Buffer.from("abcde").toString("base64") }).error === "bad part",
    "a piece of the wrong size is refused");
  ok(Q({ action: "recPart", rid: Z.rid, n: Z.parts, data: "AAAA" }).error === "bad part" && Q({ action: "recPart", rid: Z.rid, n: -1, data: "AAAA" }).error === "bad part" && Q({ action: "recPart", rid: Z.rid, n: 0.5, data: "AAAA" }).error === "bad part",
    "a piece number out of range is refused");
  ok(Q({ action: "recPart", rid: Z.rid, n: 0, data: "A".repeat(8 * 1024 * 1024 + 4) }).error === "bad part", "a piece over 8 MB of text is refused");
  ok(Q({ action: "recPart", rid: rec("cnever00010", "x").rid, n: 0, data: "eA==" }).error === "That recording is not in the locker.", "a piece of a recording never begun is refused");
  ok(Q({ action: "songGet", id: old.id }).error === "bad song", "songGet on a v2 save is refused (the desk opens it the v2 way)");
  ok(T.logs.length === LOGS0, "no v3 request logs anything, so never the key");
}

/* 10 · a Drive left by v2 opens with v3 */
{
  const V2 = fakeGas(fs.readFileSync(path.join(__dirname, "../studio/fixtures/AoG-Studio-Locker-v2.gs"), "utf8"));
  V2.run("setup"); const K2 = V2.props.LOCKER_KEY;
  ok(V2.post({ key: K2, action: "hello" }).locker === 2, "the fixture is the v2 script");
  const b = V2.post({ key: K2, action: "begin", name: "From v2", size: 4, parts: 1, sid: "song0000000v", dev: "iPad" });
  V2.post({ key: K2, action: "part", id: b.id, n: 0, data: Buffer.from("v2!!").toString("base64") }); V2.post({ key: K2, action: "finish", id: b.id });
  const V3 = fakeGas(SRC); Object.assign(V3.props, V2.props);
  const v2root = V2.root(); V3.sandbox.DriveApp.getFolderById = id => { if (id === v2root.id) return v2root; throw new Error("none"); };
  const l = V3.post({ key: K2, action: "list", v: 3 });
  ok(l.ok && l.locker === 3 && l.songs.length === 1 && l.songs[0].name === "From v2" && l.songs[0].dev === "iPad" && Buffer.from(V3.post({ key: K2, action: "get", id: b.id, n: 0 }).data, "base64").toString() === "v2!!",
    "after the update, the same key lists and opens the songs v2 saved");
  ok(V3.post({ key: K2, action: "check", sid: "song0000000v", v: 3 }).song.id === b.id && !v2root.folders.some(f => f.name === "Recordings"), "check finds it; nothing new is made in Drive until a recording is sent");
}

/* 11 · Jimmy's iPad (2026-10-23): a 106 MB song in 27 pieces of 4 MB, saved by the iPhone, opened with "get" for every piece,
   on the v2 script he has deployed and on v3. Every piece comes back whole, in order past part-009, as one clean base64
   string with no line breaks, and an answer is about 5.6 MB of text. (The iPad's "The string contains invalid characters."
   is WebKit's words for atob given something that is not base64: the desk now checks every answer; studio/locker3.js.) */
for (const [label, src] of [["v2", fs.readFileSync(path.join(__dirname, "../studio/fixtures/AoG-Studio-Locker-v2.gs"), "utf8")], ["v3", SRC]]) {
  const T = fakeGas(src); T.run("setup"); const K = T.props.LOCKER_KEY, PART = 4 * 1024 * 1024, SIZE = 106 * 1024 * 1024 + 12345;
  const song = Buffer.alloc(SIZE); for (let i = 0; i + 4 <= SIZE; i += 4096) song.writeUInt32LE(Math.imul(i / 4096, 2654435761) >>> 0, i);
  const n = Math.ceil(SIZE / PART), b = T.post({ key: K, action: "begin", name: "Jimmy's song", size: SIZE, parts: n, sid: "jimmysong001", dev: "iPhone" });
  let up = 0; for (let i = n - 1; i >= 0; i--) up += T.post({ key: K, action: "part", id: b.id, n: i, data: song.slice(i * PART, (i + 1) * PART).toString("base64") }).ok ? 1 : 0;
  const f = T.post({ key: K, action: "finish", id: b.id });
  const row = T.post({ key: K, action: "list" }).songs[0];
  ok(n === 27 && up === 27 && f.ok && row.parts === 27 && row.size === SIZE, label + ": a 106 MB song goes up in 27 pieces (sent last first) and is listed with 27");
  const names = T.root().folders.find(x => x.name === b.id).files.filter(x => /^part-/.test(x.name)).map(x => x.name).sort();
  ok(names.length === 27 && names[0] === "part-000" && names[9] === "part-009" && names[10] === "part-010" && names[26] === "part-026", label + ": the pieces are part-000 … part-026");
  let same = 0, clean = 0, maxLen = 0;
  for (let i = 0; i < n; i++) {
    const raw = T.sandbox.doPost({ postData: { contents: JSON.stringify({ key: K, action: "get", id: b.id, n: i }) } }).getContent(), r = JSON.parse(raw);
    maxLen = Math.max(maxLen, raw.length);
    if (r.ok && typeof r.data === "string" && /^[A-Za-z0-9+/]+={0,2}$/.test(r.data) && r.data.length % 4 === 0) clean++;
    if (Buffer.from(r.data, "base64").equals(song.slice(i * PART, (i + 1) * PART))) same++;
  }
  ok(same === 27 && clean === 27, label + ": get answers every piece, 0 to 26, byte for byte, as clean base64 (" + same + ", " + clean + ")");
  ok(maxLen > 5.5e6 && maxLen < 5.7e6, label + ": the biggest answer is " + (maxLen / 1e6).toFixed(2) + " MB of text");
  const past = T.post({ key: K, action: "get", id: b.id, n: 27 });
  ok(past.ok === false && past.data === undefined, label + ": a piece past the end is ok:false with no data (the desk must check ok, and does)");
}

console.log(fails ? fails + " FAILED" : "ALL PASS");
process.exit(fails ? 1 : 0);
