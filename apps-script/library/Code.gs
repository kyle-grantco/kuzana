/**
 * Kuzana Library Web App (Unified)
 * Single Apps Script project handling both:
 *  - Borrow: append [Date, Book, Borrower LinkedIn Address] to "Borrowers"
 *  - Lend: append [Date, Book Name, Lender LinkedIn URL] to "Lend Offers"
 *
 * Routing:
 *  - Prefer explicit body.action: "borrow" | "lend"
 *  - Fallback by presence of field names:
 *      - Borrow if { borrowerUrl, book }
 *      - Lend   if { lenderUrl, bookName }
 *
 * Deploy once as a Web App (Execute as Me, Access: Anyone).
 * On the website, you can point both Borrow and Lend requests to the same URL.
 * The server detects which operation to run based on action/fields.
 */

/* global ContentService, SpreadsheetApp */

/** ID of the Kuzana Library spreadsheet */
var SHEET_ID = '13qeTLyxRiL53bA-z8DVo6Vft8ie2Jla9uzLGIk9jVBE';
/** Target sheet names */
var BORROWERS_SHEET = 'Borrowers';
var LEND_SHEET = 'Lend Offers';

/**
 * CORS for preflight
 */
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Entry point for Web App POST.
 * @param {GoogleAppsScript.Events.DoPost} e
 */
function doPost(e) {
  try {
    var body = parseBodyJsonOrForm(e);
    var action = (body.action || '').toLowerCase();

    if (action === 'borrow' || isBorrowShape(body)) {
      return handleBorrow(body);
    }
    if (action === 'lend' || isLendShape(body)) {
      return handleLend(body);
    }
    return respond(400, { error: 'Unrecognized payload. Provide action \"borrow\"|\"lend\", or required fields.' });
  } catch (err) {
    return respond(500, { error: String(err && err.message || err) });
  }
}

/**
 * Optional GET handler for health checks and browser visits.
 */
function doGet(e) {
  return respond(200, {
    ok: true,
    message: 'Kuzana Library Web App: use POST with action \"borrow\" or \"lend\"',
    acceptedActions: ['borrow', 'lend']
  });
}

/**
 * Borrow handler: expects { borrowerUrl, book }
 * Appends [Date, Book, Borrower LinkedIn Address] to "Borrowers".
 */
function handleBorrow(body) {
  var borrowerUrl = (body.borrowerUrl || '').trim();
  var book = (body.book || '').trim();
  if (!borrowerUrl || !isValidUrl(borrowerUrl)) return respond(400, { error: 'Invalid borrowerUrl' });
  if (!book) return respond(400, { error: 'Missing book' });

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(BORROWERS_SHEET);
  if (!sh) return respond(500, { error: 'Borrowers sheet not found' });
  sh.appendRow([new Date(), book, borrowerUrl]);
  return respond(200, { ok: true, op: 'borrow' });
}

/**
 * Lend handler: expects { lenderUrl, bookName }
 * Appends [Date, Book Name, Lender LinkedIn URL] to "Lend Offers".
 */
function handleLend(body) {
  var lenderUrl = (body.lenderUrl || '').trim();
  var bookName = (body.bookName || '').trim();
  if (!lenderUrl || !isValidUrl(lenderUrl)) return respond(400, { error: 'Invalid lenderUrl' });
  if (!bookName) return respond(400, { error: 'Missing bookName' });

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(LEND_SHEET) || ss.insertSheet(LEND_SHEET);
  sh.appendRow([new Date(), bookName, lenderUrl]);
  return respond(200, { ok: true, op: 'lend' });
}

/**
 * Helpers
 */
function respond(status, data) {
  var out = ContentService.createTextOutput(JSON.stringify(data || {}))
    .setMimeType(ContentService.MimeType.JSON);
  return out;
}

/**
 * Attempts to parse JSON body; if not JSON, falls back to URL-encoded form parameters.
 * Supports application/json, application/x-www-form-urlencoded, multipart/form-data
 */
function parseBodyJsonOrForm(e) {
  if (!e || !e.postData) throw new Error('Missing request body');
  var type = (e.postData.type || '').toLowerCase();
  var contents = e.postData.contents || '';

  // JSON path
  if (type.indexOf('application/json') !== -1) {
    try { return JSON.parse(contents || '{}'); }
    catch (err) { throw new Error('Invalid JSON'); }
  }

  // Form path (x-www-form-urlencoded or multipart/form-data)
  var params = e.parameter || {};
  var out = {};
  for (var k in params) if (params.hasOwnProperty(k)) out[k] = params[k];
  if (Object.keys(out).length > 0) return out;

  throw new Error('Empty body');
}

function isBorrowShape(b) {
  return !!(b && typeof b === 'object' && b.borrowerUrl && b.book);
}

function isLendShape(b) {
  return !!(b && typeof b === 'object' && b.lenderUrl && b.bookName);
}

function isValidUrl(value) {
  if (typeof value !== 'string') return false;
  if (!/^https?:\/\//i.test(value)) return false;
  var host = value.split('://')[1] || '';
  if (!host || host.indexOf('.') === -1) return false;
  return true;
}


