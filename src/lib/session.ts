import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { DEMO_USERS } from "./demo-data";
import { SUPERADMIN_EMAIL } from "./types";
import type { SessionUser } from "./types";

const COOKIE = "st_session";

function secret(): string {
  return process.env.SESSION_SECRET || "smarttrafic-dev-only-change-me-32chars!!";
}

function encode(user: SessionUser): string {
  const body = Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function decode(token: string): SessionUser | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const user = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionUser;
    if (user.email.toLowerCase() === SUPERADMIN_EMAIL) {
      user.role = "superadmin";
      user.isPlatformAdmin = true;
    }
    return user;
  } catch {
    return null;
  }
}

export function demoLogin(email: string, password: string): SessionUser | null {
  const row = DEMO_USERS[email.toLowerCase()];
  if (!row || row.password !== password) return null;
  const user = { ...row.user };
  if (user.email.toLowerCase() === SUPERADMIN_EMAIL) {
    user.role = "superadmin";
    user.isPlatformAdmin = true;
  }
  return user;
}

export async function setSession(user: SessionUser): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, encode(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return decode(token);
}

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
