const PUBLIC_CASE_UPLOAD_FOLDER = "CampusVoice Pending Uploads";
const PUBLIC_CASE_UPLOAD_TTL = 24 * 60 * 60 * 1000;

function withPublicCaseLock_(operation) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    return operation();
  } finally {
    lock.releaseLock();
  }
}

function publicCaseRequestId_(value) {
  if (typeof value !== "string" || !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(value)) {
    throw new Error("無效的送件識別碼。");
  }
  return value;
}

function findPublicCaseFolder_(parent, name) {
  const folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : null;
}

function stagePublicCaseFile_(ss, input) {
  const requestId = publicCaseRequestId_(input.requestId);
  if (!Number.isInteger(input.slot) || input.slot < 0 || input.slot >= 10) {
    throw new Error("附件數量超過限制。");
  }
  if (readObjectsByColumn_(ss, "Cases", "id", requestId).length) {
    throw new Error("此送件已開始建案，請重試送件確認。");
  }

  const blob = publicCaseFileBlob_(input.file);
  const uploads = getOrCreateSubFolder_(getDriveFolder_(), PUBLIC_CASE_UPLOAD_FOLDER);
  const folder = getOrCreateSubFolder_(uploads, requestId);
  const name = `${input.slot}-${blob.getName()}`;
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (!file.getName().startsWith(`${input.slot}-`)) continue;
    if (file.getName() !== name) throw new Error("附件已變更，請重新送件。");
    return { fileId: file.getId() };
  }
  return { fileId: folder.createFile(blob.setName(name)).getId() };
}

function submitStagedPublicCase_(ss, input) {
  const requestId = publicCaseRequestId_(input.requestId);
  validatePublicCaseInput_(input);
  if (!Array.isArray(input.fileIds) || input.fileIds.length > 10 ||
      new Set(input.fileIds).size !== input.fileIds.length ||
      !input.fileIds.every((id) => typeof id === "string" && /^[\w-]{1,128}$/.test(id))) {
    throw new Error("附件清單不完整，請重新選擇。");
  }

  const saved = readObjectsByColumn_(ss, "Cases", "id", requestId)[0];
  if (saved) {
    if (saved.student_email !== String(input.email).trim().toLowerCase()) {
      throw new Error("無法確認此送件。");
    }
    if (readObjectsByColumn_(ss, "Messages", "id", requestId).length) {
      return { publicId: saved.public_id };
    }
  }

  const root = getDriveFolder_();
  const uploads = findPublicCaseFolder_(root, PUBLIC_CASE_UPLOAD_FOLDER);
  const staging = uploads && findPublicCaseFolder_(uploads, requestId);
  const caseRow = saved || buildPublicCase_(input, ss, requestId);
  const existingFolder = saved && findPublicCaseFolder_(root, saved.public_id);
  const savedAttachments = saved ? readObjectsByColumn_(ss, "Attachments", "case_id", requestId) : [];
  const completedIds = new Set(savedAttachments.map((row) => row.drive_file_id));
  const files = new Map();

  // Validate every receipt against this request's folders before writing a case.
  for (const folder of [staging, existingFolder]) {
    if (!folder) continue;
    const entries = folder.getFiles();
    while (entries.hasNext()) {
      const file = entries.next();
      files.set(file.getId(), { file, staged: folder === staging });
    }
  }
  if (input.fileIds.some((id) => !files.has(id)) ||
      [...files.keys()].some((id) => !input.fileIds.includes(id))) {
    throw new Error("附件尚未上傳完成，請重新選擇。");
  }

  const caseFolder = existingFolder || getOrCreateSubFolder_(root, caseRow.public_id);
  if (!saved) appendObject_(ss, "Cases", publicCaseCells_(caseRow));

  for (const id of input.fileIds) {
    const { file, staged } = files.get(id);
    if (completedIds.has(id)) continue;
    // A moved file can be found in the case folder after an interrupted attempt.
    // Record its display name before renaming so retrying cannot remove a real prefix.
    const originalName = file.getDescription() || file.getName().replace(/^\d-/, "");
    file.setDescription(originalName);
    if (staged) file.moveTo(caseFolder);
    file.setName(originalName);
    appendPublicCaseAttachment_(ss, caseRow, requestId, file, `${requestId}-${id}`);
  }
  grantViewerAccessSafe_(caseFolder, caseRow.student_email);
  appendPublicCaseMessage_(ss, caseRow, requestId);
  SpreadsheetApp.flush();

  // The case is durable at this point. A mail or cleanup failure must not
  // return a failed submission or prompt a duplicate case.
  try {
    if (staging) staging.setTrashed(true);
  } catch {
    console.warn("Could not remove a public intake upload folder.");
  }
  try {
    sendPublicCaseConfirmation_(ss, caseRow);
  } catch {
    console.warn("Could not send public intake notifications.");
  }
  return { publicId: caseRow.public_id };
}

function purgePublicCaseUploads_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const uploads = findPublicCaseFolder_(getDriveFolder_(), PUBLIC_CASE_UPLOAD_FOLDER);
    if (!uploads) return;
    const cutoff = Date.now() - PUBLIC_CASE_UPLOAD_TTL;
    const folders = uploads.getFolders();
    while (folders.hasNext()) {
      const folder = folders.next();
      if (folder.getDateCreated().getTime() < cutoff) folder.setTrashed(true);
    }
  } catch {
    console.warn("Could not clean up expired public intake uploads.");
  } finally {
    lock.releaseLock();
  }
}
