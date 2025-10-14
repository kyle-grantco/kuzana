const DECK_URL = 'https://docs.google.com/presentation/d/1JmAZx8-Xn2RiYaf2zFdluSwWno6XM6sNaq99fTgoCf8/view';
const FROM = 'kyle@kuzana.co'; // must be a valid Gmail "Send mail as" alias

function doPost(e) {
  try {
    const data = parseJson_(e);
    const email = (data.email || '').trim().toLowerCase();
    const deckUrl = data.deckUrl || DECK_URL;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json_({ error: 'invalid_email' });

    GmailApp.sendEmail('kyle@kuzana.co', `${email} has viewed your deck`,
      `${email} has viewed your deck.\n\nDeck: ${deckUrl}`, { name: 'Kuzana Bot', from: FROM });

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
    return json_({ ok: true });
  } catch (err) {
    return json_({ error: String(err) });
  }
}

function parseJson_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try { return JSON.parse(e.postData.contents); } catch (_) { return {}; }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}