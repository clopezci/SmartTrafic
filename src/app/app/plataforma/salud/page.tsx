import { Bento, Button, Kicker, Pill, Stat } from "@/components/ui";
import { healthIssues, heartbeats, kpis } from "@/lib/demo-data";
import { relativeTime } from "@/lib/format";

export default function SaludPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Kicker>Sentry de operación</Kicker>
          <h1 className="font-display text-4xl text-white">Salud del sistema</h1>
          <p className="mt-2 text-sm text-[var(--mute)]">
            Auditoría viva: latencias, heartbeats, errores agrupados y un botón para Telegram.
          </p>
        </div>
        <form action="/api/telegram/report" method="post">
          <Button type="submit">Enviar reporte a Telegram</Button>
        </form>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Bento glow="green">
          <Stat label="Uptime red" value={`${kpis.uptimePct}%`} />
        </Bento>
        <Bento>
          <Stat label="Cruces OK" value={`${kpis.intersectionsOnline}/${kpis.intersectionsTotal}`} />
        </Bento>
        <Bento glow="amber">
          <Stat label="Issues abiertos" value={String(healthIssues.length)} />
        </Bento>
        <Bento>
          <Stat label="Ingesta" value="HMAC" hint="/api/ingest" />
        </Bento>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Bento>
          <Kicker>Heartbeats</Kicker>
          <ul className="mt-4 space-y-3">
            {heartbeats.map((h) => (
              <li className="flex items-center justify-between text-sm" key={h.component}>
                <div>
                  <p className="text-white">{h.component}</p>
                  <p className="text-xs text-[var(--mute)]">{h.detail}</p>
                </div>
                <div className="text-right">
                  <Pill tone={h.ok ? "green" : "red"}>{h.ok ? "ok" : "off"}</Pill>
                  <p className="mt-1 text-[11px] text-[var(--mute)]">{h.latencyMs} ms</p>
                </div>
              </li>
            ))}
          </ul>
        </Bento>
        <Bento>
          <Kicker>Eventos agrupados</Kicker>
          <ul className="mt-4 space-y-3">
            {healthIssues.map((h) => (
              <li key={h.id}>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white">{h.message}</p>
                  <Pill tone={h.level === "error" ? "red" : h.level === "warning" ? "amber" : "blue"}>
                    ×{h.count}
                  </Pill>
                </div>
                <p className="text-[11px] text-[var(--mute)]">
                  {h.source} · {relativeTime(h.lastSeenAt)}
                </p>
              </li>
            ))}
          </ul>
        </Bento>
      </div>
    </div>
  );
}
