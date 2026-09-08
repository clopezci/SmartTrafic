import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { dbAudit, dbFindIntersectionId, dbInsertSnapshot } from "@/lib/persist";

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
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "json" }, { status: 400 });
  }

  const codeOrId = String(body.intersectionId || body.intersection_id || body.code || body.intersectionCode || "");
  const intersectionId = codeOrId ? await dbFindIntersectionId(codeOrId) : null;
  const mode = String(body.mode || "normal");
  const battery = Number(body.batteryPct ?? body.battery_pct);
  const stored = intersectionId
    ? await dbInsertSnapshot({
        intersectionId,
        mode,
        batteryPct: Number.isFinite(battery) ? battery : undefined,
        payload: body,
      })
    : "no-intersection";

  if (intersectionId && !stored) {
    await dbAudit({
      action: "ingest.snapshot",
      entity: "intersections",
      entityId: intersectionId,
      diff: { code: codeOrId, mode },
    });
  }

  return NextResponse.json({
    ok: stored === null || stored === "no-db" || stored === "no-intersection",
    stored: stored === null ? "supabase" : stored === "no-db" || stored === "no-intersection" ? "demo" : stored,
    intersectionId,
  });
}
