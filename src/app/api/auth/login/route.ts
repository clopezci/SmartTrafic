import { NextRequest, NextResponse } from "next/server";
import { authenticate, setSession } from "@/lib/session";
import { getLandingCopy } from "@/lib/site-settings";
import { SUPERADMIN_EMAIL } from "@/lib/types";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const copy = await getLandingCopy();
  if (copy.lockLogins && email !== SUPERADMIN_EMAIL) {
    return NextResponse.redirect(new URL("/entrar?error=locked", req.url), 303);
  }
  const user = await authenticate(email, password);
  if (!user) {
    return NextResponse.redirect(new URL("/entrar?error=invalid", req.url), 303);
  }
  await setSession(user);
  return NextResponse.redirect(new URL("/app/tablero", req.url), 303);
}
