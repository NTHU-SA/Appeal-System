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
  let appUrl = props.getProperty("APP_URL") || "";
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

function sendCaseEmail_(caseRow, token, subject, bodyOverride, ss) {
  const appUrl = getAppUrl_(ss);
  const link = token && appUrl ? `${appUrl}/case/${token}` : appUrl;

  let plainText = "";
  let htmlBody = "";

  if (bodyOverride) {
    plainText = stripHtml_(bodyOverride);
    htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #20201d; line-height: 1.6;">
        <div style="border-bottom: 2px solid #37645a; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #37645a; font-size: 20px;">清華大學學生會 · 學生申訴協力系統</h2>
        </div>
        <div style="background: #fbf9f5; border: 1px solid #ded8cf; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px; font-weight: 600;">案件編號：${caseRow.public_id}</p>
          <div style="margin-top: 12px;">${bodyOverride}</div>
        </div>
        ${link ? `
        <div style="text-align: center; margin: 28px 0;">
          <a href="${link}" style="display: inline-block; background: #37645a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px;">前往案件進度與補件頁面</a>
          <p style="margin: 8px 0 0; font-size: 12px; color: #6f6a61;">如按鈕無法點擊，請複製以下網址至瀏覽器：<br><a href="${link}" style="color: #37645a;">${link}</a></p>
        </div>` : ""}
        <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="font-size: 12px; color: #888; margin: 0;">此信件為系統自動發送，請勿直接回覆此信件。如有疑問或欲補充佐證資料，請使用專屬查詢連結。</p>
      </div>
    `;
  } else {
    plainText = [
      `同學您好：`,
      ``,
      `我們已收到您的申訴案件，並已指派學權幹部進行處理與審核。`,
      ``,
      `【案件資訊】`,
      `案件編號：${caseRow.public_id}`,
      `申訴種類：${caseRow.category}`,
      `申訴問題：${caseRow.subject}`,
      `希望得到的處理方式：${caseRow.desired_outcome}`,
      ``,
      link
        ? `【專屬案件查詢與補件連結】\n${link}\n※ 透過此專屬連結，您可隨時查看即時處理進度、閱讀學權幹部回覆，並上傳補充資料或佐證檔案。`
        : `案件編號：${caseRow.public_id}（請妥善保存以供查詢）`,
      ``,
      `清華大學學生會 學權協力小組 敬上`,
    ].join("\n");

    htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 28px 20px; color: #20201d; line-height: 1.65;">
        <div style="border-bottom: 2px solid #37645a; padding-bottom: 14px; margin-bottom: 24px;">
          <span style="font-size: 13px; color: #6f6a61; font-weight: 600; letter-spacing: 0.5px;">國立清華大學學生會 · 學權協力</span>
          <h1 style="margin: 6px 0 0; color: #21483f; font-size: 22px; font-weight: 700;">申訴案件已受理確認信</h1>
        </div>

        <p style="margin: 0 0 16px; font-size: 15px;">
          ${caseRow.student_name ? `${caseRow.student_name} 同學` : "同學"} 您好：<br>
          我們已收到您的申訴案件，並已指派學權幹部進行處理與審查。
        </p>

        <div style="background: #fbf9f5; border: 1px solid #ded8cf; border-radius: 8px; padding: 18px 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #6f6a61; width: 110px; vertical-align: top;">案件編號</td>
              <td style="padding: 6px 0; font-weight: 700; font-family: monospace; font-size: 15px; color: #37645a;">${caseRow.public_id}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6f6a61; vertical-align: top;">年級</td>
              <td style="padding: 6px 0;">${caseRow.student_department || "未填寫"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6f6a61; vertical-align: top;">申訴種類</td>
              <td style="padding: 6px 0; font-weight: 600;">${caseRow.category}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6f6a61; vertical-align: top;">申訴問題</td>
              <td style="padding: 6px 0; white-space: pre-wrap;">${caseRow.subject}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6f6a61; vertical-align: top;">希望處理方式</td>
              <td style="padding: 6px 0; white-space: pre-wrap;">${caseRow.desired_outcome}</td>
            </tr>
          </table>
        </div>

        ${link ? `
        <div style="background: rgba(55, 100, 90, 0.06); border: 1px solid rgba(55, 100, 90, 0.2); border-radius: 8px; padding: 22px 20px; margin: 24px 0; text-align: center;">
          <h3 style="margin: 0 0 8px; color: #21483f; font-size: 16px;">專屬案件追蹤與補件平台</h3>
          <p style="margin: 0 0 16px; font-size: 13px; color: #555;">
            您可以隨時點擊下方按鈕查看最新處理進度、幹部回覆，或<strong>上傳補充資料與佐證檔案</strong>：
          </p>
          <a href="${link}" style="display: inline-block; background: #37645a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 15px; box-shadow: 0 2px 8px rgba(55, 100, 90, 0.25);">查看案件進度與補充資料</a>
          <p style="margin: 12px 0 0; font-size: 12px; color: #777;">
            如按鈕無法開啟，請複製此專屬連結至瀏覽器：<br>
            <a href="${link}" style="color: #37645a; word-break: break-all;">${link}</a>
          </p>
        </div>` : ""}

        <div style="font-size: 13px; color: #6f6a61; line-height: 1.6; margin-top: 24px;">
          <p style="margin: 0 0 6px;">💡 <strong>注意事項：</strong></p>
          <ul style="margin: 0; padding-left: 20px;">
            <li>請妥善保存此信件與專屬查詢連結，以利後續案件追蹤。</li>
            <li>若有新的進度或需請您補充資料，系統將透過 email 發送通知。</li>
          </ul>
        </div>

        <hr style="border: 0; border-top: 1px solid #e0dbd3; margin: 28px 0 18px;">
        <p style="font-size: 12px; color: #999; margin: 0; text-align: center;">
          此信件由清華大學學生申訴協力系統自動發出，請勿直接回信。<br>
          國立清華大學學生會 學權小組
        </p>
      </div>
    `;
  }

  MailApp.sendEmail({
    to: caseRow.student_email,
    subject: subject || `【清華大學學生會】申訴案件已受理：${caseRow.public_id}`,
    body: plainText,
    htmlBody,
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
