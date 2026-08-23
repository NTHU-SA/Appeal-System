import { describe, expect, it } from "vitest";
import { createCaseToken, createPublicCaseId, hashCaseToken } from "../token";
import { formatDate, formatDateTime } from "../utils";

describe("token & timezone helpers", () => {
  it("generates public case ID with Asia/Taipei date", () => {
    // 2026-06-22 01:30:00 UTC is 2026-06-22 09:30:00 in Taipei (UTC+8)
    const dateUtcMorning = new Date("2026-06-22T01:30:00.000Z");
    const caseId1 = createPublicCaseId(dateUtcMorning);
    expect(caseId1).toMatch(/^CV-20260622-[0-9A-F]{8}$/);

    // 2026-06-21 20:30:00 UTC is 2026-06-22 04:30:00 in Taipei (UTC+8)
    const dateUtcNight = new Date("2026-06-21T20:30:00.000Z");
    const caseId2 = createPublicCaseId(dateUtcNight);
    expect(caseId2).toMatch(/^CV-20260622-[0-9A-F]{8}$/);
  });

  it("creates and hashes case token", () => {
    const token = createCaseToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    const hash = hashCaseToken(token);
    expect(hash).toHaveLength(64);
  });

  it("formats date and datetime in Asia/Taipei timezone", () => {
    // 2026-06-21 20:30:00 UTC -> 2026-06-22 04:30:00 Taipei
    const testDate = new Date("2026-06-21T20:30:00.000Z");
    expect(formatDate(testDate)).toBe("2026/6/22");
    expect(formatDateTime(testDate)).toContain("2026/6/22");
  });
});
