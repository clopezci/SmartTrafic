import { createHmac } from "crypto";
import {
  DEMO_MUNICIPALITY_ID,
  DEMO_MUNICIPALITY_NAME,
} from "./demo-data";
import { SUPERADMIN_EMAIL } from "./types";
import type { Role, SessionUser } from "./types";

export type AccessGrant = {
  email: string;
  fullName: string;
  role: Role;
  isPlatformAdmin: boolean;
  expiresAt: string | null;
  password: string;
  createdAt: string;
};

const ROLE_CODE: Record<string, { role: Role; admin: boolean }> = {
  adm: { role: "platform_ops", admin: true },
  mun: { role: "municipality_admin", admin: false },
  tec: { role: "technician", admin: false },
  vis: { role: "viewer", admin: false },
};

function secret(): string {
  return process.env.SESSION_SECRET || "smarttrafic-dev-only-change-me-32chars!!";
}

function expStamp(expiresAt: string | null): string {
  if (!expiresAt) return "99991231";
  return expiresAt.slice(0, 10).replace(/-/g, "");
}

function codeFor(role: Role, admin: boolean): string {
  if (admin || role === "superadmin" || role === "platform_ops") return "adm";
  if (role === "municipality_admin") return "mun";
  if (role === "technician") return "tec";
  return "vis";
}

export function issueInvitePassword(
  email: string,
  role: Role,
  isPlatformAdmin: boolean,
  expiresAt: string | null,
): string {
  const code = codeFor(role, isPlatformAdmin);
  const exp = expStamp(expiresAt);
  const msg = `${email.toLowerCase()}|${code}|${exp}`;
  const hmac = createHmac("sha256", secret()).update(msg).digest("base64url").slice(0, 8);
  return `ST-${code}-${exp}-${hmac}`;
}

export function verifyInvitePassword(
  email: string,
  password: string,
): Omit<AccessGrant, "password" | "createdAt" | "fullName"> | null {
  const m = /^ST-(adm|mun|tec|vis)-(\d{8})-([A-Za-z0-9_-]{8})$/.exec(password.trim());
  if (!m) return null;
  const [, code, exp, hmac] = m;
  const msg = `${email.toLowerCase()}|${code}|${exp}`;
  const expected = createHmac("sha256", secret()).update(msg).digest("base64url").slice(0, 8);
  if (expected !== hmac) return null;
  if (exp !== "99991231") {
    const end = Date.UTC(
      Number(exp.slice(0, 4)),
      Number(exp.slice(4, 6)) - 1,
      Number(exp.slice(6, 8)),
      23,
      59,
      59,
    );
    if (Date.now() > end) return null;
  }
  const spec = ROLE_CODE[code];
  if (!spec) return null;
  const expiresAt =
    exp === "99991231"
      ? null
      : `${exp.slice(0, 4)}-${exp.slice(4, 6)}-${exp.slice(6, 8)}T23:59:59.000Z`;
  return {
    email: email.toLowerCase(),
    role: spec.role,
    isPlatformAdmin: spec.admin,
    expiresAt,
  };
}

export function grantToUser(
  grant: Pick<AccessGrant, "email" | "fullName" | "role" | "isPlatformAdmin" | "expiresAt">,
): SessionUser {
  const platform = grant.isPlatformAdmin || grant.role === "platform_ops";
  return {
    id: `g-${grant.email.replace(/[^a-z0-9]/g, "").slice(0, 16)}`,
    email: grant.email.toLowerCase(),
    fullName: grant.fullName || grant.email.split("@")[0],
    role: platform ? "platform_ops" : grant.role,
    municipalityId: platform ? null : DEMO_MUNICIPALITY_ID,
    municipalityName: platform ? null : DEMO_MUNICIPALITY_NAME,
    isPlatformAdmin: platform,
    grantExpiresAt: grant.expiresAt,
    isGuest: true,
  };
}

export function ownerEmail(): string {
  return SUPERADMIN_EMAIL;
}

export function daysFromNow(days: number): string | null {
  if (!Number.isFinite(days) || days <= 0) return null;
  return new Date(Date.now() + days * 86400000).toISOString();
}

export function grantStillValid(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return true;
  return Date.now() <= new Date(expiresAt).getTime();
}
