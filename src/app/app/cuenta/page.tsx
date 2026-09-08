import { Bento, Button, Field, Kicker } from "@/components/ui";
import { DEMO_USERS } from "@/lib/demo-data";
import { getSession } from "@/lib/session";
import { consumeFlash } from "@/lib/site-settings";
import { updatePassword, updateProfile } from "./actions";

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const user = await getSession();
  const flash = await consumeFlash();
  const { ok } = await searchParams;
  const canPassword = Boolean(user && DEMO_USERS[user.email.toLowerCase()] && !user.isGuest);

  return (
    <div>
      <Kicker>Tu usuario</Kicker>
      <h1 className="font-display text-4xl text-white">Cuenta</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--mute)]">
        Nombre que sale en el tablero y clave de acceso. El correo del dueño no se
        cambia. Esta clave es de la sesión del tablero: el schema y la semilla no
        crean usuarios en Authentication.
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

      <form action={updateProfile} className="mt-6 space-y-4">
        <Bento>
          <Kicker>Perfil</Kicker>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field
              defaultValue={user?.fullName}
              hint="Así te ven en el menú."
              label="Nombre"
              name="fullName"
              required
            />
            <Field
              defaultValue={user?.email}
              hint="Fijo. El dueño es este correo."
              label="Correo"
              readOnly
            />
          </div>
          <div className="mt-4">
            <Button type="submit">Guardar nombre</Button>
          </div>
        </Bento>
      </form>

      <form action={updatePassword} className="mt-5">
        <Bento>
          <Kicker>Clave</Kicker>
          {canPassword ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Clave actual" name="current" required type="password" />
              <div />
              <Field
                hint="Mínimo 10 caracteres."
                label="Clave nueva"
                name="next"
                required
                type="password"
              />
              <Field label="Repite la nueva" name="confirm" required type="password" />
              <div className="md:col-span-2">
                <Button type="submit">Cambiar clave</Button>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/70">
              Esta sesión es de prueba. La clave la crea el dueño en Admin, no se
              cambia aquí.
            </p>
          )}
        </Bento>
      </form>
    </div>
  );
}
