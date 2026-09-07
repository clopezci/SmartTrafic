import { Simulator } from "@/components/simulator";
import { Kicker } from "@/components/ui";

export default function SimuladorPage() {
  return (
    <div>
      <Kicker>Laboratorio</Kicker>
      <h1 className="font-display text-4xl text-white">Simulador</h1>
      <p className="mb-6 mt-2 max-w-2xl text-sm text-[var(--mute)]">
        Esta es la misma lógica que irá a la placa. Úsala en la reunión con el concejo: mueve las colas y enseña cómo el verde sigue al tráfico, no al reloj.
      </p>
      <Simulator />
    </div>
  );
}
