"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { emptyCounts } from "@/lib/algorithm";
import { freshChecklist } from "@/lib/checklist";
import { canManageNetwork, canWriteMunicipality } from "@/lib/format";
import { hmacOk, signBody, ingestSecret } from "@/lib/hmac";
import { readOverlay, writeOverlay } from "@/lib/ops";
import { feeForPlan } from "@/lib/plans";
import {
  dbAckCommand,
  dbAudit,
  dbCreateIntersection,
  dbCreateMunicipality,
  dbCreateTechnician,
  dbFindIntersection,
  dbQueueCommand,
  dbSaveChecklist,
} from "@/lib/persist";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/site-settings";
import type { Intersection, Mode, PlanTier, Technician } from "@/lib/types";

function approachesFor(geometry: string, name: string) {
  if (geometry === "pedestrian") return [{ name: `${name} peatonal`, headingDeg: 0 }];
  if (geometry === "t") {
    return [
      { name: `${name} norte`, headingDeg: 0 },
      { name: `${name} este`, headingDeg: 90 },
      { name: `${name} sur`, headingDeg: 180 },
    ];
  }
  return [
    { name: `${name} norte`, headingDeg: 0 },
    { name: `${name} este`, headingDeg: 90 },
    { name: `${name} sur`, headingDeg: 180 },
    { name: `${name} oeste`, headingDeg: 270 },
  ];
}

function asIntersection(input: {
  id: string;
  municipalityId: string;
  code: string;
  name: string;
  geometry: Intersection["geometry"];
  plan: PlanTier;
  lat: number;
  lng: number;
  approaches: { name: string; headingDeg: number }[];
}): Intersection {
  return {
    id: input.id,
    municipalityId: input.municipalityId,
    code: input.code,
    name: input.name,
    geometry: input.geometry,
    lat: input.lat,
    lng: input.lng,
    approaches: input.approaches.length,
    plan: input.plan,
    mode: "normal",
    online: false,
    healthScore: 100,
    solar: true,
    batteryPct: 100,
    firmwareVersion: "edge-1",
    lastHeartbeatAt: new Date().toISOString(),
    live: input.approaches.map((a, i) => ({
      id: `${input.id}-${i}`,
      name: a.name,
      headingDeg: a.headingDeg,
      color: i === 0 ? "red" : "red",
      greenElapsedS: 0,
      pedWaiting: false,
      counts: emptyCounts(),
      score: 0,
    })),
  };
}

export async function createMunicipality(formData: FormData) {
  const user = await getSession();
  if (!user || (!user.isPlatformAdmin && user.role !== "superadmin")) redirect("/app/alcaldias?ok=err");
  const name = String(formData.get("name") || "").trim();
  const department = String(formData.get("department") || "").trim();
  const population = Number(formData.get("population") || 0);
  const plan = String(formData.get("plan") || "adaptativo") as PlanTier;
  if (!name) redirect("/app/alcaldias?ok=err");
  const created = await dbCreateMunicipality({
    name,
    department,
    population,
    plan,
    monthlyFeeCop: feeForPlan(plan),
  });
  if ("error" in created) {
    const overlay = await readOverlay();
    overlay.municipalities.push({
      id: randomUUID(),
      name,
      department,
      population,
      plan,
      monthlyFeeCop: feeForPlan(plan),
      contractStart: new Date().toISOString().slice(0, 10),
      contractEnd: new Date(Date.now() + 86400000 * 730).toISOString().slice(0, 10),
      active: true,
    });
    await writeOverlay(overlay);
    await setFlash("Alcaldía guardada en este navegador. Con Supabase queda en la base.");
  } else {
    await dbAudit({ actorEmail: user.email, action: "municipality.create", entity: "municipalities", entityId: created.id, diff: { name } });
    await setFlash("Alcaldía creada.");
  }
  redirect("/app/alcaldias?ok=1");
}

export async function createIntersection(formData: FormData) {
  const user = await getSession();
  if (!user || !canManageNetwork(user)) redirect("/app/cruces?ok=err");
  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const municipalityId = String(formData.get("municipalityId") || user.municipalityId || "");
  const geometry = String(formData.get("geometry") || "plus") as Intersection["geometry"];
  const plan = String(formData.get("plan") || "adaptativo") as PlanTier;
  const lat = Number(formData.get("lat") || 0);
  const lng = Number(formData.get("lng") || 0);
  if (!name || !code || !municipalityId) redirect("/app/cruces?ok=err");
  const approaches = approachesFor(geometry, name);
  const created = await dbCreateIntersection({
    municipalityId,
    code,
    name,
    geometry,
    plan,
    lat,
    lng,
    approaches,
  });
  if ("error" in created) {
    const overlay = await readOverlay();
    overlay.intersections.push(
      asIntersection({
        id: randomUUID(),
        municipalityId,
        code,
        name,
        geometry,
        plan,
        lat,
        lng,
        approaches,
      }),
    );
    await writeOverlay(overlay);
    await setFlash("Cruce guardado en este navegador. Con Supabase queda en la base.");
  } else {
    await dbAudit({ actorEmail: user.email, action: "intersection.create", entity: "intersections", entityId: created.id, diff: { code } });
    await setFlash("Cruce creado.");
  }
  redirect("/app/cruces?ok=1");
}

export async function createTechnician(formData: FormData) {
  const user = await getSession();
  if (!user || !canManageNetwork(user)) redirect("/app/tecnicos?ok=err");
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const municipalityId = String(formData.get("municipalityId") || user.municipalityId || "");
  const assigned = String(formData.get("assigned") || "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  if (!fullName || !email || !municipalityId) redirect("/app/tecnicos?ok=err");
  const checklist = assigned.map((code) => freshChecklist(code));
  const created = await dbCreateTechnician({
    municipalityId,
    fullName,
    email,
    phone,
    assigned,
    checklist,
  });
  const tech: Technician = {
    id: "id" in created ? created.id : randomUUID(),
    fullName,
    email,
    phone,
    assigned,
    status: "disponible",
    municipalityId,
    checklist,
  };
  if ("error" in created) {
    const overlay = await readOverlay();
    overlay.technicians.push(tech);
    await writeOverlay(overlay);
    await setFlash("Técnico guardado en este navegador. Si falta la columna checklist, corre migrate_v3.sql.");
  } else {
    await dbAudit({ actorEmail: user.email, action: "technician.create", entity: "field_technicians", entityId: created.id });
    await setFlash("Técnico creado, con checklist por cruce.");
  }
  redirect("/app/tecnicos?ok=1");
}

export async function toggleCheck(formData: FormData) {
  const user = await getSession();
  if (!user || !canWriteMunicipality(user)) redirect("/app/tecnicos");
  const technicianId = String(formData.get("technicianId") || "");
  const code = String(formData.get("code") || "");
  const itemId = String(formData.get("itemId") || "");
  const overlay = await readOverlay();
  const local = overlay.technicians.find((t) => t.id === technicianId);
  if (local?.checklist) {
    local.checklist = local.checklist.map((group) =>
      group.code !== code
        ? group
        : {
            ...group,
            items: group.items.map((item) =>
              item.id === itemId ? { ...item, done: !item.done } : item,
            ),
          },
    );
    await writeOverlay(overlay);
    await setFlash("Checklist actualizado.");
    redirect("/app/tecnicos?ok=1");
  }
  const { catalogTechnicians } = await import("@/lib/catalog");
  const all = await catalogTechnicians();
  const tech = all.find((t) => t.id === technicianId);
  if (!tech) redirect("/app/tecnicos?ok=err");
  const checklist = (tech.checklist ?? tech.assigned.map((c) => freshChecklist(c))).map((group) =>
    group.code !== code
      ? group
      : {
          ...group,
          items: group.items.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)),
        },
  );
  const err = await dbSaveChecklist(technicianId, checklist);
  if (err) {
    overlay.technicians.push({ ...tech, checklist });
    await writeOverlay(overlay);
  }
  await dbAudit({ actorEmail: user.email, action: "checklist.toggle", entity: "field_technicians", entityId: technicianId, diff: { code, itemId } });
  await setFlash(err ? "Checklist guardado en este navegador." : "Checklist actualizado.");
  redirect("/app/tecnicos?ok=1");
}

export async function sendFieldCommand(formData: FormData) {
  const user = await getSession();
  if (!user || !canManageNetwork(user)) redirect("/app/cruces");
  const code = String(formData.get("code") || "").trim();
  const mode = String(formData.get("mode") || "normal") as Mode;
  const kind = mode === "failsafe" ? "failsafe" : "mode";
  const found = await dbFindIntersection(code);
  const payload = { code, kind, mode, at: Date.now() };
  const raw = JSON.stringify(payload);
  const secret = ingestSecret() || "smarttrafic-dev-only-change-me-32chars!!";
  const signature = signBody(raw, secret);
  const queued = await dbQueueCommand({
    code,
    intersectionId: found?.id ?? null,
    kind,
    payload,
    signature,
  });
  if ("error" in queued) {
    const overlay = await readOverlay();
    overlay.commands.push({
      id: randomUUID(),
      code,
      kind,
      payload,
      signature,
      status: "queued",
      createdAt: new Date().toISOString(),
    });
    await writeOverlay(overlay);
    await setFlash("Orden en cola local. El edge la toma por /api/commands. Corre migrate_v3.sql para dejarla en Postgres.");
  } else {
    await dbAudit({
      actorEmail: user.email,
      action: "field.command",
      entity: "field_commands",
      entityId: queued.id,
      diff: { code, mode },
    });
    await setFlash(`Orden firmada para ${code}: ${mode}.`);
  }
  const back = String(formData.get("back") || "/app/cruces");
  redirect(`${back}?ok=1`);
}

export async function ackFieldCommand(id: string) {
  return dbAckCommand(id);
}

export async function verifyDevice(raw: string, header: string | null) {
  return hmacOk(raw, header);
}
