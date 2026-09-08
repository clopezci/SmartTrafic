import Link from "next/link";
import { BrandMark } from "@/components/signal";
import { Bento, Button, Field, Kicker } from "@/components/ui";
import { getLandingCopy, hasCustomPassword } from "@/lib/site-settings";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return <LoginInner searchParams={searchParams} />;
}

async function LoginInner({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const q = await searchParams;
  const copy = await getLandingCopy();
  const ownerCustom = await hasCustomPassword("clpezci@gmail.com");
  const errorText =
    q.error === "invalid"
      ? "Correo o clave incorrectos."
      : q.error === "locked"
        ? "Los ingresos están cerrados. Escribe al dueño."
        : q.error;
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <Link className="mb-6 flex justify-center" href="/">
        <BrandMark />
      </Link>
      <Bento>
        <Kicker>Acceso</Kicker>
        <h1 className="mt-2 font-display text-3xl text-white">Entrar al tablero</h1>
        <p className="mt-2 text-sm text-[var(--mute)]">
          Si te invitaron a probar, usa el correo y la clave que te mandaron. El
          dueño entra con su cuenta.
        </p>
        {copy.maintenance ? (
          <p className="mt-4 rounded-xl bg-[rgba(255,176,32,0.12)] px-3 py-2 text-sm text-[var(--wait)]">
            {copy.maintenanceMessage}
          </p>
        ) : null}
        {errorText ? (
          <p className="mt-4 rounded-xl bg-[rgba(255,77,77,0.12)] px-3 py-2 text-sm text-[var(--stop)]">
            {errorText}
          </p>
        ) : null}
        <form action="/api/auth/login" className="mt-6 space-y-4" method="post">
          <Field
            defaultValue=""
            hint="El dueño de la plataforma no se puede sustituir."
            label="Correo"
            name="email"
            type="email"
          />
          <Field label="Clave" name="password" type="password" />
          <Button className="w-full" type="submit">
            Entrar
          </Button>
        </form>
        {copy.showAccounts ? (
          <div className="mt-6 space-y-1 text-[11px] text-[var(--mute)]">
            <p>
              Superadmin · clpezci@gmail.com ·{" "}
              {ownerCustom ? "la clave que definiste en Cuenta" : "Demo#SmartTrafic26"}
            </p>
            <p>Alcaldía · alcalde@villaesperanza.gov.co · Demo#Municipio26</p>
            <p>Técnico · tecnico@villaesperanza.gov.co · Demo#Tecnico26</p>
            <p>Policía · transito@villaesperanza.gov.co · Demo#Visor26</p>
          </div>
        ) : null}
      </Bento>
    </div>
  );
}
