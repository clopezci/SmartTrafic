import type { AccessGrant } from "./access";
import { DEMO_MUNICIPALITY_ID, municipalityVariables } from "./demo-data";
import { createSupabaseAdmin } from "./supabase/admin";
import type { Role } from "./types";

const MUNI_KEYS = new Set(municipalityVariables.map((v) => v.key));

function fromJsonb(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

export function supabaseReady(): boolean {
  return Boolean(createSupabaseAdmin());
}

function missingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  const msg = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
  return msg.includes("does not exist") || error.code === "42P01" || error.code === "PGRST205";
}

export async function probeTables(): Promise<{ name: string; ok: boolean; detail: string }[]> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return [{ name: "supabase", ok: false, detail: "Faltan URL o SERVICE_ROLE_KEY" }];
  }
  const names = [
    "municipalities",
    "profiles",
    "intersections",
    "approaches",
    "devices",
    "alerts",
    "audit_events",
    "system_settings",
    "timing_profiles",
    "intersection_snapshots",
    "access_grants",
    "credential_overrides",
    "display_names",
    "field_technicians",
    "kpi_daily",
    "health_events",
  ];
  const out: { name: string; ok: boolean; detail: string }[] = [];
  for (const name of names) {
    const started = Date.now();
    const { error, count } = await admin.from(name).select("*", { count: "exact", head: true });
    if (error) {
      out.push({
        name,
        ok: false,
        detail: missingTable(error) ? "tabla ausente — corre supabase/migrate_v2.sql" : error.message,
      });
    } else {
      out.push({ name, ok: true, detail: `${count ?? 0} filas · ${Date.now() - started} ms` });
    }
  }
  return out;
}

export async function dbGetSettings(): Promise<Record<string, string>> {
  const admin = createSupabaseAdmin();
  if (!admin) return {};
  const { data, error } = await admin.from("system_settings").select("key,value,municipality_id");
  if (error || !data) return {};
  const out: Record<string, string> = {};
  for (const row of data) {
    out[String(row.key)] = fromJsonb(row.value);
  }
  return out;
}

export async function dbPutSettings(patch: Record<string, string>): Promise<string | null> {
  const admin = createSupabaseAdmin();
  if (!admin) return "no-db";
  try {
    for (const [key, value] of Object.entries(patch)) {
      if (key.startsWith("access.") || key.startsWith("account.")) continue;
      const municipality_id = MUNI_KEYS.has(key) ? DEMO_MUNICIPALITY_ID : null;
      let q = admin.from("system_settings").select("id").eq("key", key);
      q = municipality_id ? q.eq("municipality_id", municipality_id) : q.is("municipality_id", null);
      const { data: existing, error: findErr } = await q.maybeSingle();
      if (findErr && missingTable(findErr)) return findErr.message;
      const payload = { key, value, municipality_id, updated_at: new Date().toISOString() };
      if (existing?.id) {
        const { error } = await admin.from("system_settings").update(payload).eq("id", existing.id);
        if (error) return error.message;
      } else {
        const { error } = await admin.from("system_settings").insert(payload);
        if (error) return error.message;
      }
    }
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : "db";
  }
}

export async function dbGetGrants(): Promise<AccessGrant[]> {
  const admin = createSupabaseAdmin();
  if (!admin) return [];
  const { data, error } = await admin.from("access_grants").select("*").eq("revoked", false);
  if (error || !data) return [];
  return data.map((row) => ({
    email: String(row.email),
    fullName: String(row.full_name || row.email),
    role: row.role as Role,
    isPlatformAdmin: Boolean(row.is_platform_admin),
    expiresAt: row.expires_at ? String(row.expires_at) : null,
    password: String(row.password_issued || ""),
    createdAt: String(row.created_at),
  }));
}

export async function dbPutGrants(grants: AccessGrant[]): Promise<void> {
  const admin = createSupabaseAdmin();
  if (!admin) return;
  const keep = new Set(grants.map((g) => g.email));
  const { data: all } = await admin.from("access_grants").select("email");
  const drop = (all ?? []).map((r) => String(r.email)).filter((email) => !keep.has(email));
  if (drop.length) {
    await admin.from("access_grants").update({ revoked: true }).in("email", drop);
  }
  for (const g of grants) {
    await admin.from("access_grants").upsert({
      email: g.email,
      full_name: g.fullName,
      role: g.role,
      is_platform_admin: g.isPlatformAdmin,
      expires_at: g.expiresAt,
      password_issued: g.password,
      revoked: false,
      created_at: g.createdAt,
    });
  }
}

export async function dbRevokeEmail(email: string): Promise<void> {
  const admin = createSupabaseAdmin();
  if (!admin) return;
  await admin.from("access_grants").update({ revoked: true }).eq("email", email.toLowerCase());
}

export async function dbClearRevoke(email: string): Promise<void> {
  const admin = createSupabaseAdmin();
  if (!admin) return;
  await admin.from("access_grants").update({ revoked: false }).eq("email", email.toLowerCase());
}

export async function dbRevokedEmails(): Promise<string[]> {
  const admin = createSupabaseAdmin();
  if (!admin) return [];
  const { data, error } = await admin.from("access_grants").select("email").eq("revoked", true);
  if (error || !data) return [];
  return data.map((r) => String(r.email).toLowerCase());
}

export async function dbGetNames(): Promise<Record<string, string>> {
  const admin = createSupabaseAdmin();
  if (!admin) return {};
  const { data, error } = await admin.from("display_names").select("email,full_name");
  if (error || !data) return {};
  return Object.fromEntries(data.map((r) => [String(r.email).toLowerCase(), String(r.full_name)]));
}

export async function dbPutName(email: string, fullName: string): Promise<void> {
  const admin = createSupabaseAdmin();
  if (!admin) return;
  await admin.from("display_names").upsert({
    email: email.toLowerCase(),
    full_name: fullName,
    updated_at: new Date().toISOString(),
  });
}

export async function dbGetHashes(): Promise<Record<string, string>> {
  const admin = createSupabaseAdmin();
  if (!admin) return {};
  const { data, error } = await admin.from("credential_overrides").select("email,password_hash");
  if (error || !data) return {};
  return Object.fromEntries(data.map((r) => [String(r.email).toLowerCase(), String(r.password_hash)]));
}

export async function dbPutHash(email: string, passwordHash: string): Promise<void> {
  const admin = createSupabaseAdmin();
  if (!admin) return;
  await admin.from("credential_overrides").upsert({
    email: email.toLowerCase(),
    password_hash: passwordHash,
    updated_at: new Date().toISOString(),
  });
}

export async function dbAudit(input: {
  actorEmail?: string;
  action: string;
  entity?: string;
  entityId?: string;
  diff?: unknown;
}): Promise<void> {
  const admin = createSupabaseAdmin();
  if (!admin) return;
  await admin.from("audit_events").insert({
    actor_email: input.actorEmail ?? null,
    action: input.action,
    entity: input.entity ?? null,
    entity_id: input.entityId ?? null,
    diff: input.diff ?? null,
  });
}

export async function dbAckAlert(id: string, actorEmail: string): Promise<string | null> {
  const admin = createSupabaseAdmin();
  if (!admin) return "no-db";
  const { error } = await admin
    .from("alerts")
    .update({ acknowledged: true })
    .eq("id", id);
  if (error) return error.message;
  await dbAudit({ actorEmail, action: "alert.ack", entity: "alerts", entityId: id });
  return null;
}

export async function dbInsertSnapshot(input: {
  intersectionId: string;
  mode: string;
  batteryPct?: number;
  payload: unknown;
}): Promise<string | null> {
  const admin = createSupabaseAdmin();
  if (!admin) return "no-db";
  const { error } = await admin.from("intersection_snapshots").insert({
    intersection_id: input.intersectionId,
    mode: input.mode,
    battery_pct: input.batteryPct ?? null,
    payload: input.payload,
  });
  if (error) return error.message;
  await admin
    .from("intersections")
    .update({
      last_heartbeat_at: new Date().toISOString(),
      battery_pct: input.batteryPct ?? undefined,
      online: true,
    })
    .eq("id", input.intersectionId);
  return null;
}

export async function dbFindIntersectionId(codeOrId: string): Promise<string | null> {
  const admin = createSupabaseAdmin();
  if (!admin) return null;
  const { data: byId } = await admin.from("intersections").select("id").eq("id", codeOrId).maybeSingle();
  if (byId?.id) return String(byId.id);
  const { data: byCode } = await admin.from("intersections").select("id").eq("code", codeOrId).maybeSingle();
  return byCode?.id ? String(byCode.id) : null;
}
