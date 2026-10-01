type Bucket = { stamps: number[] };

const buckets = new Map<string, Bucket>();

export function allowRequest(
  key: string,
  limit = 60,
  windowMs = 60_000,
  now = Date.now(),
): boolean {
  const bucket = buckets.get(key) ?? { stamps: [] };
  const fresh = bucket.stamps.filter((t) => now - t < windowMs);
  if (fresh.length >= limit) {
    buckets.set(key, { stamps: fresh });
    return false;
  }
  fresh.push(now);
  buckets.set(key, { stamps: fresh });
  return true;
}

export function resetLimits(): void {
  buckets.clear();
}
