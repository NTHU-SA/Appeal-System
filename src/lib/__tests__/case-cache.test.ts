import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCachedCaseData, invalidateCaseCache } from "@/lib/case-cache";

describe("case-cache", () => {
  beforeEach(() => {
    invalidateCaseCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns fresh data and caches it for TTL duration", async () => {
    const fetcher = vi.fn().mockResolvedValue({ id: "case-1", title: "Test Case" });

    const first = await getCachedCaseData("case-1", fetcher, 5000);
    expect(first).toEqual({ id: "case-1", title: "Test Case" });
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Second call within TTL should return cached data without calling fetcher again
    const second = await getCachedCaseData("case-1", fetcher, 5000);
    expect(second).toEqual({ id: "case-1", title: "Test Case" });
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Advance time beyond TTL
    vi.advanceTimersByTime(5001);

    // Third call should invoke fetcher again
    const third = await getCachedCaseData("case-1", fetcher, 5000);
    expect(third).toEqual({ id: "case-1", title: "Test Case" });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("coalesces multiple concurrent in-flight requests into a single fetch", async () => {
    let resolvePromise: (value: { id: string }) => void;
    const fetcher = vi.fn().mockImplementation(
      () =>
        new Promise<{ id: string }>((resolve) => {
          resolvePromise = resolve;
        })
    );

    const call1 = getCachedCaseData("coalesce-key", fetcher);
    const call2 = getCachedCaseData("coalesce-key", fetcher);
    const call3 = getCachedCaseData("coalesce-key", fetcher);

    expect(fetcher).toHaveBeenCalledTimes(1);

    resolvePromise!({ id: "coalesced" });

    const [res1, res2, res3] = await Promise.all([call1, call2, call3]);
    expect(res1).toEqual({ id: "coalesced" });
    expect(res2).toEqual({ id: "coalesced" });
    expect(res3).toEqual({ id: "coalesced" });
  });

  it("invalidates cache when invalidateCaseCache is called", async () => {
    const fetcher = vi.fn().mockResolvedValue({ status: "pending" });

    await getCachedCaseData("case-key", fetcher, 10000);
    expect(fetcher).toHaveBeenCalledTimes(1);

    invalidateCaseCache("case-key");

    await getCachedCaseData("case-key", fetcher, 10000);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("clears all cache when invalidateCaseCache is called without arguments", async () => {
    const fetcher = vi.fn().mockResolvedValue({ status: "pending" });

    await getCachedCaseData("key-1", fetcher, 10000);
    await getCachedCaseData("key-2", fetcher, 10000);
    expect(fetcher).toHaveBeenCalledTimes(2);

    invalidateCaseCache();

    await getCachedCaseData("key-1", fetcher, 10000);
    await getCachedCaseData("key-2", fetcher, 10000);
    expect(fetcher).toHaveBeenCalledTimes(4);
  });
});
