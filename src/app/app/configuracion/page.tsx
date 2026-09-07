import { Bento, Button, Field, Kicker } from "@/components/ui";
import { municipalityVariables } from "@/lib/demo-data";
import { canWriteMunicipality } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function ConfigPage() {
  const user = await getSession();
  const writable = canWriteMunicipality(user);
  const groups = Array.from(new Set(municipalityVariables.map((v) => v.group)));

  return (
    <div>
      <Kicker>Alcaldía</Kicker>
      <h1 className="font-display text-4xl text-white">Variables del municipio</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
        Tiempos mínimos, ventanas de colegio y noche. El algoritmo puede ser listo, pero estos números son ley.
      </p>
      <form className="mt-6 space-y-5">
        {groups.map((g) => (
          <Bento key={g}>
            <Kicker>{g}</Kicker>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {municipalityVariables
                .filter((v) => v.group === g)
                .map((v) => (
                  <Field
                    defaultValue={v.value}
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
          <Button type="submit">Guardar (demo: no persiste aún)</Button>
        ) : (
          <p className="text-sm text-[var(--mute)]">Solo lectura para tu rol.</p>
        )}
      </form>
    </div>
  );
}
