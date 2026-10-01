import Link from "next/link";
import { Bento, Button, Field, Kicker, Light, Pill } from "@/components/ui";
import { modeLabel } from "@/lib/algorithm";
import { catalogIntersections, catalogMunicipalities } from "@/lib/catalog";
import { canManageNetwork, relativeTime } from "@/lib/format";
import { getSession } from "@/lib/session";
import { consumeFlash } from "@/lib/site-settings";
import { createIntersection } from "../red/actions";

export default async function CrucesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const flash = await consumeFlash();
  const user = await getSession();
  const [intersections, municipalities] = await Promise.all([
    catalogIntersections(),
    catalogMunicipalities(),
  ]);
  return (
    <div>
      <Kicker>Red municipal</Kicker>
      <h1 className="font-display text-4xl text-white">Cruces</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
        Un cerebro por intersección, no por poste. Toca una tarjeta y ves el gemelo.
      </p>
      {flash ? (
        <p
          className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
            ok === "err"
              ? "bg-[rgba(255,77,77,0.12)] text-[var(--stop)]"
              : "border border-[var(--go)]/30 bg-[rgba(46,242,138,0.08)] text-[var(--go)]"
          }`}
        >
          {flash}
        </p>
      ) : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {intersections.map((ix) => (
          <Link href={`/app/cruces/${ix.id}`} key={ix.id}>
            <Bento className="h-full hover:border-white/20" glow={ix.healthScore < 70 ? "amber" : "none"}>
              <div className="flex items-center justify-between">
                <Kicker>{ix.code} · {ix.geometry === "plus" ? "4 sentidos" : ix.geometry === "t" ? "3 sentidos" : "peatonal"}</Kicker>
                <Pill tone={ix.online ? "green" : "red"}>{ix.online ? "en línea" : "local"}</Pill>
              </div>
              <h2 className="mt-2 font-display text-2xl text-white">{ix.name}</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {ix.live.map((a) => (
                  <span className="flex items-center gap-2 text-xs text-white/70" key={a.id}>
                    <Light color={a.color} size={10} />
                    {a.name.split(" ")[0]}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-[var(--mute)]">
                {modeLabel(ix.mode)} · solar {ix.batteryPct}% · heartbeat {relativeTime(ix.lastHeartbeatAt)} · plan {ix.plan}
              </p>
            </Bento>
          </Link>
        ))}
      </div>
      {canManageNetwork(user) ? (
        <Bento className="mt-6">
          <Kicker>Nuevo cruce</Kicker>
          <form action={createIntersection} className="mt-4 grid gap-4 md:grid-cols-2">
            <Field
              label="Alcaldía"
              name="municipalityId"
              defaultValue={user?.municipalityId || municipalities[0]?.id}
              options={municipalities.map((m) => ({ value: m.id, label: m.name }))}
              required
            />
            <Field label="Código" name="code" required hint="Ej. CR-07" />
            <Field label="Nombre" name="name" required />
            <Field
              label="Geometría"
              name="geometry"
              defaultValue="plus"
              options={[
                { value: "plus", label: "Cruz" },
                { value: "t", label: "T" },
                { value: "pedestrian", label: "Peatonal" },
              ]}
            />
            <Field
              label="Plan"
              name="plan"
              defaultValue="adaptativo"
              options={[
                { value: "esencial", label: "Esencial" },
                { value: "adaptativo", label: "Adaptativo" },
                { value: "premium", label: "Premium" },
              ]}
            />
            <Field label="Latitud" name="lat" defaultValue="6.083" />
            <Field label="Longitud" name="lng" defaultValue="-75.333" />
            <div className="md:col-span-2">
              <Button type="submit">Crear cruce</Button>
            </div>
          </form>
        </Bento>
      ) : null}
    </div>
  );
}
