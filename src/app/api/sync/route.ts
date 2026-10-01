import { NextRequest, NextResponse } from "next/server";
import { dbAckAlert } from "@/lib/persist";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json()) as { ids?: string[] };
  const ids = Array.isArray(body.ids) ? body.ids : [];
  const failed: string[] = [];
  for (const id of ids) {
    const err = await dbAckAlert(String(id), user.email);
    if (err && err !== "no-db") failed.push(id);
  }
  return NextResponse.json({ ok: failed.length === 0, failed });
}
