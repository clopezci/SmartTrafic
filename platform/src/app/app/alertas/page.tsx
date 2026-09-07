import { Bento, Kicker, Pill } from "@/components/ui";
import { alerts, intersections } from "@/lib/demo-data";
import { relativeTime } from "@/lib/format";

export default function AlertasPage() {
  return (
    <div>
      <Kicker>Campo</Kicker>
      <h1 className="font-display text-4xl text-white">Alertas</h1>
      <p className="mt-2 text-sm text-[var(--mute)]">
        Lo que un técnico necesita en el celular. Sin SIEM. Sin cinco clics.
      </p>
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
