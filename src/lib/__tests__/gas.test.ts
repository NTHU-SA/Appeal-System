import { afterEach, describe, expect, it, vi } from "vitest";

import { callGas } from "@/lib/gas";

describe("callGas", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("sends the shared secret only in the POST body", async () => {
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
        redirect: "manual",
        headers: { "Content-Type": "application/json" },
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


describe("Apps Script transport recovery", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
  function setup() {
    vi.stubEnv("GOOGLE_APPS_SCRIPT_WEB_APP_URL", "https://script.google.com/macros/s/test/exec");
    vi.stubEnv("GOOGLE_APPS_SCRIPT_SHARED_SECRET", "secret");
  }
  it("follows ContentService redirects as GET without sending credentials", async () => {
    setup();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, {status: 302, headers: {location: "https://script.googleusercontent.com/macros/echo?result=one"}}))
      .mockResolvedValueOnce(Response.json({ok: true, data: {ok: true}}));
    vi.stubGlobal("fetch", fetchMock);
    await expect(callGas("addStudentMessage", {requestId: "request"})).resolves.toEqual({ok: true});
    expect(fetchMock.mock.calls[1][1]).toMatchObject({method: "GET", redirect: "manual"});
    expect(fetchMock.mock.calls[1][1].headers).toBeUndefined();
    expect(fetchMock.mock.calls[1][1].body).toBeUndefined();
  });
  it("follows multiple Google result redirects using Worker-supported modes", async () => {
    setup();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, {status: 302, headers: {location: "https://script.googleusercontent.com/macros/echo?result=one"}}))
      .mockResolvedValueOnce(new Response(null, {status: 302, headers: {location: "https://script.googleusercontent.com/macros/echo?result=two"}}))
      .mockResolvedValueOnce(Response.json({ok: true, data: null}));
    vi.stubGlobal("fetch", fetchMock);
    await expect(callGas("getCaseByToken")).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    for (const [, options] of fetchMock.mock.calls.slice(1)) {
      expect(options.method).toBe("GET");
      expect(options.redirect).toBe("manual");
      expect(options.body).toBeUndefined();
    }
  });
  it("recovers from a result URL 404 with the same idempotency key", async () => {
    setup();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, {status: 302, headers: {location: "https://script.googleusercontent.com/macros/echo?result=one"}}))
      .mockResolvedValueOnce(new Response(null, {status: 404}))
      .mockResolvedValueOnce(Response.json({ok: true, data: {ok: true}}));
    vi.stubGlobal("fetch", fetchMock);
    await expect(callGas("addStudentMessage", {requestId: "same-request"})).resolves.toEqual({ok: true});
    expect(fetchMock.mock.calls[0][1].body).toBe(fetchMock.mock.calls[2][1].body);
  });
  it("never retries other mutations after an ambiguous error", async () => {
    setup();
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, {status: 404}));
    vi.stubGlobal("fetch", fetchMock);
    await expect(callGas("approveReview")).rejects.toThrow("404");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("rejects unexpected redirect destinations", async () => {
    setup();
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, {status: 302, headers: {location: "https://example.com"}}));
    vi.stubGlobal("fetch", fetchMock);
    await expect(callGas("getCaseByToken")).rejects.toThrow("轉址異常");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("allows custom backoff delay during retry", async () => {
    setup();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, {status: 503}))
      .mockResolvedValueOnce(Response.json({ok: true, data: {cases: [], total: 0}}));
    vi.stubGlobal("fetch", fetchMock);
    const start = Date.now();
    await expect(callGas("listCases", {}, { backoffMs: 50 })).resolves.toEqual({cases: [], total: 0});
    expect(Date.now() - start).toBeGreaterThanOrEqual(40);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

