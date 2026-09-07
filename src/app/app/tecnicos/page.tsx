import { Bento, Kicker, Pill } from "@/components/ui";
import { technicians } from "@/lib/demo-data";

export default function TecnicosPage() {
  return (
    <div>
      <Kicker>Gente</Kicker>
      <h1 className="font-display text-4xl text-white">Técnicos</h1>
      <p className="mt-2 text-sm text-[var(--mute)]">
        Pocas personas, cruces asignados, estado en una tarjeta.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {technicians.map((t) => (
          <Bento key={t.id}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-2xl text-white">{t.fullName}</h2>
                <p className="text-sm text-[var(--mute)]">{t.email}</p>
                <p className="text-sm text-white/70">{t.phone}</p>
              </div>
              <Pill tone={t.status === "disponible" ? "green" : "amber"}>{t.status.replace("_", " ")}</Pill>
            </div>
            <p className="mt-4 text-xs text-[var(--mute)]">Cruces</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {t.assigned.map((c) => (
                <Pill key={c}>{c}</Pill>
              ))}
            </div>
          </Bento>
        ))}
      </div>
    </div>
  );
}
