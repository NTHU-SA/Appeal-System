function createCaseFromSubmission_(input) {
  validatePublicCaseInput_(input);
  const ss = getSpreadsheet_();
  const rootFolder = getDriveFolder_();
  const now = nowIso_();
  const publicId = createPublicCaseId_();
  const token = createToken_();
  const caseId = Utilities.getUuid();
  const messageId = Utilities.getUuid();
  const caseFolder = getOrCreateSubFolder_(rootFolder, publicId);
  const studentEmail = String(input.email).trim().toLowerCase();

  const caseRow = {
    id: caseId,
    public_id: publicId,
    token_hash: sha256Hex_(token),
    token_revoked_at: "",
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

  (input.files || []).forEach((fileInput) => {
    const bytes = Utilities.base64Decode(fileInput.data);
    if (bytes.length > 8 * 1024 * 1024) throw new Error(`${fileInput.name} 超過 8MB 限制。`);
    if (!isAllowedUpload_(fileInput.mimeType)) throw new Error(`${fileInput.name} 檔案格式不支援。`);
    const blob = Utilities.newBlob(bytes, fileInput.mimeType, sanitizeFileName_(fileInput.name));
    const file = caseFolder.createFile(blob);
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

  sendCaseEmail_(caseRow, token, "我們已收到您的申訴");
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
  return composeCase_(ss, match);
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
  const caseData = getCaseByToken_(ss, payload.token);
  if (!caseData) throw new Error("案件連結無效。");
  const now = nowIso_();
  appendObject_(ss, "Messages", {
    id: Utilities.getUuid(),
    case_id: caseData.case.id,
    author_id: "",
    author_email: caseData.case.student_email,
    author_type: "student",
    body_text: payload.body,
    body_html: "",
    created_at: now,
  });
  const existing = findRow_(ss, "Cases", (row) => row.id === caseData.case.id);
  updateObject_(ss, "Cases", existing.rowNumber, {
    ...existing.object,
    updated_at: now,
    last_student_message_at: now,
  });
  notifyStaff_(ss, `學生新增案件回覆 ${caseData.case.public_id}`, String(payload.body || "").slice(0, 180));
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
  sendCaseEmail_(caseRow.object, "", `案件 ${caseRow.object.public_id} 有新的回覆`, payload.html);
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
    sendCaseEmail_(item, "", `案件 ${item.public_id} 已自動結案`, "學權組織回覆後已超過 14 天未收到您的補充回覆，系統已將案件設為已結案。");
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
