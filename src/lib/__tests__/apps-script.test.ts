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
    ctx.readObjectsByColumn_ = vi.fn((_ss, tab) => tab === "Cases" ? [{id: "case", token_hash: "hash"}] : []);
    const data = ctx.getCaseByToken_({}, "token");
    expect(data).not.toHaveProperty("drafts");
    expect(ctx.readObjectsByColumn_.mock.calls.map((call: unknown[]) => call[1])).toEqual(["Cases", "Messages", "Attachments"]);
  });

  it("grants complainant viewer access to folder on submission without per-file sharing", () => {
    const addFolderViewer = vi.fn();
    const addFileViewer = vi.fn();
    const file = {
      getId: () => "file-id",
      getUrl: () => "https://drive.google.com/file",
      getName: () => "doc.pdf",
      getMimeType: () => "application/pdf",
      addViewer: addFileViewer,
    };
    const folder = {
      createFile: vi.fn(() => file),
      addViewer: addFolderViewer,
    };
    const ctx = runtime({
      MailApp: { sendEmail: vi.fn() },
      Utilities: {
        getUuid: vi.fn(() => "uuid"),
        base64Decode: () => [1, 2],
        newBlob: () => ({}),
      },
    });
    ctx.getSpreadsheet_ = () => ({});
    ctx.getAppUrl_ = () => "https://campus.example.com";
    ctx.getDriveFolder_ = () => ({});
    ctx.getOrCreateSubFolder_ = () => folder;
    ctx.createToken_ = () => "token";
    ctx.sha256Hex_ = () => "hash";
    ctx.createPublicCaseId_ = () => "CV-test";
    ctx.appendObject_ = vi.fn();
    ctx.notifyStaff_ = vi.fn();

    ctx.createCaseFromSubmission_({
      email: "Student@Example.COM ",
      department: "大一",
      name: "測試生",
      category: "生活",
      subject: "測試申訴內容超過八個字",
      desiredOutcome: "希望處理",
      files: [{ name: "doc.pdf", mimeType: "application/pdf", data: "AQI=" }],
    });

    expect(addFolderViewer).toHaveBeenCalledWith("student@example.com");
    expect(addFileViewer).not.toHaveBeenCalled();
  });

  it("grants complainant viewer access to folder in grantCaseDrivePermissions", () => {
    const addFolderViewer = vi.fn();
    const folder = {
      addViewer: addFolderViewer,
    };
    let folderIterDone = false;
    const rootFolder = {
      getFoldersByName: () => ({
        hasNext: () => !folderIterDone,
        next: () => {
          folderIterDone = true;
          return folder;
        },
      }),
    };

    const ctx = runtime();
    ctx.getSpreadsheet_ = () => ({});
    ctx.readObjects_ = (_ss: unknown, tab: string) =>
      tab === "Cases" ? [{ public_id: "CV-1234", student_email: "test@example.com" }] : [];
    ctx.getDriveFolder_ = () => rootFolder;

    const result = ctx.grantCaseDrivePermissions("CV-1234");
    expect(result).toEqual({ ok: true });
    expect(addFolderViewer).toHaveBeenCalledWith("test@example.com");
  });
});

describe("Apps Script performance optimizations", () => {
  it("caches script properties in memory without redundant RPC calls", () => {
    const getProperties = vi.fn(() => ({
      SHARED_SECRET: "secret-abc",
      SHEET_ID: "sheet-xyz",
      DRIVE_FOLDER_ID: "drive-123",
    }));
    const ctx = runtime({
      PropertiesService: {
        getScriptProperties: () => ({ getProperties }),
      },
    });

    expect(ctx.getScriptProp_("SHARED_SECRET")).toBe("secret-abc");
    expect(ctx.getScriptProp_("SHEET_ID")).toBe("sheet-xyz");
    expect(ctx.getScriptProp_("DRIVE_FOLDER_ID")).toBe("drive-123");
    // All three accesses should only invoke getProperties once!
    expect(getProperties).toHaveBeenCalledTimes(1);

    // After clearing cache, next call fetches again
    ctx.clearScriptPropsCache_();
    expect(ctx.getScriptProp_("SHARED_SECRET")).toBe("secret-abc");
    expect(getProperties).toHaveBeenCalledTimes(2);
  });

  it("reads bounded sheet ranges and applies predicate filtering", () => {
    const ctx = runtime();
    const rows = [
      ["id", "case_id", "body_text"],
      ["msg-1", "case-A", "message 1"],
      ["msg-2", "case-B", "message 2"],
      ["msg-3", "case-A", "message 3"],
    ];
    const getRange = vi.fn(() => ({
      getValues: () => rows,
    }));

    const sheet = {
      getLastRow: () => 4,
      getLastColumn: () => 3,
      getRange,
    };
    const ss = { getSheetByName: () => sheet };

    const filtered = ctx.readObjects_(ss, "Messages", ctx.byCaseIdFilter_("case-A"));
    expect(getRange).toHaveBeenCalledWith(1, 1, 4, 3);
    expect(filtered).toHaveLength(2);
    expect(filtered[0].id).toBe("msg-1");
    expect(filtered[1].id).toBe("msg-3");
  });

  it("returns empty array without calling getRange when sheet is empty or only has headers", () => {
    const ctx = runtime();
    const getRange = vi.fn();
    const sheet = {
      getLastRow: () => 1,
      getLastColumn: () => 3,
      getRange,
    };
    const ss = { getSheetByName: () => sheet };

    const results = ctx.readObjects_(ss, "Messages");
    expect(results).toEqual([]);
    expect(getRange).not.toHaveBeenCalled();
  });
});



describe("targeted case sheet reads", () => {
  function fixture(count: number, matchingRows: number[]) {
    const ctx = runtime();
    const headers = vm.runInContext("TAB_HEADERS.Messages", ctx) as string[];
    const values = Array.from({ length: count }, (_, index) => headers.map((header) =>
      header === "id" ? `message-${index + 2}` : header === "case_id"
        ? (matchingRows.includes(index + 2) ? "target" : "other") : ""));
    const getRange = vi.fn((row: number, column: number, height: number, width: number) => ({
      getValues: () => values.slice(row - 2, row - 2 + height)
        .map((cells) => cells.slice(column - 1, column - 1 + width)),
    }));
    const ss = { getSheetByName: () => ({ getLastRow: () => count + 1, getRange }) };
    return { ctx, ss, getRange, headers };
  }

  it("reads only matching contiguous runs from a large history in sheet order", () => {
    const { ctx, ss, getRange, headers } = fixture(10000, [3, 4, 9000]);
    const result = ctx.readObjectsByColumn_(ss, "Messages", "case_id", "target");
    expect(result.map((row: { id: string }) => row.id)).toEqual(["message-3", "message-4", "message-9000"]);
    expect(getRange.mock.calls).toEqual([
      [2, headers.indexOf("case_id") + 1, 10000, 1],
      [3, 1, 2, headers.length], [9000, 1, 1, headers.length],
    ]);
  });

  it("uses a single read for small sheets", () => {
    const { ctx, ss, getRange } = fixture(10, [3]);
    expect(ctx.readObjectsByColumn_(ss, "Messages", "case_id", "target")).toHaveLength(1);
    expect(getRange).toHaveBeenCalledTimes(1);
  });

  it("does not read row bodies for missing keys", () => {
    const { ctx, ss, getRange } = fixture(10000, []);
    expect(ctx.readObjectsByColumn_(ss, "Messages", "case_id", "target")).toEqual([]);
    expect(getRange).toHaveBeenCalledTimes(1);
  });

  it("bounds round trips for fragmented histories", () => {
    const { ctx, ss, getRange } = fixture(10000, [2, 4, 6, 8, 10, 12, 14, 16, 18]);
    expect(ctx.readObjectsByColumn_(ss, "Messages", "case_id", "target")).toHaveLength(9);
    expect(getRange).toHaveBeenCalledTimes(2);
  });

  it("rejects revoked and unknown tokens before reading conversations", () => {
    const ctx = runtime();
    ctx.sha256Hex_ = () => "hash";
    ctx.readObjectsByColumn_ = vi.fn(() => [{ token_revoked_at: "2026-09-13" }]);
    expect(ctx.getCaseByToken_({}, "token")).toBeNull();
    expect(ctx.readObjectsByColumn_).toHaveBeenCalledTimes(1);
    ctx.readObjectsByColumn_.mockReturnValue([]);
    expect(ctx.getCaseByToken_({}, "unknown")).toBeNull();
  });
});
