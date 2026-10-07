// Architecture of Grace · Mixing Desk locker · v1 (2026-10-07)
//
// WHAT THIS IS
// A small Google Apps Script that keeps your Mixing Desk songs in a folder in YOUR
// Google Drive, so the same song opens on your iPhone, your iPad and your computer.
// Nobody signs in on the devices. The script runs as you; the songs live in your Drive.
//
// SET IT UP ONCE (about five minutes)
//  1. Go to https://script.google.com and press New project.
//  2. Delete what is there, paste this whole file, and press Save.
//  3. In the menu at the top, pick the function "setup" and press Run.
//     Google asks you to allow it to use your Drive. Allow it.
//     The log at the bottom shows your locker key. Copy it.
//  4. Press Deploy ▸ New deployment ▸ type: Web app.
//       Execute as: Me
//       Who has access: Anyone
//     Press Deploy and copy the Web app URL (it ends in /exec).
//  5. On the Mixing Desk, open "Your locker", paste the URL and the key, press Connect.
//  6. Press "Copy the link for my other devices" and open that link on each device
//     (AirDrop it, text it to yourself, or scan the QR code).
//
// KEEP THE KEY PRIVATE
// Anyone with the URL AND the key can open, save and delete songs in this one folder.
// They cannot see anything else in your Drive. To change the key, run "newKey";
// then connect each device again.
//
// WHAT IT STORES
// A folder named "Mixing Desk songs" in your Drive. Each song is a folder of parts
// (pieces of one .aogsong file) and a small "song.json" with its name and size.

var LOCKER_VERSION = 1;
var FOLDER_NAME = 'Mixing Desk songs';
var MAX_PART_B64 = 8 * 1024 * 1024;    // one request carries at most 8 MB of text (about 6 MB of song)
var MAX_SONG_BYTES = 400 * 1024 * 1024; // one song, at most 400 MB
var MAX_PARTS = 200;

function setup() {
  var p = PropertiesService.getScriptProperties();
  if (!p.getProperty('LOCKER_KEY')) p.setProperty('LOCKER_KEY', makeKey_());
  folder_();
  console.log('Your locker key: ' + p.getProperty('LOCKER_KEY'));
  console.log('Next: Deploy ▸ New deployment ▸ Web app (Execute as: Me · Who has access: Anyone).');
}

function newKey() {
  PropertiesService.getScriptProperties().setProperty('LOCKER_KEY', makeKey_());
  console.log('Your new locker key: ' + PropertiesService.getScriptProperties().getProperty('LOCKER_KEY'));
}

function makeKey_() {
  var s = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  return s.slice(0, 32);
}

function folder_() {
  var p = PropertiesService.getScriptProperties(), id = p.getProperty('FOLDER_ID');
  if (id) { try { var f = DriveApp.getFolderById(id); if (!f.isTrashed()) return f; } catch (e) {} }
  var it = DriveApp.getFoldersByName(FOLDER_NAME);
  var folder = it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
  p.setProperty('FOLDER_ID', folder.getId());
  return folder;
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

function songFolder_(id) {
  if (!/^s[a-z0-9]{6,40}$/.test(String(id || ''))) throw new Error('bad id');
  var it = folder_().getFoldersByName(id);
  if (!it.hasNext()) throw new Error('That song is not in the locker.');
  return it.next();
}

function readInfo_(f) {
  var it = f.getFilesByName('song.json');
  if (!it.hasNext()) return null;
  try { return JSON.parse(it.next().getBlob().getDataAsString()); } catch (e) { return null; }
}

function partName_(n) { return 'part-' + ('000' + n).slice(-3); }

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'bad request' }); }
  var key = PropertiesService.getScriptProperties().getProperty('LOCKER_KEY');
  if (!key || !same_(body.key, key)) return out_({ ok: false, error: 'key' });
  var lock = LockService.getScriptLock();
  try {
    var a = String(body.action || '');

    if (a === 'hello') return out_({ ok: true, locker: LOCKER_VERSION });

    if (a === 'list') {
      var songs = [], it = folder_().getFolders(), dayAgo = Date.now() - 864e5;
      while (it.hasNext()) {
        var f = it.next(), info = readInfo_(f);
        if (info && info.done) songs.push({ id: f.getName(), name: info.name, at: info.at, size: info.size, parts: info.parts });
        else if (info && !info.done && info.at < dayAgo) f.setTrashed(true);   // a save that stopped halfway, a day ago
      }
      songs.sort(function (x, y) { return (y.at || 0) - (x.at || 0); });
      return out_({ ok: true, songs: songs });
    }

    if (a === 'begin') {
      var size = Number(body.size), parts = Number(body.parts);
      if (!(size > 0 && size <= MAX_SONG_BYTES) || !(parts >= 1 && parts <= MAX_PARTS) || parts !== Math.floor(parts))
        return out_({ ok: false, error: 'That song is too big for the locker.' });
      var id = 's' + Utilities.getUuid().replace(/-/g, '').slice(0, 20).toLowerCase();
      lock.waitLock(20000);
      var sf = folder_().createFolder(id);
      lock.releaseLock();
      sf.createFile('song.json', JSON.stringify({ name: String(body.name || 'My song').slice(0, 120), at: Date.now(),
        size: size, parts: parts, done: false }), 'application/json');
      return out_({ ok: true, id: id });
    }

    if (a === 'part') {
      var f2 = songFolder_(body.id), info2 = readInfo_(f2), n = Number(body.n), data = String(body.data || '');
      if (!info2 || info2.done || !(n >= 0 && n < info2.parts) || n !== Math.floor(n)) return out_({ ok: false, error: 'bad part' });
      if (!data || data.length > MAX_PART_B64) return out_({ ok: false, error: 'bad part' });
      var old = f2.getFilesByName(partName_(n));
      while (old.hasNext()) old.next().setTrashed(true);
      f2.createFile(Utilities.newBlob(Utilities.base64Decode(data), 'application/octet-stream', partName_(n)));
      return out_({ ok: true });
    }

    if (a === 'finish') {
      var f3 = songFolder_(body.id), info3 = readInfo_(f3);
      if (!info3) return out_({ ok: false, error: 'bad song' });
      var total = 0;
      for (var i = 0; i < info3.parts; i++) {
        var pi = f3.getFilesByName(partName_(i));
        if (!pi.hasNext()) return out_({ ok: false, error: 'A piece of the song did not arrive. Try again.' });
        total += pi.next().getSize();
      }
      if (total !== info3.size) return out_({ ok: false, error: 'A piece of the song did not arrive. Try again.' });
      info3.done = true; info3.at = Date.now();
      var ij = f3.getFilesByName('song.json');
      while (ij.hasNext()) ij.next().setTrashed(true);
      f3.createFile('song.json', JSON.stringify(info3), 'application/json');
      return out_({ ok: true });
    }

    if (a === 'get') {
      var f4 = songFolder_(body.id), info4 = readInfo_(f4), n4 = Number(body.n);
      if (!info4 || !info4.done || !(n4 >= 0 && n4 < info4.parts)) return out_({ ok: false, error: 'bad part' });
      var pf = f4.getFilesByName(partName_(n4));
      if (!pf.hasNext()) return out_({ ok: false, error: 'bad part' });
      return out_({ ok: true, data: Utilities.base64Encode(pf.next().getBlob().getBytes()) });
    }

    if (a === 'remove') {
      songFolder_(body.id).setTrashed(true);
      return out_({ ok: true });
    }

    return out_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return out_({ ok: false, error: String(err && err.message || err).slice(0, 200) });
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}
