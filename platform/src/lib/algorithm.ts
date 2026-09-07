import type { ApproachLive, Counts, LightColor, Mode, TimingProfile } from "./types";

export const DEFAULT_TIMING: TimingProfile = {
  minGreenS: 8,
  maxGreenS: 60,
  yellowS: 3,
  allRedS: 1,
  minPedS: 12,
  extensionS: 3,
};

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
  if (mode === "night" && c.m100 + c.m200 + c.m300 === 0) score *= 0.2;
  if (c.emergency) score += 10_000;
  return Number(score.toFixed(1));
}

function axisOf(heading: number): "ns" | "ew" {
  const d = ((heading % 360) + 360) % 360;
  return d === 90 || d === 270 ? "ew" : "ns";
}

function assertNoConflict(approaches: ApproachLive[]): ApproachLive[] {
  const greens = approaches.filter((a) => a.color === "green");
  const axes = new Set(greens.map((g) => axisOf(g.headingDeg)));
  if (axes.size > 1) {
    return approaches.map((a) => ({ ...a, color: "flashing_amber" as LightColor }));
  }
  return approaches;
}

function setAxisGreen(approaches: ApproachLive[], axis: "ns" | "ew"): ApproachLive[] {
  return approaches.map((a) => ({
    ...a,
    color: (axisOf(a.headingDeg) === axis ? "green" : "red") as LightColor,
    greenElapsedS: axisOf(a.headingDeg) === axis ? a.greenElapsedS : 0,
  }));
}

export function tickPhase(
  approaches: ApproachLive[],
  mode: Mode,
  timing: TimingProfile = DEFAULT_TIMING,
): ApproachLive[] {
  const scored = approaches.map((a) => ({
    ...a,
    score: approachScore(a.counts, mode),
  }));

  if (mode === "failsafe") {
    return scored.map((a) => ({ ...a, color: "flashing_amber" as LightColor }));
  }

  const emergency = scored.find((a) => a.counts.emergency);
  if (emergency) {
    return assertNoConflict(setAxisGreen(scored, axisOf(emergency.headingDeg)));
  }

  const greens = scored.filter((a) => a.color === "green");
  const currentAxis: "ns" | "ew" =
    greens.length > 0 ? axisOf(greens[0].headingDeg) : "ns";

  if (greens.length === 0) {
    const winner = [...scored].sort((a, b) => b.score - a.score)[0];
    return assertNoConflict(
      setAxisGreen(
        scored.map((a) => ({ ...a, greenElapsedS: 0 })),
        axisOf(winner.headingDeg),
      ),
    );
  }

  const group = scored.filter((a) => axisOf(a.headingDeg) === currentAxis);
  const otherGroup = scored.filter((a) => axisOf(a.headingDeg) !== currentAxis);
  const groupScore = group.reduce((s, a) => s + a.score, 0);
  const otherScore = otherGroup.reduce((s, a) => s + a.score, 0);
  const elapsed = Math.max(...group.map((a) => a.greenElapsedS)) + 1;
  const empty = group.every(
    (a) => a.counts.m100 + a.counts.m200 + a.counts.m300 === 0,
  );
  const servedMin = elapsed >= timing.minGreenS;
  const hitMax = elapsed >= timing.maxGreenS;
  const pedHold = group.some((a) => a.pedWaiting) && elapsed < timing.minPedS;
  const incoming = group.some((a) => a.counts.m200 > 0 || a.counts.m300 > 0);
  const shouldCut = servedMin && empty && otherScore > 2;

  if (pedHold) {
    return assertNoConflict(
      scored.map((a) =>
        axisOf(a.headingDeg) === currentAxis ? { ...a, greenElapsedS: elapsed } : a,
      ),
    );
  }

  if (shouldCut || (hitMax && otherScore >= groupScore)) {
    const nextAxis = currentAxis === "ns" ? "ew" : "ns";
    return assertNoConflict(
      setAxisGreen(
        scored.map((a) => ({ ...a, greenElapsedS: 0 })),
        nextAxis,
      ),
    );
  }

  return assertNoConflict(
    scored.map((a) =>
      axisOf(a.headingDeg) === currentAxis
        ? {
            ...a,
            greenElapsedS: incoming && !empty ? elapsed + timing.extensionS : elapsed,
          }
        : a,
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
