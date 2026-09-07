import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const res = await fetch(`${origin}/api/telegram/report`, {
    method: "POST",
    headers: { "x-cron-secret": secret || "" },
  });
  return NextResponse.json(await res.json());
}
