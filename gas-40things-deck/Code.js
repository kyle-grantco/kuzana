// --- CONFIG --- update

const DECK_URL = 'https://docs.google.com/presentation/d/1JmAZx8-Xn2RiYaf2zFdluSwWno6XM6sNaq99fTgoCf8/view';
const FROM = 'kyle@kuzana.co'; // must be a valid Gmail "Send mail as" alias

// Spreadsheet that holds both logs
const SHEET_ID = '1-kq5To3ysklnhM5n_Rx-B0JQ3oHxpbIkecWq6wksnEU';

// Tab names inside that spreadsheet
const DECK_SHEET_NAME = 'DeckRequests';          // change if your tab has a different name
const THINGS_SHEET_NAME = '40ThingsBeforeTheDeck'; // must match the tab name for gid=1695097223

// --- ENTRYPOINT ---

function doGet(e) {
  return ContentService
    .createTextOutput('Kuzana web app is running. Use POST to submit data.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const data = parseJson_(e);
    const rawEmail = (data.email || '').trim().toLowerCase();
    const context = (data.context || 'deck_request').trim(); // default for legacy callers
    const deckUrl = data.deckUrl || DECK_URL;

    if (!isValidEmail_(rawEmail)) {
      return json_({ status: 'error', error: 'invalid_email' });
    }

    // Log every lead somewhere first
    logLead_(rawEmail, context);

    // 40 Things: only log, do NOT send deck or notifications
    if (context === '40things_before_deck') {
      return json_({ status: 'success', ok: true, handled: '40things_before_deck' });
    }

    // Deck requests / investor contexts: send deck + notify you
    if (context === 'deck_request' || context === 'invest_deck') {
      notifyDeckViewed_(rawEmail, deckUrl);
      sendDeckToLead_(rawEmail, deckUrl);
      return json_({ status: 'success', ok: true, handled: 'deck_request' });
    }

    // Any other context: just logged, no deck
    return json_({ status: 'success', ok: true, handled: 'logged_only' });

  } catch (err) {
    return json_({ status: 'error', error: String(err) });
  }
}

// --- HELPERS ---

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
}

function logLead_(email, context) {
  Logger.log('logLead_ called with email=%s context=%s', email, context);
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const targetSheetName = (context === '40things_before_deck')
    ? THINGS_SHEET_NAME
    : DECK_SHEET_NAME;

  const sheet = ss.getSheetByName(targetSheetName);
  if (!sheet) {
    throw new Error('Sheet not found for context ' + context + ': ' + targetSheetName);
  }
  sheet.appendRow([new Date(), email, context]);
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