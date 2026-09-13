const DEFAULT_TTL_MS = 60_000; // 60 seconds
const MAX_CACHE_ENTRIES = 500;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cacheStore = new Map<string, CacheEntry<unknown>>();
const inFlightStore = new Map<string, Promise<unknown>>();

/**
 * Retrieves cached data by key, coalesces in-flight concurrent requests,
 * and caches successful results for a given TTL.
 */
export async function getCachedCaseData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const now = Date.now();
  const cached = cacheStore.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  const inFlight = inFlightStore.get(key);
  if (inFlight) {
    return inFlight as Promise<T>;
  }

  const promise = (async () => {
    try {
      const data = await fetcher();
      if (cacheStore.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = cacheStore.keys().next().value;
        if (oldestKey) cacheStore.delete(oldestKey);
      }
      cacheStore.set(key, {
        data,
        expiresAt: Date.now() + ttlMs,
      });
      return data;
    } finally {
      inFlightStore.delete(key);
    }
  })();

  inFlightStore.set(key, promise);
  return promise;
}

/**
 * Invalidate a specific case cache entry or the entire cache store.
 */
export function invalidateCaseCache(key?: string): void {
  if (key) {
    cacheStore.delete(key);
    inFlightStore.delete(key);
  } else {
    cacheStore.clear();
    inFlightStore.clear();
  }
}

export function invalidateCaseByToken(token: string): void {
  invalidateCaseCache(`token:${token}`);
}

