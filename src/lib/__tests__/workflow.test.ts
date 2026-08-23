import { describe, expect, it } from "vitest";

import {
  canManageMembers,
  canReview,
  canWorkCase,
  emailIdempotencyKey,
  nextStatusForReview,
  shouldAutoCloseCase,
  staffRoleFromMemberRole,
} from "@/lib/workflow";
import { createCaseToken, createPublicCaseId, hashCaseToken } from "@/lib/token";

describe("workflow permissions", () => {
  it("allows only ministers to manage members and approve reviews", () => {
    expect(canManageMembers("minister")).toBe(true);
    expect(canManageMembers("member")).toBe(false);
    expect(canReview("minister")).toBe(true);
    expect(canReview("member")).toBe(false);
  });

  it("allows ministers and members to work cases", () => {
    expect(canWorkCase("minister")).toBe(true);
    expect(canWorkCase("member")).toBe(true);
    expect(canWorkCase("user")).toBe(false);
    expect(canWorkCase(null)).toBe(false);
  });

  it("maps sheet roles to staff roles", () => {
    expect(staffRoleFromMemberRole("minister")).toBe("minister");
    expect(staffRoleFromMemberRole("member")).toBe("member");
    expect(staffRoleFromMemberRole("user")).toBeNull();
    expect(staffRoleFromMemberRole(null)).toBeNull();
  });
});

describe("case status transitions", () => {
  it("maps review decisions to final statuses", () => {
    expect(nextStatusForReview("accepted")).toBe("in_progress");
    expect(nextStatusForReview("rejected")).toBe("rejected");
  });
});

describe("auto close rule", () => {
  const now = new Date("2026-06-22T00:00:00.000Z");

  it("closes in-progress cases when staff replied and student has not replied for 14 days", () => {
    expect(
      shouldAutoCloseCase({
        status: "in_progress",
        lastStaffMessageAt: new Date("2026-06-08T00:00:00.000Z"),
        lastStudentMessageAt: new Date("2026-06-07T00:00:00.000Z"),
        now,
      })
    ).toBe(true);
  });

  it("keeps cases open when student replied after staff", () => {
    expect(
      shouldAutoCloseCase({
        status: "in_progress",
        lastStaffMessageAt: new Date("2026-06-08T00:00:00.000Z"),
        lastStudentMessageAt: new Date("2026-06-10T00:00:00.000Z"),
        now,
      })
    ).toBe(false);
  });

  it("does not close non in-progress cases", () => {
    expect(
      shouldAutoCloseCase({
        status: "pending",
        lastStaffMessageAt: new Date("2026-06-01T00:00:00.000Z"),
        lastStudentMessageAt: null,
        now,
      })
    ).toBe(false);
  });
});

describe("email idempotency", () => {
  it("is deterministic for the same business event", () => {
    expect(emailIdempotencyKey("case-created", "CV-1")).toBe(
      emailIdempotencyKey("case-created", "CV-1")
    );
  });
});

describe("case identifiers", () => {
  it("creates opaque tokens and deterministic token hashes", () => {
    const token = createCaseToken();
    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(hashCaseToken(token)).toBe(hashCaseToken(token));
    expect(hashCaseToken(token)).not.toBe(token);
  });

  it("creates public case ids with the expected prefix", () => {
    expect(createPublicCaseId()).toMatch(/^CV-\d{8}-[A-F0-9]{8}$/);
  });
});

import { studentMessageSchema, validateUpload } from "@/lib/validation";

describe("student message and supplement validation", () => {
  const validToken = "a".repeat(32);

  it("accepts text-only supplement", () => {
    const result = studentMessageSchema.safeParse({
      token: validToken,
      body: "這是補充說明",
      files: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts file-only supplement", () => {
    const result = studentMessageSchema.safeParse({
      token: validToken,
      body: "",
      files: [
        {
          name: "evidence.pdf",
          mimeType: "application/pdf",
          data: "YmFzZTY0ZGF0YQ==",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects when both text and files are empty", () => {
    const result = studentMessageSchema.safeParse({
      token: validToken,
      body: "   ",
      files: [],
    });
    expect(result.success).toBe(false);
  });

  it("validates file upload limits", () => {
    const validFile = new File(["test content"], "doc.pdf", {
      type: "application/pdf",
    });
    expect(validateUpload(validFile)).toBeNull();

    const invalidType = new File(["test content"], "malicious.exe", {
      type: "application/x-msdownload",
    });
    expect(validateUpload(invalidType)).toContain("檔案格式不支援");
  });
});
