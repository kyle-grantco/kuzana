/**
 * Borrow Web App (Apps Script)
 * Receives POST { borrowerUrl: string, book: string } and appends a row to
 * the "Borrowers" sheet with [Date, Book, Borrower LinkedIn Address].
 *
 * Deployment:
 * - Apps Script > Deploy > New deployment > Web app
 * - Execute as: Me
 * - Who has access: Anyone
 * - Copy the Web App URL and paste into APPS_SCRIPT_BORROW_URL on the website.
 */

/* global ContentService, SpreadsheetApp */

/** ID of the Kuzana Library spreadsheet */
var SHEET_ID = '13qeTLyxRiL53bA-z8DVo6Vft8ie2Jla9uzLGIk9jVBE';
/** Target sheet name for borrow records */
var BORROWERS_SHEET = 'Borrowers';

/**
 * Handles CORS preflight requests.
 */
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Handles borrow submission.
 * @param {GoogleAppsScript.Events.DoPost} e
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return respond(400, { error: 'Missing request body' });
    var body = {};
    try { body = JSON.parse(e.postData.contents); } catch (err) {
      return respond(400, { error: 'Invalid JSON' });
    }

    var borrowerUrl = (body.borrowerUrl || '').trim();
    var book = (body.book || '').trim();
    if (!borrowerUrl || !isValidUrl(borrowerUrl)) return respond(400, { error: 'Invalid borrowerUrl' });
    if (!book) return respond(400, { error: 'Missing book' });

    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sh = ss.getSheetByName(BORROWERS_SHEET);
    if (!sh) return respond(500, { error: 'Borrowers sheet not found' });

    var now = new Date();
    sh.appendRow([now, book, borrowerUrl]);

    return respond(200, { ok: true });
  } catch (err) {
    return respond(500, { error: String(err && err.message || err) });
  }
}

/**
 * Returns a JSON response with CORS headers.
 * @param {number} status
 * @param {any} data
 */
function respond(status, data) {
  var out = ContentService.createTextOutput(JSON.stringify(data || {}))
    .setMimeType(ContentService.MimeType.JSON);
  out.setHeader('Access-Control-Allow-Origin', '*');
  out.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  out.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return out;
}

/**
 * Minimal URL validation; Apps Script environment lacks URL class.
 * Accepts only http(s) URLs with at least one dot in the host.
 * @param {string} value
 */
function isValidUrl(value) {
  if (typeof value !== 'string') return false;
  if (!/^https?:\/\//i.test(value)) return false;
  var host = value.split('://')[1] || '';
  if (!host || host.indexOf('.') === -1) return false;
  return true;
}


