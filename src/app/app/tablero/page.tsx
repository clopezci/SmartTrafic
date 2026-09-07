import Link from "next/link";
import { IntersectionTwin } from "@/components/intersection-twin";
import { Bento, Kicker, Pill, Stat } from "@/components/ui";
import { modeLabel } from "@/lib/algorithm";
import { alerts, intersections, kpis } from "@/lib/demo-data";
import { relativeTime } from "@/lib/format";

export default function TableroPage() {
  const hero = intersections[0];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Kicker>Villa Esperanza</Kicker>
          <h1 className="font-display text-4xl text-white md:text-5xl">Tablero</h1>
          <p className="mt-1 text-sm text-[var(--mute)]">
            Cuatro cruces. El pueblo ya se ve. Las decisiones son pocas.
          </p>
        </div>
        <Pill tone="green">{kpis.intersectionsOnline} de {kpis.intersectionsTotal} en línea</Pill>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Bento glow="green">
          <Stat hint="versus ciclo fijo de 45s" label="Espera media" value={`−${kpis.waitDropPct}%`} />
        </Bento>
        <Bento>
          <Stat hint="estimado del mes" label="Combustible" value={`${kpis.fuelSavedGal} gal`} />
        </Bento>
        <Bento>
          <Stat hint="camiones de 3+ ejes" label="Carga pesada" value={String(kpis.trucks3axle)} />
        </Bento>
        <Bento glow={kpis.openAlerts ? "amber" : "none"}>
          <Stat hint="sin acusar recibo" label="Alertas" value={String(kpis.openAlerts)} />
        </Bento>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Bento glow="green">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Kicker>{hero.code}</Kicker>
              <h2 className="font-display text-2xl text-white">{hero.name}</h2>
            </div>
            <Link className="text-sm text-[var(--go)]" href={`/app/cruces/${hero.id}`}>
              Abrir cruce
            </Link>
          </div>
          <IntersectionTwin ix={hero} />
        </Bento>
        <div className="grid gap-4">
          {intersections.slice(1).map((ix) => (
            <Link href={`/app/cruces/${ix.id}`} key={ix.id}>
              <Bento className="hover:border-white/20" glow={ix.online ? "none" : "red"}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Kicker>{ix.code}</Kicker>
                    <p className="mt-1 font-medium text-white">{ix.name}</p>
                    <p className="mt-1 text-xs text-[var(--mute)]">
                      batería {ix.batteryPct}% · {modeLabel(ix.mode)}
                    </p>
                  </div>
                  <Pill tone={ix.online ? "green" : "red"}>
                    {ix.online ? "ok" : "eco"}
                  </Pill>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[var(--go)]"
                    style={{ width: `${ix.healthScore}%` }}
                  />
                </div>
              </Bento>
            </Link>
          ))}
        </div>
      </div>

      <Bento>
        <Kicker>Lo que pide atención</Kicker>
        <ul className="mt-4 divide-y divide-white/6">
          {alerts.map((a) => (
            <li className="flex items-start justify-between gap-4 py-3" key={a.id}>
              <div>
                <p className="text-sm text-white">{a.title}</p>
                <p className="text-xs text-[var(--mute)]">{a.body}</p>
              </div>
              <span className="shrink-0 text-[11px] text-[var(--mute)]">
                {relativeTime(a.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </Bento>
    </div>
  );
}
