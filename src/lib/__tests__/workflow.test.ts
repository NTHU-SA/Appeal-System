import { describe, expect, it } from "vitest";

import {
  canManageMembers,
  canReview,
  canWorkCase,
  emailIdempotencyKey,
  nextStatusForReview,
  shouldAutoCloseCase,
} from "@/lib/workflow";

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
