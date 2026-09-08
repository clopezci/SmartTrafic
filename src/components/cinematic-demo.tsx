"use client";

import { useEffect, useRef, useState } from "react";

type Kind = "car" | "moto" | "ambulance" | "truck" | "ped";
type Axis = "ns" | "ew";
type From = "n" | "s" | "e" | "w";
type Light = "green" | "yellow" | "red";

type Vehicle = {
  id: number;
  kind: Kind;
  from: From;
  progress: number;
  lane: number;
  hue: string;
};

type SceneId = "queue" | "ambulance" | "motos" | "night" | "school";

const SCENES: {
  id: SceneId;
  kicker: string;
  title: string;
  blurb: string;
  ms: number;
  night?: boolean;
}[] = [
  {
    id: "queue",
    kicker: "01 · Peso de cola",
    title: "El verde se va con los carros",
    blurb: "Parque Central lleno a 200 m. Circunvalar está casi vacía. El algoritmo corta el tiempo muerto.",
    ms: 14000,
  },
  {
    id: "ambulance",
    kicker: "02 · Emergencia",
    title: "La ambulancia abre su eje",
    blurb: "Sirena a 300 m. El otro eje se cierra. No hace falta transponder de miles de dólares.",
    ms: 12000,
  },
  {
    id: "motos",
    kicker: "03 · Motos primero",
    title: "No las cuenta como autos",
    blurb: "En Colombia las motos son el flujo. El score las pesa aparte y les da arranque.",
    ms: 12000,
  },
  {
    id: "night",
    kicker: "04 · Noche antiatraco",
    title: "No te deja parado a las 11",
    blurb: "La otra calle está vacía. Cambia a verde antes de que el carro frene en un municipio solo.",
    ms: 12000,
    night: true,
  },
  {
    id: "school",
    kicker: "05 · Colegio",
    title: "El peatón no se negocia",
    blurb: "En Ospina el peatón no se negocia: el verde mínimo se respeta aunque el pelotón esté empujando.",
    ms: 13000,
  },
];

const CAR_COLORS = ["#6ee7b7", "#93c5fd", "#fcd34d", "#f9a8d4", "#a5b4fc", "#fdba74", "#86efac"];
let nextId = 1;

function axisOf(from: From): Axis {
  return from === "n" || from === "s" ? "ns" : "ew";
}

function spawn(kind: Kind, from: From, progress: number, lane = 0): Vehicle {
  return {
    id: nextId++,
    kind,
    from,
    progress,
    lane,
    hue:
      kind === "ambulance"
        ? "#f8fafc"
        : kind === "moto"
          ? "#e2e8f0"
          : kind === "truck"
            ? "#64748b"
            : CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
  };
}

function sceneVehicles(id: SceneId): Vehicle[] {
  if (id === "queue") {
    return [
      spawn("car", "n", 0.06),
      spawn("car", "n", 0.14, 1),
      spawn("truck", "n", 0.22),
      spawn("car", "n", 0.3),
      spawn("moto", "n", 0.38, 1),
      spawn("car", "s", 0.1),
      spawn("car", "s", 0.2, 1),
      spawn("moto", "s", 0.28),
      spawn("car", "e", 0.18),
      spawn("moto", "w", 0.22),
    ];
  }
  if (id === "ambulance") {
    return [
      spawn("car", "n", 0.18),
      spawn("car", "s", 0.26),
      spawn("moto", "e", 0.12),
      spawn("ambulance", "w", 0.04),
      spawn("car", "w", 0.16),
      spawn("car", "n", 0.32, 1),
    ];
  }
  if (id === "motos") {
    return [
      spawn("moto", "n", 0.08),
      spawn("moto", "n", 0.14, 1),
      spawn("moto", "n", 0.2),
      spawn("moto", "n", 0.26, 1),
      spawn("moto", "s", 0.1),
      spawn("moto", "s", 0.18, 1),
      spawn("moto", "s", 0.26),
      spawn("car", "e", 0.2),
      spawn("car", "w", 0.28),
    ];
  }
  if (id === "night") {
    return [spawn("car", "n", 0.04), spawn("car", "s", 0.62)];
  }
  return [
    spawn("ped", "e", 0.42),
    spawn("ped", "w", 0.46),
    spawn("ped", "e", 0.5),
    spawn("car", "n", 0.16),
    spawn("car", "s", 0.22),
    spawn("moto", "n", 0.28),
  ];
}

type Phase = { ns: Light; ew: Light };

function lightsFor(id: SceneId, t: number): Phase {
  const yellow = 700;
  const allRed = 400;
  const hold = (greenMs: number, nsFirst: boolean): Phase => {
    const cycle = greenMs * 2 + (yellow + allRed) * 2;
    const x = t % cycle;
    const aGreen = greenMs;
    const aYellow = aGreen + yellow;
    const aClear = aYellow + allRed;
    const bGreen = aClear + greenMs;
    const bYellow = bGreen + yellow;
    if (x < aGreen) return nsFirst ? { ns: "green", ew: "red" } : { ns: "red", ew: "green" };
    if (x < aYellow) return nsFirst ? { ns: "yellow", ew: "red" } : { ns: "red", ew: "yellow" };
    if (x < aClear) return { ns: "red", ew: "red" };
    if (x < bGreen) return nsFirst ? { ns: "red", ew: "green" } : { ns: "green", ew: "red" };
    if (x < bYellow) return nsFirst ? { ns: "red", ew: "yellow" } : { ns: "yellow", ew: "red" };
    return { ns: "red", ew: "red" };
  };

  if (id === "ambulance") return { ns: "red", ew: "green" };
  if (id === "night") return { ns: "green", ew: "red" };
  if (id === "school") return hold(6200, false);
  if (id === "motos") return hold(7000, true);
  return hold(6800, true);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function gapOf(kind: Kind) {
  if (kind === "ped") return 0.04;
  if (kind === "moto") return 0.045;
  if (kind === "truck") return 0.075;
  return 0.06;
}

function speedOf(kind: Kind) {
  if (kind === "ped") return 0.000042;
  if (kind === "ambulance") return 0.00024;
  if (kind === "moto") return 0.00017;
  if (kind === "truck") return 0.0001;
  return 0.00013;
}

function maybeSpawn(id: SceneId, list: Vehicle[], now: number) {
  const tick = Math.floor(now / 900);
  if (tick % 2 !== 0) return list;
  const occupied = (from: From, lane: number) =>
    list.some((v) => v.from === from && v.lane === lane && v.progress < 0.09);

  const add = (kind: Kind, from: From, lane = 0) => {
    if (occupied(from, lane)) return;
    list.push(spawn(kind, from, 0.01, lane));
  };

  if (id === "queue") {
    add("car", "n", tick % 2);
    if (tick % 3 === 0) add("car", "s", 0);
    if (tick % 5 === 0) add("moto", "e", 0);
  } else if (id === "ambulance") {
    if (tick % 4 === 0) add("car", "n", 0);
    if (tick % 5 === 0) add("car", "s", 0);
    if (!list.some((v) => v.kind === "ambulance") && tick % 6 === 0) add("ambulance", "w");
  } else if (id === "motos") {
    add("moto", "n", tick % 2);
    add("moto", "s", (tick + 1) % 2);
    if (tick % 4 === 0) add("car", "e");
  } else if (id === "night") {
    if (list.filter((v) => v.kind !== "ped").length < 2) add("car", "n");
  } else {
    if (list.filter((v) => v.kind === "ped").length < 3) add("ped", tick % 2 ? "e" : "w");
    if (tick % 3 === 0) add("car", "n");
  }
  return list;
}

function stepVehicles(list: Vehicle[], lights: Phase, dt: number) {
  const groups = new Map<string, Vehicle[]>();
  for (const v of list) {
    const key = `${v.from}-${v.kind === "ped" ? "p" : v.lane}`;
    const g = groups.get(key) ?? [];
    g.push(v);
    groups.set(key, g);
  }
  for (const g of groups.values()) {
    g.sort((a, b) => b.progress - a.progress);
    let ahead: Vehicle | null = null;
    for (const v of g) {
      const green = axisOf(v.from) === "ns" ? lights.ns === "green" : lights.ew === "green";
      const stop = v.kind === "ped" ? 0.46 : 0.405;
      const approaching = v.progress < stop - 0.002;
      const mustStop =
        approaching &&
        !green &&
        v.kind !== "ambulance" &&
        (v.kind !== "ped" || lights.ew !== "green");
      let p = v.progress + (mustStop ? 0 : speedOf(v.kind) * dt);
      if (v.kind === "ambulance") p += 0.00003 * dt;
      if (mustStop) p = Math.min(p, stop - 0.004);
      if (ahead) {
        const minGap = gapOf(v.kind);
        p = Math.min(p, ahead.progress - minGap);
      }
      v.progress = p;
      ahead = v;
    }
  }
  return list.filter((v) => v.progress < 1.08);
}

export function CinematicDemo({ compact = false }: { compact?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState(0);
  const [paused, setPaused] = useState(false);
  const sceneRef = useRef(0);
  const pausedRef = useRef(false);
  const vehiclesRef = useRef<Vehicle[]>(sceneVehicles("queue"));
  const startedRef = useRef(0);
  const spawnTickRef = useRef(0);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    startedRef.current = performance.now();
    vehiclesRef.current = sceneVehicles(SCENES[sceneRef.current].id);

    const fit = () => {
      const parent = canvas.parentElement;
      const w = Math.max(parent?.clientWidth ?? 0, canvas.clientWidth, 320);
      const h = Math.max(parent?.clientHeight ?? 0, Math.round(w * (compact ? 0.72 : 0.78)));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const draw = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      const spec = SCENES[sceneRef.current];
      if (!pausedRef.current && now - startedRef.current > spec.ms) {
        const next = (sceneRef.current + 1) % SCENES.length;
        sceneRef.current = next;
        setScene(next);
        vehiclesRef.current = sceneVehicles(SCENES[next].id);
        startedRef.current = now;
        spawnTickRef.current = 0;
      }

      const elapsed = now - startedRef.current;
      if (barRef.current) {
        barRef.current.style.width = `${Math.min(1, elapsed / spec.ms) * 100}%`;
      }

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      const road = Math.min(w, h) * 0.26;
      const night = !!spec.night;
      const lights = lightsFor(spec.id, elapsed);

      if (!pausedRef.current) {
        vehiclesRef.current = stepVehicles(vehiclesRef.current, lights, dt);
        const tick = Math.floor(elapsed / 900);
        if (tick !== spawnTickRef.current) {
          spawnTickRef.current = tick;
          vehiclesRef.current = maybeSpawn(spec.id, vehiclesRef.current, elapsed);
        }
      }

      ctx.fillStyle = night ? "#071018" : "#1a3a28";
      ctx.fillRect(0, 0, w, h);

      const block = (
        x: number,
        y: number,
        bw: number,
        bh: number,
        fill: string,
        windows = true,
      ) => {
        roundRect(ctx, x, y, bw, bh, 6);
        ctx.fillStyle = fill;
        ctx.fill();
        if (!windows) return;
        ctx.fillStyle = night ? "rgba(255, 214, 120, 0.55)" : "rgba(180, 210, 240, 0.25)";
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 2; j++) {
            ctx.fillRect(x + 8 + i * 14, y + 10 + j * 16, 8, 10);
          }
        }
      };
      const pad = 14;
      const bx = cx - road / 2 - pad;
      const by = cy - road / 2 - pad;
      block(pad, pad, bx - pad * 1.4, by - pad * 1.4, night ? "#121820" : "#2c3c48");
      block(cx + road / 2 + pad, pad, bx - pad * 1.4, by - pad * 1.4, night ? "#10161e" : "#334352");
      block(pad, cy + road / 2 + pad, bx - pad * 1.4, by - pad * 1.6, night ? "#141a22" : "#3a4a3c");
      block(cx + road / 2 + pad, cy + road / 2 + pad, bx - pad * 1.4, by - pad * 1.6, night ? "#0f151c" : "#2f3d4a");

      if (spec.id === "school") {
        roundRect(ctx, cx + road / 2 + 22, 18, 54, 28, 6);
        ctx.fillStyle = "#c2410c";
        ctx.fill();
        ctx.fillStyle = "#fff7ed";
        ctx.font = "700 10px system-ui";
        ctx.fillText("COLEGIO", cx + road / 2 + 30, 36);
      }

      ctx.fillStyle = night ? "#1a2230" : "#2a3140";
      ctx.fillRect(cx - road / 2, 0, road, h);
      ctx.fillRect(0, cy - road / 2, w, road);

      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.setLineDash([11, 13]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, 10);
      ctx.lineTo(cx, cy - road / 2);
      ctx.moveTo(cx, cy + road / 2);
      ctx.lineTo(cx, h - 10);
      ctx.moveTo(10, cy);
      ctx.lineTo(cx - road / 2, cy);
      ctx.moveTo(cx + road / 2, cy);
      ctx.lineTo(w - 10, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      const zebra = (vertical: boolean) => {
        ctx.fillStyle = "rgba(255,255,255,0.82)";
        for (let i = 0; i < 9; i++) {
          if (vertical) {
            ctx.fillRect(cx - road / 2 + 6 + i * 10, cy - road / 2 - 12, 6, 12);
            ctx.fillRect(cx - road / 2 + 6 + i * 10, cy + road / 2, 6, 12);
          } else {
            ctx.fillRect(cx - road / 2 - 12, cy - road / 2 + 6 + i * 10, 12, 6);
            ctx.fillRect(cx + road / 2, cy - road / 2 + 6 + i * 10, 12, 6);
          }
        }
      };
      zebra(true);
      zebra(false);

      ctx.fillStyle = night ? "#151c28" : "#1c2433";
      ctx.fillRect(cx - road / 2, cy - road / 2, road, road);

      ctx.fillStyle = night ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.45)";
      ctx.font = "600 10px system-ui";
      ctx.save();
      ctx.translate(18, cy - road / 2 - 8);
      ctx.fillText("CALLE REAL", 0, 0);
      ctx.restore();
      ctx.fillText("PARQUE", cx + road / 2 + 10, 16);

      const solarX = cx - road / 2 - 28;
      const solarY = cy + road / 2 + 22;
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(solarX, solarY, 4, 28);
      ctx.fillStyle = "#0ea5e9";
      roundRect(ctx, solarX - 10, solarY - 8, 24, 14, 2);
      ctx.fill();
      ctx.fillStyle = night ? "#fbbf24" : "#3dff8a";
      ctx.beginPath();
      ctx.arc(solarX + 2, solarY + 28, 3, 0, Math.PI * 2);
      ctx.fill();

      const lamp = (x: number, y: number, color: Light) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = "#334155";
        ctx.fillRect(-2, 8, 4, 18);
        roundRect(ctx, -8, -18, 16, 36, 4);
        ctx.fillStyle = "#0b0d12";
        ctx.fill();
        const colors: Light[] = ["red", "yellow", "green"];
        const on =
          color === "red" ? "#ff4d4d" : color === "yellow" ? "#ffb020" : "#3dff8a";
        colors.forEach((c, i) => {
          ctx.beginPath();
          ctx.arc(0, -9 + i * 9, 3.5, 0, Math.PI * 2);
          const lit = c === color;
          ctx.fillStyle = lit ? on : "#2a2f38";
          ctx.shadowColor = lit ? on : "transparent";
          ctx.shadowBlur = lit ? 14 : 0;
          ctx.fill();
        });
        ctx.restore();
      };
      lamp(cx - road / 2 - 18, cy - road / 2 - 18, lights.ns);
      lamp(cx + road / 2 + 18, cy + road / 2 + 18, lights.ns);
      lamp(cx + road / 2 + 18, cy - road / 2 - 18, lights.ew);
      lamp(cx - road / 2 - 18, cy + road / 2 + 18, lights.ew);

      const pos = (v: Vehicle) => {
        const p = v.progress;
        const lane = (v.lane - 0.5) * 18;
        if (v.from === "n") return { x: cx - 20 + lane, y: p * h, rot: Math.PI };
        if (v.from === "s") return { x: cx + 20 + lane, y: h - p * h, rot: 0 };
        if (v.from === "e") return { x: w - p * w, y: cy - 20 + lane, rot: -Math.PI / 2 };
        return { x: p * w, y: cy + 20 + lane, rot: Math.PI / 2 };
      };

      for (const v of vehiclesRef.current) {
        const { x, y, rot } = pos(v);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        if (v.kind === "ped") {
          ctx.beginPath();
          ctx.arc(0, -3, 4.2, 0, Math.PI * 2);
          ctx.fillStyle = "#fde68a";
          ctx.fill();
          ctx.fillStyle = spec.id === "school" ? "#1d4ed8" : "#334155";
          ctx.fillRect(-3, 2, 6, 8);
        } else if (v.kind === "moto") {
          roundRect(ctx, -5, -12, 10, 24, 3);
          ctx.fillStyle = v.hue;
          ctx.fill();
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(-4, -6, 8, 5);
          ctx.beginPath();
          ctx.arc(0, 10, 3, 0, Math.PI * 2);
          ctx.arc(0, -10, 3, 0, Math.PI * 2);
          ctx.fillStyle = "#111827";
          ctx.fill();
        } else {
          const len = v.kind === "truck" ? 36 : v.kind === "ambulance" ? 32 : 26;
          const wid = 15;
          if (night) {
            ctx.fillStyle = "rgba(255,240,180,0.28)";
            ctx.beginPath();
            ctx.moveTo(-5, -len / 2);
            ctx.lineTo(-18, -len / 2 - 36);
            ctx.lineTo(18, -len / 2 - 36);
            ctx.lineTo(5, -len / 2);
            ctx.fill();
          }
          roundRect(ctx, -wid / 2, -len / 2, wid, len, 4);
          ctx.fillStyle = v.kind === "ambulance" ? "#f8fafc" : v.hue;
          ctx.fill();
          ctx.fillStyle = "rgba(15,23,42,0.4)";
          ctx.fillRect(-wid / 2 + 2, -len / 2 + 4, wid - 4, 8);
          if (v.kind === "ambulance") {
            const blink = Math.sin(now / 80) > 0;
            ctx.fillStyle = blink ? "#ef4444" : "#2563eb";
            ctx.fillRect(-wid / 2, -len / 2, wid, 5);
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(-2, -3, 4, 12);
            ctx.fillRect(-6, 1, 12, 4);
            ctx.strokeStyle = blink ? "rgba(239,68,68,0.55)" : "rgba(37,99,235,0.45)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 18 + (now / 40) % 10, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      if (night) {
        ctx.fillStyle = "rgba(2,8,20,0.22)";
        ctx.fillRect(0, 0, w, h);
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [compact]);

  const spec = SCENES[scene];

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0f16]">
      <div className={`relative w-full ${compact ? "aspect-[5/4]" : "aspect-[4/3]"}`}>
        <canvas className="absolute inset-0 h-full w-full" ref={canvasRef} />
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <p className="kicker text-[var(--go)]">{spec.kicker}</p>
          <p className="font-display text-xl text-white md:text-2xl">{spec.title}</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4">
          <div className="mb-3 flex items-end justify-between gap-3">
            <p className="max-w-md text-sm text-white/75">{spec.blurb}</p>
            <div className="flex items-center gap-2">
              {SCENES.map((s, i) => (
                <button
                  aria-label={s.title}
                  className={`h-1.5 rounded-full transition-all ${
                    i === scene ? "w-8 bg-[var(--go)]" : "w-2 bg-white/25"
                  }`}
                  key={s.id}
                  onClick={() => {
                    setScene(i);
                    sceneRef.current = i;
                    vehiclesRef.current = sceneVehicles(s.id);
                    startedRef.current = performance.now();
                    spawnTickRef.current = 0;
                  }}
                  type="button"
                />
              ))}
            </div>
          </div>
          <div className="h-0.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-0 bg-[var(--go)]" ref={barRef} />
          </div>
        </div>
      </div>
      {!compact ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 px-4 py-3">
          <p className="text-[11px] text-[var(--mute)]">
            Mini-juego en el navegador · rotación automática · no es un video grabado
          </p>
          <button
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-white"
            onClick={() => setPaused((p) => !p)}
            type="button"
          >
            {paused ? "Seguir" : "Pausar"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
