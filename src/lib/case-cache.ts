import { createHash, randomUUID } from "node:crypto";

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
  if (typeof caches !== "undefined" && "default" in caches) {
    const shared = await sharedCaseCache();
    if (shared) return getSharedCaseData(shared, key, fetcher, ttlMs);
  }

  const now = Date.now();
  const cached = cacheStore.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  const inFlight = inFlightStore.get(key);
  if (inFlight) {
    return inFlight as Promise<T>;
  }

  // Keep fetcher invocation synchronous, but handle settlement only after the
  // promise is registered, including fetchers that throw synchronously.
  const promise = (async () => fetcher())()
    .then((data) => {
      // Invalidation detaches old requests. They may finish for their original
      // caller, but must never repopulate the cache after a newer write/read.
      if (inFlightStore.get(key) === promise) {
        if (!cacheStore.has(key) && cacheStore.size >= MAX_CACHE_ENTRIES) {
          const oldestKey = cacheStore.keys().next().value;
          if (oldestKey !== undefined) cacheStore.delete(oldestKey);
        }
        cacheStore.set(key, {
          data,
          expiresAt: Date.now() + ttlMs,
        });
      }
      return data;
    })
    .finally(() => {
      if (inFlightStore.get(key) === promise) inFlightStore.delete(key);
    });

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

export async function invalidateCaseByToken(token: string): Promise<void> {
  const key = `token:${token}`;
  invalidateCaseCache(key);
  const shared = await sharedCaseCache();
  if (shared) {
    // Readers already in flight can only fill their old generation. They cannot
    // replace the generation published after this mutation.
    try {
      await shared.put(sharedKey(key), generationResponse(randomUUID()));
    } catch {
      // The student message is already saved. Do not report it as a failed
      // submission just because the optional cache is unavailable.
      console.warn("Case cache invalidation failed");
    }
  }
}



const SHARED_CACHE_NAME = "campusvoice-private-cases-v1";

async function sharedCaseCache(): Promise<Cache | null> {
  // Cloudflare's Cache API is shared by isolates in a data center. Browser/Node
  // caches are not this server-side store. Never share live I/O promises across
  // Worker requests; React.cache handles deduplication within a page render.
  if (typeof caches === "undefined" || !("default" in caches)) return null;
  try {
    return await caches.open(SHARED_CACHE_NAME);
  } catch {
    console.warn("Case cache unavailable");
    return null;
  }
}

function sharedKey(key: string, generation?: string): Request {
  const digest = createHash("sha256")
    .update(JSON.stringify([
      process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL,
      process.env.GOOGLE_APPS_SCRIPT_SHARED_SECRET,
      key,
    ]))
    .digest("hex");
  // A named cache is separate from the public fetch/CDN cache. These synthetic
  // URLs have no public route, and never contain the bearer token or secret.
  return new Request(new URL(
    `/__private-case-cache/${digest}/${generation || "generation"}`,
    process.env.NEXT_PUBLIC_APP_URL || "https://appeal.nthusa.tw",
  ));
}

function generationResponse(generation: string): Response {
  return new Response(generation, { headers: { "Cache-Control": "max-age=120" } });
}

async function getSharedCaseData<T>(
  shared: Cache,
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  let dataKey: Request | undefined;
  try {
    const generationKey = sharedKey(key);
    const current = await shared.match(generationKey);
    const generation = current ? await current.text() : randomUUID();
    if (!current) await shared.put(generationKey, generationResponse(generation));
    dataKey = sharedKey(key, generation);
    const cached = await shared.match(dataKey);
    if (cached) {
      const entry = await cached.json() as CacheEntry<T>;
      if (entry.expiresAt > Date.now()) return entry.data;
    }
  } catch {
    console.warn("Case cache read failed");
  }

  const data = await fetcher();
  if (dataKey && ttlMs > 0) {
    try {
      await shared.put(dataKey, Response.json({ data, expiresAt: Date.now() + ttlMs }, {
        headers: { "Cache-Control": `max-age=${Math.max(1, Math.ceil(ttlMs / 1000))}` },
      }));
    } catch {
      // Cache failures must not discard a successful case lookup.
      console.warn("Case cache write failed");
    }
  }
  return data;
}
