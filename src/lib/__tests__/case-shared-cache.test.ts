import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function cacheFixture() {
  const entries = new Map<string, Response>();
  const shared = {
    match: vi.fn(async (key: Request) => entries.get(key.url)?.clone()),
    put: vi.fn(async (key: Request, value: Response) => { entries.set(key.url, value.clone()); }),
  };
  vi.stubGlobal("caches", { default: {}, open: vi.fn(async () => shared) });
  return { shared, entries };
}

async function isolate() {
  vi.resetModules();
  return import("@/lib/case-cache");
}

describe("shared Worker case cache", () => {
  beforeEach(() => { vi.stubEnv("GOOGLE_APPS_SCRIPT_SHARED_SECRET", "secret"); });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

  it("reuses completed data across Worker isolates without another backend request", async () => {
    cacheFixture();
    const first = await isolate();
    const second = await isolate();
    const fetcher = vi.fn(async () => ({ messages: ["message"] }));
    await first.getCachedCaseData("token:private-token", fetcher);
    expect(await second.getCachedCaseData("token:private-token", fetcher)).toEqual({ messages: ["message"] });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("invalidates all isolates in the data center after a student message", async () => {
    cacheFixture();
    const first = await isolate();
    const second = await isolate();
    await first.getCachedCaseData("token:case", async () => "old");
    await second.invalidateCaseByToken("case");
    expect(await first.getCachedCaseData("token:case", async () => "new")).toBe("new");
  });

  it("keeps old in-flight results out of the generation used after a mutation", async () => {
    const { shared } = cacheFixture();
    const first = await isolate();
    const second = await isolate();
    let resolve!: (data: string) => void;
    const fetcher = vi.fn(() => new Promise<string>((done) => { resolve = done; }));
    const old = first.getCachedCaseData("token:case", fetcher);
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    await second.invalidateCaseByToken("case");
    await second.getCachedCaseData("token:case", async () => "new");
    resolve("old");
    await old;
    expect(await first.getCachedCaseData("token:case", async () => "unexpected")).toBe("new");
    expect(shared.put).toHaveBeenCalledTimes(4);
  });

  it("does not reuse old data if the generation marker is evicted", async () => {
    const { entries } = cacheFixture();
    const first = await isolate();
    await first.getCachedCaseData("token:case", async () => "old");
    for (const key of entries.keys()) if (key.endsWith("/generation")) entries.delete(key);
    expect(await first.getCachedCaseData("token:case", async () => "fresh")).toBe("fresh");
  });

  it("enforces the TTL even if a cache returns an expired entry", async () => {
    cacheFixture();
    const first = await isolate();
    await first.getCachedCaseData("token:case", async () => "old");
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now + 60001);
    expect(await first.getCachedCaseData("token:case", async () => "fresh")).toBe("fresh");
  });

  it("isolates tokens and secret rotations without exposing either in cache URLs", async () => {
    const { entries } = cacheFixture();
    const first = await isolate();
    await first.getCachedCaseData("token:private-token", async () => "one");
    expect(await first.getCachedCaseData("token:other-token", async () => "two")).toBe("two");
    vi.stubEnv("GOOGLE_APPS_SCRIPT_SHARED_SECRET", "rotated-secret");
    expect(await first.getCachedCaseData("token:private-token", async () => "rotated")).toBe("rotated");
    for (const key of entries.keys()) expect(key).not.toMatch(/private-token|other-token|secret/);
  });

  it("does not turn a completed submission into a failure when cache invalidation fails", async () => {
    const { shared } = cacheFixture();
    const first = await isolate();
    shared.put.mockRejectedValue(new Error("cache unavailable"));
    await expect(first.invalidateCaseByToken("case")).resolves.toBeUndefined();
  });

  it("returns fresh data on cache failure and never caches a backend error", async () => {
    const { shared } = cacheFixture();
    const first = await isolate();
    await expect(first.getCachedCaseData("token:case", async () => { throw new Error("backend failed"); })).rejects.toThrow("backend failed");
    // Only the generation marker was stored, not the failed lookup.
    expect(shared.put).toHaveBeenCalledTimes(1);
    shared.put.mockRejectedValue(new Error("cache unavailable"));
    expect(await first.getCachedCaseData("token:case", async () => "fresh")).toBe("fresh");
  });
});
