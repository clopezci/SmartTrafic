import { Bento, Kicker, Pill } from "@/components/ui";
import { devices, intersections } from "@/lib/demo-data";

const MUNI = [
  "Postes y báculos de acero",
  "Caras LED vehiculares y peatonales",
  "Paneles solares y soportes",
  "Gabinete metálico IP66",
  "Obra civil menor / anclajes",
];
const OURS = [
  "Cerebro edge (CM4 / ESP32-S3)",
  "Satélites ESP32 + relés",
  "Cámara IA / radar",
  "Módem 4G industrial",
  "Firmware, nube y dashboard",
];

export default function ActivosPage() {
  return (
    <div className="space-y-5">
      <div>
        <Kicker>Contrato mixto</Kicker>
        <h1 className="font-display text-4xl text-white">Activos</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
          El candado de renovación: el pueblo se queda con el acero. El cerebro se va si no pagan la suscripción.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Bento>
          <Kicker>Municipio (CapEx)</Kicker>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {MUNI.map((i) => (
              <li key={i}>· {i}</li>
            ))}
          </ul>
        </Bento>
        <Bento glow="green">
          <Kicker>SmartTrafic (comodato)</Kicker>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {OURS.map((i) => (
              <li key={i}>· {i}</li>
            ))}
          </ul>
        </Bento>
      </div>
      <Bento>
        <Kicker>Inventario CR-01</Kicker>
        <div className="mt-4 space-y-2">
          {devices.map((d) => {
            const ix = intersections.find((i) => i.id === d.intersectionId);
            return (
              <div className="flex items-center justify-between border-t border-white/6 py-2 text-sm" key={d.id}>
                <div>
                  <p className="text-white">{d.label}</p>
                  <p className="font-mono text-[11px] text-[var(--mute)]">
                    {d.serial} · {ix?.code}
                  </p>
                </div>
                <Pill tone={d.owner === "smarttrafic" ? "green" : "blue"}>
                  {d.owner === "smarttrafic" ? "nuestro" : "de ellos"}
                </Pill>
              </div>
            );
          })}
        </div>
      </Bento>
    </div>
  );
}
