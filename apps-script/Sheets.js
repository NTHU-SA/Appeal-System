function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  if (!id) throw new Error("Missing SHEET_ID. Run setupCampusVoice() first.");
  return SpreadsheetApp.openById(id);
}

function getOrCreateSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("SHEET_ID");
  if (id) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.create(`${APP_TITLE} Data`);
  props.setProperty("SHEET_ID", ss.getId());
  return ss;
}

function ensureSheet_(ss, name, headers) {
  const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  const width = sheet.getLastColumn();
  const current = width ? sheet.getRange(1, 1, 1, width).getValues()[0] : [];
  // Only append columns: never clear existing case data during schema upgrades.
  if (current.some((header, index) => header !== headers[index])) {
    throw new Error(`Sheet ${name} 欄位順序不符，請先確認欄位；系統未更動既有資料。`);
  }
  if (current.length < headers.length) {
    sheet.getRange(1, current.length + 1, 1, headers.length - current.length)
      .setValues([headers.slice(current.length)]);
  }
  if (!current.length) sheet.setFrozenRows(1);
  return sheet;
}

function readObjects_(ss, tabName) {
  const sheet = ss.getSheetByName(tabName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values[0];
  return values.slice(1).filter((row) => row.some(Boolean)).map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = normalizeCell_(row[index]);
    });
    return obj;
  });
}

function appendObject_(ss, tabName, object) {
  const sheet = ensureSheet_(ss, tabName, TAB_HEADERS[tabName]);
  sheet.appendRow(TAB_HEADERS[tabName].map((key) => serializeCell_(object[key])));
  return object;
}

function updateObject_(ss, tabName, rowNumber, object) {
  const sheet = ensureSheet_(ss, tabName, TAB_HEADERS[tabName]);
  sheet
    .getRange(rowNumber, 1, 1, TAB_HEADERS[tabName].length)
    .setValues([TAB_HEADERS[tabName].map((key) => serializeCell_(object[key]))]);
  return object;
}

function findRow_(ss, tabName, predicate) {
  const objects = readObjects_(ss, tabName);
  const index = objects.findIndex(predicate);
  return index === -1 ? null : { rowNumber: index + 2, object: objects[index] };
}

function writeSettings_(ss, values) {
  Object.keys(values).forEach((key) => {
    const existing = findRow_(ss, "Settings", (row) => row.key === key);
    const object = { key, value: values[key] };
    if (existing) updateObject_(ss, "Settings", existing.rowNumber, object);
    else appendObject_(ss, "Settings", object);
  });
}

function normalizeCell_(value) {
  if (value instanceof Date) return value.toISOString();
  return value === undefined || value === null ? "" : value;
}

function serializeCell_(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return value;
}
