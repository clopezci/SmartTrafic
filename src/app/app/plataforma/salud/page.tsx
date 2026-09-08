import { Bento, Button, Kicker, Pill, Stat } from "@/components/ui";
import { healthIssues, kpis } from "@/lib/demo-data";
import { probeTables } from "@/lib/persist";
import { relativeTime } from "@/lib/format";
import { heartbeats } from "@/lib/demo-data";

export default async function SaludPage() {
  const tables = await probeTables();
  const dbOk = tables.some((t) => t.ok) && tables.every((t) => t.ok);
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
        <Bento glow={dbOk ? "green" : "amber"}>
          <Stat
            label="Postgres"
            value={dbOk ? "listo" : "faltan tablas"}
            hint="schema + migrate_v2"
          />
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
      <Bento glow={dbOk ? "green" : "amber"}>
        <Kicker>Tablas de persistencia</Kicker>
        <p className="mt-2 text-xs text-[var(--mute)]">
          Si alguna falta, en el SQL Editor de Supabase corre <code>supabase/migrate_v2.sql</code> y
          luego otra vez <code>supabase/seed.sql</code>.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((t) => (
            <li className="flex items-center justify-between gap-2 text-sm" key={t.name}>
              <span className="truncate font-mono text-xs text-white/80">{t.name}</span>
              <Pill tone={t.ok ? "green" : "red"}>{t.ok ? "ok" : "falta"}</Pill>
            </li>
          ))}
        </ul>
      </Bento>
    </div>
  );
}
