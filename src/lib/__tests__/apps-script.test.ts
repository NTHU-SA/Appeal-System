import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

function runtime(globals = {}) {
  const context = vm.createContext({ console, ...globals });
  for (const file of ["Code", "Sheets", "Utils", "GoogleServices", "Workflow"]) {
    vm.runInContext(readFileSync(`apps-script/${file}.js`, "utf8"), context);
  }
  return context;
}

describe("Apps Script case links", () => {
  it("appends the link column without touching existing rows", () => {
    const ctx = runtime();
    const headers = vm.runInContext("TAB_HEADERS.Cases", ctx) as string[];
    const write = vi.fn();
    const sheet = {
      getLastColumn: () => headers.length - 1,
      getRange: vi.fn(() => ({ getValues: () => [headers.slice(0, -1)], setValues: write })),
      setFrozenRows: vi.fn(),
    };
    ctx.ensureSheet_({ getSheetByName: () => sheet }, "Cases", headers);
    expect(sheet.getRange).toHaveBeenLastCalledWith(1, headers.length, 1, 1);
    expect(write).toHaveBeenCalledWith([["student_case_url"]]);
  });

  it("refuses unexpected columns without overwriting data", () => {
    const ctx = runtime();
    const write = vi.fn();
    const sheet = {
      getLastColumn: () => 1,
      getRange: () => ({ getValues: () => [["wrong_column"]], setValues: write }),
    };
    expect(() => ctx.ensureSheet_({ getSheetByName: () => sheet }, "Cases", ["id"]))
      .toThrow("欄位順序不符");
    expect(write).not.toHaveBeenCalled();
  });

  it("rejects missing APP_URL before creating a case or files", () => {
    const ctx = runtime();
    ctx.getSpreadsheet_ = () => ({});
    ctx.getAppUrl_ = () => "";
    ctx.getDriveFolder_ = vi.fn();
    ctx.appendObject_ = vi.fn();
    expect(() => ctx.createCaseFromSubmission_({
      email: "student@example.com", department: "大三", name: "學生",
      category: "生活", subject: "申訴問題測試內容", desiredOutcome: "協助",
    })).toThrow("APP_URL");
    expect(ctx.getDriveFolder_).not.toHaveBeenCalled();
    expect(ctx.appendObject_).not.toHaveBeenCalled();
  });

  it("rejects more than 10 files on submission", () => {
    const ctx = runtime();
    ctx.getSpreadsheet_ = () => ({});
    ctx.getAppUrl_ = () => "https://campus.example.com";
    ctx.getDriveFolder_ = vi.fn();
    ctx.appendObject_ = vi.fn();
    const files = Array.from({ length: 11 }, (_, i) => ({
      name: `file${i}.pdf`,
      mimeType: "application/pdf",
      data: "AQI=",
    }));
    expect(() =>
      ctx.createCaseFromSubmission_({
        email: "student@example.com",
        department: "大三",
        name: "學生",
        category: "生活",
        subject: "申訴問題測試內容",
        desiredOutcome: "協助",
        files,
      }),
    ).toThrow("最多上傳 10 個檔案");
  });

  it("persists each case's unique link and uses it in both email formats", () => {
    const sendEmail = vi.fn();
    const ctx = runtime({ MailApp: { sendEmail }, Utilities: { getUuid: vi.fn(() => "uuid") } });
    ctx.getSpreadsheet_ = () => ({});
    ctx.getAppUrl_ = () => "https://campus.example.com";
    ctx.getDriveFolder_ = () => ({});
    ctx.getOrCreateSubFolder_ = () => ({});
    ctx.createToken_ = vi.fn().mockReturnValueOnce("first-token").mockReturnValueOnce("second-token");
    ctx.sha256Hex_ = (token: string) => `hash-${token}`;
    ctx.createPublicCaseId_ = () => "CV-test";
    ctx.appendObject_ = vi.fn();
    ctx.notifyStaff_ = vi.fn();
    const input = { email: "student@example.com", department: "大三", name: "學生",
      category: "生活", subject: "申訴問題測試內容", desiredOutcome: "協助" };
    ctx.createCaseFromSubmission_(input);
    ctx.createCaseFromSubmission_(input);
    const rows = ctx.appendObject_.mock.calls.filter((call: unknown[]) => call[1] === "Cases");
    expect(rows[0][2].student_case_url).toBe("https://campus.example.com/case/first-token");
    expect(rows[1][2].student_case_url).not.toBe(rows[0][2].student_case_url);
    expect(sendEmail.mock.calls[0][0].body).toContain(rows[0][2].student_case_url);
    expect(sendEmail.mock.calls[0][0].htmlBody).toContain(rows[0][2].student_case_url);
    ctx.sendCaseEmail_(rows[0][2], "", "新回覆", "補充資料");
    expect(sendEmail.mock.lastCall?.[0].body).toContain(rows[0][2].student_case_url);
    expect(sendEmail.mock.lastCall?.[0].htmlBody).toContain(rows[0][2].student_case_url);
  });

  it("restores a legacy link once and preserves revoked links", () => {
    const releaseLock = vi.fn();
    const ctx = runtime({ LockService: { getScriptLock: () => ({ waitLock: vi.fn(), releaseLock }) } });
    const row = { public_id: "CV-old", token_hash: "old-hash", student_case_url: "", token_revoked_at: "" };
    ctx.getSpreadsheet_ = () => ({});
    ctx.findRow_ = () => ({ rowNumber: 2, object: row });
    ctx.getAppUrl_ = () => "https://campus.example.com";
    ctx.createToken_ = () => "new-token";
    ctx.sha256Hex_ = () => "new-hash";
    ctx.updateObject_ = vi.fn((_ss, _tab, _number, updated) => Object.assign(row, updated));
    const link = ctx.restoreStudentCaseLink("CV-old");
    expect(row.token_hash).toBe("new-hash");
    expect(ctx.restoreStudentCaseLink("CV-old")).toBe(link);
    expect(ctx.updateObject_).toHaveBeenCalledTimes(1);
    row.token_revoked_at = "2026-09-10";
    expect(() => ctx.restoreStudentCaseLink("CV-old")).toThrow("已停用");
    expect(releaseLock).toHaveBeenCalledTimes(3);
  });
});


describe("student supplement persistence", () => {
  it("stores an attachment once when a completed submission is retried", () => {
    const ctx = runtime({
      LockService: {getScriptLock: () => ({waitLock: vi.fn(), releaseLock: vi.fn()})},
      Utilities: {base64Decode: () => [1, 2], newBlob: () => ({})},
    });
    const caseRow = {id: "case", public_id: "CV-test", student_email: "student@example.com"};
    const rows: Record<string, Array<Record<string, unknown>>> = {Messages: [], Attachments: []};
    ctx.sha256Hex_ = () => "hash";
    ctx.findRow_ = () => ({rowNumber: 2, object: caseRow});
    ctx.readObjects_ = (_ss: unknown, tab: string) => rows[tab] || [];
    ctx.appendObject_ = (_ss: unknown, tab: string, row: Record<string, unknown>) => rows[tab].push(row);
    ctx.updateObject_ = vi.fn();
    ctx.notifyStaff_ = vi.fn();
    ctx.getDriveFolder_ = () => ({});
    const createFile = vi.fn(() => ({getId: () => "drive-id", getUrl: () => "https://drive.google.com/test", getName: () => "proof.pdf", getMimeType: () => "application/pdf"}));
    ctx.getOrCreateSubFolder_ = () => ({createFile});
    const payload = {token: "token", requestId: "ec459dfd-daf8-4d44-85a8-bd3a57c099a0", body: "", files: [{name: "proof.pdf", mimeType: "application/pdf", data: "AQI="}]};
    ctx.addStudentMessage_({}, payload);
    ctx.addStudentMessage_({}, payload);
    expect(rows.Messages).toHaveLength(1);
    expect(rows.Attachments).toHaveLength(1);
    expect(rows.Attachments[0].message_id).toBe(rows.Messages[0].id);
    expect(createFile).toHaveBeenCalledTimes(1);
    expect(ctx.notifyStaff_).toHaveBeenCalledTimes(1);
  });
  it("does not read staff drafts or review sheets on the public page", () => {
    const ctx = runtime();
    ctx.sha256Hex_ = () => "hash";
    ctx.readObjects_ = vi.fn((_ss, tab) => tab === "Cases" ? [{id: "case", token_hash: "hash"}] : []);
    const data = ctx.getCaseByToken_({}, "token");
    expect(data).not.toHaveProperty("drafts");
    expect(ctx.readObjects_.mock.calls.map((call: unknown[]) => call[1])).toEqual(["Cases", "Messages", "Attachments"]);
  });
});
