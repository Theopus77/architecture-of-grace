/* Architecture of Grace — Sheet sync · Version 1 (2026-09-27)
   What it is: the Google Apps Script behind your Sheet. The website sends
   answers here, and it saves each one as a row in the right tab. The
   Educator Dashboard asks here to read them back. It talks to the site
   exactly as the old v18 script did, so nothing on the site changes.

   Two Script properties (Project Settings ▸ Script properties, or the
   Sheet menu "Architecture of Grace ▸ Set the keys"):
     BACKEND_AUTH_KEY  the write key. The site's pages send with it.
     ADMIN_PULL_KEY    the read key. Only your dashboard uses it.

   To update without changing the URL:
     Deploy ▸ Manage deployments ▸ Edit ▸ Version: New version ▸ Deploy
   (A NEW deployment gets a NEW URL, and the site would send nowhere.)

   New fields need no code: a tab gains a column the first time a field
   arrives. Old columns keep their place. */

var VERSION = 17;               // the level the site checks for (it expects 17); this is Version 1 of the rewrite
var VERSION_DATE = '2026-09-27';
var MAX_BODY = 65536, MAX_CELL = 2000, MAX_JSON = 20000, RATE_PER_MIN = 300;
var SECRET_FIELDS = ['action', 'passcode', 'auth', '_backendAuth', 'backendAuth', 'backendAuthKey'];
var TEXT_COLS = ['timestamp', 'date', 'submitTime'];   // kept as plain text so Sheets never turns them into dates

var PRACTICE_TABS = {
  'math-interior': 'Practice · Math Interior',
  'math-concepts': 'Practice · Math Concepts & Data',
  'drops-math': 'Practice · Daily Drafts · Math',
  'drops-ela': 'Practice · Daily Drafts · ELA',
  'drops-science': 'Practice · Daily Drafts · Science',
  'drops-social': 'Practice · Daily Drafts · Social Studies',
  'drops-write': 'Practice · Daily Drafts · Writing',
  'drops-spanish': 'Practice · Daily Drafts · Spanish',
  'drops-facs': 'Practice · Daily Drafts · FACS',
  'drops-religion': 'Practice · Daily Drafts · World Religions',
  'drops-bible': 'Practice · Daily Drafts · The Bible',
  'drops-quran': 'Practice · Daily Drafts · Qur\'an',
  'drops-talmud': 'Practice · Daily Drafts · Talmud',
  'drops-hindu': 'Practice · Daily Drafts · Hindu Texts',
  'drops-buddhist': 'Practice · Daily Drafts · Buddhist Texts',
  'drops-chinese': 'Practice · Daily Drafts · Chinese Classics',
  'drops-cultures': 'Practice · Daily Drafts · World Cultures',
  'drops-health': 'Practice · Daily Drafts · Medicine & Health',
  'drops-economics': 'Practice · Daily Drafts · Economics',
  'drops-other': 'Practice · Daily Drafts · Other',
  'reading': 'Practice · Reading',
  'writing': 'Practice · Writing',
  'grammar': 'Practice · English Grammar',
  'science': 'Practice · Science',
  'social': 'Practice · Social Studies',
  'sel': 'Practice · SEL',
  'wordfoundry': 'Practice · Word Foundry',
  'course-sci': 'Course · Science',
  'course-mth': 'Course · Math',
  'course-ela': 'Course · English Language Arts',
  'course-ss': 'Course · Social Studies',
  'course-ush': 'Course · U.S. History',
  'course-eco': 'Course · Economics',
  'course-rel': 'Course · World Religions',
  'course-spa': 'Course · Spanish',
  'course-fcs': 'Course · FACS'
};
// Old tab names, renamed in place the first time their new name is needed.
var TAB_RENAMES = {
  'Practice · Daily Drafts · Math': 'Practice · Daily Drops · Math',
  'Practice · Daily Drafts · ELA': 'Practice · Daily Drops · ELA'
};
// Single activity ids → group. "m1-14" means m1 … m14.
var ROUTE_SPECS = [
  ['m1-14 b10 b12 b13', 'math-interior'], ['c1-13', 'math-concepts'],
  ['h1-4 h7', 'reading'], ['b11', 'grammar'], ['b1-8 v1-5', 'science'],
  ['h5 h6 h8-15 b9', 'social'], ['w1-7 wb36', 'sel']
];
var PRACTICE_ROUTES = {};
ROUTE_SPECS.forEach(function (s) {
  s[0].split(' ').forEach(function (tok) {
    var m = /^([a-z]+)(\d+)(?:-(\d+))?$/.exec(tok);
    for (var i = +m[2]; i <= +(m[3] || m[2]); i++) { PRACTICE_ROUTES[m[1] + i] = s[1]; }
  });
});
var PRACTICE_PATTERNS = [
  [/^dd-math\b/i, 'drops-math'], [/^dd-ela\b/i, 'drops-ela'], [/^dd-science\b/i, 'drops-science'],
  [/^dd-social-studies\b/i, 'drops-social'], [/^dd-write\b/i, 'drops-write'], [/^dd-spanish\b/i, 'drops-spanish'],
  [/^dd-facs\b/i, 'drops-facs'], [/^dd-religion\b/i, 'drops-religion'], [/^dd-bible\b/i, 'drops-bible'],
  [/^dd-quran\b/i, 'drops-quran'], [/^dd-talmud\b/i, 'drops-talmud'], [/^dd-hindu\b/i, 'drops-hindu'],
  [/^dd-buddhist\b/i, 'drops-buddhist'], [/^dd-chinese\b/i, 'drops-chinese'],
  [/^dd-cultures\b/i, 'drops-cultures'], [/^dd-health\b/i, 'drops-health'],
  [/^dd-economics\b/i, 'drops-economics'],
  [/^wf-u\d+/i, 'wordfoundry'], [/^dd-foundry\b/i, 'wordfoundry'],
  [/^dd-/i, 'drops-other'],                        // a Daily Drafts subject not listed yet
  [/^crs-(sci|mth|ela|ss|ush|eco|rel|spa|fcs)-/i, function (m) { return 'course-' + m[1].toLowerCase(); }]
];

function practiceGroup_(body) {
  var g = String(body.group || '').trim();
  if (g && PRACTICE_TABS[g]) { return g; }
  var id = String(body.activityId || '').trim();
  if (!id) { return ''; }
  if (PRACTICE_ROUTES[id]) { return PRACTICE_ROUTES[id]; }
  for (var i = 0; i < PRACTICE_PATTERNS.length; i++) {
    var m = PRACTICE_PATTERNS[i][0].exec(id), t = PRACTICE_PATTERNS[i][1];
    if (m) { return typeof t === 'function' ? t(m) : t; }
  }
  return '';
}
function practiceTabNames_() {
  return ['Practice'].concat(Object.keys(PRACTICE_TABS).map(function (g) { return PRACTICE_TABS[g]; }));
}

// Each write action: its tab, the field it must have, and the reply flag.
var WRITES = {
  checkin:      { need: 'studentId', msg: 'A check-in needs a studentId.' },
  exitslip:     { tab: 'ExitSlips', need: 'studentId', msg: 'An exit slip needs a studentId.' },
  home:         { tab: 'HomeObservations', need: 'homeKey', msg: 'A home observation needs a homeKey.' },
  homecheckin:  { tab: 'HomeCheckins', need: 'studentId', msg: 'A home check-in needs a studentId.' },
  teamEvidence: { tab: 'TeamEvidence', need: 'studentId', msg: 'Team evidence needs a studentId.' }
};
// Each read action: the reply key and the tabs it reads.
var BOOLS_CI = ['regulated', 'usedStrategy', 'connected', 'followUp'];
var PULLS = {
  pull:             function () { return { records: readTab_('Responses', { responses: true }) }; },
  pullHome:         function () { return { homeObs: readTab_('HomeObservations', { bools: ['followUp'], key: 'homeKey' }) }; },
  pullHomeCheckins: function () { return { homeCheckins: readTab_('HomeCheckins', { bools: ['followUp'], strings: true, loose: true }) }; },
  pullExitSlips:    function () { return { exitSlips: readTab_('ExitSlips', { bools: ['followUp'], fillDate: true }) }; },
  pullTeam:         function () { return { teamEvidence: readTab_('TeamEvidence', { bools: ['followUp'], nums: ['opps', 'succ'], loose: true }) }; },
  pullCheckins: function () {
    var ss = SpreadsheetApp.getActiveSpreadsheet(), practice = [], tabs = {};
    practiceTabNames_().forEach(function (nm) {
      practice = practice.concat(readTab_(nm, { nums: ['setNo', 'itemsTotal', 'independent', 'supported', 'hintsUsed', 'confidence', 'pctIndependent'] }));
      var sh = ss.getSheetByName(nm);
      if (sh && sh.getLastRow() > 1) { tabs[nm] = sh.getLastRow() - 1; }
    });
    var checkins = readTab_('DailyCheckins', { bools: BOOLS_CI }).concat(readTab_('SupportCheckins', { bools: BOOLS_CI }));
    return { checkins: checkins, practice: practice, tabs: tabs, script: 'v18' };
  }
};

function doGet() {
  return json_({ ok: true, service: 'AoG Screener Sync', status: 'connected', version: VERSION,
                 versionDate: VERSION_DATE, release: 'Version 1' });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) { return json_({ ok: false, error: 'No POST body received' }); }
    if (e.postData.contents.length > MAX_BODY) { return json_({ ok: false, error: 'Request too large.' }); }
    var body = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();
    var writeKey = props.getProperty('BACKEND_AUTH_KEY'), pullKey = props.getProperty('ADMIN_PULL_KEY');
    var key = body._backendAuth || body.passcode || body.auth || body.backendAuth || body.backendAuthKey;
    var action = (body.action === undefined || body.action === null) ? '' : String(body.action);
    if (action && !WRITES[action] && !PULLS[action]) { return json_({ ok: false, error: 'Unknown action. Nothing was written.' }); }
    if (rateLimited_(key)) { return json_({ ok: false, error: 'Too many requests. Please wait a minute and try again.' }); }

    if (PULLS[action]) {
      if (!pullKey) { return json_({ ok: false, error: 'Pull is turned off: add an ADMIN_PULL_KEY script property.' }); }
      if (key !== pullKey) { return json_({ ok: false, error: 'Unauthorized: this passcode cannot read the sheet. Use your ADMIN_PULL_KEY.' }); }
      var out = PULLS[action]();
      out.ok = true;
      return json_(out);
    }
    if (!((writeKey && key === writeKey) || (pullKey && key === pullKey))) { return json_({ ok: false, error: 'Unauthorized' }); }

    var w = WRITES[action];
    if (w) {
      if (!body[w.need] || String(body[w.need]).trim() === '') { return json_({ ok: false, error: w.msg }); }
      if (action === 'teamEvidence' && (!body.respondentId || String(body.respondentId).trim() === '')) {
        return json_({ ok: false, error: 'Team evidence needs a respondentId — who saw this.' });
      }
      var tab = w.tab;
      if (action === 'checkin') {
        var type = String(body.checkinType || '');
        tab = type === 'support' ? 'SupportCheckins' : 'DailyCheckins';
        if (type === 'practice') { body.group = practiceGroup_(body); tab = PRACTICE_TABS[body.group] || 'Practice'; fillScores_(body); }
      }
      writeRow_(tab, body);
      var reply = { ok: true, saved: true };
      reply[action === 'checkin' ? 'checkin' : action] = true;
      return json_(reply);
    }

    // No action: a screener answer (or a connection test) for the Responses tab.
    if (body.connectionTest === true || body.ping === true) {
      writeRow_('Responses', { timestamp: new Date().toISOString(), studentId: '(connection test)' });
      return json_({ ok: true, connectionTest: true });
    }
    var rec = {};
    Object.keys(body).forEach(function (k) {
      if (k !== 'raw' && k !== 'intensities' && k !== 'reflections') { rec[k] = body[k]; }
    });
    [['raw', 'raw', 18], ['intensities', 'intensity', 18], ['reflections', 'reflection', 3]].forEach(function (s) {
      var arr = Array.isArray(body[s[0]]) ? body[s[0]] : [];
      for (var i = 1; i <= Math.max(s[2], arr.length); i++) { rec[s[1] + i] = arr[i - 1]; }
    });
    var n = writeRow_('Responses', rec);
    return json_({ ok: true, saved: true, columnsWritten: n });
  } catch (err) {
    console.log('ERROR: ' + String(err));
    return json_({ ok: false, error: String(err) });
  }
}

// Practice scores: % independent, and the IEP accuracy fields (falls back to older fields).
function fillScores_(b) {
  var blank = function (v) { return v === undefined || v === ''; };
  var tot = Number(b.itemsTotal), ind = Number(b.independent);
  b.pctIndependent = (isFinite(tot) && tot > 0 && isFinite(ind)) ? Math.round(ind / tot * 100) : '';
  var cTot = Number(blank(b.total) ? b.itemsTotal : b.total), cOk = Number(blank(b.correct) ? b.independent : b.correct);
  if (blank(b.pctCorrect)) { b.pctCorrect = (isFinite(cTot) && cTot > 0 && isFinite(cOk)) ? Math.round(cOk / cTot * 100) : ''; }
  if (blank(b.total)) { b.total = isFinite(cTot) ? cTot : ''; }
  if (blank(b.correct)) { b.correct = isFinite(cOk) ? cOk : ''; }
}

// The one helper for every tab: find or make it, grow the header, write by header name.
function writeRow_(name, rec) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(30000); } catch (e) { throw new Error('The sheet was busy. Please try again in a moment.'); }
  try {
    var sheet = sheetFor_(name);
    var header = headerOf_(sheet);
    var extra = Object.keys(rec).filter(function (k) {
      return k && SECRET_FIELDS.indexOf(k) === -1 && header.indexOf(k) === -1;
    });
    if (name === 'Responses' && header.length === 0) { extra = responsesOrder_(extra); }
    if (extra.length) {
      var start = header.length + 1;
      sheet.getRange(1, start, 1, extra.length).setValues([extra]).setFontWeight('bold');
      extra.forEach(function (k, i) {
        if (TEXT_COLS.indexOf(k) !== -1) { sheet.getRange(1, start + i, sheet.getMaxRows(), 1).setNumberFormat('@'); }
      });
      if (header.length === 0) { sheet.setFrozenRows(1); }
      header = header.concat(extra);
    }
    var row = header.map(function (k) { return k ? cellValue_(rec[k]) : ''; });
    try { sheet.appendRow(row); }
    catch (big) {   // a cell over Sheets' 50,000-character limit: save the row with `extra` shortened
      var x = header.indexOf('extra');
      if (x < 0) { throw big; }
      row[x] = String(row[x] || '').slice(0, 2000) + ' …[shortened: the full record was over the cell limit]';
      sheet.appendRow(row);
    }
    SpreadsheetApp.flush();
    return row.length;
  } finally { lock.releaseLock(); }
}

// A new Responses tab keeps the familiar order: timestamp … studentId first, then answers.
function responsesOrder_(keys) {
  var first = ['timestamp', 'districtId', 'schoolId', 'classId', 'grade', 'window', 'studentId'];
  return first.filter(function (k) { return keys.indexOf(k) !== -1; })
    .concat(keys.filter(function (k) { return first.indexOf(k) === -1; }));
}

function sheetFor_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet && TAB_RENAMES[name] && ss.getSheetByName(TAB_RENAMES[name])) {
    sheet = ss.getSheetByName(TAB_RENAMES[name]);
    sheet.setName(name);
  }
  return sheet || ss.insertSheet(name);
}

function headerOf_(sheet) {
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) { return []; }
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (v) { return String(v || '').trim(); });
}

// Read a tab back as objects keyed by header. opt: bools, nums, strings, key, loose, fillDate, responses.
function readTab_(name, opt) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 2 || sheet.getLastColumn() < 1) { return []; }
  var values = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  var header = values[0].map(function (v) { return String(v || '').trim(); });
  var bools = opt.bools || [], nums = opt.nums || [], out = [];
  for (var r = 1; r < values.length; r++) {
    var rec = opt.responses ? { raw: [], intensities: [] } : {};
    header.forEach(function (col, c) {
      if (!col) { return; }
      var v = values[r][c], empty = (v === '' || v === null || v === undefined), m;
      if (opt.responses && (m = /^(raw|intensity)(\d+)$/.exec(col))) {
        rec[m[1] === 'raw' ? 'raw' : 'intensities'][m[2] - 1] = (empty || isNaN(Number(v))) ? null : Number(v);
      } else if ((col === 'timestamp' || (col === 'date' && !opt.responses)) && v instanceof Date) {
        rec[col] = v.toISOString();
      } else if (bools.indexOf(col) !== -1) {
        rec[col] = empty ? null : (v === true || String(v).trim().toUpperCase() === 'TRUE');
      } else if (nums.indexOf(col) !== -1) {
        rec[col] = (empty || !isFinite(Number(v))) ? null : Number(v);
      } else {
        rec[col] = opt.strings ? (v === null || v === undefined ? '' : String(v)) : v;
      }
    });
    // Fields the dashboard reads by name come back null when the tab has no such column yet.
    bools.concat(nums).forEach(function (k) { if (!(k in rec)) { rec[k] = null; } });
    var id = String(rec[opt.key || 'studentId'] == null ? '' : rec[opt.key || 'studentId']).trim();
    if (!id) { continue; }
    if (!opt.key && !opt.loose && (id === 'SELFTEST' || id === '(connection test)')) { continue; }
    if (opt.fillDate && !rec.date && rec.timestamp) { rec.date = String(rec.timestamp).slice(0, 10); }
    out.push(rec);
  }
  return out;
}

// Safe cells: short enough, and never read by Sheets as a formula.
function cellValue_(v) {
  if (v === null || v === undefined) { return ''; }
  var cap = MAX_CELL;
  if (typeof v === 'object') {
    var j = '';
    try { j = JSON.stringify(v); } catch (e) {}
    if (j.length > MAX_JSON) { j = JSON.stringify({ series: String(v.series || ''), oversize: true, chars: j.length }); }
    v = j; cap = MAX_JSON;
  }
  if (typeof v !== 'string') { return v; }
  v = v.slice(0, cap);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function rateLimited_(key) {
  try {
    if (!key) { return false; }
    var d = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, String(key))
      .map(function (b) { return ((b & 0xFF) + 0x100).toString(16).slice(1); }).join('').slice(0, 16);
    var ck = 'aogrl_' + d + '_' + Math.floor(Date.now() / 60000), cache = CacheService.getScriptCache();
    var n = Number(cache.get(ck) || 0) + 1;
    cache.put(ck, String(n), 90);
    return n > RATE_PER_MIN;
  } catch (e) { return false; }
}

function json_(obj) {
  obj.v = VERSION;
  obj.vDate = VERSION_DATE;
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Sheet menu: set or check the two keys from inside the spreadsheet (handy on an iPad).
function onOpen() {
  try {
    SpreadsheetApp.getUi().createMenu('Architecture of Grace')
      .addItem('Set the keys', 'aogSetKeys').addItem('Check the keys', 'aogCheckKeys').addToUi();
  } catch (e) {}
}
function aogSetKeys() {
  var ui = SpreadsheetApp.getUi();
  var w = ui.prompt('BACKEND_AUTH_KEY', 'The write key. The site\'s pages send with it. Type the same one into Dashboard ▸ Set up.', ui.ButtonSet.OK_CANCEL);
  if (w.getSelectedButton() !== ui.Button.OK) { return; }
  var r = ui.prompt('ADMIN_PULL_KEY', 'The read key. Only your dashboard uses it. Type the same one into Dashboard ▸ Set up.', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) { return; }
  var wv = String(w.getResponseText() || '').trim(), rv = String(r.getResponseText() || '').trim();
  if (wv.length < 6 || rv.length < 6) { ui.alert('Each key needs at least 6 characters. Nothing was changed.'); return; }
  if (wv === rv) { ui.alert('The two keys must be different. Nothing was changed.'); return; }
  PropertiesService.getScriptProperties().setProperties({ BACKEND_AUTH_KEY: wv, ADMIN_PULL_KEY: rv });
  ui.alert('Saved. Now Deploy ▸ Manage deployments ▸ Edit ▸ Version: New version ▸ Deploy.');
}
function aogCheckKeys() {
  var p = PropertiesService.getScriptProperties(), w = p.getProperty('BACKEND_AUTH_KEY'), r = p.getProperty('ADMIN_PULL_KEY');
  SpreadsheetApp.getUi().alert('Write key (BACKEND_AUTH_KEY): ' + (w ? 'set' : 'NOT SET — sends are refused') +
    '\nRead key (ADMIN_PULL_KEY): ' + (r ? 'set' : 'NOT SET — the dashboard cannot read'));
}
