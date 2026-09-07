import { Bento, Kicker, Pill, Stat } from "@/components/ui";
import { municipalities } from "@/lib/demo-data";
import { cop } from "@/lib/format";

export default function AlcaldiasPage() {
  return (
    <div>
      <Kicker>Tenants</Kicker>
      <h1 className="font-display text-4xl text-white">Alcaldías</h1>
      <p className="mt-2 text-sm text-[var(--mute)]">
        Cada municipio es un inquilino aislado. El superadmin ve todos. El secretario, solo el suyo.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {municipalities.map((m) => (
          <Bento key={m.id} glow={m.plan === "premium" ? "green" : "none"}>
            <div className="flex items-start justify-between">
              <div>
                <Kicker>{m.department}</Kicker>
                <h2 className="font-display text-3xl text-white">{m.name}</h2>
              </div>
              <Pill tone="green">{m.plan}</Pill>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Stat label="Población" value={m.population.toLocaleString("es-CO")} />
              <Stat label="Canon / cruce" value={cop.format(m.monthlyFeeCop)} />
            </div>
            <p className="mt-4 text-xs text-[var(--mute)]">
              Contrato {m.contractStart} → {m.contractEnd} · {m.active ? "vigente" : "suspendido"}
            </p>
          </Bento>
        ))}
      </div>
    </div>
  );
}
