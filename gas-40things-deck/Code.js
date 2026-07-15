// --- CONFIG --- update

const DECK_URL = 'https://docs.google.com/presentation/d/1JmAZx8-Xn2RiYaf2zFdluSwWno6XM6sNaq99fTgoCf8/view';
const FROM = 'kyle@kuzana.co'; // must be a valid Gmail "Send mail as" alias

// Spreadsheet that holds both logs
const SHEET_ID = '1-kq5To3ysklnhM5n_Rx-B0JQ3oHxpbIkecWq6wksnEU';

// Tab names inside that spreadsheet (lead funnels)
const INVESTORS_SHEET_NAME = 'Investors'; // investor / deck request leads
const FOUNDERS_SHEET_NAME = 'Founders';   // founder lead magnets (quiz, 40 things, etc.)

// Legacy aliases kept for readability in routing helpers
const DECK_SHEET_NAME = INVESTORS_SHEET_NAME;
const THINGS_SHEET_NAME = FOUNDERS_SHEET_NAME;

// Founder-funnel contexts → Founders tab (column C stores the context string)
const FOUNDERS_CONTEXTS = {
  '40things_before_deck': true,
  'InvestmentReadinessQuiz': true
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

    if (!isValidEmail_(rawEmail)) {
      return json_({ status: 'error', error: 'invalid_email' });
    }

    // Log every lead somewhere first
    logLead_(rawEmail, context);

    // Founder lead magnets: only log, do NOT send deck or notifications
    if (FOUNDERS_CONTEXTS[context]) {
      return json_({ status: 'success', ok: true, handled: context, sheet: FOUNDERS_SHEET_NAME });
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
    return json_({ status: 'error', error: String(err) });
  }
}

// --- HELPERS ---

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
}

/**
 * Resolves POST payload from JSON body and/or form parameters.
 * Browser no-cors requests often land as text/plain JSON or URL-encoded fields.
 * @param {Object} e
 * @returns {Object}
 */
function parseRequest_(e) {
  var fromJson = parseJson_(e);
  var fromParams = {};
  if (e && e.parameter) {
    Object.keys(e.parameter).forEach(function (key) {
      fromParams[key] = e.parameter[key];
    });
  }
  return Object.assign({}, fromParams, fromJson);
}

function logLead_(email, context) {
  Logger.log('logLead_ called with email=%s context=%s', email, context);
  // Prefer the bound spreadsheet; fall back to openById for standalone deploys
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SHEET_ID);
  const targetSheetName = FOUNDERS_CONTEXTS[context]
    ? FOUNDERS_SHEET_NAME
    : INVESTORS_SHEET_NAME;

  const sheet = ss.getSheetByName(targetSheetName);
  if (!sheet) {
    throw new Error('Sheet not found for context ' + context + ': ' + targetSheetName);
  }
  // Columns: date | email | context (e.g. InvestmentReadinessQuiz)
  sheet.appendRow([new Date(), email, context]);
}

// Manual tests to verify permissions and behavior
function testLogLead() {
  logLead_('test-investors@example.com', 'deck_request');
  logLead_('test-founders-40things@example.com', '40things_before_deck');
  logLead_('test-founders-quiz@example.com', 'InvestmentReadinessQuiz');
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
    return JSON.parse(e.postData.contents);
  } catch (err) {
    Logger.log('JSON parse error: %s', err);
    return {};
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
