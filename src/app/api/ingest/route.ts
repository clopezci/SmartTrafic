import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

function validHmac(raw: string, header: string | null): boolean {
  const secret = process.env.INGEST_HMAC_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!header) return false;
  const digest = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(digest);
  const b = Buffer.from(header);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-smarttrafic-signature");
  if (!validHmac(raw, sig)) {
    return NextResponse.json({ ok: false, error: "firma inválida" }, { status: 401 });
  }
  try {
    JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "json" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, stored: "demo" });
}
