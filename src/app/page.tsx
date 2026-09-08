import { ArrowRight } from "lucide-react";
import { CinematicDemo } from "@/components/cinematic-demo";
import { BrandMark, SignalMark } from "@/components/signal";
import { Bento, Button, Kicker, Pill } from "@/components/ui";
import { getLandingCopy, getLandingPlans } from "@/lib/site-settings";

const PLAN_TONE = ["green", "amber", "red"] as const;
const PLAN_LIT = ["go", "wait", "red"] as const;

export default async function HomePage() {
  const plans = await getLandingPlans();
  const copy = await getLandingCopy();
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
      <header className="mb-16 flex items-center justify-between">
        <BrandMark />
        <Button href="/entrar" variant="ghost">
          Entrar al tablero
        </Button>
      </header>

      <section className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Pill tone="green">{copy.pill}</Pill>
          <h1 className="mt-5 font-display text-5xl leading-[0.95] text-white md:text-7xl">
            {copy.hero1}
            <span className="block text-[var(--go)]">{copy.hero2}</span>
            {copy.hero3}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/70">{copy.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/entrar">
              {copy.ctaPrimary} <ArrowRight size={16} />
            </Button>
            <Button href="/demo" variant="ghost">
              {copy.ctaSecondary}
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
        {plans.map((plan, i) => (
          <Bento glow={PLAN_TONE[i]} key={plan.name}>
            <div className="flex items-start justify-between gap-3">
              <Kicker>{plan.name}</Kicker>
              <SignalMark lit={PLAN_LIT[i]} size={22} />
            </div>
            <p className="mt-2 font-display text-3xl text-white">{plan.price}</p>
            <p className="mt-2 text-sm text-white/65">{plan.blurb}</p>
            <p className="mt-4 text-[11px] text-[var(--mute)]">{plan.footnote}</p>
          </Bento>
        ))}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Bento>
          <Kicker>Del municipio</Kicker>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            {copy.muniBox.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Bento>
        <Bento glow="amber">
          <Kicker>En comodato SmartTrafic</Kicker>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            {copy.comodatoBox.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Bento>
      </section>
    </div>
  );
}
