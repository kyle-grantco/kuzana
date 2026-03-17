// ⬅️ Replace these
const TEMPLATE_ID = '1FGJfRkGH1xH3tLfIm07UBR_8Inro3HHtRsowxhEsIRo';
const INSTRUCTOR_FOLDER_ID = '1aeFbhhS3jvjE7z8Z_RBYpV-FV2vrThYs';
const INSTRUCTOR_EMAIL = 'kyle@kuzana.co';
const REGISTRY_SPREADSHEET_ID = '1_4V3FbYLJt9K3AkQgi0rAkaTo8P70lEGCkh67KrsBho';
const REGISTRY_SHEET_NAME = 'Registry';


/**
 * Serves an HTML form that lets a student request their personal sheet.
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 */
function doGet() {
  const html = HtmlService.createHtmlOutput(`<!DOCTYPE html>
<meta charset="utf-8">
<style>
  :root {
    --background: #fafafa;
    --text: #222222;
    --primary: #0f172a;
    --accent: #fe7272;
    --border: #e5e5e5;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: transparent;
    color: var(--text);
  }
  .wrap {
    max-width: 420px;
    margin: 0 auto;
  }
  .card {
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid var(--border);
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
    padding: 16px 18px 18px;
  }
  .field {
    margin-bottom: 12px;
  }
  .label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 4px;
  }
  .hint {
    display: block;
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 4px;
  }
  input[type="email"],
  input[type="text"] {
    width: 100%;
    padding: 9px 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
    font-size: 0.9rem;
    box-sizing: border-box;
  }
  input[type="email"]:focus,
  input[type="text"]:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 1px var(--primary);
  }
  button[type="submit"] {
    margin-top: 4px;
    width: 100%;
    padding: 11px 14px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--accent);
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
  }
  button[type="submit"]:hover {
    filter: brightness(1.05);
  }
  #msg {
    margin-top: 10px;
    font-size: 0.9rem;
    color: var(--primary);
  }
</style>
<div class="wrap">
  <form id="createForm" class="card">
    <div class="field">
      <label for="em" class="label">Gmail</label>
      <input id="em" type="email" placeholder="Anne99@gmail.com" required>
      <span class="hint">Use the Google account you are currently signed in with.</span>
    </div>
    <div class="field">
      <label for="company" class="label">Company</label>
      <input id="company" type="text" placeholder="Your company name" required>
    </div>
    <button type="submit">Create my sheet</button>
    <p id="msg"></p>
  </form>
</div>
<script>
function handleSubmit(e){
  e.preventDefault();
  var em=document.getElementById('em').value.trim();
  var c=document.getElementById('company').value.trim();
  var msgEl=document.getElementById('msg'); msgEl.textContent='Creating (takes up to 30 seconds)...';
  google.script.run
    .withSuccessHandler(function(url){
      if(url){ window.open(url,'_blank'); msgEl.innerHTML='<a target="_blank" href="'+url+'">Open</a>'; }
      else { msgEl.textContent='No URL returned'; }
    })
    .withFailureHandler(function(err){ msgEl.textContent='Error: '+(err && err.message ? err.message : err); })
    .createFile(em,c);
}
window.handleSubmit = handleSubmit;
document.getElementById('createForm').addEventListener('submit', handleSubmit);
</script>`).setTitle('Create your Boss Mode sheet');
  html.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

/**
 * Creates a copy of the template in the instructor's folder and grants access to the student.
 * Avoids copying any bound Apps Script by creating a fresh spreadsheet and copying sheets.
 * @param {string} studentEmail - Student email to grant editor access.
 * @param {string} companyName - Company name used in the file title.
 * @returns {string} URL of the created spreadsheet.
 */
function createFile(studentEmail, companyName) {
  // If this email already has a sheet, return its URL instead of creating a new one
  try {
    var priorUrl = findExistingSheetUrlForEmail_(studentEmail);
    if (priorUrl) return priorUrl;
  } catch (e) { /* proceed to create if registry read fails */ }

  var templateSs = SpreadsheetApp.openById(TEMPLATE_ID);
  var firstCompanyWord = String(companyName || '').trim().split(/\s+/)[0];
  if (!firstCompanyWord) throw new Error('Company name is required');
  var emailLocal = String(studentEmail || '').split('@')[0];
  if (!emailLocal) throw new Error('Valid student email is required');
  var name = firstCompanyWord + '-' + emailLocal + ' 💰BOSSmode📈 w/ Kuzana';

  // 1) Create a new blank spreadsheet (no bound scripts)
  var newSs = SpreadsheetApp.create(name);

  // 2) Move it into the instructor folder
  var folder = DriveApp.getFolderById(INSTRUCTOR_FOLDER_ID);
  var newFile = DriveApp.getFileById(newSs.getId());
  folder.addFile(newFile);
  try { DriveApp.getRootFolder().removeFile(newFile); } catch (e) { /* ignore if not permitted */ }

  // 3) Copy all sheets from template; delete the default sheet AFTER first copy exists
  var defaultSheets = newSs.getSheets();
  var defaultSheet = defaultSheets && defaultSheets[0] ? defaultSheets[0] : null;

  var srcSheets = templateSs.getSheets();
  // Copy BOSSview first (if present) and ensure it is the first tab
  var bossSrc = templateSs.getSheetByName('BOSSview');
  var bossCopy = null;
  if (bossSrc) {
    bossCopy = bossSrc.copyTo(newSs);
    bossCopy.setName(bossSrc.getName());
    if (defaultSheet) { newSs.deleteSheet(defaultSheet); defaultSheet = null; }
    newSs.setActiveSheet(bossCopy);
    newSs.moveActiveSheet(1);
  }
  // Copy remaining sheets in template order, skipping BOSSview (already copied)
  for (var i = 0; i < srcSheets.length; i++) {
    var src = srcSheets[i];
    if (src.getName && src.getName() === 'BOSSview') continue;
    var copied = src.copyTo(newSs);
    copied.setName(src.getName());
    if (!bossCopy && i === 0 && defaultSheet) {
      // If BOSSview didn't exist and this is the first copied sheet, now safe to remove default
      newSs.deleteSheet(defaultSheet);
      defaultSheet = null;
    }
  }

  // Optional: mirror some spreadsheet-level settings
  try { newSs.setSpreadsheetTimeZone(templateSs.getSpreadsheetTimeZone()); } catch (e) {}

  // 4) Share with the student
  try {
    newFile.addEditor(studentEmail);
  } catch (e) {
    // If external sharing is restricted, don't fail the flow. Log and continue.
    console.log('share failed for ' + studentEmail + ': ' + e);
  }

  // 5) Upsert entry in the class registry
  try {
    upsertRegistryEntry_(newSs.getId(), newSs.getUrl(), companyName, studentEmail, '');
  } catch (e) { /* non-fatal */ }
  return newSs.getUrl();
}

/**
 * Looks up the registry for an existing spreadsheet URL for a given student email.
 * Returns the most recent match's URL or null if none found.
 * @param {string} studentEmail
 * @returns {string|null}
 */
function findExistingSheetUrlForEmail_(studentEmail) {
  var regSs = SpreadsheetApp.openById(REGISTRY_SPREADSHEET_ID);
  var regSheet = regSs.getSheetByName(REGISTRY_SHEET_NAME);
  if (!regSheet) return null;
  var lastRow = regSheet.getLastRow();
  if (lastRow < 2) return null; // no data rows
  // Read data rows. Ensure we pull enough columns to include alt emails if present.
  var numCols = Math.max(11, regSheet.getLastColumn());
  var rows = regSheet.getRange(2, 1, lastRow - 1, numCols).getValues();
  // Search from bottom (most recent) to top
  for (var i = rows.length - 1; i >= 0; i--) {
    var row = rows[i];
    // Columns (0-based): 3=studentEmail, 4=studentEmail2, 5=studentEmail3
    var emailCandidates = [
      row[3] != null ? String(row[3]) : '',
      row[4] != null ? String(row[4]) : '',
      row[5] != null ? String(row[5]) : ''
    ];
    var normalizedInput = String(studentEmail || '').toLowerCase();
    if (emailCandidates.some(function(e){ return e && e.toLowerCase() === normalizedInput; })) {
      var url = row[1]; // column 2
      if (url) return String(url);
    }
  }
  return null;
}

// Protections removed per user request

/**
 * Inserts or updates a row in the class registry with spreadsheet and student details.
 * Keeps createdAt stable on updates and refreshes lastUpdated.
 * Expects registry headers: spreadsheetId, spreadsheetUrl, company, studentEmail, createdAt, cohort, status, notes, lastUpdated
 * @param {string} spreadsheetId - Target sheet ID.
 * @param {string} spreadsheetUrl - Target sheet URL.
 * @param {string} company - Company name.
 * @param {string} studentEmail - Student email.
 * @param {string} cohort - Cohort identifier (optional; can be empty).
 */
function upsertRegistryEntry_(spreadsheetId, spreadsheetUrl, company, studentEmail, cohort) {
  console.log('[registry] open');
  var regSs = SpreadsheetApp.openById(REGISTRY_SPREADSHEET_ID);
  var regSheet = regSs.getSheetByName(REGISTRY_SHEET_NAME);
  if (!regSheet) { console.log('[registry] create sheet'); regSheet = regSs.insertSheet(REGISTRY_SHEET_NAME); }

  var lastRow = regSheet.getLastRow();
  var values = lastRow > 0 ? regSheet.getRange(1, 1, lastRow, Math.max(11, regSheet.getLastColumn())).getValues() : [];

  // Ensure header exists; if not, set it
  var expectedHeader = ['spreadsheetId','spreadsheetUrl','company','studentEmail','studentEmail2','studentEmail3','createdAt','cohort','status','notes','lastUpdated'];
  var needHeader = values.length === 0 || !values[0] || String(values[0][0]).toLowerCase() !== 'spreadsheetid' || values[0].length < expectedHeader.length;
  if (needHeader) {
    regSheet.getRange(1, 1, 1, expectedHeader.length).setValues([expectedHeader]);
    values = regSheet.getRange(1, 1, regSheet.getLastRow(), Math.max(expectedHeader.length, regSheet.getLastColumn())).getValues();
    console.log('[registry] wrote header');
  }

  var now = new Date();
  var foundRow = -1;
  for (var r = 2; r <= regSheet.getLastRow(); r++) {
    var existingId = regSheet.getRange(r, 1).getValue();
    if (existingId === spreadsheetId) { foundRow = r; break; }
  }

  if (foundRow > 0) {
    var createdAt = regSheet.getRange(foundRow, 5).getValue() || now;
    var email2 = regSheet.getRange(foundRow, 5).getValue(); // studentEmail2
    var email3 = regSheet.getRange(foundRow, 6).getValue(); // studentEmail3
    regSheet.getRange(foundRow, 1, 1, expectedHeader.length).setValues([[
      spreadsheetId, spreadsheetUrl, company, studentEmail, email2, email3, createdAt, cohort,
      regSheet.getRange(foundRow, 9).getValue(), // status
      regSheet.getRange(foundRow,10).getValue(), // notes
      now
    ]]);
    console.log('[registry] updated row ' + foundRow);
  } else {
    regSheet.appendRow([spreadsheetId, spreadsheetUrl, company, studentEmail, '', '', now, cohort, '', '', now]);
    console.log('[registry] appended row');
  }
  SpreadsheetApp.flush();
  return true;
}