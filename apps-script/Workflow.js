function createCaseFromSubmission_(input) {
  validatePublicCaseInput_(input);
  const ss = getSpreadsheet_();
  const appUrl = requireAppUrl_(ss);
  const rootFolder = getDriveFolder_();
  const now = nowIso_();
  const publicId = createPublicCaseId_();
  const token = createToken_();
  const caseId = Utilities.getUuid();
  const messageId = Utilities.getUuid();
  const caseFolder = getOrCreateSubFolder_(rootFolder, publicId);
  const studentEmail = String(input.email).trim().toLowerCase();
  grantViewerAccessSafe_(caseFolder, studentEmail);

  const caseRow = {
    id: caseId,
    public_id: publicId,
    token_hash: sha256Hex_(token),
    token_revoked_at: "",
    student_case_url: `${appUrl}/case/${token}`,
    status: "pending",
    student_email: studentEmail,
    student_department: String(input.department || "").trim(),
    student_name: String(input.name || "").trim(),
    category: String(input.category || "").trim(),
    subject: String(input.subject || "").trim(),
    desired_outcome: String(input.desiredOutcome || "").trim(),
    assigned_to: "",
    assigned_to_email: "",
    created_at: now,
    updated_at: now,
    last_student_message_at: now,
    last_staff_message_at: "",
    closed_at: "",
  };

  appendObject_(ss, "Cases", caseRow);
  appendObject_(ss, "Messages", {
    id: messageId,
    case_id: caseId,
    author_id: "",
    author_email: studentEmail,
    author_type: "student",
    body_text: caseRow.subject,
    body_html: "",
    created_at: now,
  });

  const files = input.files || [];
  if (files.length > 10) throw new Error("最多上傳 10 個檔案。");
  files.forEach((fileInput) => {
    const bytes = Utilities.base64Decode(fileInput.data);
    if (bytes.length > 8 * 1024 * 1024) throw new Error(`${fileInput.name} 超過 8MB 限制。`);
    if (!isAllowedUpload_(fileInput.mimeType)) throw new Error(`${fileInput.name} 檔案格式不支援。`);
    const blob = Utilities.newBlob(bytes, fileInput.mimeType, sanitizeFileName_(fileInput.name));
    const file = caseFolder.createFile(blob);
    grantViewerAccessSafe_(file, studentEmail);
    appendObject_(ss, "Attachments", {
      id: Utilities.getUuid(),
      case_id: caseId,
      message_id: messageId,
      drive_file_id: file.getId(),
      drive_url: file.getUrl(),
      file_name: file.getName(),
      file_type: file.getMimeType(),
      file_size: bytes.length,
      uploaded_by_type: "student",
      created_at: now,
    });
  });

  sendCaseEmail_(caseRow, token, `【清華大學學生會】申訴案件已受理：${publicId}`, null, ss);
  notifyStaff_(ss, `新申訴案件 ${publicId}`, `${caseRow.student_name}（${caseRow.student_department}）送出 ${caseRow.category}`);
  return { publicId, caseId };
}

function listCases_(ss, payload) {
  const days = Number(payload.days || 30);
  const query = String(payload.query || "").trim().toLowerCase();
  const since = new Date();
  since.setDate(since.getDate() - days);

  let cases = readObjects_(ss, "Cases").filter((item) => {
    const created = new Date(item.created_at);
    return created >= since;
  });

  if (query) {
    cases = cases.filter((item) =>
      [
        item.public_id,
        item.student_email,
        item.student_name,
        item.student_department,
        item.category,
        item.subject,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }

  cases.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return { cases: cases.slice(0, 100), total: cases.length };
}

function getCaseByToken_(ss, token) {
  const tokenHash = sha256Hex_(token || "");
  const match = readObjects_(ss, "Cases").find(
    (item) => item.token_hash === tokenHash && !item.token_revoked_at,
  );
  if (!match) return null;
  return {
    case: match,
    messages: readObjects_(ss, "Messages").filter((row) => row.case_id === match.id),
    attachments: readObjects_(ss, "Attachments").filter((row) => row.case_id === match.id),
  };
}

function getAdminCase_(ss, caseId) {
  const match = readObjects_(ss, "Cases").find((item) => item.id === caseId);
  if (!match) throw new Error("Case not found.");
  return composeCase_(ss, match);
}

function composeCase_(ss, caseRow) {
  const caseId = caseRow.id;
  return {
    case: caseRow,
    messages: readObjects_(ss, "Messages").filter((row) => row.case_id === caseId),
    attachments: readObjects_(ss, "Attachments").filter((row) => row.case_id === caseId),
    drafts: readObjects_(ss, "DraftReplies").filter((row) => row.case_id === caseId),
    reviews: readObjects_(ss, "ReviewRequests").filter((row) => row.case_id === caseId),
  };
}

function addStudentMessage_(ss, payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    return saveStudentMessage_(ss, payload);
  } finally {
    lock.releaseLock();
  }
}

function saveStudentMessage_(ss, payload) {
  const tokenHash = sha256Hex_(payload.token || "");
  const existing = findRow_(ss, "Cases", (row) => row.token_hash === tokenHash && !row.token_revoked_at);
  if (!existing) throw new Error("案件連結無效。");
  const caseData = { case: existing.object };
  const now = nowIso_();
  const caseId = caseData.case.id;
  const publicId = caseData.case.public_id;
  const requestId = String(payload.requestId || "");
  if (requestId && !/^[0-9a-f-]{36}$/i.test(requestId)) throw new Error("無效的送件識別碼。");
  const messageId = requestId || Utilities.getUuid();
  const savedMessage = readObjects_(ss, "Messages").find((row) => row.id === messageId && row.case_id === caseId);
  if (savedMessage) return { ok: true };

  let bodyText = String(payload.body || "").trim();
  const files = payload.files || [];
  if (files.length > 3) throw new Error("每次最多上傳 3 個檔案。");

  if (!bodyText && files.length === 0) {
    throw new Error("請填寫補充說明或選取要上傳的檔案。");
  }

  if (files.length > 0) {
    const rootFolder = getDriveFolder_();
    const caseFolder = getOrCreateSubFolder_(rootFolder, publicId);
    grantViewerAccessSafe_(caseFolder, caseData.case.student_email);
    const uploadedNames = [];

    const savedAttachments = readObjects_(ss, "Attachments").filter((row) => row.message_id === messageId && row.case_id === caseId);
    files.forEach((fileInput, index) => {
      const attachmentId = `${messageId}-${index}`;
      const saved = savedAttachments.find((row) => row.id === attachmentId);
      if (saved) { uploadedNames.push(saved.file_name); return; }
      const bytes = Utilities.base64Decode(fileInput.data);
      if (bytes.length > 8 * 1024 * 1024) throw new Error(`${fileInput.name} 超過 8MB 限制。`);
      if (!isAllowedUpload_(fileInput.mimeType)) throw new Error(`${fileInput.name} 檔案格式不支援。`);
      const blob = Utilities.newBlob(bytes, fileInput.mimeType, sanitizeFileName_(fileInput.name));
      const file = caseFolder.createFile(blob);
      grantViewerAccessSafe_(file, caseData.case.student_email);
      uploadedNames.push(file.getName());

      appendObject_(ss, "Attachments", {
        id: attachmentId,
        case_id: caseId,
        message_id: messageId,
        drive_file_id: file.getId(),
        drive_url: file.getUrl(),
        file_name: file.getName(),
        file_type: file.getMimeType(),
        file_size: bytes.length,
        uploaded_by_type: "student",
        created_at: now,
      });
    });

    if (!bodyText) {
      bodyText = `【學生補充附件】：${uploadedNames.join("、")}`;
    }
  }

  updateObject_(ss, "Cases", existing.rowNumber, {
    ...existing.object,
    updated_at: now,
    last_student_message_at: now,
  });

  appendObject_(ss, "Messages", {
    id: messageId,
    case_id: caseId,
    author_id: "",
    author_email: caseData.case.student_email,
    author_type: "student",
    body_text: bodyText,
    body_html: "",
    created_at: now,
  });

  notifyStaff_(
    ss,
    `學生新增案件回覆與補件 ${publicId}`,
    `${caseData.case.student_name || "學生"}（${caseData.case.student_department || ""}）新增補充資料：\n${bodyText}`.slice(0, 300)
  );

  return { ok: true };
}

function saveDraftReply_(ss, payload) {
  const now = nowIso_();
  const staff = payload.staff;
  const existingCase = findRow_(ss, "Cases", (row) => row.id === payload.caseId);
  if (!existingCase) throw new Error("Case not found.");
  if (!existingCase.object.assigned_to) {
    updateObject_(ss, "Cases", existingCase.rowNumber, {
      ...existingCase.object,
      assigned_to: staff.id,
      assigned_to_email: staff.email,
      updated_at: now,
    });
  }

  const existingDraft = findRow_(
    ss,
    "DraftReplies",
    (row) => row.case_id === payload.caseId && row.author_email === staff.email,
  );
  const draft = {
    id: existingDraft ? existingDraft.object.id : Utilities.getUuid(),
    case_id: payload.caseId,
    author_id: staff.id,
    author_email: staff.email,
    body_html: payload.html,
    body_json: payload.json || "{}",
    created_at: existingDraft ? existingDraft.object.created_at : now,
    updated_at: now,
  };
  if (existingDraft) updateObject_(ss, "DraftReplies", existingDraft.rowNumber, draft);
  else appendObject_(ss, "DraftReplies", draft);
  return draft;
}

function submitReview_(ss, payload) {
  const staff = payload.staff;
  const review = {
    id: Utilities.getUuid(),
    case_id: payload.caseId,
    requested_by: staff.id,
    requested_by_email: staff.email,
    reviewed_by: "",
    reviewed_by_email: "",
    decision: payload.decision,
    status: "pending",
    body_html: payload.html,
    body_json: payload.json || "{}",
    created_at: nowIso_(),
    reviewed_at: "",
  };
  appendObject_(ss, "ReviewRequests", review);
  notifyStaff_(ss, "部員送出審核", `${staff.email} 送出 ${payload.decision === "accepted" ? "受理" : "不受理"} 回覆審核`);
  return review;
}

function approveReview_(ss, payload) {
  const staff = payload.staff;
  const reviewRow = findRow_(ss, "ReviewRequests", (row) => row.id === payload.reviewId);
  if (!reviewRow) throw new Error("Review not found.");
  const caseRow = findRow_(ss, "Cases", (row) => row.id === reviewRow.object.case_id);
  if (!caseRow) throw new Error("Case not found.");

  const now = nowIso_();
  const nextStatus = reviewRow.object.decision === "accepted" ? "in_progress" : "rejected";
  updateObject_(ss, "ReviewRequests", reviewRow.rowNumber, {
    ...reviewRow.object,
    status: "approved",
    reviewed_by: staff.id,
    reviewed_by_email: staff.email,
    body_html: payload.html,
    reviewed_at: now,
  });
  updateObject_(ss, "Cases", caseRow.rowNumber, {
    ...caseRow.object,
    status: nextStatus,
    updated_at: now,
    last_staff_message_at: now,
    closed_at: nextStatus === "rejected" ? now : "",
  });
  appendObject_(ss, "Messages", {
    id: Utilities.getUuid(),
    case_id: caseRow.object.id,
    author_id: staff.id,
    author_email: staff.email,
    author_type: "minister",
    body_text: stripHtml_(payload.html),
    body_html: payload.html,
    created_at: now,
  });
  sendCaseEmail_(caseRow.object, "", `【清華大學學生會】案件 ${caseRow.object.public_id} 有新的回覆`, payload.html, ss);
  return { caseId: caseRow.object.id };
}

function closeStaleCases() {
  const ss = getSpreadsheet_();
  const now = new Date();
  const rows = readObjects_(ss, "Cases");
  let closed = 0;
  rows.forEach((item) => {
    if (!shouldAutoClose_(item, now)) return;
    const existing = findRow_(ss, "Cases", (row) => row.id === item.id);
    const closedAt = now.toISOString();
    updateObject_(ss, "Cases", existing.rowNumber, {
      ...existing.object,
      status: "closed",
      closed_at: closedAt,
      updated_at: closedAt,
    });
    appendObject_(ss, "AuditLogs", {
      id: Utilities.getUuid(),
      actor_id: "system",
      actor_email: "",
      case_id: item.id,
      action: "auto_close_stale_case",
      metadata: JSON.stringify({ staleDays: 14 }),
      created_at: closedAt,
    });
    sendCaseEmail_(item, "", `【清華大學學生會】案件 ${item.public_id} 已自動結案`, "學權組織回覆後已超過 14 天未收到您的補充回覆，系統已將案件設為已結案。", ss);
    closed += 1;
  });
  return { closed };
}

function shouldAutoClose_(item, now) {
  if (item.status !== "in_progress" || !item.last_staff_message_at) return false;
  const lastStaff = new Date(item.last_staff_message_at);
  const lastStudent = item.last_student_message_at ? new Date(item.last_student_message_at) : null;
  if (lastStudent && lastStudent > lastStaff) return false;
  return now.getTime() - lastStaff.getTime() >= 14 * 24 * 60 * 60 * 1000;
}

// Run manually for a legacy case that has no stored link. Does not send email.
// The previous token cannot be recovered from its hash; it is replaced once.
function restoreStudentCaseLink(publicId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = getSpreadsheet_();
    const existing = findRow_(ss, "Cases", (row) => row.public_id === publicId);
    if (!existing) throw new Error("Case not found.");
    if (existing.object.token_revoked_at) throw new Error("案件連結已停用。");
    if (existing.object.student_case_url) return existing.object.student_case_url;
    const token = createToken_();
    const link = `${requireAppUrl_(ss)}/case/${token}`;
    updateObject_(ss, "Cases", existing.rowNumber, {
      ...existing.object,
      token_hash: sha256Hex_(token),
      student_case_url: link,
    });
    return link;
  } finally {
    lock.releaseLock();
  }
}

// Run manually in the Apps Script editor to grant complainant access to a case folder and its attachments.
function grantCaseDrivePermissions(publicId) {
  const ss = getSpreadsheet_();
  const match = readObjects_(ss, "Cases").find(
    (item) => item.public_id === publicId || item.id === publicId,
  );
  if (!match) throw new Error("Case not found.");
  if (!match.student_email) throw new Error("Case has no student email.");

  const rootFolder = getDriveFolder_();
  const folders = rootFolder.getFoldersByName(match.public_id);
  if (!folders.hasNext()) return { ok: false, message: "Folder not found." };
  const folder = folders.next();
  grantViewerAccessSafe_(folder, match.student_email);

  const files = folder.getFiles();
  let count = 0;
  while (files.hasNext()) {
    const file = files.next();
    grantViewerAccessSafe_(file, match.student_email);
    count++;
  }
  return { ok: true, fileCount: count };
}
