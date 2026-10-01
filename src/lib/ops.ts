import type { Intersection, Municipality, StoredCommandShape, Technician } from "./types";
import { readSavedValues, savePlatformValues } from "./site-settings";

const KEY = "ops.overlayJson";

export type PlateNote = { id: string; plate: string; code: string; seenAt: string };

export type Overlay = {
  municipalities: Municipality[];
  intersections: Intersection[];
  technicians: Technician[];
  commands: StoredCommandShape[];
  plates: PlateNote[];
};

function empty(): Overlay {
  return { municipalities: [], intersections: [], technicians: [], commands: [], plates: [] };
}

export async function readOverlay(): Promise<Overlay> {
  const saved = await readSavedValues();
  const raw = saved[KEY];
  if (!raw) return empty();
  try {
    const parsed = JSON.parse(raw) as Partial<Overlay>;
    return {
      municipalities: parsed.municipalities ?? [],
      intersections: parsed.intersections ?? [],
      technicians: parsed.technicians ?? [],
      commands: parsed.commands ?? [],
      plates: parsed.plates ?? [],
    };
  } catch {
    return empty();
  }
}

export async function writeOverlay(next: Overlay): Promise<void> {
  await savePlatformValues({ [KEY]: JSON.stringify(next) });
}
