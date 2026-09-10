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

function getAppUrl_(ss) {
  const props = PropertiesService.getScriptProperties();
  let appUrl = String(props.getProperty("APP_URL") || "").trim();
  if (!appUrl) {
    try {
      const spreadsheet = ss || getSpreadsheet_();
      const settingRow = readObjects_(spreadsheet, "Settings").find((s) => s.key === "APP_URL");
      if (settingRow && settingRow.value) {
        appUrl = String(settingRow.value).trim();
      }
    } catch (e) {
      console.warn("Could not read APP_URL from Settings sheet:", e);
    }
  }
  return appUrl ? appUrl.replace(/\/$/, "") : "";
}

function requireAppUrl_(ss) {
  const appUrl = getAppUrl_(ss);
  if (!/^https?:\/\/[^\s/?#"<>]+(?::\d+)?(?:\/[^\s?#"<>]*)?$/.test(appUrl)) {
    throw new Error("系統尚未設定有效的 APP_URL，請聯絡管理員設定案件平台網址後再送件。");
  }
  return appUrl;
}

function escapeEmailHtml_(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function sendCaseEmail_(caseRow, token, subject, bodyOverride, ss) {
  const link = caseRow.token_revoked_at ? "" :
    (caseRow.student_case_url || (token ? `${requireAppUrl_(ss)}/case/${token}` : ""));
  const title = bodyOverride ? "案件有新通知" : "已收到您的申訴案件";
  const intro = bodyOverride ? stripHtml_(bodyOverride) : "學權小組將進行審查，後續進度會以 email 通知。";
  const plainText = [
    `${caseRow.student_name || "同學"} 您好：`, title,
    `案件編號：${caseRow.public_id}`,
    link ? `查看案件與補件：${link}` : "",
    intro,
    !bodyOverride ? `申訴種類：${caseRow.category}\n申訴問題：${caseRow.subject}\n希望處理方式：${caseRow.desired_outcome}` : "",
    "請保留專屬連結，勿轉傳他人。此信件無法直接回覆，請至案件頁留言。",
    "國立清華大學學生會 學權小組",
  ].filter(Boolean).join("\n\n");
  const href = escapeEmailHtml_(link);
  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 28px 20px; color: #20201d; line-height: 1.65;">
      <p style="margin: 0; color: #6f6a61; font-size: 13px;">國立清華大學學生會 · 學權小組</p>
      <h1 style="margin: 8px 0 12px; font-size: 24px; color: #21483f;">${title}</h1>
      <p style="margin: 0 0 16px;">${escapeEmailHtml_(caseRow.student_name) || "同學"} 您好，<br>案件編號：<strong>${escapeEmailHtml_(caseRow.public_id)}</strong></p>
      ${link ? `<div style="margin: 20px 0 24px;">
        <a href="${href}" style="display: inline-block; padding: 14px 28px; background: #37645a; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 700;">查看案件與補件 →</a>
        <p style="margin: 8px 0 0; color: #6f6a61; font-size: 13px;">查看回覆、留言或上傳附件</p>
      </div>` : ""}
      ${bodyOverride ? `<div>${bodyOverride}</div>` : `<p>${intro}</p>
      <div style="padding: 16px 20px; background: #fbf9f5; border: 1px solid #ded8cf; border-radius: 8px;">
        <p style="margin: 0 0 12px;"><strong>${escapeEmailHtml_(caseRow.category)}</strong></p>
        <p style="margin: 0; white-space: pre-wrap;">${escapeEmailHtml_(caseRow.subject)}</p>
        <p style="margin: 12px 0 0; white-space: pre-wrap;"><span style="color: #6f6a61;">希望處理方式</span><br>${escapeEmailHtml_(caseRow.desired_outcome)}</p>
      </div>`}
      <p style="margin: 24px 0 0; font-size: 12px; color: #6f6a61;">請保留專屬連結，勿轉傳他人。此信件無法直接回覆，請至案件頁留言。</p>
      ${link ? `<p style="font-size: 12px; color: #6f6a61;">按鈕無法開啟？請複製網址：<br><a href="${href}" style="color: #37645a; word-break: break-all;">${href}</a></p>` : ""}
    </div>`;
  MailApp.sendEmail({
    to: caseRow.student_email,
    subject: subject || `【清華大學學生會】申訴案件已受理：${caseRow.public_id}`,
    body: plainText, htmlBody,
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
