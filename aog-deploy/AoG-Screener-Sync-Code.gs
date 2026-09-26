/* Architecture of Grace — Sheet sync · Apps Script · v18
   Trimmed 2026-09-20: comments stripped, and five functions nothing ever
   called were removed (runWriteTest, checkKeys, checkinSelfTest — editor-only
   tools — plus safe_ and getPracticeSheet). What runs is unchanged. The fully
   annotated original: _not-deployed/AoG-Screener-Sync-Code.annotated.gs

   v18 (2026-09-26): every Daily Drafts subject gets its own tab. Jimmy:
   "There is no Daily Drafts for the Bible on the Google Sheets, or any of
   the new stuff." A v17 script still took those rows — they landed in the
   plain Practice tab. Now The Bible, Qur'an, Talmud, FACS, World Religions
   and Economics each get "Practice · Daily Drafts · <subject>", and any
   subject added later lands in "Practice · Daily Drafts · Other" instead of
   disappearing into Practice. Paste this over the old script and deploy a
   new version (Deploy ▸ Manage deployments ▸ Edit ▸ New version).

   v17 (2026-09-21): Word Foundry test rehearsals get their own tab,
   "Practice · Word Foundry". A v16 script still takes those rows — they
   land in the plain Practice tab instead. Nothing else changed.

   Script properties (Project Settings ▸ Script properties):
     BACKEND_AUTH_KEY  write key. Also published in aog-sync-config.js.
     ADMIN_PULL_KEY    read key. Never published; the dashboard passcode only.

   To update WITHOUT changing the /exec URL the site sends to:
     Deploy ▸ Manage deployments ▸ pencil ▸ Version: New version ▸ Deploy
   A NEW deployment gets a NEW URL, and every page sends nowhere until
   aog-sync-config.js is changed to match. */

var SCRIPT_VERSION      = 17;
var SCRIPT_VERSION_DATE = '2026-09-21';
var MAX_BODY_BYTES     = 65536;
var MAX_FIELD_CHARS    = 2000;
var MAX_JSON_CHARS     = 20000;
var RATE_LIMIT_PER_MIN = 300;
var KNOWN_ACTIONS = [
  'pull',
  'checkin',
  'exitslip',
  'pullCheckins',
  'home',
  'homecheckin',
  'pullHome',
  'pullHomeCheckins',
  'pullExitSlips',
  'teamEvidence',
  'pullTeam'
];
var SHEET_NAME = 'Responses';
var CHECKIN_SHEET_NAME = 'DailyCheckins';
var SUPPORT_SHEET_NAME = 'SupportCheckins';
var SUPPORT_COLS = [
  'timestamp',
  'date',
  'slipType',
  'checkinType',
  'assignmentId',
  'trackingGroup',
  'term',
  'districtId',
  'schoolId',
  'classId',
  'grade',
  'period',
  'periodNum',
  'studentId',
  'respondentRole',
  'respondentId',
  'regulated',
  'usedStrategy',
  'connected',
  'pct',
  'note',
  'followUp',
  'source',
  'extra'
];
var CHECKIN_COLS = [
  'timestamp',
  'date',
  'slipType',
  'checkinType',
  'assignmentId',
  'trackingGroup',
  'term',
  'districtId',
  'schoolId',
  'classId',
  'grade',
  'period',
  'periodNum',
  'studentId',
  'respondentRole',
  'respondentId',
  'regulated',
  'usedStrategy',
  'connected',
  'pct',
  'note',
  'followUp',
  'source',
  'arrival',
  'feelingWords',
  'readiness',
  'need',
  'connection',
  'challenge',
  'challengeImpact',
  'contextTag',
  'tellAdult',
  'agency',
  'extra'
];
var EXITSLIP_SHEET_NAME = 'ExitSlips';
var EXITSLIP_COLS = [
  'timestamp',
  'date',
  'submitTime',
  'slipType',
  'districtId',
  'schoolId',
  'classId',
  'grade',
  'period',
  'term',
  'assignmentId',
  'trackingGroup',
  'studentId',
  'respondentRole',
  'respondentId',
  'classesAvailable',
  'scheduleSource',
  'favClass',
  'favWhy',
  'hardClass',
  'hardWhy',
  'goodMoment',
  'roughMoment',
  'response',
  'closing',
  'dayWord',
  'written',
  'followUp',
  'source',
  'extra'
];
var HOME_SHEET_NAME = 'HomeObservations';
var HOME_COLS = [
  'timestamp',
  'date',
  'slipType',
  'homeKey',
  'skill',
  'level',
  'levelKey',
  'districtId',
  'schoolId',
  'classId',
  'grade',
  'term',
  'studentId',
  'respondentRole',
  'timeOfDay',
  'activity',
  'support',
  'note',
  'followUp',
  'source',
  'extra'
];
var HOMECI_SHEET_NAME = 'HomeCheckins';
var HOMECI_COLS = [
  'timestamp',
  'date',
  'submitTime',
  'slipType',
  'studentId',
  'respondentId',
  'respondentRole',
  'districtId',
  'schoolId',
  'classId',
  'grade',
  'term',
  'morning',
  'morningKey',
  'afternoon',
  'afternoonKey',
  'evening',
  'eveningKey',
  'helped',
  'helpedKeys',
  'note',
  'followUp',
  'source'
];
var PRACTICE_SHEET_NAME = 'Practice';
var PRACTICE_COLS = [
  'timestamp',
  'date',
  'checkinType',
  'activityId',
  'activityName',
  'skill',
  'setNo',
  'itemsTotal',
  'independent',
  'supported',
  'pctIndependent',
  'hintsUsed',
  'confidence',
  'studentId',
  'note',
  'source',
  'group',
  'extra',
  // AOG-IEP-REC-V1 (2026-09-25) — the IEP record every sender now fills.
  // New columns are appended to the right of existing tabs automatically
  // (see getPracticeSheetFor_), so no old row moves.
  'correct',       // items right (first try unless the page says otherwise)
  'total',         // items scored
  'pctCorrect',    // computed below when the page leaves it blank
  'standards',     // standard codes the items served, e.g. 7.RP.A.2; RL.1
  'byStrand',      // per-skill breakdown: "Proportional Reasoning 2/3; Geometry 1/1"
  'supports',      // accommodations used: listen; spanish; hints; wordbank; retry
  'attempt',       // this student's attempt number on this activity, on this device
  'minutes',       // time on task, rounded to 0.1
  'course',        // course key for course pages (sci, mth, ela ...)
  'unit',
  'assessment'     // lesson-check | chapter-review | unit-test | spiral | practice
];
var TEAM_SHEET_NAME = 'TeamEvidence';
var TEAM_COLS = [
  'timestamp',
  'date',
  'slipType',
  'askId',
  'term',
  'districtId',
  'schoolId',
  'classId',
  'grade',
  'period',
  'studentId',
  'respondentRole',
  'respondentId',
  'goalId',
  'area',
  'focus',
  'periodFrom',
  'periodTo',
  'evidence',
  'perf',
  'opps',
  'succ',
  'strengths',
  'concerns',
  'supports',
  'response',
  'recommend',
  'note',
  'followUp',
  'source',
  'extra'
];
var PRACTICE_TABS = {
  'math-interior': 'Practice · Math Interior',
  'math-concepts': 'Practice · Math Concepts & Data',
  'drops-math':    'Practice · Daily Drafts · Math',
  'drops-ela':     'Practice · Daily Drafts · ELA',
  'drops-science': 'Practice · Daily Drafts · Science',
  'drops-social':  'Practice · Daily Drafts · Social Studies',
  'drops-write':   'Practice · Daily Drafts · Writing',
  'drops-spanish': 'Practice · Daily Drafts · Spanish',
  // v18 — the newer subjects, and a catch-all so nothing new is ever lost
  'drops-facs':      'Practice · Daily Drafts · FACS',
  'drops-religion':  'Practice · Daily Drafts · World Religions',
  'drops-bible':     'Practice · Daily Drafts · The Bible',
  'drops-quran':     'Practice · Daily Drafts · Qur\'an',
  'drops-talmud':    'Practice · Daily Drafts · Talmud',
  'drops-economics': 'Practice · Daily Drafts · Economics',
  'drops-other':     'Practice · Daily Drafts · Other',
  'reading':       'Practice · Reading',
  'writing':       'Practice · Writing',
  'grammar':       'Practice · English Grammar',
  'science':       'Practice · Science',
  'social':        'Practice · Social Studies',
  'sel':           'Practice · SEL',
  'wordfoundry':   'Practice · Word Foundry',
  // AOG-IEP-REC-V1 — the courses, one tab each
  'course-sci':    'Course · Science',
  'course-mth':    'Course · Math',
  'course-ela':    'Course · English Language Arts',
  'course-ss':     'Course · Social Studies',
  'course-ush':    'Course · U.S. History',
  'course-eco':    'Course · Economics',
  'course-rel':    'Course · World Religions',
  'course-spa':    'Course · Spanish',
  'course-fcs':    'Course · FACS'
};
var PRACTICE_ROUTES = {
  m1:'math-interior',  m2:'math-interior',  m3:'math-interior',  m4:'math-interior',
  m5:'math-interior',  m6:'math-interior',  m7:'math-interior',  m8:'math-interior',
  m9:'math-interior',  m10:'math-interior', m11:'math-interior', m12:'math-interior',
  m13:'math-interior', m14:'math-interior',
  b10:'math-interior',
  b12:'math-interior',
  b13:'math-interior',
  c1:'math-concepts',  c2:'math-concepts',  c3:'math-concepts',  c4:'math-concepts',
  c5:'math-concepts',  c6:'math-concepts',  c7:'math-concepts',  c8:'math-concepts',
  c9:'math-concepts',  c10:'math-concepts', c11:'math-concepts', c12:'math-concepts',
  c13:'math-concepts',
  h1:'reading', h2:'reading', h3:'reading', h4:'reading', h7:'reading',
  b11:'grammar',
  b1:'science', b2:'science', b3:'science', b4:'science',
  b5:'science', b6:'science', b7:'science', b8:'science',
  v1:'science', v2:'science', v3:'science', v4:'science', v5:'science',
  h5:'social',  h6:'social',  h8:'social',  h9:'social',  h10:'social',
  h11:'social', h12:'social', h13:'social', h14:'social', h15:'social',
  b9:'social',
  w1:'sel', w2:'sel', w3:'sel', w4:'sel', w5:'sel', w6:'sel', w7:'sel',
  wb36:'sel'
};
var PRACTICE_PATTERNS = [
  [/^dd-math\b/i,           'drops-math'],
  [/^dd-ela\b/i,            'drops-ela'],
  [/^dd-science\b/i,        'drops-science'],
  [/^dd-social-studies\b/i, 'drops-social'],
  [/^dd-write\b/i,          'drops-write'],
  [/^dd-spanish\b/i,        'drops-spanish'],
  [/^dd-facs\b/i,           'drops-facs'],
  [/^dd-religion\b/i,       'drops-religion'],
  [/^dd-bible\b/i,          'drops-bible'],
  [/^dd-quran\b/i,          'drops-quran'],
  [/^dd-talmud\b/i,         'drops-talmud'],
  [/^dd-economics\b/i,      'drops-economics'],
  [/^wf-u\d+/i,             'wordfoundry'],
  [/^dd-foundry\b/i,        'wordfoundry'],  // AOG-DD-FOUNDRY-V1: the Foundry's Daily Drafts land with its test rehearsals
  [/^dd-/i,                 'drops-other'],  // v18: a Daily Drafts subject this script has not met yet
  [/^crs-(sci|mth|ela|ss|ush|eco|rel|spa|fcs)-/i, function (m) { return 'course-' + m[1].toLowerCase(); }]
];

function practiceGroup_(body) {
  var g = String((body && body.group) || '').trim();
  if (g && PRACTICE_TABS[g]) { return g; }
  var id = String((body && body.activityId) || '').trim();
  if (!id) { return ''; }
  if (PRACTICE_ROUTES[id]) { return PRACTICE_ROUTES[id]; }
  for (var i = 0; i < PRACTICE_PATTERNS.length; i++) {
    var pm = PRACTICE_PATTERNS[i][0].exec(id);
    if (pm) {
      var tgt = PRACTICE_PATTERNS[i][1];
      return (typeof tgt === 'function') ? tgt(pm) : tgt;
    }
  }
  return '';
}
var PRACTICE_TAB_RENAMES = {
  'Practice · Daily Drafts · Math': 'Practice · Daily Drops · Math',
  'Practice · Daily Drafts · ELA':  'Practice · Daily Drops · ELA'
};

function migratePracticeTabName_(ss, name) {
  var legacy = PRACTICE_TAB_RENAMES[name];
  if (!legacy) { return null; }
  if (ss.getSheetByName(name)) { return null; }
  var old = ss.getSheetByName(legacy);
  if (!old) { return null; }
  old.setName(name);
  return old;
}

function getPracticeSheetFor_(group) {
  var name = (group && PRACTICE_TABS[group]) ? PRACTICE_TABS[group] : PRACTICE_SHEET_NAME;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  migratePracticeTabName_(ss, name);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(PRACTICE_COLS);
    sheet
      .getRange(1, 1, 1, PRACTICE_COLS.length)
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    forceTextCols_(sheet, PRACTICE_COLS, ['timestamp', 'date', 'submitTime']);
    return sheet;
  }
  var lastCol = sheet.getLastColumn();
  var header = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (v) { return String(v || '').trim(); });
  var missing = PRACTICE_COLS.filter(function (c) {
    return header.indexOf(c) === -1;
  });
  if (missing.length) {
    sheet
      .getRange(1, lastCol + 1, 1, missing.length)
      .setValues([missing])
      .setFontWeight('bold');
    console.log('PRACTICE TAB ' + name + ' · added columns: ' + missing.join(', '));
  }
  return sheet;
}

function readAllPractice_() {
  var out = readPracticeTab_(PRACTICE_SHEET_NAME);
  Object.keys(PRACTICE_TABS).forEach(function (g) {
    out = out.concat(readPracticeTab_(PRACTICE_TABS[g]));
  });
  return out;
}
var SCALAR_COLS = [
  'timestamp',
  'districtId',
  'schoolId',
  'classId',
  'grade',
  'window',
  'studentId',
  'language',
  'mode',
  'domainA',
  'domainB',
  'domainC',
  'composite',
  'normA',
  'normB',
  'normC',
  'normComposite',
  'tier',
  'trustedAdultFlag',
  'closingWord'
];
var TAIL_COLS = [
  'unsafeFlag',
  'population',
  'context',
  'band'
];

function headerRow() {
  var h = SCALAR_COLS.slice();
  var i;
  for (i = 1; i <= 18; i++) {
    h.push('raw' + i);
  }
  for (i = 1; i <= 18; i++) {
    h.push('intensity' + i);
  }
  for (i = 1; i <= 3; i++) {
    h.push('reflection' + i);
  }
  for (i = 0; i < TAIL_COLS.length; i++) {
    h.push(TAIL_COLS[i]);
  }
  return h;
}

function ensureResponseColumns_(sheet) {
  var want = headerRow();
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) {
    return want;
  }
  var header = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (v) { return String(v || '').trim(); });
  var missing = want.filter(function (c) {
    return header.indexOf(c) === -1;
  });
  if (missing.length) {
    sheet
      .getRange(1, lastCol + 1, 1, missing.length)
      .setValues([missing])
      .setFontWeight('bold');
    console.log('RESPONSES · added columns on the right: ' + missing.join(', '));
    header = header.concat(missing);
  }
  return header;
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    var h = headerRow();
    sheet.appendRow(h);
    sheet
      .getRange(1, 1, 1, h.length)
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      console.log('NO POST BODY');
      return json_({
        ok: false,
        error: 'No POST body received'
      });
    }
    if (e.postData.contents.length > MAX_BODY_BYTES) {
      console.log('BODY TOO LARGE · ' + e.postData.contents.length + ' chars · rejected');
      return json_({
        ok: false,
        error: 'Request too large.'
      });
    }
    var body = JSON.parse(e.postData.contents);
    console.log(
      'Received fields: ' +
      Object.keys(body).join(', ')
    );
    var props = PropertiesService.getScriptProperties();
    var writeKey = props.getProperty('BACKEND_AUTH_KEY');
    var pullKey = props.getProperty('ADMIN_PULL_KEY');
    var supplied =
      body._backendAuth ||
      body.passcode ||
      body.auth ||
      body.backendAuth ||
      body.backendAuthKey;
    if (body.action !== undefined &&
        body.action !== null &&
        String(body.action) !== '' &&
        KNOWN_ACTIONS.indexOf(String(body.action)) === -1) {
      console.log('UNKNOWN ACTION REJECTED · ' +
                  String(body.action).slice(0, 40));
      return json_({
        ok: false,
        error: 'Unknown action. Nothing was written.'
      });
    }
    if (rateLimited_(supplied)) {
      console.log('RATE LIMITED · over ' + RATE_LIMIT_PER_MIN + '/min for this key');
      return json_({
        ok: false,
        error: 'Too many requests. Please wait a minute and try again.'
      });
    }
    if (body.action === 'pull') {
      if (!pullKey) {
        console.log('PULL BLOCKED · no ADMIN_PULL_KEY set');
        return json_({
          ok: false,
          error: 'Pull is turned off: add an ADMIN_PULL_KEY script property.'
        });
      }
      if (supplied !== pullKey) {
        console.log('PULL DENIED · wrong key');
        return json_({
          ok: false,
          error: 'Unauthorized: this passcode cannot read the sheet. Use your ADMIN_PULL_KEY.'
        });
      }
      var records = readRecords_();
      console.log('PULL OK · returning ' + records.length + ' records');
      return json_({
        ok: true,
        records: records
      });
    }
    if (body.action === 'checkin') {
      var ciWrite =
        (writeKey && supplied === writeKey) ||
        (pullKey  && supplied === pullKey);
      if (!ciWrite) {
        console.log('CHECKIN AUTH FAILED');
        return json_({
          ok: false,
          error: 'Unauthorized'
        });
      }
      if (!body.studentId || String(body.studentId).trim() === '') {
        return json_({
          ok: false,
          error: 'A check-in needs a studentId.'
        });
      }
      var ciType = String(body.checkinType || '');
      if (ciType === 'practice') {
        body.group = practiceGroup_(body);
      }
      var ciSheet = (ciType === 'support')  ? getSupportSheet()
                  : (ciType === 'practice') ? getPracticeSheetFor_(body.group)
                  : getCheckinSheet();
      if (ciType === 'practice') {
        var pTot = Number(body.itemsTotal);
        var pInd = Number(body.independent);
        body.pctIndependent =
          (isFinite(pTot) && pTot > 0 && isFinite(pInd))
            ? Math.round((pInd / pTot) * 100)
            : '';
        // AOG-IEP-REC-V1 — accuracy for the IEP record. Falls back to the
        // older fields so a page that has not been upgraded still fills it.
        var cTot = Number(body.total !== undefined && body.total !== '' ? body.total : body.itemsTotal);
        var cOk  = Number(body.correct !== undefined && body.correct !== '' ? body.correct : body.independent);
        if (body.pctCorrect === undefined || body.pctCorrect === '') {
          body.pctCorrect = (isFinite(cTot) && cTot > 0 && isFinite(cOk)) ? Math.round((cOk / cTot) * 100) : '';
        }
        if (body.total === undefined || body.total === '') { body.total = isFinite(cTot) ? cTot : ''; }
        if (body.correct === undefined || body.correct === '') { body.correct = isFinite(cOk) ? cOk : ''; }
      }
      var ciHeader = ciSheet
        .getRange(1, 1, 1, ciSheet.getLastColumn())
        .getValues()[0]
        .map(function (v) { return String(v || '').trim(); });
      var ciRow = ciHeader.map(function (col) {
        if (!col) { return ''; }
        return cellValue_(body[col]);
      });
      try {
        aogAppend_(ciSheet, ciRow);
      } catch (errRow) {
        // v18 — never lose a send. A cell over Sheets' 50,000-character limit (almost always `extra`) throws;
        // the row goes in again with extra shortened, and the log says which student and activity it was.
        console.log('ROW WRITE FAILED (' + String(errRow && errRow.message) + ') · retrying without extra · ' +
                    body.checkinType + ' · ' + body.studentId + ' · ' + String(body.activityId || ''));
        var ciRow2 = ciHeader.map(function (col) {
          if (!col) { return ''; }
          if (col === 'extra') { return String(cellValue_(body[col]) || '').slice(0, 2000) + ' …[shortened: the full record was over the cell limit]'; }
          return cellValue_(body[col]);
        });
        aogAppend_(ciSheet, ciRow2);
      }
      console.log(
        'CHECKIN SAVED · ' +
        body.checkinType + ' · student ' + body.studentId +
        ' · by ' + (body.respondentId || '(unnamed adult)')
      );
      return json_({
        ok: true,
        saved: true,
        checkin: true
      });
    }
    if (body.action === 'exitslip') {
      var xsWrite =
        (writeKey && supplied === writeKey) ||
        (pullKey  && supplied === pullKey);
      if (!xsWrite) {
        console.log('EXIT SLIP AUTH FAILED');
        return json_({
          ok: false,
          error: 'Unauthorized'
        });
      }
      if (!body.studentId || String(body.studentId).trim() === '') {
        return json_({
          ok: false,
          error: 'An exit slip needs a studentId.'
        });
      }
      var xsSheet = getExitSlipSheet();
      var xsHeader = xsSheet
        .getRange(1, 1, 1, xsSheet.getLastColumn())
        .getValues()[0]
        .map(function (v) { return String(v || '').trim(); });
      var xsRow = xsHeader.map(function (col) {
        if (!col) { return ''; }
        return cellValue_(body[col]);
      });
      aogAppend_(xsSheet, xsRow);
      console.log('EXIT SLIP SAVED · student ' + body.studentId + ' · ' + body.date);
      return json_({
        ok: true,
        saved: true,
        exitslip: true
      });
    }
    if (body.action === 'pullCheckins') {
      if (!pullKey) {
        return json_({
          ok: false,
          error: 'Pull is turned off: add an ADMIN_PULL_KEY script property.'
        });
      }
      if (supplied !== pullKey) {
        return json_({
          ok: false,
          error: 'Unauthorized: this passcode cannot read the sheet. Use your ADMIN_PULL_KEY.'
        });
      }
      var checkins = readCheckins_();
      var practice = readAllPractice_();
      // v18 — which tabs hold rows, and how many: the Inbox shows this after a refresh
      var tabs = {};
      try {
        var ssT = SpreadsheetApp.getActiveSpreadsheet();
        var names = [PRACTICE_SHEET_NAME].concat(Object.keys(PRACTICE_TABS).map(function (g) { return PRACTICE_TABS[g]; }));
        names.forEach(function (nm) { var sh = ssT.getSheetByName(nm); if (sh && sh.getLastRow() > 1) { tabs[nm] = sh.getLastRow() - 1; } });
      } catch (errTabs) {}
      console.log('CHECKIN PULL OK · returning ' + checkins.length +
                  ' rows and ' + practice.length + ' practice rows');
      return json_({
        ok: true,
        checkins: checkins,
        practice: practice,
        tabs: tabs,
        script: 'v18'
      });
    }
    if (body.action === 'home') {
      var hoWrite =
        (writeKey && supplied === writeKey) ||
        (pullKey  && supplied === pullKey);
      if (!hoWrite) {
        console.log('HOME OBSERVATION AUTH FAILED');
        return json_({
          ok: false,
          error: 'Unauthorized'
        });
      }
      if (!body.homeKey || String(body.homeKey).trim() === '') {
        return json_({
          ok: false,
          error: 'A home observation needs a homeKey.'
        });
      }
      var hoSheet = getHomeSheet();
      var hoHeader = hoSheet
        .getRange(1, 1, 1, hoSheet.getLastColumn())
        .getValues()[0]
        .map(function (v) { return String(v || '').trim(); });
      var hoRow = hoHeader.map(function (col) {
        if (!col) { return ''; }
        return cellValue_(body[col]);
      });
      aogAppend_(hoSheet, hoRow);
      console.log(
        'HOME OBSERVATION SAVED · ' + body.skill +
        ' · key ' + body.homeKey
      );
      return json_({
        ok: true,
        saved: true,
        home: true
      });
    }
    if (body.action === 'homecheckin') {
      var hcWrite =
        (writeKey && supplied === writeKey) ||
        (pullKey  && supplied === pullKey);
      if (!hcWrite) {
        console.log('HOME CHECK-IN AUTH FAILED');
        return json_({
          ok: false,
          error: 'Unauthorized'
        });
      }
      if (!body.studentId || String(body.studentId).trim() === '') {
        return json_({
          ok: false,
          error: 'A home check-in needs a studentId.'
        });
      }
      var hcSheet = getHomeCheckinSheet();
      var hcHeader = hcSheet
        .getRange(1, 1, 1, hcSheet.getLastColumn())
        .getValues()[0]
        .map(function (v) { return String(v || '').trim(); });
      var hcRow = hcHeader.map(function (col) {
        if (!col) { return ''; }
        return cellValue_(body[col]);
      });
      aogAppend_(hcSheet, hcRow);
      console.log(
        'HOME CHECK-IN SAVED · ' + body.studentId +
        ' · ' + body.respondentRole
      );
      return json_({
        ok: true,
        saved: true,
        homecheckin: true
      });
    }
    if (body.action === 'pullHome') {
      if (!pullKey) {
        return json_({
          ok: false,
          error: 'Pull is turned off: add an ADMIN_PULL_KEY script property.'
        });
      }
      if (supplied !== pullKey) {
        return json_({
          ok: false,
          error: 'Unauthorized: this passcode cannot read the sheet. Use your ADMIN_PULL_KEY.'
        });
      }
      var homeObs = readHomeObs_();
      console.log('HOME PULL OK · returning ' + homeObs.length + ' rows');
      return json_({
        ok: true,
        homeObs: homeObs
      });
    }
    if (body.action === 'pullHomeCheckins') {
      if (!pullKey) {
        return json_({
          ok: false,
          error: 'Pull is turned off: add an ADMIN_PULL_KEY script property.'
        });
      }
      if (supplied !== pullKey) {
        return json_({
          ok: false,
          error: 'Unauthorized: this passcode cannot read the sheet. Use your ADMIN_PULL_KEY.'
        });
      }
      var homeCi = readHomeCheckins_();
      console.log('HOME CHECK-IN PULL OK · returning ' + homeCi.length + ' rows');
      return json_({
        ok: true,
        homeCheckins: homeCi
      });
    }
    if (body.action === 'pullExitSlips') {
      if (!pullKey) {
        return json_({
          ok: false,
          error: 'Pull is turned off: add an ADMIN_PULL_KEY script property.'
        });
      }
      if (supplied !== pullKey) {
        return json_({
          ok: false,
          error: 'Unauthorized: this passcode cannot read the sheet. Use your ADMIN_PULL_KEY.'
        });
      }
      var exitSlips = readExitSlips_();
      console.log('EXIT SLIP PULL OK · returning ' + exitSlips.length + ' rows');
      return json_({
        ok: true,
        exitSlips: exitSlips
      });
    }
    if (body.action === 'teamEvidence') {
      var teWrite =
        (writeKey && supplied === writeKey) ||
        (pullKey  && supplied === pullKey);
      if (!teWrite) {
        console.log('TEAM EVIDENCE AUTH FAILED');
        return json_({
          ok: false,
          error: 'Unauthorized'
        });
      }
      if (!body.studentId || String(body.studentId).trim() === '') {
        return json_({
          ok: false,
          error: 'Team evidence needs a studentId.'
        });
      }
      if (!body.respondentId || String(body.respondentId).trim() === '') {
        return json_({
          ok: false,
          error: 'Team evidence needs a respondentId — who saw this.'
        });
      }
      var teSheet = getTeamSheet();
      var teHeader = teSheet
        .getRange(1, 1, 1, teSheet.getLastColumn())
        .getValues()[0]
        .map(function (v) { return String(v || '').trim(); });
      var teRow = teHeader.map(function (col) {
        if (!col) { return ''; }
        return cellValue_(body[col]);
      });
      aogAppend_(teSheet, teRow);
      console.log('TEAM EVIDENCE SAVED · student ' + body.studentId +
                  ' · ' + body.respondentRole + ' · ' + body.date);
      return json_({
        ok: true,
        saved: true,
        teamEvidence: true
      });
    }
    if (body.action === 'pullTeam') {
      if (!pullKey) {
        return json_({
          ok: false,
          error: 'Pull is turned off: add an ADMIN_PULL_KEY script property.'
        });
      }
      if (supplied !== pullKey) {
        return json_({
          ok: false,
          error: 'Unauthorized: this passcode cannot read the sheet. Use your ADMIN_PULL_KEY.'
        });
      }
      var teamRows = readTeamEvidence_();
      console.log('TEAM EVIDENCE PULL OK · returning ' + teamRows.length + ' rows');
      return json_({
        ok: true,
        teamEvidence: teamRows
      });
    }
    var mayWrite =
      (writeKey && supplied === writeKey) ||
      (pullKey && supplied === pullKey);
    if (!mayWrite) {
      console.log('AUTH FAILED');
      return json_({
        ok: false,
        error: 'Unauthorized'
      });
    }
    var sheet = getSheet();
    if (
      body.connectionTest === true ||
      body.ping === true
    ) {
      sheet.appendRow([
        new Date().toISOString(),
        '',
        '',
        '',
        '',
        '',
        '(connection test)'
      ]);
      console.log('CONNECTION TEST SAVED');
      return json_({
        ok: true,
        connectionTest: true
      });
    }
    var h = ensureResponseColumns_(sheet);
    var raw =
      Array.isArray(body.raw)
        ? body.raw
        : [];
    var intens =
      Array.isArray(body.intensities)
        ? body.intensities
        : [];
    var refl =
      Array.isArray(body.reflections)
        ? body.reflections
        : [];
    var row = h.map(function(col) {
      var m;
      var value = '';
      m = col.match(/^raw(\d+)$/);
      if (m) {
        value =
          raw[Number(m[1]) - 1];
        return cellValue_(value);
      }
      m = col.match(/^intensity(\d+)$/);
      if (m) {
        value =
          intens[Number(m[1]) - 1];
        return cellValue_(value);
      }
      m = col.match(/^reflection(\d+)$/);
      if (m) {
        value =
          refl[Number(m[1]) - 1];
        return cellValue_(value);
      }
      value = body[col];
      return cellValue_(value);
    });
    console.log(
      'Writing ' +
      row.length +
      ' columns to Responses'
    );
    aogAppend_(sheet, row);
    console.log('SCREENER SAVED SUCCESSFULLY');
    return json_({
      ok: true,
      saved: true,
      columnsWritten: row.length
    });
  } catch (err) {
    console.log(
      'WRITE ERROR: ' +
      String(err)
    );
    return json_({
      ok: false,
      error: String(err)
    });
  }
}

function readRecords_() {
  var sheet = getSheet();
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) {
    return [];
  }
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var header = values[0].map(function (v) {
    return String(v || '').trim();
  });
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var rowVals = values[r];
    var rec = { raw: [], intensities: [] };
    for (var c = 0; c < header.length; c++) {
      var col = header[c];
      if (!col) { continue; }
      var v = rowVals[c];
      var m;
      m = col.match(/^raw(\d+)$/);
      if (m) {
        rec.raw[Number(m[1]) - 1] = numOrNull_(v);
        continue;
      }
      m = col.match(/^intensity(\d+)$/);
      if (m) {
        rec.intensities[Number(m[1]) - 1] = numOrNull_(v);
        continue;
      }
      if (col === 'timestamp' && v instanceof Date) {
        rec.timestamp = v.toISOString();
        continue;
      }
      rec[col] = v;
    }
    var id = String(rec.studentId == null ? '' : rec.studentId).trim();
    if (id === '') { continue; }
    if (id === 'SELFTEST') { continue; }
    if (id === '(connection test)') { continue; }
    out.push(rec);
  }
  return out;
}

function numOrNull_(v) {
  if (v === '' || v === null || v === undefined) {
    return null;
  }
  var n = Number(v);
  return isNaN(n) ? null : n;
}

function doGet(e) {
  return json_({
    ok: true,
    service: 'AoG Screener Sync',
    status: 'connected',
    version: SCRIPT_VERSION,
    versionDate: SCRIPT_VERSION_DATE
  });
}

function cellValue_(v) {
  if (v === null || v === undefined) {
    return '';
  }
  if (typeof v === 'object') {
    var j;
    try { j = JSON.stringify(v); } catch (e) { j = ''; }
    if (j && j.length > MAX_JSON_CHARS) {
      var series = '';
      try { series = String((v && v.series) || ''); } catch (e2) {}
      j = JSON.stringify({ series: series, oversize: true, chars: j.length });
    }
    return sanitizeCell_(j, MAX_JSON_CHARS);
  }
  return sanitizeCell_(v);
}

function sanitizeCell_(v, cap) {
  if (typeof v !== 'string') {
    return v;
  }
  var lim = (typeof cap === 'number' && cap > 0) ? cap : MAX_FIELD_CHARS;
  if (v.length > lim) {
    v = v.slice(0, lim);
  }
  if (v.charAt(0) === '=' ||
      v.charAt(0) === '+' ||
      v.charAt(0) === '-' ||
      v.charAt(0) === '@') {
    v = "'" + v;
  }
  return v;
}

function rateLimited_(supplied) {
  try {
    if (!supplied) { return false; }
    var cache = CacheService.getScriptCache();
    var digest = Utilities
      .computeDigest(Utilities.DigestAlgorithm.MD5, String(supplied))
      .map(function (b) { return ((b & 0xFF) + 0x100).toString(16).slice(1); })
      .join('')
      .slice(0, 16);
    var bucket = Math.floor(Date.now() / 60000);
    var key = 'aogrl_' + digest + '_' + bucket;
    var n = Number(cache.get(key) || 0) + 1;
    cache.put(key, String(n), 90);
    return n > RATE_LIMIT_PER_MIN;
  } catch (err) {
    return false;
  }
}

function aogAppend_(sheet, row) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    console.log('LOCK TIMEOUT — row NOT written');
    throw new Error('The sheet was busy. Please try again in a moment.');
  }
  try {
    sheet.appendRow(row);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function json_(obj) {
  try {
    if (obj && typeof obj === 'object' && !('v' in obj)) {
      obj.v = SCRIPT_VERSION;
      obj.vDate = SCRIPT_VERSION_DATE;
    }
  } catch (err) {}
  return ContentService
    .createTextOutput(
      JSON.stringify(obj)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}

function getCheckinSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CHECKIN_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CHECKIN_SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(CHECKIN_COLS);
    sheet
      .getRange(1, 1, 1, CHECKIN_COLS.length)
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    forceTextCols_(sheet, CHECKIN_COLS, ['timestamp', 'date', 'submitTime']);
    return sheet;
  }
  var lastCol = sheet.getLastColumn();
  var header = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (v) { return String(v || '').trim(); });
  var missing = CHECKIN_COLS.filter(function (c) {
    return header.indexOf(c) === -1;
  });
  if (missing.length) {
    sheet
      .getRange(1, lastCol + 1, 1, missing.length)
      .setValues([missing])
      .setFontWeight('bold');
    console.log('CHECKIN TAB · added columns: ' + missing.join(', '));
  }
  return sheet;
}

function forceTextCols_(sheet, cols, names) {
  var rows = sheet.getMaxRows();
  names.forEach(function (name) {
    var i = cols.indexOf(name);
    if (i < 0) { return; }
    sheet.getRange(1, i + 1, rows, 1).setNumberFormat('@');
  });
}

function getHomeSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HOME_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(HOME_SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HOME_COLS);
    sheet
      .getRange(1, 1, 1, HOME_COLS.length)
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    forceTextCols_(sheet, HOME_COLS, ['timestamp', 'date', 'submitTime']);
    return sheet;
  }
  var lastCol = sheet.getLastColumn();
  var header = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (v) { return String(v || '').trim(); });
  var missing = HOME_COLS.filter(function (c) {
    return header.indexOf(c) === -1;
  });
  if (missing.length) {
    sheet
      .getRange(1, lastCol + 1, 1, missing.length)
      .setValues([missing])
      .setFontWeight('bold');
    console.log('HOME TAB · added columns: ' + missing.join(', '));
  }
  return sheet;
}

function getExitSlipSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(EXITSLIP_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(EXITSLIP_SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(EXITSLIP_COLS);
    sheet
      .getRange(1, 1, 1, EXITSLIP_COLS.length)
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    forceTextCols_(sheet, EXITSLIP_COLS, ['timestamp', 'date', 'submitTime']);
    return sheet;
  }
  var lastCol = sheet.getLastColumn();
  var header = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (v) { return String(v || '').trim(); });
  var missing = EXITSLIP_COLS.filter(function (c) {
    return header.indexOf(c) === -1;
  });
  if (missing.length) {
    sheet
      .getRange(1, lastCol + 1, 1, missing.length)
      .setValues([missing])
      .setFontWeight('bold');
    console.log('EXIT SLIP TAB · added columns: ' + missing.join(', '));
  }
  return sheet;
}

function getSupportSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SUPPORT_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SUPPORT_SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SUPPORT_COLS);
    sheet
      .getRange(1, 1, 1, SUPPORT_COLS.length)
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    forceTextCols_(sheet, SUPPORT_COLS, ['timestamp', 'date', 'submitTime']);
    return sheet;
  }
  var lastCol = sheet.getLastColumn();
  var header = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (v) { return String(v || '').trim(); });
  var missing = SUPPORT_COLS.filter(function (c) {
    return header.indexOf(c) === -1;
  });
  if (missing.length) {
    sheet
      .getRange(1, lastCol + 1, 1, missing.length)
      .setValues([missing])
      .setFontWeight('bold');
    console.log('SUPPORT TAB · added columns: ' + missing.join(', '));
  }
  return sheet;
}

function getTeamSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TEAM_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(TEAM_SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(TEAM_COLS);
    sheet
      .getRange(1, 1, 1, TEAM_COLS.length)
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    forceTextCols_(sheet, TEAM_COLS, ['timestamp', 'date', 'submitTime']);
    return sheet;
  }
  var lastCol = sheet.getLastColumn();
  var header = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (v) { return String(v || '').trim(); });
  var missing = TEAM_COLS.filter(function (c) {
    return header.indexOf(c) === -1;
  });
  if (missing.length) {
    sheet
      .getRange(1, lastCol + 1, 1, missing.length)
      .setValues([missing])
      .setFontWeight('bold');
    console.log('TEAM TAB · added columns: ' + missing.join(', '));
  }
  return sheet;
}

function readPracticeTab_(tabName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(tabName || PRACTICE_SHEET_NAME);
  if (!sheet) { return []; }
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) { return []; }
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var header = values[0].map(function (v) {
    return String(v || '').trim();
  });
  var NUMS = ['setNo', 'itemsTotal', 'independent', 'supported',
              'hintsUsed', 'confidence', 'pctIndependent'];
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var rowVals = values[r];
    var rec = {};
    for (var c = 0; c < header.length; c++) {
      var col = header[c];
      if (!col) { continue; }
      var v = rowVals[c];
      if ((col === 'timestamp' || col === 'date') && v instanceof Date) {
        rec[col] = v.toISOString();
        continue;
      }
      if (NUMS.indexOf(col) !== -1) {
        if (v === '' || v === null || v === undefined) { rec[col] = null; continue; }
        var n = Number(v);
        rec[col] = isNaN(n) ? null : n;
        continue;
      }
      rec[col] = v;
    }
    var sid = String(rec.studentId == null ? '' : rec.studentId).trim();
    if (sid === '') { continue; }
    if (sid === 'SELFTEST') { continue; }
    if (sid === '(connection test)') { continue; }
    out.push(rec);
  }
  return out;
}

function readCheckins_() {
  return readCheckinTab_(CHECKIN_SHEET_NAME).concat(readCheckinTab_(SUPPORT_SHEET_NAME));
}

function readCheckinTab_(tabName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) { return []; }
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) { return []; }
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var header = values[0].map(function (v) {
    return String(v || '').trim();
  });
  var BOOLS = ['regulated', 'usedStrategy', 'connected', 'followUp'];
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var rowVals = values[r];
    var rec = {};
    for (var c = 0; c < header.length; c++) {
      var col = header[c];
      if (!col) { continue; }
      var v = rowVals[c];
      if ((col === 'timestamp' || col === 'date') && v instanceof Date) {
        rec[col] = v.toISOString();
        continue;
      }
      if (BOOLS.indexOf(col) !== -1) {
        if (v === '' || v === null || v === undefined) { rec[col] = null; continue; }
        rec[col] = (v === true) ||
                   (String(v).trim().toUpperCase() === 'TRUE');
        continue;
      }
      rec[col] = v;
    }
    var sid = String(rec.studentId == null ? '' : rec.studentId).trim();
    if (sid === '') { continue; }
    if (sid === 'SELFTEST') { continue; }
    if (sid === '(connection test)') { continue; }
    out.push(rec);
  }
  return out;
}

function readHomeObs_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HOME_SHEET_NAME);
  if (!sheet) { return []; }
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) { return []; }
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var header = values[0].map(function (v) { return String(v || '').trim(); });
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var rowVals = values[r];
    var rec = {};
    for (var c = 0; c < header.length; c++) {
      var col = header[c];
      if (!col) { continue; }
      var v = rowVals[c];
      if ((col === 'timestamp' || col === 'date') && v instanceof Date) {
        rec[col] = v.toISOString();
        continue;
      }
      if (col === 'followUp') {
        if (v === '' || v === null || v === undefined) { rec[col] = null; continue; }
        rec[col] = (v === true) || (String(v).trim().toUpperCase() === 'TRUE');
        continue;
      }
      rec[col] = v;
    }
    var hk = String(rec.homeKey == null ? '' : rec.homeKey).trim();
    if (hk === '') { continue; }
    out.push(rec);
  }
  return out;
}

function readExitSlips_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(EXITSLIP_SHEET_NAME);
  if (!sheet) { return []; }
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) { return []; }
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var header = values[0].map(function (v) {
    return String(v || '').trim();
  });
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var rowVals = values[r];
    var rec = {};
    for (var c = 0; c < header.length; c++) {
      var col = header[c];
      if (!col) { continue; }
      var v = rowVals[c];
      if ((col === 'timestamp' || col === 'date') && v instanceof Date) {
        rec[col] = v.toISOString();
        continue;
      }
      if (col === 'followUp') {
        if (v === '' || v === null || v === undefined) { rec[col] = null; continue; }
        rec[col] = (v === true) ||
                   (String(v).trim().toUpperCase() === 'TRUE');
        continue;
      }
      rec[col] = v;
    }
    var sid = String(rec.studentId == null ? '' : rec.studentId).trim();
    if (sid === '') { continue; }
    if (sid === 'SELFTEST') { continue; }
    if (sid === '(connection test)') { continue; }
    if (!rec.date && rec.timestamp) {
      rec.date = String(rec.timestamp).slice(0, 10);
    }
    out.push(rec);
  }
  return out;
}

function getHomeCheckinSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HOMECI_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(HOMECI_SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HOMECI_COLS);
    sheet
      .getRange(1, 1, 1, HOMECI_COLS.length)
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    forceTextCols_(sheet, HOMECI_COLS, ['timestamp', 'date', 'submitTime']);
    return sheet;
  }
  var lastCol = sheet.getLastColumn();
  var header = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (v) { return String(v || '').trim(); });
  var missing = HOMECI_COLS.filter(function (c) {
    return header.indexOf(c) === -1;
  });
  if (missing.length) {
    sheet
      .getRange(1, lastCol + 1, 1, missing.length)
      .setValues([missing])
      .setFontWeight('bold');
    console.log('HOME CHECK-IN TAB · added columns: ' + missing.join(', '));
  }
  return sheet;
}

function readHomeCheckins_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HOMECI_SHEET_NAME);
  if (!sheet) { return []; }
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) { return []; }
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var header = values[0].map(function (v) { return String(v || '').trim(); });
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var rowVals = values[r];
    var rec = {};
    for (var c = 0; c < header.length; c++) {
      var col = header[c];
      if (!col) { continue; }
      var v = rowVals[c];
      if ((col === 'timestamp' || col === 'date') && v instanceof Date) {
        rec[col] = v.toISOString();
        continue;
      }
      if (col === 'followUp') {
        if (v === '' || v === null || v === undefined) { rec[col] = null; continue; }
        rec[col] = (v === true) || (String(v).trim().toUpperCase() === 'TRUE');
        continue;
      }
      rec[col] = (v === null || v === undefined) ? '' : String(v);
    }
    if (rec.studentId) { out.push(rec); }
  }
  return out;
}

function readTeamEvidence_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TEAM_SHEET_NAME);
  if (!sheet) { return []; }
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) { return []; }
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var header = values[0].map(function (v) {
    return String(v || '').trim();
  });
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var rowVals = values[r];
    var rec = {};
    for (var c = 0; c < header.length; c++) {
      var col = header[c];
      if (!col) { continue; }
      var v = rowVals[c];
      if ((col === 'timestamp' || col === 'date') && v instanceof Date) {
        rec[col] = v.toISOString();
        continue;
      }
      if (col === 'followUp') {
        if (v === '' || v === null || v === undefined) { rec[col] = null; continue; }
        rec[col] = (v === true) ||
                   (String(v).trim().toUpperCase() === 'TRUE');
        continue;
      }
      if (col === 'opps' || col === 'succ') {
        if (v === '' || v === null || v === undefined) { rec[col] = null; continue; }
        var n = Number(v);
        rec[col] = isFinite(n) ? n : null;
        continue;
      }
      rec[col] = v;
    }
    if (rec.studentId) { out.push(rec); }
  }
  return out;
}

/* ═══ v18 · SET THE KEYS FROM INSIDE THE SHEET ═════════════════════════════
   Jimmy, on an iPad: "Add script property … that is not there." The Apps
   Script settings page does not always draw that button on a tablet. So the
   Sheet gets a menu of its own: reload the spreadsheet, open
   "Architecture of Grace" in the menu bar, and choose "Set the keys". Two
   prompts, two passphrases you make up, saved as the script properties the
   script already reads. "Check the keys" says whether they are set, never
   what they are. Nothing else about the script changes. */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('Architecture of Grace')
      .addItem('Set the keys', 'aogSetKeys')
      .addItem('Check the keys', 'aogCheckKeys')
      .addToUi();
  } catch (e) {}
}
function aogSetKeys() {
  var ui = SpreadsheetApp.getUi();
  var props = PropertiesService.getScriptProperties();
  var w = ui.prompt('BACKEND_AUTH_KEY',
    'The write key. Students\' pages send with it. Type the same one into Dashboard ▸ Set up ▸ BACKEND_AUTH_KEY.',
    ui.ButtonSet.OK_CANCEL);
  if (w.getSelectedButton() !== ui.Button.OK) { return; }
  var wv = String(w.getResponseText() || '').trim();
  var r = ui.prompt('ADMIN_PULL_KEY',
    'The read key. Only your dashboard uses it, to pull answers back. Type the same one into Dashboard ▸ Set up ▸ ADMIN_PULL_KEY.',
    ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) { return; }
  var rv = String(r.getResponseText() || '').trim();
  if (wv.length < 6 || rv.length < 6) { ui.alert('Each key needs at least 6 characters. Nothing was changed.'); return; }
  if (wv === rv) { ui.alert('The two keys must be different. Nothing was changed.'); return; }
  props.setProperty('BACKEND_AUTH_KEY', wv);
  props.setProperty('ADMIN_PULL_KEY', rv);
  ui.alert('Saved. Now Deploy ▸ Manage deployments ▸ Edit ▸ New version ▸ Deploy, then put the same two keys into the dashboard\'s Set up.');
}
function aogCheckKeys() {
  var props = PropertiesService.getScriptProperties();
  var w = props.getProperty('BACKEND_AUTH_KEY'), r = props.getProperty('ADMIN_PULL_KEY');
  SpreadsheetApp.getUi().alert(
    'BACKEND_AUTH_KEY (write): ' + (w ? 'set (' + w.length + ' characters)' : 'NOT SET — sends are refused') + '\n' +
    'ADMIN_PULL_KEY (read): ' + (r ? 'set (' + r.length + ' characters)' : 'NOT SET — the dashboard cannot pull'));
}
