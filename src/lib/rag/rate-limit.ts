/**
 * Rate limiting. Uses Upstash Ratelimit when Redis env vars are present
 * (durable, multi-region); otherwise a best-effort in-memory limiter that
 * bounds abuse within a single warm instance. Never throws — degrades to
 * "allowed" if the limiter backend fails, so the assistant stays available.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;

type UpstashLimiter = { limit: (key: string) => Promise<{ success: boolean }> };
let upstashLimiter: UpstashLimiter | null | undefined;

const memoryHits = new Map<string, number[]>();

async function getUpstashLimiter(): Promise<UpstashLimiter | null> {
  if (upstashLimiter !== undefined) return upstashLimiter;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    upstashLimiter = null;
    return null;
  }
  try {
    const [{ Ratelimit }, { Redis }] = await Promise.all([
      import("@upstash/ratelimit"),
      import("@upstash/redis"),
    ]);
    upstashLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "60 s"),
      prefix: "assistant",
    });
  } catch {
    upstashLimiter = null;
  }
  return upstashLimiter;
}

function memoryAllow(key: string): boolean {
  const now = Date.now();
  const hits = (memoryHits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_REQUESTS) {
    memoryHits.set(key, hits);
    return false;
  }
  hits.push(now);
  memoryHits.set(key, hits);
  return true;
}

/** Returns true if the request is within limits. */
export async function checkRateLimit(identifier: string): Promise<boolean> {
  const limiter = await getUpstashLimiter();
  if (limiter) {
    try {
      const { success } = await limiter.limit(identifier);
      return success;
    } catch {
      return true; // fail-open on limiter error
    }
  }
  return memoryAllow(identifier);
}
