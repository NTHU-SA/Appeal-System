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

function formResponseMap_(response) {
  const map = {};
  response.getItemResponses().forEach((itemResponse) => {
    const item = itemResponse.getItem();
    if (item.getType().toString() === "FILE_UPLOAD") return;
    map[item.getTitle()] = itemResponse.getResponse();
  });
  return map;
}

function fileUploadIds_(response) {
  return response
    .getItemResponses()
    .filter((itemResponse) => itemResponse.getItem().getType().toString() === "FILE_UPLOAD")
    .map((itemResponse) => itemResponse.getResponse())
    .reduce((all, value) => all.concat(value || []), []);
}

function stripHtml_(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
