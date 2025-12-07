/**
 * Lend Web App (Apps Script)
 * Receives POST { lenderUrl: string, bookName: string } and appends a row to
 * the "Lend Offers" sheet with [Date, Book Name, Lender LinkedIn URL].
 *
 * You may rename the destination sheet to fit your workflow, e.g., update Library tab manually later.
 *
 * Deployment:
 * - Apps Script > Deploy > New deployment > Web app
 * - Execute as: Me
 * - Who has access: Anyone
 * - Copy the Web App URL and paste into APPS_SCRIPT_LEND_URL on the website.
 */

/* global ContentService, SpreadsheetApp */

/** ID of the Kuzana Library spreadsheet */
var SHEET_ID = '13qeTLyxRiL53bA-z8DVo6Vft8ie2Jla9uzLGIk9jVBE';
/** Target sheet name for lend offers */
var LEND_SHEET = 'Lend Offers';

function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Handles lend submission.
 * @param {GoogleAppsScript.Events.DoPost} e
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return respond(400, { error: 'Missing request body' });
    var body = {};
    try { body = JSON.parse(e.postData.contents); } catch (err) {
      return respond(400, { error: 'Invalid JSON' });
    }

    var lenderUrl = (body.lenderUrl || '').trim();
    var bookName = (body.bookName || '').trim();
    if (!lenderUrl || !isValidUrl(lenderUrl)) return respond(400, { error: 'Invalid lenderUrl' });
    if (!bookName) return respond(400, { error: 'Missing bookName' });

    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sh = ss.getSheetByName(LEND_SHEET) || ss.insertSheet(LEND_SHEET);
    var now = new Date();
    sh.appendRow([now, bookName, lenderUrl]);

    return respond(200, { ok: true });
  } catch (err) {
    return respond(500, { error: String(err && err.message || err) });
  }
}

function respond(status, data) {
  var out = ContentService.createTextOutput(JSON.stringify(data || {}))
    .setMimeType(ContentService.MimeType.JSON);
  out.setHeader('Access-Control-Allow-Origin', '*');
  out.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  out.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return out;
}

function isValidUrl(value) {
  if (typeof value !== 'string') return false;
  if (!/^https?:\/\//i.test(value)) return false;
  var host = value.split('://')[1] || '';
  if (!host || host.indexOf('.') === -1) return false;
  return true;
}


