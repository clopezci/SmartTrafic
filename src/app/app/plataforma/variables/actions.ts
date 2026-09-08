"use server";

import { redirect } from "next/navigation";
import {
  daysFromNow,
  issueInvitePassword,
  ownerEmail,
  type AccessGrant,
} from "@/lib/access";
import { municipalityVariables } from "@/lib/demo-data";
import { isOwner, isPlatformAdmin, canWriteMunicipality } from "@/lib/format";
import { getSession } from "@/lib/session";
import {
  ALL_PLATFORM_FIELDS,
  addRevokedEmail,
  clearRevokedEmail,
  listGrants,
  PLAN_VARIABLES,
  readSavedValues,
  savePlatformValues,
  setFlash,
  writeGrants,
} from "@/lib/site-settings";
import type { Role } from "@/lib/types";

const municipalityKeys = new Set(municipalityVariables.map((v) => v.key));
const platformKeys = new Set(ALL_PLATFORM_FIELDS.map((v) => v.key));
const planKeys = new Set(PLAN_VARIABLES.map((v) => v.key));

function requireOwnerRedirect() {
  redirect("/app/tablero");
}

export async function savePlatformVariables(formData: FormData) {
  const user = await getSession();
  if (!user) redirect("/entrar");
  const admin = isPlatformAdmin(user);
  const writable = canWriteMunicipality(user);
  if (!admin && !writable) redirect("/app/tablero");

  const patch: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("_") || typeof value !== "string") continue;
    if (planKeys.has(key) && !admin) continue;
    if (municipalityKeys.has(key) && !writable) continue;
    if (platformKeys.has(key) && !admin) continue;
    if (!planKeys.has(key) && !municipalityKeys.has(key) && !platformKeys.has(key) && !admin) {
      continue;
    }
    patch[key] = value;
  }
  await savePlatformValues(patch);
  const raw = String(formData.get("_next") || "/app/plataforma/variables");
  const next =
    raw === "/app/configuracion" || raw === "/app/plataforma/variables"
      ? raw
      : "/app/plataforma/variables";
  redirect(`${next}?ok=1`);
}

export async function createAccessGrant(formData: FormData) {
  const user = await getSession();
  if (!isOwner(user)) requireOwnerRedirect();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") || "").trim() || email.split("@")[0];
  const kind = String(formData.get("kind") || "viewer");
  const days = Number(formData.get("days") || 7);
  if (!email.includes("@") || email === ownerEmail()) {
    redirect("/app/plataforma/variables?ok=badmail");
  }
  const roleMap: Record<string, { role: Role; admin: boolean }> = {
    admin: { role: "platform_ops", admin: true },
    municipality: { role: "municipality_admin", admin: false },
    technician: { role: "technician", admin: false },
    viewer: { role: "viewer", admin: false },
  };
  const spec = roleMap[kind] ?? roleMap.viewer;
  const settings = await readSavedValues();
  const maxDays = Math.min(365, Math.max(1, Number(settings["security.inviteMaxDays"] || 90)));
  const cap = Math.min(Math.max(0, Number.isFinite(days) ? days : 7), maxDays);
  const expiresAt = daysFromNow(cap);
  const password = issueInvitePassword(email, spec.role, spec.admin, expiresAt);
  const grant: AccessGrant = {
    email,
    fullName,
    role: spec.role,
    isPlatformAdmin: spec.admin,
    expiresAt,
    password,
    createdAt: new Date().toISOString(),
  };
  const rest = (await listGrants()).filter((g) => g.email !== email);
  await writeGrants([grant, ...rest]);
  await clearRevokedEmail(email);
  await setFlash(
    `Listo. ${email} entra con la clave ${password}${expiresAt ? ` · vence ${expiresAt.slice(0, 10)}` : " · sin vencimiento"}.`,
  );
  redirect("/app/plataforma/variables?ok=grant");
}

export async function revokeAccessGrant(formData: FormData) {
  const user = await getSession();
  if (!isOwner(user)) requireOwnerRedirect();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email || email === ownerEmail()) {
    redirect("/app/plataforma/variables");
  }
  await addRevokedEmail(email);
  await setFlash(`Se quitó el acceso a ${email}.`);
  redirect("/app/plataforma/variables?ok=revoke");
}
