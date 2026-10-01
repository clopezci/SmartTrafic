"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/signal";
import { Button } from "@/components/ui";

const BONDS = [
  { k: "Cola", v: "Verde al pelotón que está a 100, 200 y 300 metros. Si la calle se vacía, el verde se corta." },
  { k: "Motos primero", v: "Moto, carro, bus, camión y peatón no pesan igual. El cruce colombiano deja de medirse como si fuera una avenida europea." },
  { k: "Solar de verdad", v: "Si la batería baja, el cruce no se apaga: degrada lo auxiliar y sigue decidiendo en el poste." },
  { k: "Modos de pueblo", v: "Colegio, mercado, noche y emergencia. Cada uno cambia la prioridad sin que un ingeniero reprograme el gabinete." },
  { k: "Seguridad de fases", v: "Nunca verde contra verde. Ante la duda, ámbar intermitente. El despeje ámbar y all-red no se negocia." },
  { k: "Técnico con el pulgar", v: "Alerta, checklist y estado del cruce en el celular. Sin consola de tráfico ni cinco claves." },
  { k: "Gemelo antes de la obra", v: "El concejo ve el cruce decidir con conteos de ese punto, antes de romper una losa." },
  { k: "Números para el despacho", v: "Espera contra un ciclo fijo, gasolina que no se quemó en ralentí, CO₂ y camiones de tres ejes. Lenguaje de alcaldía, no de ingeniería." },
];

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
          {String(index + 1).padStart(2, "0")} / 05
        </p>
      </header>

      <div ref={scroller} className="h-dvh snap-y snap-mandatory overflow-y-auto scroll-smooth">
        <section
          className="flex min-h-dvh snap-start snap-always flex-col justify-end px-5 pb-28 pt-24 md:px-16 md:pb-32"
          data-slide
        >
          <p className="kicker">Piloto · punto de partida</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.92] text-white md:text-7xl">
            El municipio no necesita romper las calles.
            <span className="mt-2 block text-[var(--go)]">Las miramos juntos.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/70">
            SmartTrafic es semaforización solar y adaptativa. Esta sala no cierra un contrato.
            Abre un piloto: un cruce de ustedes, medido de verdad, para decidir después si la red crece.
          </p>
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
              ["La obra se paga una vez", "y el ciclo sigue fijo, igual de ciego el lunes que el domingo de mercado."],
              ["Se va la luz", "y el cruce se apaga con ella. En un municipio solar, eso es el miedo del alcalde."],
              ["La moto pesa como un carro", "y en la fila colombiana la moto es la mitad del flujo, o más."],
              ["El técnico se entera tarde", "cuando el reclamo ya está en redes y el concejo pide explicaciones."],
            ].map(([title, body]) => (
              <li className="bento p-5" key={title}>
                <p className="font-display text-2xl text-white">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{body}</p>
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
                <p className="mt-2 text-sm leading-relaxed text-white/70">{item.v}</p>
              </li>
            ))}
          </ul>
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
              <ul className="mt-4 space-y-2 text-sm text-white/75">
                <li>Postes, báculos y anclajes</li>
                <li>Caras LED vehiculares y peatonales</li>
                <li>Paneles, soportes y gabinete</li>
              </ul>
            </article>
            <article className="bento bento-glow-go p-6">
              <p className="kicker">Comodato SmartTrafic</p>
              <ul className="mt-4 space-y-2 text-sm text-white/75">
                <li>Cerebro del cruce, sensores y módem</li>
                <li>Firmware, tablero y alertas</li>
                <li>Acompañamiento del piloto</li>
              </ul>
            </article>
          </div>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70">
            El canon mensual se acuerda cuando el piloto tenga resultados, con el alcance que ustedes quieran:
            un cruce, un corredor o la red. Si no continúa, retiramos el cerebro. Los postes se quedan.
          </p>
        </section>

        <section
          className="flex min-h-dvh snap-start snap-always flex-col justify-center px-5 py-24 md:px-16"
          data-slide
        >
          <p className="kicker">Propuesta de trabajo</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl leading-[0.95] text-white md:text-6xl">
            Cuatro pasos. La decisión queda al final.
          </h2>
          <ol className="mt-8 grid max-w-5xl gap-3 md:grid-cols-2">
            {[
              ["01", "El cruce", "Recorremos el punto que la alcaldía elija. Ustedes conocen la fila; nosotros llevamos el método."],
              ["02", "El gemelo", "Simulamos ese cruce con conteos reales o del laboratorio, antes de tocar la obra."],
              ["03", "La calle", "El piloto queda operando. Alcaldía, técnico y tránsito miran el mismo tablero."],
              ["04", "El cierre", "Crecer, ajustar o parar. Las tres salidas son válidas. El piloto existe para poder elegirlas con datos."],
            ].map(([n, title, body]) => (
              <li className="bento flex gap-4 p-5" key={n}>
                <span className="font-display text-3xl text-[var(--go)]">{n}</span>
                <div>
                  <p className="font-display text-2xl text-white">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">{body}</p>
                </div>
              </li>
            ))}
          </ol>
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
          <p className="mt-4 max-w-xl text-xs text-[var(--mute)]">
            El tablero de demostración es un laboratorio. El piloto usa el cruce del municipio, con su tráfico.
          </p>
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
          {Array.from({ length: 5 }, (_, i) => (
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
