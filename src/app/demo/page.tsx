import Link from "next/link";
import { CinematicDemo } from "@/components/cinematic-demo";
import { BrandMark } from "@/components/signal";
import { Button, Kicker } from "@/components/ui";

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:py-12">
      <header className="mb-8 flex items-center justify-between">
        <Link className="flex items-center gap-2" href="/">
          <BrandMark />
        </Link>
        <Button href="/entrar" variant="ghost">
          Entrar al tablero
        </Button>
      </header>
      <Kicker>Demo para la alcaldía</Kicker>
      <h1 className="font-display text-4xl text-white md:text-5xl">El cruce piensa</h1>
      <p className="mt-3 mb-8 max-w-2xl text-sm text-white/70">
        Cinco escenas en el mismo cuadro, como un juego. No es un video grabado: los
        carros se mueven y los semáforos cambian según el caso. Puedes saltar con
        las rayitas de abajo.
      </p>
      <CinematicDemo />
    </div>
  );
}
