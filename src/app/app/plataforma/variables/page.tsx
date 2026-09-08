import { Bento, Button, Field, Kicker, Pill } from "@/components/ui";
import { grantStillValid } from "@/lib/access";
import { isOwner, roleLabel } from "@/lib/format";
import { getSession } from "@/lib/session";
import {
  consumeFlash,
  getMergedPlatformVariables,
  listGrants,
} from "@/lib/site-settings";
import { SUPERADMIN_EMAIL } from "@/lib/types";
import { createAccessGrant, revokeAccessGrant, savePlatformVariables } from "./actions";

function boolField(value: string) {
  return value === "true" || value === "false";
}

export default async function PlatformVarsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const user = await getSession();
  const owner = isOwner(user);
  const vars = await getMergedPlatformVariables();
  const groups = Array.from(new Set(vars.map((v) => v.group)));
  const grants = await listGrants();
  const flash = await consumeFlash();

  return (
    <div>
      <Kicker>Dueño de plataforma</Kicker>
      <h1 className="font-display text-4xl text-white">Admin</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
        Precios, textos de la home, flags y accesos de prueba. El dueño fijo es{" "}
        {SUPERADMIN_EMAIL}. Eso no se delega.
      </p>
      {flash || ok === "1" ? (
        <p className="mt-4 rounded-2xl border border-[var(--go)]/30 bg-[rgba(61,255,138,0.08)] px-4 py-3 text-sm text-[var(--go)]">
          {flash || "Guardado. La landing ya usa estos valores."}
        </p>
      ) : null}
      {ok === "badmail" ? (
        <p className="mt-4 rounded-2xl bg-[rgba(255,77,77,0.12)] px-4 py-3 text-sm text-[var(--stop)]">
          Ese correo no sirve. No puedes invitarte a ti mismo ni omitir el @.
        </p>
      ) : null}

      {owner ? (
        <Bento className="mt-6" glow="green">
          <Kicker>Accesos de prueba</Kicker>
          <p className="mt-2 text-sm text-white/70">
            Invita con correo, rol y días. La clave es autónoma: funciona desde
            cualquier computador hasta que venza o la quites. No le des el correo
            del dueño a nadie.
          </p>
          <form action={createAccessGrant} className="mt-4 grid gap-4 md:grid-cols-2">
            <Field hint="La persona entra con este correo." label="Correo" name="email" required type="email" />
            <Field hint="Cómo sale su nombre en el tablero." label="Nombre" name="fullName" />
            <Field
              defaultValue="admin"
              hint="Admin ve este panel. Alcaldía / técnico / visor ven El Carmen de Viboral."
              label="Rol"
              name="kind"
              options={[
                { value: "admin", label: "Admin de plataforma" },
                { value: "municipality", label: "Alcaldía" },
                { value: "technician", label: "Técnico" },
                { value: "viewer", label: "Visor" },
              ]}
            />
            <Field
              defaultValue="7"
              hint="0 = sin fecha. Tope 90 días."
              label="Días de acceso"
              name="days"
              type="number"
            />
            <div className="md:col-span-2">
              <Button type="submit">Crear acceso</Button>
            </div>
          </form>
          <div className="mt-6 space-y-2">
            {grants.length === 0 ? (
              <p className="text-sm text-[var(--mute)]">Nadie invitado todavía.</p>
            ) : (
              grants.map((g) => {
                const alive = grantStillValid(g.expiresAt);
                return (
                  <div
                    className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-black/20 p-3 md:flex-row md:items-center md:justify-between"
                    key={g.email}
                  >
                    <div>
                      <p className="text-sm text-white">
                        {g.fullName}{" "}
                        <span className="text-white/50">· {g.email}</span>
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-[var(--go)]">
                        {g.password}
                      </p>
                      <p className="mt-1 text-[11px] text-[var(--mute)]">
                        {roleLabel(g.role)}
                        {g.isPlatformAdmin ? " · panel admin" : ""}
                        {g.expiresAt
                          ? ` · vence ${g.expiresAt.slice(0, 10)}`
                          : " · sin vencimiento"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill tone={alive ? "green" : "red"}>
                        {alive ? "Vigente" : "Vencido"}
                      </Pill>
                      <form action={revokeAccessGrant}>
                        <input name="email" type="hidden" value={g.email} />
                        <Button type="submit" variant="danger">
                          Quitar
                        </Button>
                      </form>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Bento>
      ) : (
        <p className="mt-6 text-sm text-[var(--mute)]">
          Puedes ver y editar variables. Solo el dueño crea o quita invitaciones.
        </p>
      )}

      <form action={savePlatformVariables} className="mt-6 space-y-5">
        <input name="_next" type="hidden" value="/app/plataforma/variables" />
        {groups.map((g) => (
          <Bento key={g}>
            <Kicker>{g}</Kicker>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {vars
                .filter((v) => v.group === g)
                .map((v) => (
                  <Field
                    defaultValue={v.value}
                    hint={v.hint}
                    key={v.key}
                    label={v.label}
                    name={v.key}
                    options={
                      boolField(v.value)
                        ? [
                            { value: "true", label: "Sí" },
                            { value: "false", label: "No" },
                          ]
                        : undefined
                    }
                    textarea={
                      v.key.includes("lead") ||
                      v.key.includes("Box") ||
                      v.key.includes("Message") ||
                      v.key.includes("blurb")
                    }
                  />
                ))}
            </div>
          </Bento>
        ))}
        <Button type="submit">Guardar variables</Button>
      </form>
    </div>
  );
}
