// Architecture of Grace · Mixing Desk locker · v2 (2026-10-23, AOG-LOCKER-V2)
//
// WHAT THIS IS
// A small Google Apps Script that keeps your Mixing Desk songs in a folder in YOUR
// Google Drive, so the same song opens on your iPhone, your iPad and your computer.
// Nobody signs in on the devices. The script runs as you; the songs live in your Drive.
// New in v2: one link sets up a device, a song can follow you from device to device,
// a single take can be passed from one device to another, and each song keeps its
// last 3 saves.
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
// UPDATING FROM v1 (your songs and your key stay the same)
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
// A folder named "Mixing Desk songs" in your Drive. Each save of a song is a folder of parts
// (pieces of one .aogsong file) and a small "song.json" with its name, size, device and time.
// A song keeps its last 3 saves; older saves of that song go to the Drive trash.
// Takes passed between devices wait in the folder "takes" inside it, and go to the trash once
// another device has received them, or after 7 days.

var LOCKER_VERSION = 2;
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
  return { id: f.getName(), sid: info.sid || '', name: info.name, at: info.at, size: info.size, parts: info.parts, dev: info.dev || '' };
}

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
      var groups = {}, order = [], it = folder_().getFolders(), dayAgo = Date.now() - 864e5;
      while (it.hasNext()) {
        var f = it.next();
        if (f.isTrashed() || f.getName() === TAKES_NAME) continue;
        var info = readInfo_(f);
        if (info && info.done) {
          var g = info.sid || f.getName();
          if (!groups[g]) { groups[g] = []; order.push(g); }
          groups[g].push(saveRow_(f, info));
        }
        else if (info && !info.done && info.at < dayAgo) f.setTrashed(true);   // a save that stopped halfway, a day ago
      }
      var songs = order.map(function (g) {
        var s = groups[g].sort(function (x, y) { return (y.at || 0) - (x.at || 0); }), top = s[0];
        top.earlier = s.slice(1, KEEP_SAVES).map(function (x) { return { id: x.id, at: x.at, dev: x.dev, size: x.size, parts: x.parts }; });
        return top;
      });
      songs.sort(function (x, y) { return (y.at || 0) - (x.at || 0); });
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
      var f5 = songFolder_(body.id), info5 = readInfo_(f5);
      if (info5 && info5.sid) savesOf_(info5.sid).forEach(function (x) { x.f.setTrashed(true); });
      f5.setTrashed(true);
      return out_({ ok: true });
    }

    /* AOG-LOCKER-V2: one small question when a desk opens or comes back into view: the newest save of this song, and
       the takes other devices sent */
    if (a === 'check') {
      var sid6 = sid_(body.sid), newest = sid6 ? savesOf_(sid6)[0] : null;
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

    return out_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return out_({ ok: false, error: String(err && err.message || err).slice(0, 200) });
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}
