import type { AccessGrant } from "./access";
import { DEMO_MUNICIPALITY_ID, municipalityVariables } from "./demo-data";
import { cache } from "react";
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
    "field_commands",
    "plate_events",
    "message_boards",
    "board_messages",
  ];
  return Promise.all(
    names.map(async (name) => {
      const started = Date.now();
      const { error, count } = await admin.from(name).select("*", { count: "exact", head: true });
      if (error) {
        return {
          name,
          ok: false,
          detail: missingTable(error) ? "tabla ausente — corre supabase/migrate_v2.sql" : error.message,
        };
      }
      return { name, ok: true, detail: `${count ?? 0} filas · ${Date.now() - started} ms` };
    }),
  );
}

export const dbGetSettings = cache(async function dbGetSettings(): Promise<Record<string, string>> {
  const admin = createSupabaseAdmin();
  if (!admin) return {};
  const { data, error } = await admin.from("system_settings").select("key,value,municipality_id");
  if (error || !data) return {};
  const out: Record<string, string> = {};
  for (const row of data) {
    out[String(row.key)] = fromJsonb(row.value);
  }
  return out;
});

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

export async function dbFindIntersection(codeOrId: string): Promise<{
  id: string;
  municipalityId: string;
  code: string;
  plan: string;
} | null> {
  const admin = createSupabaseAdmin();
  if (!admin) return null;
  const cols = "id,municipality_id,code,plan";
  const { data: byId } = await admin.from("intersections").select(cols).eq("id", codeOrId).maybeSingle();
  const row =
    byId ??
    (await admin.from("intersections").select(cols).eq("code", codeOrId).maybeSingle()).data;
  if (!row?.id) return null;
  return {
    id: String(row.id),
    municipalityId: String(row.municipality_id),
    code: String(row.code),
    plan: String(row.plan || "adaptativo"),
  };
}

export async function dbFindIntersectionId(codeOrId: string): Promise<string | null> {
  const found = await dbFindIntersection(codeOrId);
  return found?.id ?? null;
}

export const dbLatestSnapshots = cache(async function dbLatestSnapshots(): Promise<
  Map<string, { mode: string; battery: number | null; payload: unknown; at: string }>
> {
  const map = new Map<string, { mode: string; battery: number | null; payload: unknown; at: string }>();
  const admin = createSupabaseAdmin();
  if (!admin) return map;
  const { data, error } = await admin
    .from("intersection_snapshots")
    .select("intersection_id,mode,battery_pct,payload,captured_at")
    .order("captured_at", { ascending: false })
    .limit(48);
  if (error || !data) return map;
  for (const row of data) {
    const id = String(row.intersection_id);
    if (map.has(id)) continue;
    map.set(id, {
      mode: String(row.mode || "normal"),
      battery: row.battery_pct == null ? null : Number(row.battery_pct),
      payload: row.payload,
      at: String(row.captured_at),
    });
  }
  return map;
});

export async function dbAddKpi(input: {
  municipalityId: string;
  motos: number;
  trucks: number;
  batteryPct?: number;
}): Promise<void> {
  const admin = createSupabaseAdmin();
  if (!admin || !input.municipalityId) return;
  const day = new Date().toISOString().slice(0, 10);
  const { data } = await admin
    .from("kpi_daily")
    .select("motos,trucks_3axle,fuel_saved_gal,co2_tons,wait_drop_pct,uptime_pct,payload")
    .eq("municipality_id", input.municipalityId)
    .eq("day", day)
    .maybeSingle();
  const prevPayload = (data?.payload ?? {}) as { samples?: number; batteryPct?: number };
  const samples = Number(prevPayload.samples || 0) + 1;
  const motos = Number(data?.motos || 0) + input.motos;
  const trucks = Number(data?.trucks_3axle || 0) + input.trucks;
  const fuel = Number((motos * 0.0145).toFixed(2));
  const row = {
    day,
    municipality_id: input.municipalityId,
    motos,
    trucks_3axle: trucks,
    fuel_saved_gal: fuel,
    co2_tons: Number((fuel * 0.0088).toFixed(3)),
    wait_drop_pct: data?.wait_drop_pct ?? null,
    uptime_pct: data?.uptime_pct ?? null,
    payload: {
      samples,
      batteryPct: input.batteryPct ?? prevPayload.batteryPct ?? null,
    },
  };
  if (data) {
    await admin.from("kpi_daily").update(row).eq("municipality_id", input.municipalityId).eq("day", day);
  } else {
    await admin.from("kpi_daily").insert(row);
  }
}

export async function dbKpiWindow(days = 30): Promise<
  {
    motos: number;
    trucks: number;
    fuel: number;
    co2: number;
    wait: number | null;
    uptime: number | null;
    rows: number;
  } | null
> {
  const admin = createSupabaseAdmin();
  if (!admin) return null;
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const { data, error } = await admin
    .from("kpi_daily")
    .select("motos,trucks_3axle,fuel_saved_gal,co2_tons,wait_drop_pct,uptime_pct,day")
    .gte("day", since);
  if (error || !data?.length) return null;
  const waitVals = data.map((r) => Number(r.wait_drop_pct)).filter((n) => Number.isFinite(n) && n > 0);
  const upVals = data.map((r) => Number(r.uptime_pct)).filter((n) => Number.isFinite(n) && n > 0);
  return {
    motos: data.reduce((s, r) => s + Number(r.motos || 0), 0),
    trucks: data.reduce((s, r) => s + Number(r.trucks_3axle || 0), 0),
    fuel: data.reduce((s, r) => s + Number(r.fuel_saved_gal || 0), 0),
    co2: data.reduce((s, r) => s + Number(r.co2_tons || 0), 0),
    wait: waitVals.length ? waitVals.reduce((s, n) => s + n, 0) / waitVals.length : null,
    uptime: upVals.length ? upVals.reduce((s, n) => s + n, 0) / upVals.length : null,
    rows: data.length,
  };
}

export async function dbCreateMunicipality(input: {
  name: string;
  department: string;
  population: number;
  plan: string;
  monthlyFeeCop: number;
}): Promise<{ id: string } | { error: string }> {
  const admin = createSupabaseAdmin();
  if (!admin) return { error: "no-db" };
  const { data, error } = await admin
    .from("municipalities")
    .insert({
      name: input.name,
      department: input.department,
      population: input.population,
      plan: input.plan,
      monthly_fee_cop: input.monthlyFeeCop,
      contract_start: new Date().toISOString().slice(0, 10),
      contract_end: new Date(Date.now() + 86400000 * 365 * 2).toISOString().slice(0, 10),
      active: true,
    })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message || "insert" };
  return { id: String(data.id) };
}

export async function dbCreateIntersection(input: {
  municipalityId: string;
  code: string;
  name: string;
  geometry: string;
  plan: string;
  lat: number;
  lng: number;
  approaches: { name: string; headingDeg: number }[];
}): Promise<{ id: string } | { error: string }> {
  const admin = createSupabaseAdmin();
  if (!admin) return { error: "no-db" };
  const { data, error } = await admin
    .from("intersections")
    .insert({
      municipality_id: input.municipalityId,
      code: input.code,
      name: input.name,
      geometry: input.geometry,
      plan: input.plan,
      lat: input.lat,
      lng: input.lng,
      approaches: input.approaches.length,
      mode: "normal",
      online: false,
      solar: true,
      health_score: 100,
    })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message || "insert" };
  const id = String(data.id);
  if (input.approaches.length) {
    await admin.from("approaches").insert(
      input.approaches.map((a) => ({
        intersection_id: id,
        name: a.name,
        heading_deg: a.headingDeg,
      })),
    );
  }
  return { id };
}

export async function dbCreateTechnician(input: {
  municipalityId: string;
  fullName: string;
  email: string;
  phone: string;
  assigned: string[];
  checklist: unknown;
}): Promise<{ id: string } | { error: string }> {
  const admin = createSupabaseAdmin();
  if (!admin) return { error: "no-db" };
  const { data, error } = await admin
    .from("field_technicians")
    .insert({
      municipality_id: input.municipalityId,
      full_name: input.fullName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      status: "disponible",
      assigned_codes: input.assigned,
      checklist: input.checklist,
    })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message || "insert" };
  return { id: String(data.id) };
}

export async function dbSaveChecklist(
  technicianId: string,
  checklist: unknown,
): Promise<string | null> {
  const admin = createSupabaseAdmin();
  if (!admin) return "no-db";
  const { error } = await admin.from("field_technicians").update({ checklist }).eq("id", technicianId);
  if (error) return error.message;
  return null;
}

export type StoredCommand = {
  id: string;
  code: string;
  kind: string;
  payload: unknown;
  signature: string;
  status: string;
  createdAt: string;
};

export async function dbQueueCommand(input: {
  code: string;
  intersectionId: string | null;
  kind: string;
  payload: unknown;
  signature: string;
}): Promise<{ id: string } | { error: string }> {
  const admin = createSupabaseAdmin();
  if (!admin) return { error: "no-db" };
  const { data, error } = await admin
    .from("field_commands")
    .insert({
      intersection_id: input.intersectionId,
      intersection_code: input.code,
      kind: input.kind,
      payload: input.payload,
      signature: input.signature,
      status: "queued",
    })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message || "insert" };
  return { id: String(data.id) };
}

export async function dbPullCommands(code: string): Promise<StoredCommand[] | { error: string }> {
  const admin = createSupabaseAdmin();
  if (!admin) return { error: "no-db" };
  const { data, error } = await admin
    .from("field_commands")
    .select("id,intersection_code,kind,payload,signature,status,created_at")
    .eq("intersection_code", code)
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(20);
  if (error) return { error: error.message };
  return (data ?? []).map((row) => ({
    id: String(row.id),
    code: String(row.intersection_code),
    kind: String(row.kind),
    payload: row.payload,
    signature: String(row.signature),
    status: String(row.status),
    createdAt: String(row.created_at),
  }));
}

export async function dbAckCommand(id: string): Promise<string | null> {
  const admin = createSupabaseAdmin();
  if (!admin) return "no-db";
  const { error } = await admin.from("field_commands").update({ status: "acked" }).eq("id", id);
  return error ? error.message : null;
}

export async function dbInsertPlate(input: {
  municipalityId: string;
  intersectionId: string | null;
  plate: string;
  at?: string;
}): Promise<string | null> {
  const admin = createSupabaseAdmin();
  if (!admin) return "no-db";
  const { error } = await admin.from("plate_events").insert({
    municipality_id: input.municipalityId,
    intersection_id: input.intersectionId,
    plate: input.plate,
    seen_at: input.at ?? new Date().toISOString(),
  });
  return error ? error.message : null;
}

export async function dbListPlates(limit = 40): Promise<
  { id: string; plate: string; code: string; seenAt: string }[] | { error: string }
> {
  const admin = createSupabaseAdmin();
  if (!admin) return { error: "no-db" };
  const { data, error } = await admin
    .from("plate_events")
    .select("id,plate,seen_at,intersection_id")
    .order("seen_at", { ascending: false })
    .limit(limit);
  if (error) return { error: error.message };
  return (data ?? []).map((row) => ({
    id: String(row.id),
    plate: String(row.plate),
    code: row.intersection_id ? String(row.intersection_id) : "",
    seenAt: String(row.seen_at),
  }));
}

export async function dbCreateBoard(input: {
  municipalityId: string;
  code: string;
  name: string;
  place: string;
}): Promise<{ id: string } | { error: string }> {
  const admin = createSupabaseAdmin();
  if (!admin) return { error: "no-db" };
  const { data, error } = await admin
    .from("message_boards")
    .insert({
      municipality_id: input.municipalityId,
      code: input.code,
      name: input.name,
      place: input.place,
      solar: true,
      current_text: "",
    })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message || "no se creó el letrero" };
  return { id: String(data.id) };
}

export async function dbPublishBoardMessage(input: {
  boardId: string;
  municipalityId: string;
  kind: string;
  body: string;
  authorEmail: string;
  endsAt: string | null;
}): Promise<string | null> {
  const admin = createSupabaseAdmin();
  if (!admin) return "no-db";
  const ended = await admin
    .from("board_messages")
    .update({ status: "ended" })
    .eq("board_id", input.boardId)
    .eq("status", "live");
  if (ended.error && !missingTable(ended.error)) return ended.error.message;
  const inserted = await admin.from("board_messages").insert({
    board_id: input.boardId,
    municipality_id: input.municipalityId,
    kind: input.kind,
    body: input.body,
    author_email: input.authorEmail,
    status: "live",
    ends_at: input.endsAt,
  });
  if (inserted.error) return inserted.error.message;
  const board = await admin
    .from("message_boards")
    .update({ current_text: input.body, current_kind: input.kind })
    .eq("id", input.boardId);
  return board.error ? board.error.message : null;
}

export async function dbTouchBoard(code: string, batteryPct: number | null): Promise<string | null> {
  const admin = createSupabaseAdmin();
  if (!admin) return "no-db";
  const patch: { online: boolean; last_seen_at: string; battery_pct?: number } = {
    online: true,
    last_seen_at: new Date().toISOString(),
  };
  if (batteryPct != null) patch.battery_pct = batteryPct;
  const { error } = await admin.from("message_boards").update(patch).eq("code", code);
  return error ? error.message : null;
}
