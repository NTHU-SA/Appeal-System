import { afterEach, describe, expect, it, vi } from "vitest";

import { callGas } from "@/lib/gas";

describe("callGas", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("sends the shared secret in the request body and header", async () => {
    vi.stubEnv("GOOGLE_APPS_SCRIPT_WEB_APP_URL", "https://script.google.com/macros/s/test/exec");
    vi.stubEnv("GOOGLE_APPS_SCRIPT_SHARED_SECRET", "secret-123");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: { role: "minister" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      callGas("getMemberRole", { email: "minister@example.com" })
    ).resolves.toEqual({ role: "minister" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://script.google.com/macros/s/test/exec",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-campusvoice-secret": "secret-123",
        }),
        body: JSON.stringify({
          action: "getMemberRole",
          secret: "secret-123",
          payload: { email: "minister@example.com" },
        }),
      })
    );
  });

  it("throws a useful error for Apps Script failures", async () => {
    vi.stubEnv("GOOGLE_APPS_SCRIPT_WEB_APP_URL", "https://script.google.com/macros/s/test/exec");
    vi.stubEnv("GOOGLE_APPS_SCRIPT_SHARED_SECRET", "secret-123");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: false, error: "Unauthorized." }),
      })
    );

    await expect(callGas("listCases")).rejects.toThrow("Unauthorized.");
  });
});
