"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pill } from "@/components/ui";
import {
  Columns,
  Donut,
  GroupedBars,
  HBars,
  Heatmap,
  MultiLine,
  Sparkline,
  StackedArea,
} from "@/components/bi-charts";
import {
  alertFeed,
  batteryWeek,
  biKpis,
  heatHours,
  heatRows,
  hourlyFlow,
  insights,
  matrix,
  modalShare,
  modeHours,
  savingsMonth,
  scopeLabel,
  sparks,
  waitByCrossing,
  type BiPeriod,
  type BiScope,
} from "@/lib/bi-demo";

const PERIODS: { id: BiPeriod; label: string }[] = [
  { id: "hoy", label: "Hoy" },
  { id: "7d", label: "7 días" },
  { id: "30d", label: "30 días" },
];

const SCOPES: { id: BiScope; label: string }[] = [
  { id: "villa", label: "Villa Esperanza" },
  { id: "cedro", label: "El Cedro" },
  { id: "red", label: "Toda la red" },
];

export function BiDashboard() {
  const [period, setPeriod] = useState<BiPeriod>("hoy");
  const [scope, setScope] = useState<BiScope>("villa");
  const k = useMemo(() => {
    const base = biKpis[period];
    if (scope === "cedro") {
      return {
        ...base,
        online: period === "hoy" ? "2 / 2" : "1.9 / 2",
        onlineDelta: "ambos ok",
        motos: period === "hoy" ? "186" : period === "7d" ? "1 240" : "4 910",
        alerts: "0",
        alertsDelta: "sin abiertas",
        battery: "79%",
        batteryDelta: "mín. 72%",
        preempt: period === "hoy" ? "1" : period === "7d" ? "4" : "11",
        night: period === "hoy" ? "6" : period === "7d" ? "28" : "91",
        fuel: period === "hoy" ? "2.4 gal" : period === "7d" ? "18 gal" : "71 gal",
        co2: period === "hoy" ? "0.02 t" : period === "7d" ? "0.16 t" : "0.64 t",
      };
    }
    if (scope === "red") {
      return {
        ...base,
        online: "11 / 12",
        onlineDelta: "1 eco",
        motos: period === "hoy" ? "1 086" : period === "7d" ? "8 420" : "34 100",
        alerts: period === "hoy" ? "5" : period === "7d" ? "14" : "29",
        alertsDelta: "2 críticas",
        battery: "61%",
        batteryDelta: "mín. CR-04",
        fuel: period === "hoy" ? "19 gal" : period === "7d" ? "142 gal" : "510 gal",
        co2: period === "hoy" ? "0.18 t" : period === "7d" ? "1.3 t" : "4.6 t",
      };
    }
    return base;
  }, [period, scope]);

  const shownMatrix = scope === "cedro" ? matrix.slice(0, 2) : matrix;
  const shownHeat = scope === "cedro" ? heatRows.slice(0, 2) : heatRows;
  const shownWait = scope === "cedro" ? waitByCrossing.slice(0, 2) : waitByCrossing;

  const ixHref: Record<string, string> = {
    "CR-01": "ix-1",
    "CR-02": "ix-2",
    "CR-03": "ix-3",
    "CR-04": "ix-4",
  };

  const flowSeries = useMemo(
    () => [
      { key: "motos", color: "#2ef28a", values: hourlyFlow.map((h) => h.motos) },
      { key: "autos", color: "#7cb8ff", values: hourlyFlow.map((h) => h.autos) },
      { key: "pesados", color: "#ffbf24", values: hourlyFlow.map((h) => h.pesados) },
    ],
    [],
  );

  const batSeries = useMemo(
    () => [
      { key: "cr01", color: "#2ef28a", values: batteryWeek.map((d) => d.cr01) },
      { key: "cr02", color: "#7cb8ff", values: batteryWeek.map((d) => d.cr02) },
      { key: "cr03", color: "#ffbf24", values: batteryWeek.map((d) => d.cr03) },
      { key: "cr04", color: "#ff3b3b", values: batteryWeek.map((d) => d.cr04) },
    ],
    [],
  );

  const kpis = [
    { label: "En línea", value: k.online, delta: k.onlineDelta, spark: sparks.uptime, color: "var(--go)", glow: false },
    { label: "Uptime", value: k.uptime, delta: k.uptimeDelta, spark: sparks.uptime, color: "var(--go)", glow: false },
    { label: "Espera", value: k.wait, delta: k.waitDelta, spark: sparks.wait, color: "var(--go)", glow: true },
    { label: "Motos", value: k.motos, delta: k.motosDelta, spark: sparks.motos, color: "var(--info)", glow: false },
    { label: "Combustible", value: k.fuel, delta: k.fuelDelta, spark: sparks.fuel, color: "var(--wait)", glow: false },
    { label: "CO₂ evitado", value: k.co2, delta: k.co2Delta, spark: sparks.fuel, color: "var(--go)", glow: false },
    { label: "Alertas", value: k.alerts, delta: k.alertsDelta, spark: sparks.alerts, color: "var(--stop)", glow: true },
    { label: "Batería red", value: k.battery, delta: k.batteryDelta, spark: sparks.bat, color: "var(--wait)", glow: false },
    { label: "Emergencias", value: k.preempt, delta: k.preemptDelta, spark: sparks.alerts, color: "var(--info)", glow: false },
    { label: "Noche segura", value: k.night, delta: k.nightDelta, spark: sparks.motos, color: "var(--go)", glow: false },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">Inteligencia de red</p>
          <h1 className="font-display text-3xl text-white md:text-4xl">Tablero</h1>
          <p className="mt-1 max-w-xl text-xs text-[var(--mute)]">
            Resumen ejecutivo · {scopeLabel[scope]} · datos de demostración hasta que el edge publique telemetría.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="amber">demo</Pill>
          <Link className="text-xs text-[var(--go)] hover:underline" href="/app/en-vivo">
            Gemelos en vivo →
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="bi-slicer">
          {PERIODS.map((p) => (
            <button
              className={period === p.id ? "is-on" : undefined}
              key={p.id}
              onClick={() => setPeriod(p.id)}
              type="button"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="bi-slicer">
          {SCOPES.map((s) => (
            <button
              className={scope === s.id ? "is-on" : undefined}
              key={s.id}
              onClick={() => setScope(s.id)}
              type="button"
            >
              {s.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[10px] uppercase tracking-[0.16em] text-[var(--mute)]">
          actualizado 14:02 · America/Bogotá
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((item) => (
          <article className={`bi-tile ${item.glow ? "bi-tile-hot" : ""}`} key={item.label}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="kicker">{item.label}</p>
                <p className="mt-1 font-display text-2xl leading-none text-white">{item.value}</p>
                <p className="mt-1 text-[10px] text-[var(--mute)]">{item.delta}</p>
              </div>
              <Sparkline color={item.color} data={item.spark} />
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        {insights.map((i) => (
          <p
            className="bi-tile py-2.5 text-[12px] text-white/80"
            key={i.text}
            style={{
              borderColor:
                i.tone === "stop"
                  ? "color-mix(in srgb, var(--stop) 45%, transparent)"
                  : i.tone === "wait"
                    ? "color-mix(in srgb, var(--wait) 40%, transparent)"
                    : "color-mix(in srgb, var(--go) 40%, transparent)",
            }}
          >
            {i.text}
          </p>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.45fr_0.9fr_1fr]">
        <article className="bi-panel">
          <header className="bi-panel-h">
            <div>
              <p className="kicker">Flujo 24 h</p>
              <h2 className="text-sm font-medium text-white">Motos · autos · pesados</h2>
            </div>
            <div className="flex gap-2 text-[10px] text-[var(--mute)]">
              <span className="text-[var(--go)]">● motos</span>
              <span className="text-[var(--info)]">● autos</span>
              <span className="text-[var(--wait)]">● pesados</span>
            </div>
          </header>
          <StackedArea cats={hourlyFlow.map((h) => h.h)} series={flowSeries} />
        </article>
        <article className="bi-panel">
          <header className="bi-panel-h">
            <div>
              <p className="kicker">Mix modal</p>
              <h2 className="text-sm font-medium text-white">Quién usa el cruce</h2>
            </div>
          </header>
          <Donut slices={modalShare} />
        </article>
        <article className="bi-panel">
          <header className="bi-panel-h">
            <div>
              <p className="kicker">Espera por cruce</p>
              <h2 className="text-sm font-medium text-white">Adaptativo vs 45 s</h2>
            </div>
          </header>
          <GroupedBars rows={shownWait} />
        </article>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.15fr_1.2fr_0.9fr]">
        <article className="bi-panel">
          <header className="bi-panel-h">
            <div>
              <p className="kicker">Solar</p>
              <h2 className="text-sm font-medium text-white">Batería 7 días</h2>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[9px] text-[var(--mute)]">
              <span className="text-[var(--go)]">CR-01</span>
              <span className="text-[var(--info)]">CR-02</span>
              <span className="text-[var(--wait)]">CR-03</span>
              <span className="text-[var(--stop)]">CR-04</span>
            </div>
          </header>
          <MultiLine cats={batteryWeek.map((d) => d.d)} series={batSeries} />
        </article>
        <article className="bi-panel">
          <header className="bi-panel-h">
            <div>
              <p className="kicker">Congestión</p>
              <h2 className="text-sm font-medium text-white">Mapa de calor 06–20 h</h2>
            </div>
          </header>
          <Heatmap hours={heatHours} rows={shownHeat} />
        </article>
        <article className="bi-panel">
          <header className="bi-panel-h">
            <div>
              <p className="kicker">Modos</p>
              <h2 className="text-sm font-medium text-white">Horas del día</h2>
            </div>
          </header>
          <HBars rows={modeHours} />
        </article>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.45fr_0.85fr_0.9fr]">
        <article className="bi-panel overflow-x-auto">
          <header className="bi-panel-h">
            <div>
              <p className="kicker">Matriz de cruces</p>
              <h2 className="text-sm font-medium text-white">Salud · espera · motos</h2>
            </div>
          </header>
          <table className="w-full min-w-[520px] text-left text-[12px]">
            <thead className="text-[10px] uppercase tracking-[0.14em] text-[var(--mute)]">
              <tr>
                <th className="pb-2 font-medium">Cruce</th>
                <th className="pb-2 font-medium">Modo</th>
                <th className="pb-2 font-medium">Espera</th>
                <th className="pb-2 font-medium">Salud</th>
                <th className="pb-2 font-medium">Bat.</th>
                <th className="pb-2 font-medium">Motos</th>
                <th className="pb-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {shownMatrix.map((r) => (
                <tr key={r.code}>
                  <td className="py-2">
                    <Link className="text-white hover:text-[var(--go)]" href={`/app/cruces/${ixHref[r.code]}`}>
                      <span className="font-medium">{r.code}</span>
                      <span className="ml-2 text-[var(--mute)]">{r.name}</span>
                    </Link>
                  </td>
                  <td className="py-2 text-white/70">{r.mode}</td>
                  <td className="py-2 text-[var(--go)]">{r.wait}s</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/8">
                        <span
                          className="block h-full rounded-full bg-[var(--go)]"
                          style={{
                            width: `${r.health}%`,
                            background: r.health < 70 ? "var(--wait)" : "var(--go)",
                          }}
                        />
                      </span>
                      {r.health}
                    </div>
                  </td>
                  <td className={`py-2 ${r.bat < 25 ? "text-[var(--stop)]" : "text-white"}`}>{r.bat}%</td>
                  <td className="py-2 text-white">{r.motos}</td>
                  <td className="py-2">
                    <Pill tone={r.status === "ok" ? "green" : "red"}>{r.status}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
        <article className="bi-panel">
          <header className="bi-panel-h">
            <div>
              <p className="kicker">Ahorro estimado</p>
              <h2 className="text-sm font-medium text-white">Millones COP / mes</h2>
            </div>
          </header>
          <Columns rows={savingsMonth} />
        </article>
        <article className="bi-panel">
          <header className="bi-panel-h">
            <div>
              <p className="kicker">Cola de atención</p>
              <h2 className="text-sm font-medium text-white">Alertas y eventos</h2>
            </div>
            <Link className="text-[11px] text-[var(--go)]" href="/app/alertas">
              Ver todas
            </Link>
          </header>
          <ul className="divide-y divide-white/6">
            {alertFeed.map((a) => (
              <li className="flex items-start justify-between gap-2 py-2" key={a.title}>
                <div>
                  <p className="text-[12px] text-white">{a.title}</p>
                  <p className="text-[10px] text-[var(--mute)]">
                    {a.cruce} · {a.sev}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-[var(--mute)]">{a.ago}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
