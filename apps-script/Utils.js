function assertSecret_(secret) {
  const expected = PropertiesService.getScriptProperties().getProperty("SHARED_SECRET");
  if (!expected || secret !== expected) throw new Error("Unauthorized.");
}

function json_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function nowIso_() {
  return new Date().toISOString();
}

function createToken_() {
  return `${Utilities.getUuid()}${Utilities.getUuid()}`.replace(/-/g, "");
}

function createPublicCaseId_() {
  const date = Utilities.formatDate(new Date(), "Asia/Taipei", "yyyyMMdd");
  const suffix = Utilities.getUuid().slice(0, 8).toUpperCase();
  return `CV-${date}-${suffix}`;
}

function sha256Hex_(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value)
    .map((byte) => {
      const value = byte < 0 ? byte + 256 : byte;
      return `0${value.toString(16)}`.slice(-2);
    })
    .join("");
}

function stripHtml_(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function validatePublicCaseInput_(input) {
  if (!input) throw new Error("送件資料不可為空。");
  const email = String(input.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("請輸入有效的電子郵件。");
  ["department", "name", "category", "subject", "desiredOutcome"].forEach((key) => {
    if (!String(input[key] || "").trim()) throw new Error("請填寫所有必填欄位。");
  });
  if (String(input.subject || "").trim().length < 8) throw new Error("申訴問題請至少描述 8 個字。");
}

function isAllowedUpload_(mimeType) {
  return [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
  ].includes(String(mimeType || ""));
}

function sanitizeFileName_(name) {
  return String(name || "attachment").replace(/[\\/:*?"<>|]/g, "_").slice(0, 120);
}
