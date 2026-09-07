"use client";

import { useMemo } from "react";
import { Light, Pill } from "@/components/ui";
import { modeLabel } from "@/lib/algorithm";
import type { Intersection } from "@/lib/types";

function Band({
  label,
  n,
  max,
}: {
  label: string;
  n: number;
  max: number;
}) {
  const w = Math.min(100, (n / Math.max(max, 1)) * 100);
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="w-10 text-[var(--mute)]">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-[var(--go)]"
          style={{ width: `${w}%` }}
        />
      </div>
      <span className="w-5 text-right text-white/80">{n}</span>
    </div>
  );
}

export function IntersectionTwin({ ix }: { ix: Intersection }) {
  const max = useMemo(
    () =>
      Math.max(
        1,
        ...ix.live.flatMap((a) => [a.counts.m100, a.counts.m200, a.counts.m300]),
      ),
    [ix],
  );

  const north = ix.live.find((a) => a.headingDeg === 0) ?? ix.live[0];
  const east = ix.live.find((a) => a.headingDeg === 90) ?? ix.live[1];
  const south = ix.live.find((a) => a.headingDeg === 180) ?? ix.live[2];
  const west = ix.live.find((a) => a.headingDeg === 270) ?? ix.live[3];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-[#0c1018]">
        <div className="absolute inset-0 asphalt" />
        <div className="absolute left-1/2 top-0 h-full w-[22%] -translate-x-1/2 bg-[#141a24]" />
        <div className="absolute left-0 top-1/2 h-[22%] w-full -translate-y-1/2 bg-[#141a24]" />
        <div className="absolute left-1/2 top-1/2 h-[22%] w-[22%] -translate-x-1/2 -translate-y-1/2 bg-[#1a2230]" />
        <div className="absolute left-1/2 top-[8%] -translate-x-1/2">
          {north ? (
            <Stack color={north.color} name={north.name} />
          ) : null}
        </div>
        <div className="absolute right-[8%] top-1/2 -translate-y-1/2">
          {east ? <Stack color={east.color} name={east.name} /> : null}
        </div>
        <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2">
          {south ? <Stack color={south.color} name={south.name} /> : null}
        </div>
        <div className="absolute left-[8%] top-1/2 -translate-y-1/2">
          {west ? <Stack color={west.color} name={west.name} /> : null}
        </div>
        <div className="absolute bottom-3 left-3">
          <Pill tone={ix.online ? "green" : "red"}>
            {ix.online ? "En línea" : "Sin nube"}
          </Pill>
        </div>
        <div className="absolute right-3 top-3">
          <Pill tone="amber">{modeLabel(ix.mode)}</Pill>
        </div>
      </div>
      <div className="space-y-3">
        {ix.live.map((a) => (
          <div className="rounded-2xl border border-white/8 bg-white/3 p-3" key={a.id}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Light color={a.color} />
                <p className="text-sm text-white">{a.name}</p>
              </div>
              <span className="text-xs text-[var(--mute)]">score {a.score}</span>
            </div>
            <Band label="100 m" max={max} n={a.counts.m100} />
            <Band label="200 m" max={max} n={a.counts.m200} />
            <Band label="300 m" max={max} n={a.counts.m300} />
            <p className="mt-2 text-[11px] text-[var(--mute)]">
              {a.counts.motos} motos · {a.counts.cars} autos · {a.counts.buses} buses ·{" "}
              {a.counts.trucks} camiones · {a.counts.peds} peatones
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stack({
  color,
  name,
}: {
  color: "red" | "amber" | "green" | "flashing_amber" | "off";
  name: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex flex-col items-center gap-1 rounded-2xl bg-black/70 px-2 py-2">
        <Light color={color === "red" ? "red" : "off"} size={10} />
        <Light color={color === "amber" || color === "flashing_amber" ? color : "off"} size={10} />
        <Light color={color === "green" ? "green" : "off"} size={10} />
      </div>
      <span className="max-w-[90px] text-center text-[10px] text-white/70">{name}</span>
    </div>
  );
}
