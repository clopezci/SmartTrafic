import Link from "next/link";
import { Bento, Kicker, Light, Pill } from "@/components/ui";
import { modeLabel } from "@/lib/algorithm";
import { catalogIntersections } from "@/lib/catalog";
import { relativeTime } from "@/lib/format";

export default async function CrucesPage() {
  const intersections = await catalogIntersections();
  return (
    <div>
      <Kicker>Red municipal</Kicker>
      <h1 className="font-display text-4xl text-white">Cruces</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
        Un cerebro por intersección, no por poste. Toca una tarjeta y ves el gemelo.
      </p>
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
    </div>
  );
}
