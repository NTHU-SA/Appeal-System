import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST, PUT } from "@/app/api/appeals/route";
import { callGas } from "@/lib/gas";

vi.mock("@/lib/gas", () => ({ callGas: vi.fn() }));
vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: vi.fn() }));

const url = "https://appeal.example/api/appeals";
const requestId = "d671271c-be98-42cd-a61f-6a12d48b8198";

describe("public appeal Worker routes", () => {
  beforeEach(() => vi.resetAllMocks());

  it("forwards a single picked file with base64 data and infers a missing MIME type", async () => {
    vi.mocked(callGas).mockResolvedValue({ fileId: "file-01" });
    const body = new FormData();
    body.set("requestId", requestId);
    body.set("slot", "0");
    body.set("file", new File(["PDF"], "example.pdf"));

    const response = await PUT(new Request(url, { method: "PUT", body }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, data: { fileId: "file-01" } });
    expect(callGas).toHaveBeenCalledWith("uploadPublicCaseFile", {
      requestId,
      slot: 0,
      file: { name: "example.pdf", mimeType: "application/pdf", data: "UERG" },
    });
  });

  it("forwards form fields and receipts and returns only the public case number", async () => {
    vi.mocked(callGas).mockResolvedValue({ publicId: "CV-TEST", caseId: "private-id" });
    const body = {
      requestId,
      email: "student@example.com",
      name: "測試生",
      department: "其他",
      departmentOther: "交換生",
      category: "課務與教學",
      subject: "這是一段測試用的申訴內容",
      desiredOutcome: "希望協助",
      fileIds: ["file-01"],
    };
    const response = await POST(new Request(url, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, data: { publicId: "CV-TEST" } });
    expect(callGas).toHaveBeenCalledWith("submitPublicCase", expect.objectContaining({
      requestId, department: "其他, 交換生", fileIds: ["file-01"],
    }));
  });

  it("rejects cross-origin or oversized requests before calling Apps Script", async () => {
    const crossSite = await POST(new Request(url, {
      method: "POST", headers: { "Content-Type": "application/json", Origin: "https://another.example" },
      body: "{}",
    }));
    expect(crossSite.status).toBe(403);
    const oversized = await POST(new Request(url, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "x".repeat(128 * 1024 + 1),
    }));
    expect(oversized.status).toBe(413);
    expect(callGas).not.toHaveBeenCalled();
  });
});
