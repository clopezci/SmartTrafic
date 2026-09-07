import { NextRequest, NextResponse } from "next/server";
import { demoLogin, setSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const user = demoLogin(email, password);
  if (!user) {
    return NextResponse.redirect(new URL("/entrar?error=invalid", req.url), 303);
  }
  await setSession(user);
  const dest = user.isPlatformAdmin ? "/app/tablero" : "/app/tablero";
  return NextResponse.redirect(new URL(dest, req.url), 303);
}
