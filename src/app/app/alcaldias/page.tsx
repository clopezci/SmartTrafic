import { Bento, Button, Field, Kicker, Pill, Stat } from "@/components/ui";
import { catalogMunicipalities } from "@/lib/catalog";
import { cop, isPlatformAdmin } from "@/lib/format";
import { getSession } from "@/lib/session";
import { consumeFlash } from "@/lib/site-settings";
import { createMunicipality } from "../red/actions";

export default async function AlcaldiasPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const flash = await consumeFlash();
  const user = await getSession();
  const municipalities = await catalogMunicipalities();
  const admin = isPlatformAdmin(user);
  return (
    <div>
      <Kicker>Tenants</Kicker>
      <h1 className="font-display text-4xl text-white">Alcaldías</h1>
      <p className="mt-2 text-sm text-[var(--mute)]">
        Cada municipio es un inquilino aislado. El superadmin ve todos. El secretario, solo el suyo.
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
      {admin ? (
        <Bento className="mt-6">
          <Kicker>Nueva alcaldía</Kicker>
          <form action={createMunicipality} className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Nombre" name="name" required />
            <Field label="Departamento" name="department" required />
            <Field label="Población" name="population" type="number" defaultValue="20000" />
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
            <div className="md:col-span-2">
              <Button type="submit">Crear alcaldía</Button>
            </div>
          </form>
        </Bento>
      ) : null}
    </div>
  );
}
