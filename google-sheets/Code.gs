/**
 * Maryam Institute Website -> Google Sheets Form Receiver
 * Creates/uses two separate sheets:
 *   Applications
 *   Messages
 */
function setupSheets_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const apps = getOrCreateSheet_(ss, 'Applications', [
    'Timestamp','Full Name','Father / Guardian','Email','Phone','CNIC / B-Form','Date of Birth','Program','Qualification','Additional Information'
  ]);
  const msgs = getOrCreateSheet_(ss, 'Messages', [
    'Timestamp','Name','Email','Subject','Message'
  ]);
  return {apps, msgs};
}

function getOrCreateSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1,1,1,headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function doPost(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    const type = String(p.type || '').toLowerCase();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = setupSheets_();

    if (type === 'application') {
      sheets.apps.appendRow([
        new Date(),
        p.name || '', p.father_name || '', p.email || '', p.phone || '',
        p.cnic || '', p.date_of_birth || '', p.program || '',
        p.qualification || '', p.message || ''
      ]);
      return json_({ok:true, type:'application'});
    }

    if (type === 'message') {
      sheets.msgs.appendRow([
        new Date(), p.name || '', p.email || '', p.subject || '', p.message || ''
      ]);
      return json_({ok:true, type:'message'});
    }

    return json_({ok:false, error:'Unknown submission type'});
  } catch (err) {
    return json_({ok:false, error:String(err)});
  }
}

function doGet(e) {
  return json_({ok:true, service:'Maryam Institute Forms', message:'Endpoint is active'});
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
