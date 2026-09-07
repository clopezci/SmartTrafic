import { Bento, Button, Field, Kicker } from "@/components/ui";
import { platformVariables } from "@/lib/demo-data";

export default function PlatformVarsPage() {
  const groups = Array.from(new Set(platformVariables.map((v) => v.group)));
  return (
    <div>
      <Kicker>Configuración global</Kicker>
      <h1 className="font-display text-4xl text-white">Variables de plataforma</h1>
      <p className="mt-2 text-sm text-[var(--mute)]">
        Feature flags, Telegram, HMAC. Esto no lo ve una alcaldía.
      </p>
      <form className="mt-6 space-y-5">
        {groups.map((g) => (
          <Bento key={g}>
            <Kicker>{g}</Kicker>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {platformVariables
                .filter((v) => v.group === g)
                .map((v) => (
                  <Field
                    defaultValue={v.value}
                    hint={v.hint}
                    key={v.key}
                    label={v.label}
                    name={v.key}
                  />
                ))}
            </div>
          </Bento>
        ))}
        <Button type="submit">Guardar flags (demo)</Button>
      </form>
    </div>
  );
}
