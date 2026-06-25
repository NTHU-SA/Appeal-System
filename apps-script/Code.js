const APP_TITLE = "CampusVoice";
const TAB_HEADERS = {
  Cases: [
    "id",
    "public_id",
    "token_hash",
    "token_revoked_at",
    "status",
    "student_email",
    "student_department",
    "student_name",
    "category",
    "subject",
    "desired_outcome",
    "assigned_to",
    "assigned_to_email",
    "created_at",
    "updated_at",
    "last_student_message_at",
    "last_staff_message_at",
    "closed_at",
  ],
  Messages: [
    "id",
    "case_id",
    "author_id",
    "author_email",
    "author_type",
    "body_text",
    "body_html",
    "created_at",
  ],
  Attachments: [
    "id",
    "case_id",
    "message_id",
    "drive_file_id",
    "drive_url",
    "file_name",
    "file_type",
    "file_size",
    "uploaded_by_type",
    "created_at",
  ],
  DraftReplies: [
    "id",
    "case_id",
    "author_id",
    "author_email",
    "body_html",
    "body_json",
    "created_at",
    "updated_at",
  ],
  ReviewRequests: [
    "id",
    "case_id",
    "requested_by",
    "requested_by_email",
    "reviewed_by",
    "reviewed_by_email",
    "decision",
    "status",
    "body_html",
    "body_json",
    "created_at",
    "reviewed_at",
  ],
  Members: ["id", "email", "role", "created_at", "updated_at"],
  AuditLogs: ["id", "actor_id", "actor_email", "case_id", "action", "metadata", "created_at"],
  Settings: ["key", "value"],
};

function setupCampusVoice() {
  const props = PropertiesService.getScriptProperties();
  const ss = getOrCreateSpreadsheet_();
  Object.keys(TAB_HEADERS).forEach((name) => ensureSheet_(ss, name, TAB_HEADERS[name]));

  const rootFolder = getOrCreateDriveFolder_(props);
  const form = getOrCreateForm_(props, ss);
  installFormTrigger_(form);
  installAutoCloseTrigger_();

  const deployerEmail = Session.getActiveUser().getEmail();
  if (deployerEmail) {
    upsertMemberRow_(ss, deployerEmail, "minister");
  }

  const sharedSecret = props.getProperty("SHARED_SECRET") || Utilities.getUuid();
  props.setProperties(
    {
      SHEET_ID: ss.getId(),
      DRIVE_FOLDER_ID: rootFolder.getId(),
      FORM_ID: form.getId(),
      FORM_URL: form.getPublishedUrl(),
      SHARED_SECRET: sharedSecret,
    },
    true,
  );
  writeSettings_(ss, {
    SHEET_ID: ss.getId(),
    DRIVE_FOLDER_ID: rootFolder.getId(),
    FORM_ID: form.getId(),
    FORM_URL: form.getPublishedUrl(),
    SHARED_SECRET: sharedSecret,
  });

  console.log(`Sheet: ${ss.getUrl()}`);
  console.log(`Form: ${form.getPublishedUrl()}`);
  console.log(`Drive folder: ${rootFolder.getUrl()}`);
  console.log(`Shared secret: ${sharedSecret}`);
}

function onFormSubmit(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = getSpreadsheet_();
    const rootFolder = getDriveFolder_();
    const itemMap = formResponseMap_(e.response);
    const now = nowIso_();
    const publicId = createPublicCaseId_();
    const token = createToken_();
    const caseId = Utilities.getUuid();
    const messageId = Utilities.getUuid();

    const caseFolder = getOrCreateSubFolder_(rootFolder, publicId);
    const studentEmail =
      String(itemMap["電子郵件"] || e.response.getRespondentEmail() || "").trim().toLowerCase();
    if (!studentEmail) throw new Error("Missing student email.");

    const caseRow = {
      id: caseId,
      public_id: publicId,
      token_hash: sha256Hex_(token),
      token_revoked_at: "",
      status: "pending",
      student_email: studentEmail,
      student_department: itemMap["系級"] || "",
      student_name: itemMap["姓名"] || "",
      category: itemMap["申訴種類"] || "",
      subject: itemMap["申訴問題"] || "",
      desired_outcome: itemMap["希望得到的處理方式"] || "",
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

    const fileIds = fileUploadIds_(e.response);
    fileIds.forEach((fileId) => {
      const file = DriveApp.getFileById(fileId);
      file.moveTo(caseFolder);
      appendObject_(ss, "Attachments", {
        id: Utilities.getUuid(),
        case_id: caseId,
        message_id: messageId,
        drive_file_id: file.getId(),
        drive_url: file.getUrl(),
        file_name: file.getName(),
        file_type: file.getMimeType(),
        file_size: file.getSize(),
        uploaded_by_type: "student",
        created_at: now,
      });
    });

    sendCaseEmail_(caseRow, token, "我們已收到您的申訴");
    notifyStaff_(ss, `新申訴案件 ${publicId}`, `${caseRow.student_name}（${caseRow.student_department}）送出 ${caseRow.category}`);
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents || "{}");
    assertSecret_(request.secret);
    const data = handleAction_(request.action, request.payload || {});
    return json_({ ok: true, data });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: err && err.message ? err.message : String(err) });
  }
}

function handleAction_(action, payload) {
  const ss = getSpreadsheet_();
  switch (action) {
    case "getMemberRole":
      return { role: getMemberRole_(ss, payload.email) };
    case "listMembers":
      return readObjects_(ss, "Members")
        .filter((row) => row.role === "minister" || row.role === "member")
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    case "upsertMember":
      return upsertMemberRow_(ss, payload.email, payload.role || "member");
    case "removeMember":
      return removeMemberRow_(ss, payload.id);
    case "listCases":
      return listCases_(ss, payload);
    case "getCaseByToken":
      return getCaseByToken_(ss, payload.token);
    case "getAdminCase":
      return getAdminCase_(ss, payload.caseId);
    case "addStudentMessage":
      return addStudentMessage_(ss, payload);
    case "saveDraftReply":
      return saveDraftReply_(ss, payload);
    case "submitReview":
      return submitReview_(ss, payload);
    case "approveReview":
      return approveReview_(ss, payload);
    case "closeStaleCases":
      return closeStaleCases();
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
