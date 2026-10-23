/* AOG-LOCKER-V2 — the locker script (aog-deploy/AoG-Studio-Locker.gs) run in node against a pretend Google (../lib/fakegas.js).
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
ok(G.get().ok === true && G.get().locker === 2, "doGet still answers {ok, locker}, now version 2");

/* 2 · the key, for every action */
const ACTIONS = ["hello", "list", "begin", "part", "finish", "get", "remove", "check", "takeBegin", "takePart", "takeFinish", "takeGet", "takeDone", "nonsense"];
const logs0 = G.logs.length;
let refused = ACTIONS.filter(a => { const r = G.post({ key: "wrong" + KEY.slice(5), action: a, size: 10, parts: 1 }); return r.ok === false && r.error === "key"; });
ok(refused.length === ACTIONS.length, "a wrong key is refused for every action, old and new (" + refused.length + "/" + ACTIONS.length + ")");
refused = ACTIONS.filter(a => { const r = G.post({ action: a }); return r.ok === false && r.error === "key"; });
ok(refused.length === ACTIONS.length, "no key is refused for every action");
ok(G.post("not json").error === "bad request", "a request that is not JSON is refused");
const G3 = fakeGas(SRC); ok(G3.post({ key: "", action: "hello" }).error === "key" && G3.post({ key: "anything", action: "list" }).error === "key", "before setup, nothing gets in");
ok(G.post({ key: KEY, action: "hello" }).locker === 2 && G.post({ key: KEY, action: "nonsense" }).error === "unknown action", "the right key: hello says v2; an unknown action is told");
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
ok(L.ok && L.locker === 2 && L.songs.length === 3 && L.songs[0].id === oth.id, "list: each song once, newest first (" + L.songs.map(s => s.name).join(", ") + ")");
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
ok(C.ok && C.locker === 2 && C.song && C.song.id === saves[4].id && C.song.dev === "Android" && C.song.at === saves[4].at, "check answers the newest save of the song, with its device and time");
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

console.log(fails ? fails + " FAILED" : "ALL PASS");
process.exit(fails ? 1 : 0);
