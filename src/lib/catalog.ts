import { emptyCounts } from "@/lib/algorithm";
import { readOverlay } from "@/lib/ops";
import { dbLatestSnapshots } from "@/lib/persist";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import {
  alerts as demoAlerts,
  boardMessages as demoBoardMessages,
  devices as demoDevices,
  intersections as demoIntersections,
  messageBoards as demoBoards,
  municipalities as demoMunicipalities,
  technicians as demoTechnicians,
  auditEvents as demoAudit,
} from "@/lib/demo-data";
import type {
  Alert,
  ApproachLive,
  AuditEvent,
  BoardKind,
  BoardMessage,
  Device,
  Intersection,
  MessageBoard,
  Municipality,
  Technician,
} from "@/lib/types";

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

function liveFromPayload(payload: unknown, fallback: ApproachLive[]): ApproachLive[] {
  if (!payload || typeof payload !== "object") return fallback;
  const approaches = (payload as { approaches?: unknown }).approaches;
  if (!Array.isArray(approaches) || approaches.length === 0) return fallback;
  return approaches.map((raw, i) => {
    const a = raw as Record<string, unknown>;
    const base = fallback[i];
    const counts = (a.counts ?? {}) as Record<string, unknown>;
    return {
      id: String(a.id || base?.id || i),
      name: String(a.name || base?.name || "Acceso"),
      headingDeg: Number(a.headingDeg ?? a.heading_deg ?? base?.headingDeg ?? 0),
      color: (a.color as ApproachLive["color"]) || base?.color || "red",
      greenElapsedS: Number(a.greenElapsedS ?? a.green_elapsed_s ?? 0),
      pedWaiting: Boolean(a.pedWaiting ?? a.ped_waiting),
      counts: {
        ...emptyCounts(),
        m100: Number(counts.m100 ?? 0),
        m200: Number(counts.m200 ?? 0),
        m300: Number(counts.m300 ?? 0),
        waitS: Number(counts.waitS ?? counts.wait_s ?? 0),
        motos: Number(counts.motos ?? 0),
        cars: Number(counts.cars ?? 0),
        buses: Number(counts.buses ?? 0),
        trucks: Number(counts.trucks ?? 0),
        peds: Number(counts.peds ?? 0),
        emergency: Boolean(counts.emergency),
      },
      score: Number(a.score ?? 0),
      phase: a.phase as ApproachLive["phase"],
    };
  });
}

function mergeById<T extends { id: string }>(base: T[], extra: T[]): T[] {
  const seen = new Set(base.map((row) => row.id));
  return [...base, ...extra.filter((row) => !seen.has(row.id))];
}

export async function catalogMunicipalities(): Promise<Municipality[]> {
  const overlay = await readOverlay();
  const admin = createSupabaseAdmin();
  if (!admin) return mergeById(demoMunicipalities, overlay.municipalities);
  const { data, error } = await admin
    .from("municipalities")
    .select("id,name,department,population,plan,monthly_fee_cop,contract_start,contract_end,active")
    .eq("active", true);
  const base =
    error || !data?.length
      ? demoMunicipalities
      : data.map((m) => ({
          id: String(m.id),
          name: String(m.name),
          department: String(m.department || ""),
          population: Number(m.population || 0),
          plan: m.plan as Municipality["plan"],
          monthlyFeeCop: Number(m.monthly_fee_cop || 0),
          contractStart: String(m.contract_start || ""),
          contractEnd: String(m.contract_end || ""),
          active: Boolean(m.active),
        }));
  return mergeById(base, overlay.municipalities);
}

export async function catalogIntersections(): Promise<Intersection[]> {
  const overlay = await readOverlay();
  const snaps = await dbLatestSnapshots();
  const admin = createSupabaseAdmin();
  if (!admin) return mergeById(demoIntersections, overlay.intersections);
  const { data, error } = await admin.from("intersections").select("*");
  if (error || !data?.length) return mergeById(demoIntersections, overlay.intersections);
  const rows = data.map((row) => {
    const demo = demoIntersections.find((i) => i.code === row.code);
    const snap = snaps.get(String(row.id));
    const fallback = demo?.live ?? [];
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
      mode: (snap?.mode as Intersection["mode"]) || row.mode,
      online: snap ? true : Boolean(row.online),
      healthScore: Number(row.health_score || 0),
      solar: Boolean(row.solar),
      batteryPct: snap?.battery ?? Number(row.battery_pct || 0),
      firmwareVersion: String(row.firmware_version || ""),
      lastHeartbeatAt: snap?.at
        ? snap.at
        : row.last_heartbeat_at
          ? String(row.last_heartbeat_at)
          : new Date().toISOString(),
      live: snap ? liveFromPayload(snap.payload, fallback) : fallback,
    };
  });
  return mergeById(rows, overlay.intersections);
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
  const overlay = await readOverlay();
  const admin = createSupabaseAdmin();
  if (!admin) return mergeTechnicians(demoTechnicians, overlay.technicians);
  const { data, error } = await admin.from("field_technicians").select("*");
  if (error || !data?.length) return mergeTechnicians(demoTechnicians, overlay.technicians);
  const rows = data.map((t) => ({
    id: String(t.id),
    fullName: String(t.full_name),
    email: String(t.email),
    phone: String(t.phone || ""),
    assigned: Array.isArray(t.assigned_codes) ? t.assigned_codes.map(String) : [],
    status: (t.status || "disponible") as Technician["status"],
    municipalityId: String(t.municipality_id || ""),
    checklist: Array.isArray(t.checklist) ? (t.checklist as Technician["checklist"]) : undefined,
  }));
  return mergeTechnicians(rows, overlay.technicians);
}

function mergeTechnicians(base: Technician[], extra: Technician[]): Technician[] {
  const byId = new Map(extra.map((t) => [t.id, t]));
  const patched = base.map((t) => (byId.has(t.id) ? { ...t, ...byId.get(t.id) } : t));
  return mergeById(patched, extra);
}

function mergeBoards(base: MessageBoard[], extra: MessageBoard[]): MessageBoard[] {
  const byId = new Map(extra.map((board) => [board.id, board]));
  const patched = base.map((board) => (byId.has(board.id) ? { ...board, ...byId.get(board.id) } : board));
  return mergeById(patched, extra);
}

export async function catalogBoards(): Promise<MessageBoard[]> {
  const overlay = await readOverlay();
  const admin = createSupabaseAdmin();
  if (!admin) return mergeBoards(demoBoards, overlay.boards);
  const { data, error } = await admin.from("message_boards").select("*");
  if (error || !data?.length) return mergeBoards(demoBoards, overlay.boards);
  const rows: MessageBoard[] = data.map((row) => ({
    id: String(row.id),
    municipalityId: String(row.municipality_id),
    code: String(row.code),
    name: String(row.name),
    place: String(row.place || ""),
    solar: Boolean(row.solar),
    batteryPct: row.battery_pct == null ? null : Number(row.battery_pct),
    online: Boolean(row.online),
    lastSeenAt: row.last_seen_at ? String(row.last_seen_at) : null,
    currentText: String(row.current_text || ""),
    currentKind: (row.current_kind || null) as BoardKind | null,
  }));
  return mergeBoards(rows, overlay.boards);
}

export async function catalogBoardMessages(): Promise<BoardMessage[]> {
  const overlay = await readOverlay();
  const admin = createSupabaseAdmin();
  let base = demoBoardMessages;
  if (admin) {
    const { data, error } = await admin
      .from("board_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(40);
    if (!error && data?.length) {
      base = data.map((row) => ({
        id: String(row.id),
        boardId: String(row.board_id),
        municipalityId: String(row.municipality_id),
        kind: row.kind as BoardKind,
        body: String(row.body),
        authorEmail: String(row.author_email || ""),
        status: row.status === "ended" ? "ended" : "live",
        startsAt: String(row.starts_at),
        endsAt: row.ends_at ? String(row.ends_at) : null,
        createdAt: String(row.created_at),
      }));
    }
  }
  const byId = new Map(overlay.boardMessages.map((message) => [message.id, message]));
  const patched = base.map((message) => (byId.has(message.id) ? { ...message, ...byId.get(message.id)! } : message));
  const sorted = mergeById(overlay.boardMessages, patched).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const liveBoard = new Set<string>();
  return sorted.map((message) => {
    if (message.status !== "live") return message;
    if (liveBoard.has(message.boardId)) return { ...message, status: "ended" as const };
    liveBoard.add(message.boardId);
    return message;
  });
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
