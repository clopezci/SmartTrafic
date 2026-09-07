import { ArrowRight } from "lucide-react";
import { CinematicDemo } from "@/components/cinematic-demo";
import { Bento, Button, Kicker, Pill } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
      <header className="mb-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--go)] text-xs font-black text-[#04210f]">
            ST
          </span>
          <span className="font-display text-xl text-white">SmartTrafic</span>
        </div>
        <Button href="/entrar" variant="ghost">
          Entrar al tablero
        </Button>
      </header>

      <section className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Pill tone="green">Fase 1 · plataforma municipal</Pill>
          <h1 className="mt-5 font-display text-5xl leading-[0.95] text-white md:text-7xl">
            El pueblo no necesita
            <span className="block text-[var(--go)]">romper las calles</span>
            para semaforizarse.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/70">
            Control adaptativo a 100, 200 y 300 metros. Solar. Motos primero.
            El alcalde paga acero. El cerebro llega en comodato y se opera
            desde el celular.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/entrar">
              Ver el tablero <ArrowRight size={16} />
            </Button>
            <Button href="/demo" variant="ghost">
              Ver la simulación
            </Button>
          </div>
        </div>
        <Bento glow="green">
          <Kicker>Cinco escenas en un cuadro</Kicker>
          <p className="mt-1 mb-4 text-sm text-white/65">
            Cola, ambulancia, motos, noche antiatraco y colegio. Rota solo.
          </p>
          <CinematicDemo compact />
        </Bento>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          ["Esencial", "$1.0M / mes", "Mesh, noche segura, alertas, tablero."],
          ["Adaptativo", "$1.5M / mes", "IA de colas, reportes al alcalde, bloqueos."],
          ["Premium", "$2.1M / mes", "Piso LED, audio, ambulancia, hospital."],
        ].map(([n, p, d]) => (
          <Bento key={n}>
            <Kicker>{n}</Kicker>
            <p className="mt-2 font-display text-3xl text-white">{p}</p>
            <p className="mt-2 text-sm text-white/65">{d}</p>
            <p className="mt-4 text-[11px] text-[var(--mute)]">
              Por cruce. Tecnología en comodato. Postes del municipio.
            </p>
          </Bento>
        ))}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Bento>
          <Kicker>Del municipio</Kicker>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li>Postes, báculos y obra menor</li>
            <li>Caras LED vehiculares y peatonales</li>
            <li>Paneles, soportes y gabinete metálico</li>
          </ul>
        </Bento>
        <Bento glow="amber">
          <Kicker>En comodato SmartTrafic</Kicker>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li>Cerebro del cruce, ESP32, relés, módem</li>
            <li>Cámaras / radar, firmware y plataforma</li>
            <li>Si no se renueva, se retira el cerebro. El acero se queda.</li>
          </ul>
        </Bento>
      </section>
    </div>
  );
}
