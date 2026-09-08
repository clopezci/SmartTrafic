import { createSupabaseAdmin } from "@/lib/supabase/admin";
import {
  alerts as demoAlerts,
  devices as demoDevices,
  intersections as demoIntersections,
  municipalities as demoMunicipalities,
  technicians as demoTechnicians,
  auditEvents as demoAudit,
} from "@/lib/demo-data";
import type { Alert, AuditEvent, Device, Intersection, Municipality, Technician } from "@/lib/types";

const IX_UUID: Record<string, string> = {
  "22222222-2222-2222-2222-222222222221": "ix-1",
  "22222222-2222-2222-2222-222222222222": "ix-2",
  "22222222-2222-2222-2222-222222222223": "ix-3",
  "22222222-2222-2222-2222-222222222224": "ix-4",
  "22222222-2222-2222-2222-222222222225": "ix-5",
  "22222222-2222-2222-2222-222222222226": "ix-6",
};

function demoIxId(dbId: string | null | undefined, code?: string) {
  if (dbId && IX_UUID[dbId]) return IX_UUID[dbId];
  if (code) {
    const demo = demoIntersections.find((i) => i.code === code);
    if (demo) return demo.id;
  }
  return dbId ? String(dbId) : null;
}

export async function catalogMunicipalities(): Promise<Municipality[]> {
  const admin = createSupabaseAdmin();
  if (!admin) return demoMunicipalities;
  const { data, error } = await admin
    .from("municipalities")
    .select("id,name,department,population,plan,monthly_fee_cop,contract_start,contract_end,active")
    .eq("active", true);
  if (error || !data?.length) return demoMunicipalities;
  return data.map((m) => ({
    id: String(m.id),
    name: String(m.name),
    department: String(m.department || ""),
    population: Number(m.population || 0),
    plan: m.plan,
    monthlyFeeCop: Number(m.monthly_fee_cop || 0),
    contractStart: String(m.contract_start || ""),
    contractEnd: String(m.contract_end || ""),
    active: Boolean(m.active),
  }));
}

export async function catalogIntersections(): Promise<Intersection[]> {
  const admin = createSupabaseAdmin();
  if (!admin) return demoIntersections;
  const { data, error } = await admin.from("intersections").select("*");
  if (error || !data?.length) return demoIntersections;
  return data.map((row) => {
    const demo = demoIntersections.find((i) => i.code === row.code);
    return {
      ...(demo ?? demoIntersections[0]),
      id: demoIxId(String(row.id), String(row.code)) ?? String(row.id),
      municipalityId: String(row.municipality_id),
      code: String(row.code),
      name: String(row.name),
      geometry: row.geometry,
      lat: Number(row.lat || 0),
      lng: Number(row.lng || 0),
      approaches: Number(row.approaches || 4),
      plan: row.plan,
      mode: row.mode,
      online: Boolean(row.online),
      healthScore: Number(row.health_score || 0),
      solar: Boolean(row.solar),
      batteryPct: Number(row.battery_pct || 0),
      firmwareVersion: String(row.firmware_version || ""),
      lastHeartbeatAt: row.last_heartbeat_at
        ? String(row.last_heartbeat_at)
        : new Date().toISOString(),
      live: demo?.live ?? [],
    };
  });
}

export async function catalogAlerts(): Promise<Alert[]> {
  const admin = createSupabaseAdmin();
  if (!admin) return demoAlerts;
  const { data, error } = await admin
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data?.length) return demoAlerts;
  return data.map((a) => ({
    id: String(a.id),
    intersectionId: demoIxId(a.intersection_id ? String(a.intersection_id) : null),
    severity: a.severity,
    code: String(a.code),
    title: String(a.title),
    body: String(a.body || ""),
    acknowledged: Boolean(a.acknowledged),
    createdAt: String(a.created_at),
  }));
}

export async function catalogDevices(): Promise<Device[]> {
  const admin = createSupabaseAdmin();
  if (!admin) return demoDevices;
  const { data, error } = await admin.from("devices").select("*");
  if (error || !data?.length) return demoDevices;
  return data.map((d) => ({
    id: String(d.id),
    intersectionId: demoIxId(d.intersection_id ? String(d.intersection_id) : null) ?? "ix-1",
    kind: d.kind,
    serial: String(d.serial || ""),
    owner: d.owner,
    label: String(d.label),
  }));
}

export async function catalogTechnicians(): Promise<Technician[]> {
  const admin = createSupabaseAdmin();
  if (!admin) return demoTechnicians;
  const { data, error } = await admin.from("field_technicians").select("*");
  if (error || !data?.length) return demoTechnicians;
  return data.map((t) => ({
    id: String(t.id),
    fullName: String(t.full_name),
    email: String(t.email),
    phone: String(t.phone || ""),
    assigned: Array.isArray(t.assigned_codes) ? t.assigned_codes.map(String) : [],
    status: (t.status || "disponible") as Technician["status"],
  }));
}

export async function catalogAudit(): Promise<AuditEvent[]> {
  const admin = createSupabaseAdmin();
  if (!admin) return demoAudit;
  const { data, error } = await admin
    .from("audit_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(40);
  if (error || !data?.length) return demoAudit;
  return data.map((e) => ({
    id: String(e.id),
    actorEmail: String(e.actor_email || "sistema"),
    action: String(e.action),
    entity: String(e.entity || ""),
    createdAt: String(e.created_at),
    diff: e.diff ? (typeof e.diff === "string" ? e.diff : JSON.stringify(e.diff)) : undefined,
  }));
}
