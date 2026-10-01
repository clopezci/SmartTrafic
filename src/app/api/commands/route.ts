import { NextRequest, NextResponse } from "next/server";
import { hmacOk } from "@/lib/hmac";
import { readOverlay, writeOverlay } from "@/lib/ops";
import { dbAckCommand, dbPullCommands } from "@/lib/persist";
import { allowRequest } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowRequest(`cmd:${ip}`, 120, 60_000)) {
    return NextResponse.json({ ok: false, error: "demasiadas peticiones" }, { status: 429 });
  }
  const code = req.nextUrl.searchParams.get("code") || "";
  if (!code) return NextResponse.json({ ok: false, error: "code" }, { status: 400 });
  if (!hmacOk(code, req.headers.get("x-smarttrafic-signature"))) {
    return NextResponse.json({ ok: false, error: "firma inválida" }, { status: 401 });
  }
  const pulled = await dbPullCommands(code);
  if (!Array.isArray(pulled)) {
    const overlay = await readOverlay();
    const commands = overlay.commands.filter((c) => c.code === code && c.status === "queued");
    return NextResponse.json({ ok: true, stored: "local", commands });
  }
  return NextResponse.json({ ok: true, stored: "supabase", commands: pulled });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!hmacOk(raw, req.headers.get("x-smarttrafic-signature"))) {
    return NextResponse.json({ ok: false, error: "firma inválida" }, { status: 401 });
  }
  let body: { id?: string };
  try {
    body = JSON.parse(raw) as { id?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "json" }, { status: 400 });
  }
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ ok: false, error: "id" }, { status: 400 });
  const err = await dbAckCommand(id);
  if (err) {
    const overlay = await readOverlay();
    overlay.commands = overlay.commands.map((c) => (c.id === id ? { ...c, status: "acked" } : c));
    await writeOverlay(overlay);
  }
  return NextResponse.json({ ok: true });
}
