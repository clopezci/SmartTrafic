import { NextRequest, NextResponse } from "next/server";
import { hmacOk } from "@/lib/hmac";
import { dbAddKpi, dbAudit, dbFindIntersection, dbInsertPlate, dbInsertSnapshot } from "@/lib/persist";
import { allowRequest } from "@/lib/rate-limit";
import { readSavedValues } from "@/lib/site-settings";

function countsFrom(body: Record<string, unknown>): { motos: number; trucks: number } {
  const approaches = Array.isArray(body.approaches) ? body.approaches : [];
  let motos = 0;
  let trucks = 0;
  for (const raw of approaches) {
    const counts = (raw as { counts?: Record<string, unknown> }).counts ?? {};
    motos += Number(counts.motos || 0);
    trucks += Number(counts.trucks || 0);
  }
  const top = (body.counts ?? {}) as Record<string, unknown>;
  motos += Number(top.motos || 0);
  trucks += Number(top.trucks || 0);
  return { motos, trucks };
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowRequest(`ingest:${ip}`, 60, 60_000)) {
    return NextResponse.json({ ok: false, error: "demasiadas peticiones" }, { status: 429 });
  }
  const raw = await req.text();
  const sig = req.headers.get("x-smarttrafic-signature");
  if (!hmacOk(raw, sig)) {
    return NextResponse.json({ ok: false, error: "firma inválida" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "json" }, { status: 400 });
  }

  const codeOrId = String(body.intersectionId || body.intersection_id || body.code || body.intersectionCode || "");
  const found = codeOrId ? await dbFindIntersection(codeOrId) : null;
  const mode = String(body.mode || "normal");
  const battery = Number(body.batteryPct ?? body.battery_pct);
  const stored = found
    ? await dbInsertSnapshot({
        intersectionId: found.id,
        mode,
        batteryPct: Number.isFinite(battery) ? battery : undefined,
        payload: body,
      })
    : "no-intersection";

  if (found && !stored) {
    const counts = countsFrom(body);
    await dbAddKpi({
      municipalityId: found.municipalityId,
      motos: counts.motos,
      trucks: counts.trucks,
      batteryPct: Number.isFinite(battery) ? battery : undefined,
    });
    await dbAudit({
      action: "ingest.snapshot",
      entity: "intersections",
      entityId: found.id,
      diff: { code: codeOrId, mode },
    });
  }

  let plates: "stored" | "blocked" | "none" = "none";
  const incoming = Array.isArray(body.plates) ? body.plates : [];
  if (incoming.length) {
    const settings = await readSavedValues();
    if (settings["feature.platesLegal"] === "true" && found) {
      for (const item of incoming) {
        const plate = String((item as { plate?: string }).plate || "").trim().toUpperCase();
        if (!plate) continue;
        await dbInsertPlate({
          municipalityId: found.municipalityId,
          intersectionId: found.id,
          plate,
        });
      }
      plates = "stored";
    } else {
      plates = "blocked";
    }
  }

  return NextResponse.json({
    ok: stored === null || stored === "no-db" || stored === "no-intersection",
    stored: stored === null ? "supabase" : stored === "no-db" || stored === "no-intersection" ? "demo" : stored,
    intersectionId: found?.id ?? null,
    plates,
  });
}
