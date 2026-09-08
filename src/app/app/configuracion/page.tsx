import { Bento, Button, Field, Kicker } from "@/components/ui";
import { municipalityVariables } from "@/lib/demo-data";
import { canWriteMunicipality, isPlatformAdmin } from "@/lib/format";
import { getSession } from "@/lib/session";
import { readSavedValues } from "@/lib/site-settings";
import { savePlatformVariables } from "@/app/app/plataforma/variables/actions";

export default async function ConfigPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const user = await getSession();
  const writable = canWriteMunicipality(user);
  const admin = isPlatformAdmin(user);
  const saved = await readSavedValues();
  const groups = Array.from(new Set(municipalityVariables.map((v) => v.group)));

  return (
    <div>
      <Kicker>Alcaldía</Kicker>
      <h1 className="font-display text-4xl text-white">Variables del municipio</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
        Tiempos mínimos, ventanas de colegio y noche. Precios y accesos de prueba
        viven en Admin.
      </p>
      {ok ? (
        <p className="mt-4 rounded-2xl border border-[var(--go)]/30 bg-[rgba(61,255,138,0.08)] px-4 py-3 text-sm text-[var(--go)]">
          Guardado.
        </p>
      ) : null}
      {admin ? (
        <Bento className="mt-6" glow="green">
          <Kicker>Planes, landing y accesos</Kicker>
          <p className="mt-2 text-sm text-white/65">
            Eso se mueve en el panel Admin: precios +50%, textos de la home e
            invitaciones por correo.
          </p>
          <div className="mt-4">
            <Button href="/app/plataforma/variables">Abrir Admin</Button>
          </div>
        </Bento>
      ) : null}
      <form action={savePlatformVariables} className="mt-6 space-y-5">
        <input name="_next" type="hidden" value="/app/configuracion" />
        {groups.map((g) => (
          <Bento key={g}>
            <Kicker>{g}</Kicker>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {municipalityVariables
                .filter((v) => v.group === g)
                .map((v) => (
                  <Field
                    defaultValue={saved[v.key] ?? v.value}
                    hint={v.hint}
                    key={v.key}
                    label={v.label}
                    name={v.key}
                    readOnly={!writable}
                  />
                ))}
            </div>
          </Bento>
        ))}
        {writable ? (
          <Button type="submit">Guardar variables</Button>
        ) : (
          <p className="text-sm text-[var(--mute)]">Solo lectura para tu rol.</p>
        )}
      </form>
    </div>
  );
}
