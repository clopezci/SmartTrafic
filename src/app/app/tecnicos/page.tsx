import { Bento, Button, Field, Kicker, Pill } from "@/components/ui";
import { freshChecklist } from "@/lib/checklist";
import { catalogMunicipalities, catalogTechnicians } from "@/lib/catalog";
import { canManageNetwork, canWriteMunicipality } from "@/lib/format";
import { getSession } from "@/lib/session";
import { consumeFlash } from "@/lib/site-settings";
import { createTechnician, toggleCheck } from "../red/actions";

export default async function TecnicosPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const flash = await consumeFlash();
  const user = await getSession();
  const [technicians, municipalities] = await Promise.all([
    catalogTechnicians(),
    catalogMunicipalities(),
  ]);
  const writable = canWriteMunicipality(user);
  return (
    <div>
      <Kicker>Gente</Kicker>
      <h1 className="font-display text-4xl text-white">Técnicos</h1>
      <p className="mt-2 text-sm text-[var(--mute)]">
        Pocas personas, cruces asignados, checklist de campo en la misma tarjeta.
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
        {technicians.map((t) => {
          const groups = t.checklist?.length ? t.checklist : t.assigned.map((code) => freshChecklist(code));
          return (
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
              <div className="mt-4 space-y-3">
                {groups.map((group) => (
                  <div key={group.code}>
                    <p className="text-xs text-white/70">{group.code}</p>
                    <ul className="mt-1 space-y-1">
                      {group.items.map((item) => (
                        <li key={item.id}>
                          {writable ? (
                            <form action={toggleCheck}>
                              <input name="technicianId" type="hidden" value={t.id} />
                              <input name="code" type="hidden" value={group.code} />
                              <input name="itemId" type="hidden" value={item.id} />
                              <button className="text-left text-sm text-white/80" type="submit">
                                {item.done ? "☑" : "☐"} {item.label}
                              </button>
                            </form>
                          ) : (
                            <span className="text-sm text-white/80">
                              {item.done ? "☑" : "☐"} {item.label}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Bento>
          );
        })}
      </div>
      {canManageNetwork(user) ? (
        <Bento className="mt-6">
          <Kicker>Nuevo técnico</Kicker>
          <form action={createTechnician} className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Nombre" name="fullName" required />
            <Field label="Correo" name="email" type="email" required />
            <Field label="Teléfono" name="phone" />
            <Field
              label="Alcaldía"
              name="municipalityId"
              defaultValue={user?.municipalityId || municipalities[0]?.id}
              options={municipalities.map((m) => ({ value: m.id, label: m.name }))}
            />
            <Field label="Cruces" name="assigned" hint="Códigos separados por coma. Ej. CR-01, CR-02" />
            <div className="md:col-span-2">
              <Button type="submit">Crear técnico</Button>
            </div>
          </form>
        </Bento>
      ) : null}
    </div>
  );
}
