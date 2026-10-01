"use server";

import { redirect } from "next/navigation";
import { reportParagraphs, loadReportKpis } from "@/lib/report";
import { catalogAlerts, catalogIntersections, catalogMunicipalities } from "@/lib/catalog";
import { canManageNetwork } from "@/lib/format";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/site-settings";

export async function sendMayorReport(formData: FormData) {
  const user = await getSession();
  if (!user || !canManageNetwork(user)) redirect("/app/reportes?ok=err");
  const to = String(formData.get("to") || "").trim();
  const [munis, intersections, alerts] = await Promise.all([
    catalogMunicipalities(),
    catalogIntersections(),
    catalogAlerts(),
  ]);
  const mine = user.municipalityId ? munis.find((m) => m.id === user.municipalityId) : munis[0];
  const kpis = await loadReportKpis({
    municipalityName: mine?.name || "el municipio",
    openAlerts: alerts.filter((a) => !a.acknowledged).length,
    intersectionsOnline: intersections.filter((i) => i.online).length,
    intersectionsTotal: intersections.length,
  });
  const text = reportParagraphs(kpis).join("\n\n");
  const key = process.env.RESEND_API_KEY;
  const from = process.env.REPORTS_FROM_EMAIL || "SmartTrafic <onboarding@resend.dev>";
  if (!key || !to) {
    await setFlash(
      key
        ? "Escribe el correo del alcalde."
        : "Falta RESEND_API_KEY. El reporte ya está en pantalla; el envío queda pendiente.",
    );
    redirect("/app/reportes?ok=err");
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `SmartTrafic · reporte ${kpis.monthLabel}`,
      text,
    }),
  });
  if (!res.ok) {
    await setFlash("Resend no aceptó el envío. Revisa la clave y el remitente.");
    redirect("/app/reportes?ok=err");
  }
  await setFlash(`Reporte enviado a ${to}.`);
  redirect("/app/reportes?ok=1");
}
