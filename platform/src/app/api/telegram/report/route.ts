import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isPlatformAdmin } from "@/lib/format";
import { healthIssues, kpis } from "@/lib/demo-data";

async function sendTelegram(text: string): Promise<{ ok: boolean; detail: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chat) {
    return { ok: false, detail: "Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_ADMIN_CHAT_ID" };
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML" }),
  });
  const json = await res.json();
  return { ok: Boolean(json.ok), detail: json.description || "enviado" };
}

function reportText(): string {
  const open = healthIssues.filter((h) => h.level !== "info");
  return [
    "<b>SmartTrafic · salud diaria</b>",
    `Cruces en línea: ${kpis.intersectionsOnline}/${kpis.intersectionsTotal}`,
    `Uptime: ${kpis.uptimePct}%`,
    `Alertas abiertas: ${kpis.openAlerts}`,
    `Espera media ↓ ${kpis.waitDropPct}%`,
    "",
    ...open.map((h) => `• [${h.level}] ${h.source}: ${h.message}`),
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  const cron = req.headers.get("x-cron-secret");
  const allowed =
    isPlatformAdmin(user) ||
    (Boolean(process.env.CRON_SECRET) && cron === process.env.CRON_SECRET);
  if (!allowed) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const result = await sendTelegram(reportText());
  const wantsHtml = (req.headers.get("accept") || "").includes("text/html") || req.headers.get("content-type")?.includes("application/x-www-form-urlencoded");
  if (wantsHtml) {
    const url = new URL("/app/plataforma/salud", req.url);
    url.searchParams.set("telegram", result.ok ? "ok" : "fail");
    return NextResponse.redirect(url, 303);
  }
  return NextResponse.json(result);
}
