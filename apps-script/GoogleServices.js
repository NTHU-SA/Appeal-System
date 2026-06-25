function getOrCreateDriveFolder_(props) {
  const id = props.getProperty("DRIVE_FOLDER_ID");
  if (id) return DriveApp.getFolderById(id);
  const folder = DriveApp.createFolder(`${APP_TITLE} Case Files`);
  props.setProperty("DRIVE_FOLDER_ID", folder.getId());
  return folder;
}

function getDriveFolder_() {
  const id = PropertiesService.getScriptProperties().getProperty("DRIVE_FOLDER_ID");
  if (!id) throw new Error("Missing DRIVE_FOLDER_ID. Run setupCampusVoice() first.");
  return DriveApp.getFolderById(id);
}

function getOrCreateSubFolder_(parent, name) {
  const folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function installAutoCloseTrigger_() {
  const props = PropertiesService.getScriptProperties();
  const existingId = props.getProperty("AUTO_CLOSE_TRIGGER_ID");
  const triggers = ScriptApp.getProjectTriggers();
  if (existingId && triggers.some((trigger) => trigger.getUniqueId() === existingId)) return;
  const triggerId = ScriptApp.newTrigger("closeStaleCases")
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create()
    .getUniqueId();
  props.setProperty("AUTO_CLOSE_TRIGGER_ID", triggerId);
}

function sendCaseEmail_(caseRow, token, subject, bodyOverride) {
  const appUrl = PropertiesService.getScriptProperties().getProperty("APP_URL") || "";
  const link = token && appUrl ? `${appUrl.replace(/\/$/, "")}/case/${token}` : appUrl;
  const body = bodyOverride || [
    `案件編號：${caseRow.public_id}`,
    "",
    `申訴種類：${caseRow.category}`,
    `申訴問題：${caseRow.subject}`,
    `希望得到的處理方式：${caseRow.desired_outcome}`,
    "",
    link ? `案件查詢連結：${link}` : "",
  ].join("\n");
  MailApp.sendEmail({
    to: caseRow.student_email,
    subject,
    body: stripHtml_(body),
    htmlBody: `<p>${String(body).replace(/\n/g, "<br>")}</p>`,
    name: "清華大學學生申訴協力系統",
  });
}

function notifyStaff_(ss, subject, body) {
  const recipients = readObjects_(ss, "Members")
    .filter((member) => member.role === "minister" || member.role === "member")
    .map((member) => member.email)
    .filter(Boolean);
  if (!recipients.length) return;
  MailApp.sendEmail({
    to: recipients.join(","),
    subject,
    body,
    name: "清華大學學生申訴協力系統",
  });
}
