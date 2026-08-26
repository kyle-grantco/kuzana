// --- CONFIG --- update

const DECK_URL = 'https://docs.google.com/presentation/d/1JmAZx8-Xn2RiYaf2zFdluSwWno6XM6sNaq99fTgoCf8/view';
const FROM = 'kyle@kuzana.co'; // must be a valid Gmail "Send mail as" alias

// Spreadsheet that holds both logs
const SHEET_ID = '1-kq5To3ysklnhM5n_Rx-B0JQ3oHxpbIkecWq6wksnEU';

// Tab names inside that spreadsheet (lead funnels)
const INVESTORS_SHEET_NAME = 'Investors'; // investor / deck request leads
const FOUNDERS_SHEET_NAME = 'Founders';   // founder lead magnets (quiz, 40 things, sales, etc.)
// Hard-coded Founders tab gid — do not route by name alone
const FOUNDERS_SHEET_GID = 1695097223;    // https://docs.google.com/spreadsheets/d/1-kq5To3ysklnhM5n_Rx-B0JQ3oHxpbIkecWq6wksnEU/edit?gid=1695097223
const INVESTORS_SHEET_GID = null;         // resolve Investors by name until a stable gid is known

// Legacy aliases kept for readability in routing helpers
const DECK_SHEET_NAME = INVESTORS_SHEET_NAME;
const THINGS_SHEET_NAME = FOUNDERS_SHEET_NAME;

// Founder-funnel contexts → Founders tab (column C stores the context string)
const FOUNDERS_CONTEXTS = {
  '40things_before_deck': true,
  'InvestmentReadinessQuiz': true,
  'frontier_sales_workshop': true
};

// --- ENTRYPOINT ---

function doGet(e) {
  return ContentService
    .createTextOutput('Kuzana web app is running. Use POST to submit data.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const data = parseRequest_(e);
    const rawEmail = String(data.email || '').trim().toLowerCase();
    const context = String(data.context || 'deck_request').trim();
    const deckUrl = data.deckUrl || DECK_URL;

    Logger.log('doPost email=%s context=%s keys=%s', rawEmail, context, Object.keys(data).join(','));

    if (!isValidEmail_(rawEmail)) {
      return json_({ status: 'error', error: 'invalid_email' });
    }

    // Log every lead somewhere first
    logLead_(rawEmail, context);

    // Founder lead magnets: only log, do NOT send deck or notifications
    if (FOUNDERS_CONTEXTS[context]) {
      return json_({ status: 'success', ok: true, handled: context, sheet: FOUNDERS_SHEET_NAME, gid: FOUNDERS_SHEET_GID });
    }

    // Deck requests / investor contexts: send deck + notify you
    if (context === 'deck_request' || context === 'invest_deck') {
      notifyDeckViewed_(rawEmail, deckUrl);
      sendDeckToLead_(rawEmail, deckUrl);
      return json_({ status: 'success', ok: true, handled: 'deck_request', sheet: INVESTORS_SHEET_NAME });
    }

    // Any other context: just logged, no deck
    return json_({ status: 'success', ok: true, handled: 'logged_only', sheet: INVESTORS_SHEET_NAME });

  } catch (err) {
    Logger.log('doPost error: %s', err);
    return json_({ status: 'error', error: String(err) });
  }
}

// --- HELPERS ---

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
}

/**
 * Resolves POST payload from JSON body, form parameters, and raw URL-encoded bodies.
 * sendBeacon / no-cors posts often arrive as text/plain form strings with empty e.parameter.
 * @param {Object} e
 * @returns {Object}
 */
function parseRequest_(e) {
  var fromJson = parseJson_(e);
  var fromParams = {};
  var fromFormBody = {};

  if (e && e.parameter) {
    Object.keys(e.parameter).forEach(function (key) {
      fromParams[key] = e.parameter[key];
    });
  }

  if (e && e.postData && e.postData.contents) {
    var contents = String(e.postData.contents);
    var type = String((e.postData.type || '')).toLowerCase();
    // If JSON parse failed / empty, try form-urlencoded (including text/plain bodies)
    if (!Object.keys(fromJson).length && contents.indexOf('=') !== -1 &&
        (type.indexOf('json') === -1 || contents.charAt(0) !== '{')) {
      fromFormBody = parseFormBody_(contents);
    }
  }

  // Prefer explicit JSON fields when present; otherwise form params / body.
  return Object.assign({}, fromFormBody, fromParams, fromJson);
}

/**
 * Parses application/x-www-form-urlencoded (or text/plain equivalent) into an object.
 * @param {string} contents
 * @returns {Object}
 */
function parseFormBody_(contents) {
  var out = {};
  String(contents || '').split('&').forEach(function (pair) {
    if (!pair) return;
    var idx = pair.indexOf('=');
    var rawKey = idx === -1 ? pair : pair.slice(0, idx);
    var rawVal = idx === -1 ? '' : pair.slice(idx + 1);
    var key = decodeURIComponent(String(rawKey).replace(/\+/g, ' '));
    var val = decodeURIComponent(String(rawVal).replace(/\+/g, ' '));
    if (key) out[key] = val;
  });
  return out;
}

/**
 * Appends a lead row to Founders (by gid) or Investors (by name).
 * @param {string} email
 * @param {string} context
 */
function logLead_(email, context) {
  Logger.log('logLead_ called with email=%s context=%s', email, context);
  // Prefer the bound spreadsheet; fall back to openById for standalone deploys
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SHEET_ID);
  const isFounderLead = !!FOUNDERS_CONTEXTS[context];
  const sheet = isFounderLead
    ? getFoundersSheet_(ss)
    : getInvestorsSheet_(ss);

  if (!sheet) {
    throw new Error('Sheet not found for context ' + context);
  }
  Logger.log('logLead_ writing to sheet=%s gid=%s', sheet.getName(), sheet.getSheetId());
  // Columns: date | email | context (e.g. InvestmentReadinessQuiz)
  sheet.appendRow([new Date(), email, context]);
}

/**
 * Founder lead magnet tab — ALWAYS by gid 1695097223 (never name-only).
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getFoundersSheet_(ss) {
  var sheet = getSheetByGid_(ss, FOUNDERS_SHEET_GID);
  if (!sheet) {
    throw new Error('Founders sheet gid ' + FOUNDERS_SHEET_GID + ' not found in spreadsheet');
  }
  return sheet;
}

/**
 * Investor / deck-request tab, with name fallbacks.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
function getInvestorsSheet_(ss) {
  if (INVESTORS_SHEET_GID != null) {
    var byGid = getSheetByGid_(ss, INVESTORS_SHEET_GID);
    if (byGid) return byGid;
  }
  return getSheetByGidOrName_(ss, null, [
    INVESTORS_SHEET_NAME,
    'DeckRequests',
    'Investors'
  ]);
}

/**
 * Finds a sheet by numeric gid.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {number} gid
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
function getSheetByGid_(ss, gid) {
  var sheets = ss.getSheets();
  var target = Number(gid);
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === target) return sheets[i];
  }
  return null;
}

/**
 * Finds a sheet by numeric gid first, then by any of the provided names.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {number|null} gid
 * @param {string[]} names
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
function getSheetByGidOrName_(ss, gid, names) {
  if (gid != null && gid !== '') {
    var byGid = getSheetByGid_(ss, gid);
    if (byGid) return byGid;
  }
  for (var i = 0; i < names.length; i++) {
    var sheet = ss.getSheetByName(names[i]);
    if (sheet) return sheet;
  }
  return null;
}

// Manual tests to verify permissions and behavior
function testLogLead() {
  logLead_('test-investors@example.com', 'deck_request');
  logLead_('test-founders-40things@example.com', '40things_before_deck');
  logLead_('test-founders-quiz@example.com', 'InvestmentReadinessQuiz');
  logLead_('test-founders-sales@example.com', 'frontier_sales_workshop');
}

function testEmailSend() {
  // Sends a test deck email and internal notification to verify Gmail scopes
  sendDeckToLead_('kyle@kuzana.co', DECK_URL);
  notifyDeckViewed_('kyle@kuzana.co', DECK_URL);
}

function notifyDeckViewed_(email, deckUrl) {
  GmailApp.sendEmail(
    'kyle@kuzana.co',
    `${email} has viewed your deck`,
    `${email} has viewed your deck.\n\nDeck: ${deckUrl}`,
    { name: 'Kuzana Bot', from: FROM }
  );
}

function sendDeckToLead_(email, deckUrl) {
  const body = [
    'Hi, Here is the deck you requested.',
    deckUrl,
    '',
    'Follow Kuzana on social media at',
    '',
    'Kuzana.substack.com',
    'Linkedin.com/company/kuzana',
    '',
    'yours,',
    '',
    'Kyle Schutter',
    'CEO/Founder',
    'mint 1,000 millionaires by 2040',
    '',
    'batch1 summary (https://youtu.be/5-UTgfQiXM8)'
  ].join('\n');

  GmailApp.sendEmail(email, 'Kuzana Deck', body, { name: 'Kuzana', from: FROM });
}

function parseJson_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    var contents = String(e.postData.contents).trim();
    if (!contents || contents.charAt(0) !== '{' && contents.charAt(0) !== '[') return {};
    return JSON.parse(contents);
  } catch (err) {
    Logger.log('JSON parse error: %s', err);
    return {};
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
