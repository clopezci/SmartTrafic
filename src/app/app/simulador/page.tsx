import { CinematicDemo } from "@/components/cinematic-demo";
import { Simulator } from "@/components/simulator";
import { Kicker } from "@/components/ui";

export default function SimuladorPage() {
  return (
    <div>
      <Kicker>Laboratorio</Kicker>
      <h1 className="font-display text-4xl text-white">Simulador</h1>
      <p className="mb-6 mt-2 max-w-2xl text-sm text-[var(--mute)]">
        Arriba: la peli que le muestras al concejo. Abajo: el laboratorio donde
        tú mueves las colas. Misma idea, dos niveles.
      </p>
      <div className="mb-8">
        <CinematicDemo />
      </div>
      <Simulator />
    </div>
  );
}
