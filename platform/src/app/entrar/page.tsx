import { Bento, Button, Field, Kicker } from "@/components/ui";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <LoginInner searchParams={searchParams} />
  );
}

async function LoginInner({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const q = await searchParams;
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <Bento>
        <Kicker>Acceso</Kicker>
        <h1 className="mt-2 font-display text-3xl text-white">Entrar al tablero</h1>
        <p className="mt-2 text-sm text-[var(--mute)]">
          En demostración usa las cuentas de abajo. Cuando Supabase esté conectado,
          entra con tu usuario real.
        </p>
        {q.error ? (
          <p className="mt-4 rounded-xl bg-[rgba(255,77,77,0.12)] px-3 py-2 text-sm text-[var(--stop)]">
            {q.error === "invalid" ? "Correo o clave incorrectos." : q.error}
          </p>
        ) : null}
        <form action="/api/auth/login" className="mt-6 space-y-4" method="post">
          <Field
            defaultValue="clopezci@gmail.com"
            hint="El dueño de la plataforma es este correo."
            label="Correo"
            name="email"
            type="email"
          />
          <Field
            defaultValue="Demo#SmartTrafic26"
            label="Clave"
            name="password"
            type="password"
          />
          <Button className="w-full" type="submit">
            Entrar
          </Button>
        </form>
        <div className="mt-6 space-y-1 text-[11px] text-[var(--mute)]">
          <p>Superadmin · clopezci@gmail.com · Demo#SmartTrafic26</p>
          <p>Alcaldía · alcalde@villaesperanza.gov.co · Demo#Municipio26</p>
          <p>Técnico · tecnico@villaesperanza.gov.co · Demo#Tecnico26</p>
          <p>Policía · transito@villaesperanza.gov.co · Demo#Visor26</p>
        </div>
      </Bento>
    </div>
  );
}
