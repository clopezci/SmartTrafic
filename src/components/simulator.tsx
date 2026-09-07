"use client";

import { useEffect, useMemo, useState } from "react";
import { IntersectionTwin } from "@/components/intersection-twin";
import { Bento, Button, Kicker, Pill } from "@/components/ui";
import { DEFAULT_TIMING, tickPhase } from "@/lib/algorithm";
import { emptyCounts } from "@/lib/algorithm";
import type { ApproachLive, Intersection, Mode } from "@/lib/types";

const MODES: Mode[] = ["normal", "school", "night", "eco", "emergency"];

function seedApproaches(): ApproachLive[] {
  return [
    {
      id: "a",
      name: "Calle A — entrada",
      headingDeg: 0,
      color: "green",
      greenElapsedS: 0,
      pedWaiting: false,
      counts: { ...emptyCounts(), m100: 6, m200: 3, m300: 1, motos: 8, cars: 4, waitS: 10 },
      score: 0,
    },
    {
      id: "b",
      name: "Calle B — transversal",
      headingDeg: 90,
      color: "red",
      greenElapsedS: 0,
      pedWaiting: false,
      counts: { ...emptyCounts(), m100: 1, peds: 2, waitS: 18, motos: 2 },
      score: 0,
    },
    {
      id: "c",
      name: "Calle A — salida",
      headingDeg: 180,
      color: "green",
      greenElapsedS: 0,
      pedWaiting: false,
      counts: { ...emptyCounts(), m100: 4, m200: 2, motos: 5, cars: 3 },
      score: 0,
    },
    {
      id: "d",
      name: "Calle B — opuesta",
      headingDeg: 270,
      color: "red",
      greenElapsedS: 0,
      pedWaiting: false,
      counts: { ...emptyCounts(), waitS: 6 },
      score: 0,
    },
  ];
}

export function Simulator() {
  const [mode, setMode] = useState<Mode>("normal");
  const [running, setRunning] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const [approaches, setApproaches] = useState<ApproachLive[]>(seedApproaches);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setApproaches((prev) => {
        const next = tickPhase(prev, mode, DEFAULT_TIMING);
        const g = next.filter((a) => a.color === "green").map((a) => a.name);
        const f = next.some((a) => a.color === "flashing_amber");
        setLog((l) =>
          [
            f
              ? "FAIL-SAFE: conflicto evitado → ámbar intermitente"
              : `Verde: ${g.join(" + ") || "ninguno"}`,
            ...l,
          ].slice(0, 8),
        );
        return next;
      });
    }, 900);
    return () => clearInterval(t);
  }, [mode, running]);

  const ix: Intersection = useMemo(
    () => ({
      id: "sim",
      municipalityId: "demo",
      code: "LAB-01",
      name: "Laboratorio de escritorio",
      geometry: "plus",
      lat: 0,
      lng: 0,
      approaches: 4,
      plan: "premium",
      mode,
      online: true,
      healthScore: 100,
      solar: true,
      batteryPct: 92,
      firmwareVersion: "sim-1.0",
      lastHeartbeatAt: new Date().toISOString(),
      live: approaches,
    }),
    [approaches, mode],
  );

  function patch(id: string, key: "m100" | "m200" | "m300" | "peds" | "motos", value: number) {
    setApproaches((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, counts: { ...a.counts, [key]: value } } : a,
      ),
    );
  }

  function siren(id: string) {
    setApproaches((prev) =>
      prev.map((a) => ({
        ...a,
        counts: { ...a.counts, emergency: a.id === id },
      })),
    );
    setMode("emergency");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <Bento glow="green">
        <Kicker>Gemelo digital</Kicker>
        <h2 className="mt-1 font-display text-2xl text-white">El algoritmo decide aquí</h2>
        <p className="mb-5 mt-1 text-sm text-[var(--mute)]">
          Mueve las colas. El verde sigue al pelotón, corta si la calle se vacía y nunca se pelea con el otro verde.
        </p>
        <IntersectionTwin ix={ix} />
      </Bento>
      <div className="space-y-5">
        <Bento>
          <Kicker>Modo</Kicker>
          <div className="mt-3 flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                className="rounded-full"
                key={m}
                onClick={() => {
                  setMode(m);
                  if (m !== "emergency") {
                    setApproaches((prev) =>
                      prev.map((a) => ({ ...a, counts: { ...a.counts, emergency: false } })),
                    );
                  }
                }}
                type="button"
              >
                <Pill tone={mode === m ? "green" : "neutral"}>{m}</Pill>
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="ghost" className="!px-4 !py-2 text-xs" href={undefined}>
              <span
                onClick={() => setRunning((v) => !v)}
                onKeyDown={() => setRunning((v) => !v)}
                role="button"
                tabIndex={0}
              >
                {running ? "Pausar" : "Correr"}
              </span>
            </Button>
            <button
              className="rounded-full border border-white/10 px-4 py-2 text-xs text-white"
              onClick={() => siren("a")}
              type="button"
            >
              Sirena en Calle A
            </button>
          </div>
        </Bento>
        <Bento>
          <Kicker>Colas configurables</Kicker>
          <div className="mt-4 space-y-4">
            {approaches
              .filter((a) => a.id === "a" || a.id === "b")
              .map((a) => (
                <div key={a.id}>
                  <p className="mb-2 text-sm text-white">{a.name}</p>
                  {(
                    [
                      ["m100", "100 m"],
                      ["m200", "200 m"],
                      ["m300", "300 m"],
                      ["motos", "Motos"],
                      ["peds", "Peatones"],
                    ] as const
                  ).map(([key, label]) => (
                    <label className="mb-1 flex items-center gap-3 text-xs text-[var(--mute)]" key={key}>
                      <span className="w-20">{label}</span>
                      <input
                        className="flex-1 accent-[var(--go)]"
                        max={20}
                        min={0}
                        onChange={(e) => patch(a.id, key, Number(e.target.value))}
                        type="range"
                        value={a.counts[key]}
                      />
                      <span className="w-6 text-white">{a.counts[key]}</span>
                    </label>
                  ))}
                  <button
                    className="mt-1 text-[11px] text-[var(--info)]"
                    onClick={() =>
                      setApproaches((prev) =>
                        prev.map((x) =>
                          x.id === a.id ? { ...x, pedWaiting: !x.pedWaiting } : x,
                        ),
                      )
                    }
                    type="button"
                  >
                    {a.pedWaiting ? "Quitar botón peatonal" : "Pedir cruce peatonal"}
                  </button>
                </div>
              ))}
          </div>
        </Bento>
        <Bento>
          <Kicker>Bitácora</Kicker>
          <ul className="mt-3 space-y-1 font-mono text-[11px] text-white/70">
            {log.map((line, i) => (
              <li key={`${line}-${i}`}>{line}</li>
            ))}
          </ul>
        </Bento>
      </div>
    </div>
  );
}
