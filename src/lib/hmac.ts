import { createHmac, timingSafeEqual } from "crypto";

export function signBody(raw: string, secret: string): string {
  return createHmac("sha256", secret).update(raw).digest("hex");
}

export function signaturesMatch(expectedHex: string, header: string | null): boolean {
  if (!header) return false;
  const a = Buffer.from(expectedHex);
  const b = Buffer.from(header);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function ingestSecret(): string {
  return process.env.INGEST_HMAC_SECRET || process.env.SESSION_SECRET || "";
}

export function hmacOk(raw: string, header: string | null): boolean {
  const secret = ingestSecret();
  if (!secret) return process.env.NODE_ENV !== "production";
  return signaturesMatch(signBody(raw, secret), header);
}
