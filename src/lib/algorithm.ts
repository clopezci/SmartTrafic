import type { ApproachLive, Counts, LightColor, Mode, TimingProfile } from "./types";

export const DEFAULT_TIMING: TimingProfile = {
  minGreenS: 8,
  maxGreenS: 60,
  yellowS: 3,
  allRedS: 1,
  minPedS: 12,
  extensionS: 3,
};

type Axis = "ns" | "ew";

export function emptyCounts(): Counts {
  return {
    m100: 0,
    m200: 0,
    m300: 0,
    waitS: 0,
    motos: 0,
    cars: 0,
    buses: 0,
    trucks: 0,
    peds: 0,
    emergency: false,
  };
}

export function approachScore(c: Counts, mode: Mode): number {
  let score =
    c.m100 * 1.0 +
    c.m200 * 1.6 +
    c.m300 * 2.4 +
    c.waitS * 0.08 +
    c.motos * 0.45 +
    c.buses * 2.2 +
    c.trucks * 2.8 +
    c.peds * 1.8;
  if (mode === "school") score += c.peds * 2.5;
  if (mode === "market") score += c.peds * 1.4 + c.waitS * 0.12 + c.buses * 0.6;
  if (mode === "night" && c.m100 + c.m200 + c.m300 === 0) score *= 0.2;
  if (mode === "eco" && !c.emergency) score *= 0.85;
  if (c.emergency) score += 10_000;
  return Number(score.toFixed(1));
}

export function effectiveTiming(mode: Mode, timing: TimingProfile): TimingProfile {
  if (mode !== "eco") return timing;
  return {
    ...timing,
    maxGreenS: Math.min(timing.maxGreenS, 20),
    extensionS: 0,
  };
}

function axisOf(heading: number): Axis {
  const d = ((heading % 360) + 360) % 360;
  return d === 90 || d === 270 ? "ew" : "ns";
}

function scored(approaches: ApproachLive[], mode: Mode): ApproachLive[] {
  return approaches.map((a) => ({
    ...a,
    score: approachScore(a.counts, mode),
  }));
}

function assertNoConflict(approaches: ApproachLive[]): ApproachLive[] {
  const greens = approaches.filter((a) => a.color === "green");
  const axes = new Set(greens.map((g) => axisOf(g.headingDeg)));
  if (axes.size > 1) {
    return approaches.map((a) => ({
      ...a,
      color: "flashing_amber" as LightColor,
      phase: "service",
      phaseElapsedS: 0,
      pendingAxis: undefined,
    }));
  }
  return approaches;
}

function setAxisGreen(approaches: ApproachLive[], axis: Axis): ApproachLive[] {
  return approaches.map((a) => ({
    ...a,
    color: (axisOf(a.headingDeg) === axis ? "green" : "red") as LightColor,
    greenElapsedS: axisOf(a.headingDeg) === axis ? a.greenElapsedS : 0,
    phase: "service",
    phaseElapsedS: 0,
    servingAxis: axis,
    pendingAxis: undefined,
  }));
}

function beginYellow(approaches: ApproachLive[], serving: Axis, pending: Axis): ApproachLive[] {
  return approaches.map((a) => ({
    ...a,
    color: (axisOf(a.headingDeg) === serving ? "amber" : "red") as LightColor,
    phase: "yellow",
    phaseElapsedS: 0,
    servingAxis: serving,
    pendingAxis: pending,
  }));
}

function holdClearance(
  approaches: ApproachLive[],
  phase: "yellow" | "allred",
  elapsed: number,
  serving: Axis,
  pending: Axis,
): ApproachLive[] {
  return approaches.map((a) => ({
    ...a,
    color: (phase === "yellow" && axisOf(a.headingDeg) === serving ? "amber" : "red") as LightColor,
    phase,
    phaseElapsedS: elapsed,
    servingAxis: serving,
    pendingAxis: pending,
  }));
}

export function tickPhase(
  approaches: ApproachLive[],
  mode: Mode,
  timingIn: TimingProfile = DEFAULT_TIMING,
): ApproachLive[] {
  const timing = effectiveTiming(mode, timingIn);
  const state = scored(approaches, mode);

  if (mode === "failsafe") {
    return state.map((a) => ({
      ...a,
      color: "flashing_amber" as LightColor,
      phase: "service",
      phaseElapsedS: 0,
    }));
  }

  const phase = state[0]?.phase ?? "service";
  const elapsedPhase = (state[0]?.phaseElapsedS ?? 0) + 1;
  const serving = state[0]?.servingAxis;
  const pending = state[0]?.pendingAxis;

  if (phase === "yellow" && serving && pending) {
    if (elapsedPhase >= timing.yellowS) {
      return holdClearance(state, "allred", 0, serving, pending);
    }
    return holdClearance(state, "yellow", elapsedPhase, serving, pending);
  }

  if (phase === "allred" && pending) {
    if (elapsedPhase >= timing.allRedS) {
      return assertNoConflict(
        setAxisGreen(
          state.map((a) => ({ ...a, greenElapsedS: 0 })),
          pending,
        ),
      );
    }
    return holdClearance(state, "allred", elapsedPhase, serving ?? pending, pending);
  }

  const emergency = state.find((a) => a.counts.emergency);
  const greens = state.filter((a) => a.color === "green");
  const currentAxis: Axis =
    greens.length > 0 ? axisOf(greens[0].headingDeg) : (serving ?? "ns");

  if (emergency) {
    const target = axisOf(emergency.headingDeg);
    if (greens.length > 0 && currentAxis !== target) {
      return beginYellow(state, currentAxis, target);
    }
    if (greens.length === 0) {
      return assertNoConflict(setAxisGreen(state.map((a) => ({ ...a, greenElapsedS: 0 })), target));
    }
  }

  if (greens.length === 0) {
    const winner = [...state].sort((a, b) => b.score - a.score)[0];
    return assertNoConflict(
      setAxisGreen(
        state.map((a) => ({ ...a, greenElapsedS: 0 })),
        axisOf(winner.headingDeg),
      ),
    );
  }

  const group = state.filter((a) => axisOf(a.headingDeg) === currentAxis);
  const otherGroup = state.filter((a) => axisOf(a.headingDeg) !== currentAxis);
  const groupScore = group.reduce((s, a) => s + a.score, 0);
  const otherScore = otherGroup.reduce((s, a) => s + a.score, 0);
  const elapsed = Math.max(...group.map((a) => a.greenElapsedS)) + 1;
  const empty = group.every((a) => a.counts.m100 + a.counts.m200 + a.counts.m300 === 0);
  const servedMin = elapsed >= timing.minGreenS;
  const hitMax = elapsed >= timing.maxGreenS;
  const pedHold = group.some((a) => a.pedWaiting) && elapsed < timing.minPedS;
  const incoming = group.some((a) => a.counts.m200 > 0 || a.counts.m300 > 0);
  const shouldCut = servedMin && empty && otherScore > 2;
  const nextAxis: Axis = currentAxis === "ns" ? "ew" : "ns";

  if (pedHold) {
    return assertNoConflict(
      state.map((a) =>
        axisOf(a.headingDeg) === currentAxis
          ? { ...a, greenElapsedS: elapsed, phase: "service", servingAxis: currentAxis }
          : { ...a, phase: "service", servingAxis: currentAxis },
      ),
    );
  }

  if (shouldCut || (hitMax && otherScore >= groupScore)) {
    return beginYellow(state, currentAxis, nextAxis);
  }

  return assertNoConflict(
    state.map((a) =>
      axisOf(a.headingDeg) === currentAxis
        ? {
            ...a,
            greenElapsedS: incoming && !empty ? elapsed + timing.extensionS : elapsed,
            phase: "service",
            servingAxis: currentAxis,
          }
        : { ...a, phase: "service", servingAxis: currentAxis },
    ),
  );
}

export function modeLabel(mode: Mode): string {
  const map: Record<Mode, string> = {
    normal: "Adaptativo",
    school: "Colegio",
    market: "Mercado",
    night: "Noche segura",
    eco: "Eco solar",
    emergency: "Emergencia",
    failsafe: "Ámbar seguro",
  };
  return map[mode];
}
