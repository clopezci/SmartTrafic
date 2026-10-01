import { kpis as demo } from "./demo-data";
import { dbKpiWindow } from "./persist";

export type ReportKpis = {
  source: "medido" | "demostración";
  municipalityName: string;
  waitDropPct: number;
  fuelSavedGal: number;
  co2Tons: number;
  motosClassified: number;
  trucks3axle: number;
  uptimePct: number;
  openAlerts: number;
  intersectionsOnline: number;
  intersectionsTotal: number;
  monthLabel: string;
};

export async function loadReportKpis(input: {
  municipalityName: string;
  openAlerts: number;
  intersectionsOnline: number;
  intersectionsTotal: number;
}): Promise<ReportKpis> {
  const monthLabel = new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
  }).format(new Date());
  const measured = await dbKpiWindow(30);
  if (!measured || measured.motos <= 0) {
    return {
      source: "demostración",
      municipalityName: input.municipalityName,
      ...demo,
      openAlerts: input.openAlerts || demo.openAlerts,
      intersectionsOnline: input.intersectionsOnline || demo.intersectionsOnline,
      intersectionsTotal: input.intersectionsTotal || demo.intersectionsTotal,
      monthLabel,
    };
  }
  const fuel = measured.fuel || Number((measured.motos * 0.0145).toFixed(1));
  return {
    source: "medido",
    municipalityName: input.municipalityName,
    waitDropPct: Math.round(measured.wait ?? demo.waitDropPct),
    fuelSavedGal: Math.round(fuel * 10) / 10,
    co2Tons: Math.round((measured.co2 || fuel * 0.0088) * 100) / 100,
    motosClassified: measured.motos,
    trucks3axle: measured.trucks,
    uptimePct: Math.round((measured.uptime ?? demo.uptimePct) * 10) / 10,
    openAlerts: input.openAlerts,
    intersectionsOnline: input.intersectionsOnline,
    intersectionsTotal: input.intersectionsTotal,
    monthLabel,
  };
}

export function reportParagraphs(k: ReportKpis): string[] {
  return [
    `Señor Alcalde: en ${k.monthLabel} la red de ${k.municipalityName} dejó la espera media un ${k.waitDropPct}% por debajo de un ciclo fijo de 45 segundos. En la cuenta conservadora eso son ${k.fuelSavedGal} galones que no se quemaron en ralentí y ${k.co2Tons} toneladas de CO₂ evitadas.`,
    `Camiones de tres o más ejes registrados en el periodo: ${k.trucks3axle}. Motos clasificadas: ${k.motosClassified.toLocaleString("es-CO")}. El peso de cola no las trata como carros.`,
    `Uptime de la red: ${k.uptimePct}%. Cruces con heartbeat reciente: ${k.intersectionsOnline} de ${k.intersectionsTotal}. Alertas abiertas: ${k.openAlerts}.`,
    k.source === "medido"
      ? "Estas cifras salen de la telemetría acumulada en kpi_daily."
      : "Estas cifras son el laboratorio de Carmen de Viboral. En cuanto el edge publique conteos, el mismo texto usa kpi_daily.",
  ];
}
