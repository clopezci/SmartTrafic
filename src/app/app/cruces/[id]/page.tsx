import { notFound } from "next/navigation";
import { LivePulse } from "@/components/live-pulse";
import { IntersectionTwin } from "@/components/intersection-twin";
import { Bento, Button, Field, Kicker, Pill, Stat } from "@/components/ui";
import { modeLabel } from "@/lib/algorithm";
import { catalogDevices, catalogIntersections } from "@/lib/catalog";
import { canManageNetwork, relativeTime } from "@/lib/format";
import { planAllows } from "@/lib/plans";
import { getSession } from "@/lib/session";
import { consumeFlash } from "@/lib/site-settings";
import type { Mode } from "@/lib/types";
import { sendFieldCommand } from "../../red/actions";

const COMMAND_MODES: Mode[] = ["normal", "school", "market", "night", "eco", "emergency", "failsafe"];

export default async function CrucePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { id } = await params;
  const { ok } = await searchParams;
  const flash = await consumeFlash();
  const user = await getSession();
  const intersections = await catalogIntersections();
  const devices = await catalogDevices();
  const ix = intersections.find((i) => i.id === id);
  if (!ix) notFound();
  const owned = devices.filter((d) => d.intersectionId === ix.id);
  const queues = planAllows(ix.plan, "queues");
  const premium = planAllows(ix.plan, "ambulance");
  const modes = COMMAND_MODES.filter((m) => (m === "emergency" ? premium || Boolean(user?.isPlatformAdmin) : true));

  return (
    <div className="space-y-5">
      <LivePulse />
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
          <Stat label="Plan" value={ix.plan} hint={queues ? "colas 100/200/300" : "cola cercana"} />
        </Bento>
      </div>
      <Bento glow="green">
        <Kicker>Gemelo</Kicker>
        <p className="mb-4 mt-1 text-sm text-[var(--mute)]">
          Se refresca solo. Si el edge publicó un snapshot, las luces salen de ahí.
        </p>
        <IntersectionTwin ix={ix} showQueues={queues} />
      </Bento>
      {canManageNetwork(user) ? (
        <Bento>
          <Kicker>Orden al campo</Kicker>
          <p className="mt-1 text-sm text-[var(--mute)]">
            Queda firmada con HMAC. El cerebro la pide en /api/commands. El despeje ámbar y all-red lo hace el edge.
          </p>
          <form action={sendFieldCommand} className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <input name="code" type="hidden" value={ix.code} />
            <input name="back" type="hidden" value={`/app/cruces/${ix.id}`} />
            <Field
              label="Modo"
              name="mode"
              defaultValue={ix.mode}
              options={modes.map((m) => ({ value: m, label: modeLabel(m) }))}
            />
            <Button type="submit">Enviar orden</Button>
          </form>
          {premium ? (
            <p className="mt-3 text-xs text-[var(--mute)]">Premium: piso, audio y prioridad de emergencia.</p>
          ) : (
            <p className="mt-3 text-xs text-[var(--mute)]">Emergencia, piso y audio piden plan Premium.</p>
          )}
        </Bento>
      ) : null}
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
