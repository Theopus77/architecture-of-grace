/**
 * ARCHITECTURE OF GRACE — School Sheet Sync
 * Google Apps Script Web App (Code.gs)  ·  v1.0
 * ---------------------------------------------------------------------------
 * This script makes a Google Sheet YOUR school owns the destination for
 * Architecture of Grace self-reflections. Architecture of Grace stores nothing;
 * every synced record lands in this Sheet, in your Google Workspace, under your
 * control. It is append-only and gated by a passcode you choose.
 *
 * ===== 5-MINUTE SETUP =====================================================
 * 1. Create a new Google Sheet (this becomes your system of record).
 * 2. Extensions ▸ Apps Script. Delete any sample code, paste THIS file in.
 * 3. Project Settings ▸ Script properties ▸ Add property:
 *        Name:  SHEET_PASSCODE
 *        Value: a secret of your choosing (e.g. lincoln-2026-x7q4)
 * 4. Deploy ▸ New deployment ▸ type "Web app".
 *        Execute as:  Me
 *        Who has access:  Anyone
 *    Click Deploy, authorize, and COPY the Web app URL (it ends in /exec).
 * 5. In the AoG dashboard ▸ Distribute ▸ "Connect your school's Sheet":
 *        paste the /exec URL and the same passcode, then Save and Test.
 *    A row marked "(connection test)" appears in your Sheet = connected.
 * ==========================================================================
 *
 * PRIVACY NOTE: store a pseudonymous student CODE in the "studentId" field —
 * never a child's name. Keep the code↔name list in a separate, private tab or
 * file that only your school holds. The synced rows carry no other PII.
 */

/* Column order written to the "Results" tab. Matches the AoG record schema so
   the dashboard's "Pull from sheet" reads it back without any mapping. */
var FIELDS = [
  "timestamp", "studentId", "context", "grade", "window",
  "districtId", "schoolId", "classId", "language", "mode", "population", "relationship",
  "normComposite", "normA", "normB", "normC",
  "composite", "domainA", "domainB", "domainC",
  "tier", "trustedAdultFlag", "unsafeFlag", "closingWord",
  "raw", "intensities", "reflections"
];
var SHEET_NAME = "Results";

function getPasscode_() {
  return PropertiesService.getScriptProperties().getProperty("SHEET_PASSCODE") || "";
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(FIELDS);
    sh.setFrozenRows(1);
  } else if (sh.getLastRow() === 0) {
    sh.appendRow(FIELDS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Convert one record object into a row in FIELDS order. Arrays are stored as
   JSON strings; the dashboard parses them back on pull. */
function recordToRow_(rec) {
  return FIELDS.map(function (f) {
    var v = rec[f];
    if (v === undefined || v === null) return "";
    if (Array.isArray(v)) return JSON.stringify(v);
    return v;
  });
}

/* Read every data row back into {records:[...]} keyed by header names. */
function readRecords_() {
  var sh = getSheet_();
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var header = values[0];
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r], obj = {};
    var hasData = false;
    for (var c = 0; c < header.length; c++) {
      var key = header[c];
      if (!key) continue;
      var cell = row[c];
      if (cell !== "" && cell !== null) hasData = true;
      obj[key] = cell;
    }
    if (hasData) out.push(obj);
  }
  return out;
}

/* ---- POST: write a record, run a connection test, or serve a pull ---- */
function doPost(e) {
  var body = {};
  try { body = JSON.parse((e && e.postData && e.postData.contents) || "{}"); } catch (err) { body = {}; }

  var pass = getPasscode_();
  var supplied = body.passcode || body.key || "";
  if (pass && supplied !== pass) {
    return json_({ error: "bad-passcode" });
  }

  // Read path (the dashboard's "Pull from sheet")
  if (body.action === "pull") {
    return json_({ records: readRecords_() });
  }

  var sh = getSheet_();

  // Connection test from the Setup panel
  if (body.ping) {
    sh.appendRow(recordToRow_({
      timestamp: body.timestamp || new Date().toISOString(),
      studentId: "(connection test)",
      context: "test", window: "—", tier: "—"
    }));
    return json_({ ok: true, test: true });
  }

  // Normal write: append the self-reflection record
  sh.appendRow(recordToRow_(body));
  return json_({ ok: true });
}

/* ---- GET: pull fallback via ?key=PASSCODE ---- */
function doGet(e) {
  var pass = getPasscode_();
  var supplied = (e && e.parameter && e.parameter.key) || "";
  if (pass && supplied !== pass) {
    return json_({ error: "bad-passcode" });
  }
  return json_({ records: readRecords_() });
}
