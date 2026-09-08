import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { grantStillValid, grantToUser, verifyInvitePassword } from "./access";
import { DEMO_USERS } from "./demo-data";
import { listGrants, revokedEmails } from "./site-settings";
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
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

function stampOwner(user: SessionUser): SessionUser {
  if (user.email.toLowerCase() === SUPERADMIN_EMAIL) {
    return {
      ...user,
      role: "superadmin",
      isPlatformAdmin: true,
      isGuest: false,
      grantExpiresAt: null,
    };
  }
  return user;
}

export async function authenticate(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const e = email.trim().toLowerCase();
  if (!e || !password) return null;
  if (e !== SUPERADMIN_EMAIL) {
    const blocked = await revokedEmails();
    if (blocked.has(e)) return null;
  }

  const row = DEMO_USERS[e];
  if (row && row.password === password) {
    return stampOwner({ ...row.user });
  }

  const invite = verifyInvitePassword(e, password);
  if (!invite) return null;
  if (e === SUPERADMIN_EMAIL) return null;
  const named = (await listGrants()).find((g) => g.email === e);
  return grantToUser({
    email: e,
    fullName: named?.fullName || e.split("@")[0],
    role: invite.role,
    isPlatformAdmin: invite.isPlatformAdmin,
    expiresAt: invite.expiresAt,
  });
}

export async function setSession(user: SessionUser): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, encode(stampOwner(user)), {
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
  const user = decode(token);
  if (!user) return null;
  const stamped = stampOwner(user);
  if (stamped.email.toLowerCase() !== SUPERADMIN_EMAIL) {
    if (!grantStillValid(stamped.grantExpiresAt)) return null;
    const blocked = await revokedEmails();
    if (blocked.has(stamped.email.toLowerCase())) return null;
  }
  return stamped;
}

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
