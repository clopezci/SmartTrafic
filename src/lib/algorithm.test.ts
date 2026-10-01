import assert from "node:assert/strict";
import test from "node:test";
import { approachScore, emptyCounts, tickPhase } from "./algorithm.ts";
import type { ApproachLive, Counts } from "./types.ts";

function approach(
  id: string,
  heading: number,
  color: ApproachLive["color"],
  elapsed: number,
  counts: Partial<Counts> = {},
): ApproachLive {
  return {
    id,
    name: id,
    headingDeg: heading,
    color,
    greenElapsedS: elapsed,
    pedWaiting: false,
    counts: { ...emptyCounts(), ...counts },
    score: 0,
  };
}

test("ámbar y all-red antes de cambiar de eje", () => {
  let state = [
    approach("n", 0, "green", 60, { m100: 1 }),
    approach("e", 90, "red", 0, { m100: 8, trucks: 2 }),
  ];
  state = tickPhase(state, "normal");
  assert.equal(state[0].color, "amber");
  assert.equal(state[1].color, "red");
  assert.equal(state[0].phase, "yellow");
  state = tickPhase(state, "normal");
  state = tickPhase(state, "normal");
  state = tickPhase(state, "normal");
  assert.equal(state[0].phase, "allred");
  assert.equal(state.every((a) => a.color === "red"), true);
  state = tickPhase(state, "normal");
  assert.equal(state[1].color, "green");
  assert.equal(state[0].color, "red");
});

test("verde contra verde cae a ámbar intermitente", () => {
  const state = tickPhase(
    [approach("n", 0, "green", 1), approach("e", 90, "green", 1)],
    "normal",
  );
  assert.equal(state.every((a) => a.color === "flashing_amber"), true);
});

test("emergencia también despeja", () => {
  const state = tickPhase(
    [
      approach("n", 0, "green", 12, { m100: 3 }),
      approach("e", 90, "red", 0, { emergency: true }),
    ],
    "emergency",
  );
  assert.equal(state[0].color, "amber");
  assert.equal(state[0].pendingAxis, "ew");
});

test("eco acorta el verde máximo", () => {
  const state = tickPhase(
    [
      approach("n", 0, "green", 19, { m100: 1 }),
      approach("e", 90, "red", 0, { m100: 6 }),
    ],
    "eco",
  );
  assert.equal(state[0].phase, "yellow");
});

test("mercado pesa más peatón y espera", () => {
  const counts = { ...emptyCounts(), peds: 4, waitS: 20 };
  assert.ok(approachScore(counts, "market") > approachScore(counts, "normal"));
});
