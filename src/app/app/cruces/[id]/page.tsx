import { notFound } from "next/navigation";
import { IntersectionTwin } from "@/components/intersection-twin";
import { Bento, Kicker, Pill, Stat } from "@/components/ui";
import { modeLabel } from "@/lib/algorithm";
import { devices, intersections } from "@/lib/demo-data";
import { relativeTime } from "@/lib/format";

export default async function CrucePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ix = intersections.find((i) => i.id === id);
  if (!ix) notFound();
  const owned = devices.filter((d) => d.intersectionId === ix.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Kicker>{ix.code}</Kicker>
          <h1 className="font-display text-4xl text-white">{ix.name}</h1>
        </div>
        <div className="flex gap-2">
          <Pill tone={ix.online ? "green" : "red"}>{ix.online ? "nube ok" : "solo edge"}</Pill>
          <Pill tone="amber">{modeLabel(ix.mode)}</Pill>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Bento>
          <Stat label="Salud" value={`${ix.healthScore}`} hint="0–100" />
        </Bento>
        <Bento glow={ix.batteryPct < 25 ? "red" : "green"}>
          <Stat label="Batería" value={`${ix.batteryPct}%`} hint={ix.solar ? "solar" : "red"} />
        </Bento>
        <Bento>
          <Stat label="Firmware" value={ix.firmwareVersion} hint={relativeTime(ix.lastHeartbeatAt)} />
        </Bento>
        <Bento>
          <Stat label="Plan" value={ix.plan} hint={`${ix.approaches} accesos`} />
        </Bento>
      </div>
      <Bento glow="green">
        <Kicker>Gemelo</Kicker>
        <p className="mb-4 mt-1 text-sm text-[var(--mute)]">
          Bandas a 100 / 200 / 300 m. El score sube si la cola llega lejos o si hay bus y camión.
        </p>
        <IntersectionTwin ix={ix} />
      </Bento>
      <Bento>
        <Kicker>Qué hay en este cruce</Kicker>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-[var(--mute)]">
              <tr>
                <th className="pb-2">Elemento</th>
                <th className="pb-2">Serie</th>
                <th className="pb-2">Dueño</th>
              </tr>
            </thead>
            <tbody>
              {owned.map((d) => (
                <tr className="border-t border-white/6" key={d.id}>
                  <td className="py-2 text-white">{d.label}</td>
                  <td className="py-2 font-mono text-xs text-white/60">{d.serial}</td>
                  <td className="py-2">
                    <Pill tone={d.owner === "smarttrafic" ? "green" : "blue"}>
                      {d.owner === "smarttrafic" ? "comodato" : "municipio"}
                    </Pill>
                  </td>
                </tr>
              ))}
              {owned.length === 0 ? (
                <tr>
                  <td className="py-3 text-[var(--mute)]" colSpan={3}>
                    Inventario detallado en Activos (este cruce usa el patrón estándar).
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Bento>
    </div>
  );
}
