import { Bento, Button, Field, Kicker, Pill } from "@/components/ui";
import { loadReportKpis, reportParagraphs } from "@/lib/report";
import { catalogAlerts, catalogIntersections, catalogMunicipalities } from "@/lib/catalog";
import { canManageNetwork } from "@/lib/format";
import { planAllows } from "@/lib/plans";
import { getSession } from "@/lib/session";
import { consumeFlash } from "@/lib/site-settings";
import { sendMayorReport } from "./actions";

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const flash = await consumeFlash();
  const user = await getSession();
  const [munis, intersections, alerts] = await Promise.all([
    catalogMunicipalities(),
    catalogIntersections(),
    catalogAlerts(),
  ]);
  const mine = user?.municipalityId ? munis.find((m) => m.id === user.municipalityId) : munis[0];
  const plan = mine?.plan ?? "adaptativo";
  const allowed = planAllows(plan, "reports") || user?.isPlatformAdmin;
  const kpis = await loadReportKpis({
    municipalityName: mine?.name || "el municipio",
    openAlerts: alerts.filter((a) => !a.acknowledged).length,
    intersectionsOnline: intersections.filter((i) => i.online).length,
    intersectionsTotal: intersections.length,
  });
  const paragraphs = reportParagraphs(kpis);

  return (
    <div className="space-y-5">
      <div>
        <Kicker>Despacho del alcalde</Kicker>
        <h1 className="font-display text-4xl text-white">Reporte del mes</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
          El texto sale de los KPI del periodo. Con Resend se va al correo. Sin la clave, se queda en pantalla.
        </p>
      </div>
      {flash ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            ok === "err"
              ? "bg-[rgba(255,77,77,0.12)] text-[var(--stop)]"
              : "border border-[var(--go)]/30 bg-[rgba(46,242,138,0.08)] text-[var(--go)]"
          }`}
        >
          {flash}
        </p>
      ) : null}
      {allowed ? (
        <Bento glow="green">
          <div className="flex flex-wrap gap-2">
            <Pill tone="green">{kpis.municipalityName}</Pill>
            <Pill>{kpis.monthLabel}</Pill>
            <Pill tone={kpis.source === "medido" ? "green" : "amber"}>{kpis.source}</Pill>
          </div>
          <div className="mt-6 max-w-3xl space-y-4 text-[15px] leading-relaxed text-white/80">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          {canManageNetwork(user) ? (
            <form action={sendMayorReport} className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <Field label="Correo del alcalde" name="to" type="email" required hint="Resend usa REPORTS_FROM_EMAIL." />
              <Button type="submit">Enviar reporte</Button>
            </form>
          ) : null}
        </Bento>
      ) : (
        <Bento glow="amber">
          <Kicker>Plan {plan}</Kicker>
          <p className="mt-2 text-sm text-white/70">
            El reporte al alcalde entra con Adaptativo o Premium. Esencial deja tablero, alertas y noche segura.
          </p>
        </Bento>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <Bento>
          <Kicker>Uptime</Kicker>
          <p className="mt-2 font-display text-4xl text-white">{kpis.uptimePct}%</p>
        </Bento>
        <Bento>
          <Kicker>Motos vistas</Kicker>
          <p className="mt-2 font-display text-4xl text-white">
            {kpis.motosClassified.toLocaleString("es-CO")}
          </p>
        </Bento>
        <Bento>
          <Kicker>CO₂ evitado</Kicker>
          <p className="mt-2 font-display text-4xl text-[var(--go)]">{kpis.co2Tons} t</p>
        </Bento>
      </div>
    </div>
  );
}
