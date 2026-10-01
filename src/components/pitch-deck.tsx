"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/signal";
import { Button } from "@/components/ui";

const SLIDES = 7;

const BONDS: { k: string; lines: string[] }[] = [
  {
    k: "Cola",
    lines: [
      "El verde sigue al pelotón que está a 100, 200 y 300 metros.",
      "Si la calle se vacía, ese verde se corta.",
    ],
  },
  {
    k: "Motos primero",
    lines: [
      "La moto, el carro, el bus, el camión y el peatón no pesan igual.",
      "El cruce se mide como una calle colombiana.",
    ],
  },
  {
    k: "Solar de verdad",
    lines: [
      "Si la batería baja, el cruce no se apaga.",
      "Quita lo auxiliar y sigue decidiendo en el poste.",
    ],
  },
  {
    k: "Modos de pueblo",
    lines: [
      "Colegio, mercado, noche y emergencia cambian la prioridad solos.",
      "Nadie tiene que reprogramar el gabinete.",
    ],
  },
  {
    k: "Seguridad de fases",
    lines: [
      "Nunca hay verde contra verde.",
      "Ante la duda, el cruce pasa a ámbar intermitente.",
      "El despeje ámbar y el all-red no se saltan.",
    ],
  },
  {
    k: "Técnico con el pulgar",
    lines: [
      "La alerta, el checklist y el estado del cruce caben en el celular.",
      "No hace falta una consola de tráfico.",
    ],
  },
  {
    k: "Gemelo antes de la obra",
    lines: [
      "El concejo ve el cruce decidir con conteos de ese punto.",
      "Eso ocurre antes de romper una losa.",
    ],
  },
];

const GAINS: { k: string; lines: string[] }[] = [
  {
    k: "Espera",
    lines: ["Cuántos minutos bajó la fila frente a un semáforo que siempre dura 45 segundos."],
  },
  {
    k: "Combustible",
    lines: ["Cuánta gasolina dejaron de quemar carros, motos y buses mientras esperaban en rojo."],
  },
  {
    k: "CO₂",
    lines: ["Cuántas toneladas de ese combustible no salieron al aire."],
  },
  {
    k: "Quién pasó",
    lines: [
      "Cuántas motos, carros, buses y camiones de tres o más ejes cruzaron.",
      "Ese número sirve para hablar del desgaste de la vía y de una variante.",
    ],
  },
  {
    k: "Horarios",
    lines: ["Cuántas horas trabajó el cruce en colegio, en mercado, en noche y en emergencia."],
  },
  {
    k: "Salud del poste",
    lines: [
      "Qué batería tiene el poste.",
      "Si el cruce está en línea.",
      "Qué alertas nadie ha atendido.",
    ],
  },
  {
    k: "Informe del mes",
    lines: [
      "Un texto corto para leer en el concejo.",
      "También se puede enviar por correo al alcalde.",
    ],
  },
];

function Lines({ items, className }: { items: string[]; className?: string }) {
  return (
    <div className={className}>
      {items.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

export function PitchDeck({
  email,
  whatsapp,
}: {
  email: string;
  whatsapp: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const digits = whatsapp.replace(/\D/g, "");
  const wa = digits.length >= 10 ? `https://wa.me/${digits}` : null;

  const go = useCallback((next: number) => {
    const root = scroller.current;
    if (!root) return;
    const slides = [...root.querySelectorAll<HTMLElement>("[data-slide]")];
    const i = Math.max(0, Math.min(slides.length - 1, next));
    slides[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const slides = [...root.querySelectorAll<HTMLElement>("[data-slide]")];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const i = slides.indexOf(visible.target as HTMLElement);
        if (i >= 0) setIndex(i);
      },
      { root, threshold: 0.55 },
    );
    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowDown" || event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        go(index + 1);
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        go(index - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  return (
    <div className="relative h-dvh">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 md:px-10">
        <Link className="pointer-events-auto" href="/">
          <BrandMark />
        </Link>
        <p className="font-mono text-xs tracking-[0.2em] text-white/55">
          {String(index + 1).padStart(2, "0")} / {String(SLIDES).padStart(2, "0")}
        </p>
      </header>

      <div ref={scroller} className="h-dvh snap-y snap-mandatory overflow-y-auto scroll-smooth">
        <section
          className="flex min-h-dvh snap-start snap-always flex-col justify-end px-5 pb-28 pt-24 md:px-16 md:pb-32"
          data-slide
        >
          <p className="kicker">Piloto con contrato corto</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.92] text-white md:text-7xl">
            El municipio no necesita romper las calles.
            <span className="mt-2 block text-[var(--go)]">El piloto se firma.</span>
          </h1>
          <Lines
            className="mt-6 max-w-xl space-y-3 text-lg text-white/75"
            items={[
              "SmartTrafic adapta el semáforo al tráfico real.",
              "El cruce sigue funcionando con sol.",
              "Firmamos un contrato corto.",
              "Cubre un cruce de ustedes, instalado y medido.",
              "Ese contrato respalda la inversión del piloto.",
              "La red completa se decide al cierre, con los resultados.",
            ]}
          />
        </section>

        <section
          className="flex min-h-dvh snap-start snap-always flex-col justify-center px-5 py-24 md:px-16"
          data-slide
        >
          <p className="kicker">Por qué vale la conversación</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl leading-[0.95] text-white md:text-6xl">
            El semáforo de siempre deja al alcalde sin una historia que contar.
          </h2>
          <ul className="mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
            {[
              ["La obra se paga una vez.", "El ciclo sigue fijo, igual el lunes que el domingo de mercado."],
              ["Se va la luz.", "El cruce se apaga con ella."],
              ["La moto pesa como un carro.", "En la fila colombiana la moto es la mitad del flujo, o más."],
              ["El técnico se entera tarde.", "El reclamo ya está en redes y el concejo pide explicaciones."],
            ].map(([title, body]) => (
              <li className="bento p-5" key={title}>
                <p className="font-display text-2xl text-white">{title}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="flex min-h-dvh snap-start snap-always flex-col justify-center px-5 py-24 md:px-16"
          data-slide
        >
          <p className="kicker">Lo que el cruce empieza a hacer</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl leading-[0.95] text-white md:text-6xl">
            Decide en el poste. Se opera desde el celular.
          </h2>
          <ul className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {BONDS.map((item) => (
              <li className="bento p-4" key={item.k}>
                <p className="text-sm font-semibold text-[var(--go)]">{item.k}</p>
                <div className="mt-2 space-y-2 text-sm leading-relaxed text-white/70">
                  {item.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="flex min-h-dvh snap-start snap-always flex-col justify-center px-5 py-24 md:px-16"
          data-slide
        >
          <p className="kicker">Números para el despacho</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl leading-[0.95] text-white md:text-5xl">
            Lo que el municipio puede mostrar.
          </h2>
          <Lines
            className="mt-4 max-w-2xl space-y-2 text-base text-white/75"
            items={[
              "El tablero es una sola pantalla.",
              "La alcaldía, el técnico y tránsito ven los mismos números.",
              "Están escritos para un concejo, no para un ingeniero.",
            ]}
          />
          <ul className="mt-6 grid max-w-5xl gap-3 md:grid-cols-2">
            {GAINS.map((item) => (
              <li className="bento p-4" key={item.k}>
                <p className="text-sm font-semibold text-[var(--go)]">{item.k}</p>
                <div className="mt-2 space-y-2 text-sm leading-relaxed text-white/75">
                  {item.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="flex min-h-dvh snap-start snap-always flex-col justify-center px-5 py-24 md:px-16"
          data-slide
        >
          <p className="kicker">Letreros en puntos críticos</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl leading-[0.95] text-white md:text-6xl">
            Un mensaje en la calle. Se escribe desde el celular.
          </h2>
          <Lines
            className="mt-6 max-w-2xl space-y-3 text-lg text-white/75"
            items={[
              "En los sitios críticos va un letrero de texto.",
              "El municipio pone el tablero, el poste y el solar.",
              "SmartTrafic pone el controlador y el módem.",
              "Ese aparato recibe el mensaje y lo deja en la pantalla.",
              "Sirve para una bienvenida, una norma, un desvío o un cierre de vía.",
              "Lo publica la alcaldía, tránsito, o quien el contrato autorice.",
              "Si se cae la señal, queda el último mensaje.",
            ]}
          />
        </section>

        <section
          className="flex min-h-dvh snap-start snap-always flex-col justify-center px-5 py-24 md:px-16"
          data-slide
        >
          <p className="kicker">Cómo se reparte el piloto</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl leading-[0.95] text-white md:text-6xl">
            El acero es del municipio. El cerebro se prueba.
          </h2>
          <div className="mt-8 grid max-w-5xl gap-4 md:grid-cols-2">
            <article className="bento p-6">
              <p className="kicker">Obra del municipio</p>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                <li>Postes, báculos y anclajes.</li>
                <li>Caras LED vehiculares y peatonales.</li>
                <li>Paneles, soportes y gabinete.</li>
                <li>El letrero de texto, con su poste y su solar.</li>
              </ul>
            </article>
            <article className="bento bento-glow-go p-6">
              <p className="kicker">Comodato SmartTrafic</p>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                <li>Cerebro del cruce, sensores y módem.</li>
                <li>Controlador del letrero.</li>
                <li>Firmware, tablero y alertas.</li>
                <li>Acompañamiento del piloto.</li>
              </ul>
            </article>
          </div>
          <Lines
            className="mt-6 max-w-2xl space-y-3 text-base text-white/75"
            items={[
              "El canon de la red se acuerda cuando el piloto tenga resultados.",
              "El alcance lo definen ustedes: un cruce, un corredor o la red.",
              "Si no continúa, retiramos el cerebro y el controlador.",
              "Los postes, las luminarias y el letrero físico se quedan.",
            ]}
          />
        </section>

        <section
          className="flex min-h-dvh snap-start snap-always flex-col justify-center px-5 py-24 md:px-16"
          data-slide
        >
          <p className="kicker">Propuesta de trabajo</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl leading-[0.95] text-white md:text-6xl">
            Cuatro pasos. El contrato cubre el piloto.
          </h2>
          <ol className="mt-8 grid max-w-5xl gap-3 md:grid-cols-2">
            {[
              ["01", "El cruce", ["Recorremos el punto que ustedes elijan."]],
              ["02", "El gemelo", ["Simulamos ese cruce antes de tocar la obra."]],
              ["03", "La calle", ["Instalamos y medimos bajo el contrato corto."]],
              [
                "04",
                "El cierre",
                [
                  "Se amplía, se ajusta o se termina.",
                  "Las tres salidas son válidas.",
                  "La decisión se toma con los números del piloto.",
                ],
              ],
            ].map(([n, title, lines]) => (
              <li className="bento flex gap-4 p-5" key={String(n)}>
                <span className="font-display text-3xl text-[var(--go)]">{n}</span>
                <div>
                  <p className="font-display text-2xl text-white">{title}</p>
                  <div className="mt-2 space-y-2 text-sm leading-relaxed text-white/70">
                    {(lines as string[]).map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <Lines
            className="mt-6 max-w-2xl space-y-2 text-sm text-white/70"
            items={[
              "El letrero entra en el piloto si queda en el mismo alcance.",
              "El tablero de demostración es un laboratorio.",
              "El piloto usa el cruce del municipio, con su tráfico.",
            ]}
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={`mailto:${email}?subject=Piloto%20SmartTrafic`}>Escribir a {email}</Button>
            {wa ? (
              <Button href={wa} variant="ghost">
                WhatsApp
              </Button>
            ) : null}
            <Button href="/demo" variant="ghost">
              Ver la simulación
            </Button>
          </div>
        </section>
      </div>

      <nav className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 px-5 py-4 md:px-10">
        <button
          className="min-h-11 rounded-full border border-white/10 px-4 text-sm text-white/80 hover:bg-white/8"
          onClick={() => go(index - 1)}
          type="button"
        >
          Anterior
        </button>
        <div className="flex gap-2">
          {Array.from({ length: SLIDES }, (_, i) => (
            <button
              aria-label={`Pantalla ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-[var(--go)]" : "w-2.5 bg-white/25"}`}
              key={i}
              onClick={() => go(i)}
              type="button"
            />
          ))}
        </div>
        <button
          className="min-h-11 rounded-full bg-[var(--go)] px-4 text-sm font-semibold text-[#04210f]"
          onClick={() => go(index + 1)}
          type="button"
        >
          Siguiente
        </button>
      </nav>
    </div>
  );
}
