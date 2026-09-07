import { NextResponse } from "next/server";
import { heartbeats } from "@/lib/demo-data";
import { getSession } from "@/lib/session";
import { isPlatformAdmin } from "@/lib/format";

export async function GET() {
  const user = await getSession();
  const checks = [
    ...heartbeats,
    {
      component: "Sesión",
      ok: Boolean(user),
      latencyMs: 1,
      detail: user ? user.email : "anónimo",
    },
  ];
  const ok = checks.every((c) => c.ok || c.component === "MQTT");
  return NextResponse.json({
    ok,
    platformAdmin: isPlatformAdmin(user),
    checks,
    now: new Date().toISOString(),
  });
}
