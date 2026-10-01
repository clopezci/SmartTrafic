import type { PlanTier } from "./types";

const RANK: Record<PlanTier, number> = {
  esencial: 1,
  adaptativo: 2,
  premium: 3,
};

export type PlanFeature = "dashboard" | "alerts" | "night" | "queues" | "reports" | "ambulance" | "floor" | "audio";

const NEED: Record<PlanFeature, number> = {
  dashboard: 1,
  alerts: 1,
  night: 1,
  queues: 2,
  reports: 2,
  ambulance: 3,
  floor: 3,
  audio: 3,
};

export function planAllows(plan: PlanTier, feature: PlanFeature): boolean {
  return RANK[plan] >= NEED[feature];
}

export function feeForPlan(plan: PlanTier): number {
  if (plan === "esencial") return 1_500_000;
  if (plan === "premium") return 3_150_000;
  return 2_250_000;
}
