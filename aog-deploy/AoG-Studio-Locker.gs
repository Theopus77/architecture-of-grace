// Architecture of Grace · Mixing Desk locker · v3 (2026-10-23, AOG-LOCKER-V3)
//
// WHAT THIS IS
// A small Google Apps Script that keeps your Mixing Desk songs in a folder in YOUR
// Google Drive, so the same song opens on your iPhone, your iPad and your computer.
// Nobody signs in on the devices. The script runs as you; the songs live in your Drive.
// One link sets up a device, a song can follow you from device to device, a single take
// can be passed from one device to another, and each song keeps its last 3 saves.
// New in v3: each recording goes to the locker once. After that, a save sends only the
// song itself (a few KB), and a new take sends only that take. A save that stopped
// halfway carries on where it stopped.
//
// SET IT UP ONCE (about five minutes)
//  1. Go to https://script.google.com and press New project.
//  2. Delete what is there, paste this whole file, and press Save.
//  3. In the menu at the top, pick the function "setup" and press Run.
//     Google asks you to allow it to use your Drive. Allow it.
//  4. Press Deploy ▸ New deployment ▸ type: Web app.
//       Execute as: Me
//       Who has access: Anyone
//     Press Deploy.
//  5. Pick the function "link" and press Run. The log at the bottom shows one link.
//     Open that link on each of your devices (AirDrop it, or text it to yourself).
//     That is all: the link connects the device to your locker.
//     (A script can only know its own web address once it is deployed. That is why
//     "link" is a second step. If "link" cannot find the address, it says so: paste the
//     Web app URL into WEB_APP_URL below, press Save, and run "link" again.)
//
// UPDATING FROM v1 OR v2 (your songs and your key stay the same)
//  1. Open your locker's project at https://script.google.com.
//  2. Select everything in the file, paste this whole file in its place, and press Save.
//  3. Press Deploy ▸ Manage deployments ▸ Edit (the pencil) ▸ Version: New version ▸ Deploy.
//  Updating the deployment you already have keeps the same web address (/exec), and the key
//  is kept in the script's properties, so no device needs to connect again.
//  Do not press "New deployment" to update: that makes a new web address.
//
// KEEP THE KEY PRIVATE
// Anyone with the URL AND the key can open, save and delete songs in this one folder.
// They cannot see anything else in your Drive. The device link carries both: send it only
// to your own devices or your family's. To change the key, run "newKey"; then open the new
// link on each device again.
//
// WHAT IT STORES
// A folder named "Mixing Desk songs" in your Drive.
//  - "Recordings" inside it keeps each recording once: a folder of pieces named after the
//    recording (its id, its size and a check of its bytes), and "index.json", which says
//    which recordings are whole and when each was last used.
//  - Each save of a song is a folder with a small "song.json" (its name, size, device and
//    time) and "manifest.json" (the song and the recordings it uses). Saves made by v1 and
//    v2 are a folder of parts of one .aogsong file instead; they stay and still open.
//  - A song keeps its last 3 saves; older saves of that song go to the Drive trash.
//  - A recording no save uses goes to the trash 7 days after it was last used. Taking a
//    song out of the locker takes its recordings too, unless another song uses them.
//  - Takes passed between devices wait in the folder "takes", and go to the trash once
//    another device has received them, or after 7 days.

var LOCKER_VERSION = 3;
var WEB_APP_URL = '';                    // only if "link" asks for it: your Web app URL, ending in /exec
var SITE = 'https://architectureofgrace.com/the-studio';
var FOLDER_NAME = 'Mixing Desk songs';
var TAKES_NAME = 'takes';
var MAX_PART_B64 = 8 * 1024 * 1024;     // one request carries at most 8 MB of text (about 6 MB of song)
var MAX_SONG_BYTES = 400 * 1024 * 1024; // one song, at most 400 MB
var MAX_PARTS = 200;
var MAX_TAKE_BYTES = 120 * 1024 * 1024; // one take (with a voice take's dry copy), at most 120 MB
var MAX_TAKE_PARTS = 40;
var MAX_META = 2000;                    // a take's label, in characters of JSON
var KEEP_SAVES = 3;                     // the saves kept of each song
var TAKE_DAYS = 7;                      // a take nobody received goes to the trash after this many days
var DEVICES = ['iPhone', 'iPad', 'Mac', 'Windows', 'Android', 'computer'];
/* AOG-LOCKER-V3: each recording once */
var RECS_NAME = 'Recordings';
var MAX_REC_BYTES = 400 * 1024 * 1024;  // one recording, at most 400 MB
var MAX_REC_PARTS = 200;
var MAX_PIECE = 6 * 1024 * 1024;        // a piece of a recording, at most 6 MB (8 MB of text)
var MAX_MANIFEST = 2 * 1024 * 1024;     // the song itself, at most 2 MB of text
var MAX_RECS = 200;                     // recordings in one song, or in one question
var REC_DAYS = 7;                       // a recording no save uses goes to the trash after this many days
var TIDY_EVERY = 6 * 3600 * 1000;       // the tidying runs at most once in 6 hours
/* a recording's id: its clip id, its size in bytes, and the CRC32 of its bytes (8 hex letters) */
var RID_RE = /^c[a-z0-9]{4,40}-[1-9][0-9]{0,9}-[0-9a-f]{8}$/;

function setup() {
  var p = PropertiesService.getScriptProperties();
  if (!p.getProperty('LOCKER_KEY')) p.setProperty('LOCKER_KEY', makeKey_());
  folder_();
  console.log('Your locker key: ' + p.getProperty('LOCKER_KEY'));
  var url = execUrl_();
  if (url) {
    console.log('Open this link on each of your devices. Send it only to your own devices or your family\'s:');
    console.log(deviceLink_(url, p.getProperty('LOCKER_KEY')));
  } else {
    console.log('Next: Deploy ▸ New deployment ▸ Web app (Execute as: Me · Who has access: Anyone) ▸ Deploy.');
    console.log('Then pick "link" in the menu at the top and press Run. It shows the link for your devices.');
  }
}

/* the one link for your devices: the Mixing Desk, with this locker's address and key after # (never sent to a server) */
function link() {
  var key = PropertiesService.getScriptProperties().getProperty('LOCKER_KEY');
  if (!key) { console.log('Run "setup" first.'); return; }
  var url = execUrl_();
  if (!url) {
    console.log('I could not find this script\'s web address yet.');
    console.log('Press Deploy ▸ Manage deployments, copy the Web app URL (it ends in /exec),');
    console.log('paste it between the quotes of WEB_APP_URL at the top of this file, press Save, and run "link" again.');
    return;
  }
  console.log('Open this link on each of your devices. Send it only to your own devices or your family\'s:');
  console.log(deviceLink_(url, key));
  console.log('On a Home Screen app, paste the link into the Mixing Desk\'s web address box instead.');
}

function newKey() {
  var p = PropertiesService.getScriptProperties();
  p.setProperty('LOCKER_KEY', makeKey_());
  console.log('Your new locker key: ' + p.getProperty('LOCKER_KEY'));
  var url = execUrl_();
  if (url) {
    console.log('Open this new link on each of your devices to connect them again:');
    console.log(deviceLink_(url, p.getProperty('LOCKER_KEY')));
  } else {
    console.log('Run "link" to get the new link for your devices.');
  }
}

function execUrl_() {
  var u = String(WEB_APP_URL || '').trim();
  if (!u) { try { u = String(ScriptApp.getService().getUrl() || ''); } catch (e) { u = ''; } }
  return /^https:\/\/script\.google\.com\/(?:a\/macros\/[A-Za-z0-9.-]+|macros)\/s\/[A-Za-z0-9_-]{10,200}\/exec$/.test(u) ? u : '';
}

function deviceLink_(url, key) {
  return SITE + '#locker=' + encodeURIComponent(url) + '&k=' + encodeURIComponent(key);
}

function makeKey_() {
  var s = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  return s.slice(0, 32);
}

function rand_(n) { return Utilities.getUuid().replace(/-/g, '').toLowerCase().slice(0, n); }

function folder_() {
  var p = PropertiesService.getScriptProperties(), id = p.getProperty('FOLDER_ID');
  if (id) { try { var f = DriveApp.getFolderById(id); if (!f.isTrashed()) return f; } catch (e) {} }
  var it = DriveApp.getFoldersByName(FOLDER_NAME), folder = null;
  while (it.hasNext()) { var c = it.next(); if (!c.isTrashed()) { folder = c; break; } }
  if (!folder) folder = DriveApp.createFolder(FOLDER_NAME);
  p.setProperty('FOLDER_ID', folder.getId());
  return folder;
}

function takesFolder_() {
  var root = folder_(), it = root.getFoldersByName(TAKES_NAME);
  while (it.hasNext()) { var c = it.next(); if (!c.isTrashed()) return c; }
  return root.createFolder(TAKES_NAME);
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return out_({ ok: true, locker: LOCKER_VERSION });
}

function same_(a, b) {
  a = String(a || ''); b = String(b || '');
  if (!a || a.length !== b.length) return false;
  var d = 0;
  for (var i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/* Drive's lists can include things in the trash: every lookup here skips them */
function firstLive_(it) {
  while (it.hasNext()) { var x = it.next(); if (!x.isTrashed()) return x; }
  return null;
}

function songFolder_(id) {
  if (!/^s[a-z0-9]{6,40}$/.test(String(id || ''))) throw new Error('bad id');
  var f = firstLive_(folder_().getFoldersByName(id));
  if (!f) throw new Error('That song is not in the locker.');
  return f;
}

function takeFolder_(id) {
  if (!/^k[a-z0-9]{6,40}$/.test(String(id || ''))) throw new Error('bad id');
  var f = firstLive_(takesFolder_().getFoldersByName(id));
  if (!f) throw new Error('That take is not in the locker.');
  return f;
}

function readJson_(f, name) {
  var file = firstLive_(f.getFilesByName(name));
  if (!file) return null;
  try { return JSON.parse(file.getBlob().getDataAsString()); } catch (e) { return null; }
}

/* the small file is changed in place, so there is only ever one */
function writeJson_(f, name, o) {
  var file = firstLive_(f.getFilesByName(name));
  if (file) file.setContent(JSON.stringify(o));
  else f.createFile(name, JSON.stringify(o), 'application/json');
}

function readInfo_(f) { return readJson_(f, 'song.json'); }

function partName_(n) { return 'part-' + ('000' + n).slice(-3); }

function dev_(d) { return DEVICES.indexOf(String(d || '')) >= 0 ? String(d) : ''; }
function sid_(s) { s = String(s || ''); return /^[a-z0-9]{12}$/.test(s) ? s : ''; }
function did_(s) { s = String(s || ''); return /^[a-z0-9]{8,40}$/.test(s) ? s : ''; }

/* every finished save of one song, newest first (a save's folder name starts with "s" and the song's id) */
function savesOf_(sid) {
  var out = [], it = folder_().getFolders(), pre = 's' + sid;
  while (it.hasNext()) {
    var f = it.next();
    if (f.isTrashed() || f.getName().indexOf(pre) !== 0) continue;
    var info = readInfo_(f);
    if (info && info.done && info.sid === sid) out.push({ f: f, info: info });
  }
  out.sort(function (x, y) { return (y.info.at || 0) - (x.info.at || 0); });
  return out;
}

function saveRow_(f, info) {
  var r = { id: f.getName(), sid: info.sid || '', name: info.name, at: info.at, size: info.size, parts: info.parts, dev: info.dev || '' };
  if (info.v === 3) r.v = 3;
  return r;
}

/* AOG-LOCKER-V3: a desk before v3 cannot open a v3 save (it has no song file), so it is only shown to a v3 desk */
function seen_(info, v3) { return v3 || info.v !== 3; }

/* the pieces: written, checked and read the same way for a song's save and for a take */
function putPart_(f, info, body) {
  var n = Number(body.n), data = String(body.data || '');
  if (!info || info.done || !(n >= 0 && n < info.parts) || n !== Math.floor(n)) return { ok: false, error: 'bad part' };
  if (!data || data.length > MAX_PART_B64) return { ok: false, error: 'bad part' };
  var old = f.getFilesByName(partName_(n));
  while (old.hasNext()) old.next().setTrashed(true);
  f.createFile(Utilities.newBlob(Utilities.base64Decode(data), 'application/octet-stream', partName_(n)));
  return { ok: true };
}

function allParts_(f, info) {
  var total = 0;
  for (var i = 0; i < info.parts; i++) {
    var p = firstLive_(f.getFilesByName(partName_(i)));
    if (!p) return false;
    total += p.getSize();
  }
  return total === info.size;
}

function getPart_(f, info, body) {
  var n = Number(body.n);
  if (!info || !info.done || !(n >= 0 && n < info.parts) || n !== Math.floor(n)) return { ok: false, error: 'bad part' };
  var p = firstLive_(f.getFilesByName(partName_(n)));
  if (!p) return { ok: false, error: 'bad part' };
  return { ok: true, data: Utilities.base64Encode(p.getBlob().getBytes()) };
}

/* takes for other devices; a take older than 7 days, or a send that stopped halfway a day ago, goes to the trash */
function takesFor_(did) {
  var out = [], it = takesFolder_().getFolders(), now = Date.now(), week = TAKE_DAYS * 864e5;
  while (it.hasNext()) {
    var f = it.next();
    if (f.isTrashed()) continue;
    var info = readJson_(f, 'take.json');
    if (!info) continue;
    if (now - (info.at || 0) > week || (!info.done && now - (info.at || 0) > 864e5)) { f.setTrashed(true); continue; }
    if (!info.done || (did && info.did === did)) continue;
    out.push({ id: f.getName(), at: info.at, dev: info.dev || '', size: info.size, parts: info.parts, meta: info.meta || {} });
  }
  out.sort(function (x, y) { return (x.at || 0) - (y.at || 0); });
  return out;
}

/* ── AOG-LOCKER-V3: each recording once ─────────────────────────────────────────────────────────────────────────────
   Recordings/<id>/part-000 …  the pieces of one recording
   Recordings/index.json       {r: {<id>: {s: size, p: pieces, c: bytes a piece, a: last used, d: 1 once whole}}}
   The index is only written under the script lock; pieces are written without it, so 3 can arrive at once. */
function recsFolder_(make) {
  var p = PropertiesService.getScriptProperties(), id = p.getProperty('RECS_ID');
  if (id) { try { var f = DriveApp.getFolderById(id); if (!f.isTrashed()) return f; } catch (e) {} }
  var root = folder_(), r = firstLive_(root.getFoldersByName(RECS_NAME));
  if (!r && !make) return null;
  if (!r) r = root.createFolder(RECS_NAME);
  p.setProperty('RECS_ID', r.getId());
  return r;
}

function rid_(s) {
  s = String(s || '');
  if (s.length > 64 || !RID_RE.test(s)) return '';
  var n = Number(s.split('-')[1]);
  return n > 0 && n <= MAX_REC_BYTES ? s : '';
}
function ridSize_(r) { return Number(r.split('-')[1]); }

function readIndex_(rf) {
  var o = rf ? readJson_(rf, 'index.json') : null;
  return o && typeof o === 'object' && o.r && typeof o.r === 'object' ? o : { r: {} };
}
function writeIndex_(rf, ix) { writeJson_(rf, 'index.json', ix); }
function entry_(ix, r) { return Object.prototype.hasOwnProperty.call(ix.r, r) ? ix.r[r] : null; }

function recFolder_(rf, r, make) {
  var f = firstLive_(rf.getFoldersByName(r));
  if (!f && make) f = rf.createFolder(r);
  return f;
}
function pieceLen_(e, n) { return n < e.p - 1 ? e.c : e.s - (e.p - 1) * e.c; }

/* the pieces that arrived whole, by number */
function piecesOf_(f, e) {
  var got = {}, out = [], it = f.getFiles();
  while (it.hasNext()) {
    var x = it.next(), m = /^part-(\d{3})$/.exec(x.getName());
    if (!m || x.isTrashed()) continue;
    var n = Number(m[1]);
    if (n < e.p && x.getSize() === pieceLen_(e, n)) got[n] = 1;
  }
  for (var i = 0; i < e.p; i++) if (got[i]) out.push(i);
  return out;
}

/* every recording a finished save uses */
function usedRecs_() {
  var used = {}, it = folder_().getFolders();
  while (it.hasNext()) {
    var f = it.next();
    if (f.isTrashed() || f.getName() === TAKES_NAME || f.getName() === RECS_NAME) continue;
    var info = readInfo_(f);
    if (info && info.done && info.v === 3 && Array.isArray(info.recs)) info.recs.forEach(function (r) { used[r] = 1; });
  }
  return used;
}

function trashRec_(rf, r) { var f = firstLive_(rf.getFoldersByName(r)); if (f) f.setTrashed(true); }

/* a recording no save uses, last used more than 7 days ago, goes to the trash; so does a folder the index does not know.
   At most once in 6 hours, and only under the script lock. Answers whether the index changed. */
function tidy_(rf, ix, now, force) {
  if (!rf) return false;
  var p = PropertiesService.getScriptProperties(), last = Number(p.getProperty('TIDY_AT') || 0);
  if (!force && now - last < TIDY_EVERY) return false;
  p.setProperty('TIDY_AT', String(now));
  var used = usedRecs_(), week = REC_DAYS * 864e5, changed = false;
  Object.keys(ix.r).forEach(function (r) {
    if (used[r] || now - (ix.r[r].a || 0) <= week) return;
    trashRec_(rf, r); delete ix.r[r]; changed = true;
  });
  var it = rf.getFolders();
  while (it.hasNext()) { var f = it.next(); if (!f.isTrashed() && !entry_(ix, f.getName()) && !used[f.getName()]) f.setTrashed(true); }
  return changed;
}

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'bad request' }); }
  var key = PropertiesService.getScriptProperties().getProperty('LOCKER_KEY');
  if (!key || !same_(body.key, key)) return out_({ ok: false, error: 'key' });
  var lock = LockService.getScriptLock();
  try {
    var a = String(body.action || '');

    if (a === 'hello') return out_({ ok: true, locker: LOCKER_VERSION });

    /* every song once, its newest save first, with up to two earlier saves */
    if (a === 'list') {
      var groups = {}, order = [], it = folder_().getFolders(), dayAgo = Date.now() - 864e5, v3 = Number(body.v) >= 3;
      while (it.hasNext()) {
        var f = it.next();
        if (f.isTrashed() || f.getName() === TAKES_NAME || f.getName() === RECS_NAME) continue;
        var info = readInfo_(f);
        if (info && info.done && !seen_(info, v3)) continue;
        if (info && info.done) {
          var g = info.sid || f.getName();
          if (!groups[g]) { groups[g] = []; order.push(g); }
          groups[g].push(saveRow_(f, info));
        }
        else if (info && !info.done && info.at < dayAgo) f.setTrashed(true);   // a save that stopped halfway, a day ago
      }
      var songs = order.map(function (g) {
        var s = groups[g].sort(function (x, y) { return (y.at || 0) - (x.at || 0); }), top = s[0];
        top.earlier = s.slice(1, KEEP_SAVES).map(function (x) { var o = { id: x.id, at: x.at, dev: x.dev, size: x.size, parts: x.parts }; if (x.v === 3) o.v = 3; return o; });
        return top;
      });
      songs.sort(function (x, y) { return (y.at || 0) - (x.at || 0); });
      /* AOG-LOCKER-V3: now and then, recordings nothing uses any more go to the trash */
      var rfL = recsFolder_(false), nowL = Date.now();
      if (rfL && nowL - Number(PropertiesService.getScriptProperties().getProperty('TIDY_AT') || 0) >= TIDY_EVERY) {
        lock.waitLock(20000);
        var ixL = readIndex_(rfL);
        if (tidy_(rfL, ixL, nowL)) writeIndex_(rfL, ixL);
        lock.releaseLock();
      }
      return out_({ ok: true, locker: LOCKER_VERSION, songs: songs });
    }

    if (a === 'begin') {
      var size = Number(body.size), parts = Number(body.parts), sid = sid_(body.sid);
      if (!(size > 0 && size <= MAX_SONG_BYTES) || !(parts >= 1 && parts <= MAX_PARTS) || parts !== Math.floor(parts))
        return out_({ ok: false, error: 'That song is too big for the locker.' });
      var id = 's' + (sid ? sid + rand_(8) : rand_(20));
      lock.waitLock(20000);
      var sf = folder_().createFolder(id);
      lock.releaseLock();
      sf.createFile('song.json', JSON.stringify({ name: String(body.name || 'My song').slice(0, 120), at: Date.now(),
        size: size, parts: parts, done: false, sid: sid, dev: dev_(body.dev) }), 'application/json');
      return out_({ ok: true, id: id });
    }

    if (a === 'part') {
      var f2 = songFolder_(body.id);
      return out_(putPart_(f2, readInfo_(f2), body));
    }

    if (a === 'finish') {
      var f3 = songFolder_(body.id), info3 = readInfo_(f3);
      if (!info3) return out_({ ok: false, error: 'bad song' });
      if (!allParts_(f3, info3)) return out_({ ok: false, error: 'A piece of the song did not arrive. Try again.' });
      info3.done = true; info3.at = Date.now();
      writeJson_(f3, 'song.json', info3);
      /* the song keeps its newest 3 saves: older saves of this song, and only those, go to the trash */
      if (info3.sid) {
        lock.waitLock(20000);
        savesOf_(info3.sid).slice(KEEP_SAVES).forEach(function (x) { x.f.setTrashed(true); });
        lock.releaseLock();
      }
      return out_({ ok: true, at: info3.at });
    }

    if (a === 'get') {
      var f4 = songFolder_(body.id);
      return out_(getPart_(f4, readInfo_(f4), body));
    }

    /* a song out of the locker: every save of it */
    if (a === 'remove') {
      var f5 = songFolder_(body.id), info5 = readInfo_(f5), gone = [];
      lock.waitLock(20000);
      if (info5 && info5.sid) savesOf_(info5.sid).forEach(function (x) { if (Array.isArray(x.info.recs)) gone = gone.concat(x.info.recs); x.f.setTrashed(true); });
      if (info5 && Array.isArray(info5.recs)) gone = gone.concat(info5.recs);
      f5.setTrashed(true);
      /* AOG-LOCKER-V3: its recordings go too, unless another song uses them */
      var rf5 = gone.length ? recsFolder_(false) : null;
      if (rf5) {
        var used5 = usedRecs_(), ix5 = readIndex_(rf5);
        gone.forEach(function (r) { r = rid_(r); if (r && !used5[r]) { trashRec_(rf5, r); delete ix5.r[r]; } });
        writeIndex_(rf5, ix5);
      }
      return out_({ ok: true });
    }

    /* AOG-LOCKER-V2: one small question when a desk opens or comes back into view: the newest save of this song, and
       the takes other devices sent */
    if (a === 'check') {
      var v36 = Number(body.v) >= 3, sid6 = sid_(body.sid), newest = sid6 ? savesOf_(sid6).filter(function (x) { return seen_(x.info, v36); })[0] : null;
      return out_({ ok: true, locker: LOCKER_VERSION, song: newest ? saveRow_(newest.f, newest.info) : null, takes: takesFor_(did_(body.did)) });
    }

    if (a === 'takeBegin') {
      var tsize = Number(body.size), tparts = Number(body.parts), meta = body.meta && typeof body.meta === 'object' ? body.meta : {};
      if (!(tsize > 0 && tsize <= MAX_TAKE_BYTES) || !(tparts >= 1 && tparts <= MAX_TAKE_PARTS) || tparts !== Math.floor(tparts))
        return out_({ ok: false, error: 'That take is too big for the locker.' });
      var m = { name: String(meta.name || '').slice(0, 120), from: String(meta.from || '').replace(/[^a-z]/g, '').slice(0, 12), sec: Math.max(0, Math.min(36000, Number(meta.sec) || 0)) };
      if (JSON.stringify(m).length > MAX_META) return out_({ ok: false, error: 'bad take' });
      var tid = 'k' + rand_(20), tf = takesFolder_().createFolder(tid);
      tf.createFile('take.json', JSON.stringify({ at: Date.now(), size: tsize, parts: tparts, done: false,
        dev: dev_(body.dev), did: did_(body.did), meta: m }), 'application/json');
      return out_({ ok: true, id: tid });
    }

    if (a === 'takePart') {
      var f7 = takeFolder_(body.id);
      return out_(putPart_(f7, readJson_(f7, 'take.json'), body));
    }

    if (a === 'takeFinish') {
      var f8 = takeFolder_(body.id), info8 = readJson_(f8, 'take.json');
      if (!info8) return out_({ ok: false, error: 'bad take' });
      if (!allParts_(f8, info8)) return out_({ ok: false, error: 'A piece of the take did not arrive. Try again.' });
      info8.done = true;
      writeJson_(f8, 'take.json', info8);
      return out_({ ok: true });
    }

    if (a === 'takeGet') {
      var f9 = takeFolder_(body.id);
      return out_(getPart_(f9, readJson_(f9, 'take.json'), body));
    }

    /* the take arrived on another device: out of the locker */
    if (a === 'takeDone') {
      takeFolder_(body.id).setTrashed(true);
      return out_({ ok: true });
    }

    /* ── AOG-LOCKER-V3 ── */

    /* which recordings the locker has whole, and the pieces it has of the rest. With begin, the missing ones are made
       ready for their pieces (a recording begun before, with the same size of pieces, keeps the pieces it has). */
    if (a === 'have') {
      var list = Array.isArray(body.recs) ? body.recs : Array.isArray(body.ids) ? body.ids.map(function (x) { return { rid: x }; }) : null;
      if (!list || !list.length || list.length > MAX_RECS) return out_({ ok: false, error: 'bad list' });
      var begin = body.begin === true, haveL = [], part = {}, changed = false, now = Date.now();
      for (var i = 0; i < list.length; i++) if (!list[i] || !rid_(list[i].rid)) return out_({ ok: false, error: 'bad id' });
      if (begin) lock.waitLock(20000);
      var rfH = recsFolder_(begin), ixH = readIndex_(rfH);
      for (var j = 0; j < list.length; j++) {
        var x = list[j], r = rid_(x.rid), e = entry_(ixH, r);
        if (e && e.d) { haveL.push(r); continue; }
        if (begin) {
          var size = ridSize_(r), piece = Number(x.piece), np = Number(x.parts);
          if (!(piece >= 1 && piece <= MAX_PIECE) || piece !== Math.floor(piece) || np !== Math.ceil(size / piece) || np > MAX_REC_PARTS)
            return out_({ ok: false, error: 'That recording is too big for the locker.' });
          if (e && (e.c !== piece || e.s !== size)) { trashRec_(rfH, r); e = null; }   /* pieces of another size: it starts again */
          var fH = recFolder_(rfH, r, true);
          if (!e) e = ixH.r[r] = { s: size, p: np, c: piece, a: now, d: 0 };
          else e.a = now;
          changed = true;
          var got = piecesOf_(fH, e);
          if (got.length === e.p) { e.d = 1; haveL.push(r); } else part[r] = got;
        } else if (e) {
          var fQ = rfH ? recFolder_(rfH, r, false) : null;
          part[r] = fQ ? piecesOf_(fQ, e) : [];
        }
      }
      if (changed) writeIndex_(rfH, ixH);
      return out_({ ok: true, have: haveL, part: part });
    }

    /* one piece of a recording; pieces are checked for their exact size, and a whole recording is never written over */
    if (a === 'recPart') {
      var rP = rid_(body.rid);
      if (!rP) return out_({ ok: false, error: 'bad id' });
      var rfP = recsFolder_(false), eP = rfP ? entry_(readIndex_(rfP), rP) : null;
      if (!eP) return out_({ ok: false, error: 'That recording is not in the locker.' });
      if (eP.d) return out_({ ok: true, done: true });
      var nP = Number(body.n), dP = String(body.data || '');
      if (!(nP >= 0 && nP < eP.p) || nP !== Math.floor(nP) || !dP || dP.length > MAX_PART_B64) return out_({ ok: false, error: 'bad part' });
      var bytes = Utilities.base64Decode(dP);
      if (bytes.length !== pieceLen_(eP, nP)) return out_({ ok: false, error: 'bad part' });
      var fP = recFolder_(rfP, rP, false);
      if (!fP) return out_({ ok: false, error: 'That recording is not in the locker.' });
      var oldP = fP.getFilesByName(partName_(nP));
      while (oldP.hasNext()) oldP.next().setTrashed(true);
      fP.createFile(Utilities.newBlob(bytes, 'application/octet-stream', partName_(nP)));
      return out_({ ok: true });
    }

    /* a save of a song: the song and the recordings it uses. A recording the locker does not have whole is named in
       "missing", and nothing is saved: the desk sends it, then asks again. */
    if (a === 'songPut') {
      var man = body.song, rl = body.recs, sidS = sid_(body.sid);
      if (typeof man !== 'string' || !man || man.length > MAX_MANIFEST) return out_({ ok: false, error: 'That song is too big for the locker.' });
      if (!Array.isArray(rl) || !rl.length || rl.length > MAX_RECS) return out_({ ok: false, error: 'bad list' });
      var recs = [], once = {};
      for (var k = 0; k < rl.length; k++) { var rr = rid_(rl[k]); if (!rr) return out_({ ok: false, error: 'bad id' }); if (!once[rr]) { once[rr] = 1; recs.push(rr); } }
      lock.waitLock(20000);
      var rfS = recsFolder_(false), ixS = readIndex_(rfS), missing = [], total = 0, now2 = Date.now(), dirty = false;
      recs.forEach(function (r) {
        var e = entry_(ixS, r);
        if (e && !e.d) { var f = recFolder_(rfS, r, false); if (f && piecesOf_(f, e).length === e.p) { e.d = 1; dirty = true; } }   /* its last piece came: whole now */
        if (!e || !e.d) missing.push(r); else total += e.s;
      });
      if (missing.length) { if (dirty) writeIndex_(rfS, ixS); return out_({ ok: true, missing: missing }); }
      if (total + man.length > MAX_SONG_BYTES) return out_({ ok: false, error: 'That song is too big for the locker.' });
      var idS = 's' + (sidS ? sidS + rand_(8) : rand_(20)), sfS = folder_().createFolder(idS);
      sfS.createFile('manifest.json', man, 'application/json');
      sfS.createFile('song.json', JSON.stringify({ name: String(body.name || 'My song').slice(0, 120), at: now2, size: total + man.length, parts: 0,
        done: true, sid: sidS, dev: dev_(body.dev), v: 3, recs: recs }), 'application/json');
      recs.forEach(function (r) { ixS.r[r].a = now2; });
      /* the song keeps its newest 3 saves; a recording only an older save used has 7 days from now */
      if (sidS) savesOf_(sidS).slice(KEEP_SAVES).forEach(function (x) {
        if (Array.isArray(x.info.recs)) x.info.recs.forEach(function (r) { var e = entry_(ixS, String(r)); if (e) e.a = now2; });
        x.f.setTrashed(true);
      });
      tidy_(rfS, ixS, now2);
      writeIndex_(rfS, ixS);
      return out_({ ok: true, id: idS, at: now2 });
    }

    /* a v3 save, to open it: the song, and for each recording its size and pieces */
    if (a === 'songGet') {
      var fG = songFolder_(body.id), iG = readInfo_(fG);
      if (!iG || !iG.done || iG.v !== 3 || !Array.isArray(iG.recs)) return out_({ ok: false, error: 'bad song' });
      var mG = firstLive_(fG.getFilesByName('manifest.json'));
      if (!mG) return out_({ ok: false, error: 'bad song' });
      var ixG = readIndex_(recsFolder_(false)), recsG = {};
      for (var g = 0; g < iG.recs.length; g++) {
        var eG = entry_(ixG, String(iG.recs[g]));
        if (!eG || !eG.d) return out_({ ok: false, error: 'A recording of this song is not in the locker.' });
        recsG[iG.recs[g]] = { size: eG.s, parts: eG.p, piece: eG.c };
      }
      return out_({ ok: true, song: mG.getBlob().getDataAsString(), recs: recsG });
    }

    /* one piece of a whole recording */
    if (a === 'recGet') {
      var rR = rid_(body.rid);
      if (!rR) return out_({ ok: false, error: 'bad id' });
      var rfR = recsFolder_(false), eR = rfR ? entry_(readIndex_(rfR), rR) : null, nR = Number(body.n);
      if (!eR || !eR.d) return out_({ ok: false, error: 'That recording is not in the locker.' });
      if (!(nR >= 0 && nR < eR.p) || nR !== Math.floor(nR)) return out_({ ok: false, error: 'bad part' });
      var fR = recFolder_(rfR, rR, false), pR = fR ? firstLive_(fR.getFilesByName(partName_(nR))) : null;
      if (!pR) return out_({ ok: false, error: 'That recording is not in the locker.' });
      return out_({ ok: true, data: Utilities.base64Encode(pR.getBlob().getBytes()) });
    }

    return out_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return out_({ ok: false, error: String(err && err.message || err).slice(0, 200) });
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}
