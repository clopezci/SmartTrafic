import { Bento, Button, Kicker, Pill } from "@/components/ui";
import { catalogAlerts, catalogIntersections } from "@/lib/catalog";
import { consumeFlash } from "@/lib/site-settings";
import { relativeTime } from "@/lib/format";
import { acknowledgeAlert } from "./actions";

export default async function AlertasPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const flash = await consumeFlash();
  const [alerts, intersections] = await Promise.all([catalogAlerts(), catalogIntersections()]);
  return (
    <div>
      <Kicker>Campo</Kicker>
      <h1 className="font-display text-4xl text-white">Alertas</h1>
      <p className="mt-2 text-sm text-[var(--mute)]">
        Lo que un técnico necesita en el celular. Sin SIEM. Sin cinco clics.
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
      <div className="mt-6 space-y-3">
        {alerts.map((a) => {
          const ix = intersections.find((i) => i.id === a.intersectionId);
          return (
            <Bento
              glow={a.severity === "critical" ? "red" : a.severity === "warning" ? "amber" : "none"}
              key={a.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Pill
                      tone={
                        a.severity === "critical"
                          ? "red"
                          : a.severity === "warning"
                            ? "amber"
                            : "blue"
                      }
                    >
                      {a.code}
                    </Pill>
                    {ix ? <Pill>{ix.code}</Pill> : null}
                    {a.acknowledged ? <Pill tone="green">vista</Pill> : <Pill tone="amber">abierta</Pill>}
                  </div>
                  <h2 className="mt-2 text-lg text-white">{a.title}</h2>
                  <p className="mt-1 text-sm text-white/65">{a.body}</p>
                  {!a.acknowledged ? (
                    <form action={acknowledgeAlert} className="mt-3">
                      <input name="id" type="hidden" value={a.id} />
                      <Button type="submit" variant="ghost">
                        Acusar recibo
                      </Button>
                    </form>
                  ) : null}
                </div>
                <span className="text-xs text-[var(--mute)]">{relativeTime(a.createdAt)}</span>
              </div>
            </Bento>
          );
        })}
      </div>
    </div>
  );
}
