import { cookies } from "next/headers";
import { cache } from "react";
import type { BoardMessage, Intersection, MessageBoard, Municipality, StoredCommandShape, Technician } from "./types";
import { readSavedValues, savePlatformValues } from "./site-settings";

const KEY = "ops.overlayJson";
const BOARDS_COOKIE = "st_boards";

export type PlateNote = { id: string; plate: string; code: string; seenAt: string };

export type Overlay = {
  municipalities: Municipality[];
  intersections: Intersection[];
  technicians: Technician[];
  commands: StoredCommandShape[];
  plates: PlateNote[];
  boards: MessageBoard[];
  boardMessages: BoardMessage[];
};

function empty(): Overlay {
  return {
    municipalities: [],
    intersections: [],
    technicians: [],
    commands: [],
    plates: [],
    boards: [],
    boardMessages: [],
  };
}

function mergeRows<T extends { id: string }>(base: T[], extra: T[]): T[] {
  const byId = new Map(extra.map((row) => [row.id, row]));
  const patched = base.map((row) => (byId.has(row.id) ? { ...row, ...byId.get(row.id) } : row));
  const seen = new Set(patched.map((row) => row.id));
  return [...patched, ...extra.filter((row) => !seen.has(row.id))];
}

async function readBoardCookie(): Promise<{ boards: MessageBoard[]; boardMessages: BoardMessage[] }> {
  const jar = await cookies();
  const raw = jar.get(BOARDS_COOKIE)?.value;
  if (!raw) return { boards: [], boardMessages: [] };
  try {
    const parsed = JSON.parse(raw) as { boards?: MessageBoard[]; boardMessages?: BoardMessage[] };
    return { boards: parsed.boards ?? [], boardMessages: parsed.boardMessages ?? [] };
  } catch {
    return { boards: [], boardMessages: [] };
  }
}

export const readOverlay = cache(async function readOverlay(): Promise<Overlay> {
  const saved = await readSavedValues();
  const raw = saved[KEY];
  let base = empty();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<Overlay>;
      base = {
        municipalities: parsed.municipalities ?? [],
        intersections: parsed.intersections ?? [],
        technicians: parsed.technicians ?? [],
        commands: parsed.commands ?? [],
        plates: parsed.plates ?? [],
        boards: parsed.boards ?? [],
        boardMessages: parsed.boardMessages ?? [],
      };
    } catch {
      base = empty();
    }
  }
  const boards = await readBoardCookie();
  return {
    ...base,
    boards: mergeRows(base.boards, boards.boards),
    boardMessages: mergeRows(base.boardMessages, boards.boardMessages),
  };
});

export async function writeOverlay(next: Overlay): Promise<void> {
  const jar = await cookies();
  jar.set(BOARDS_COOKIE, JSON.stringify({ boards: next.boards, boardMessages: next.boardMessages }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  await savePlatformValues({ [KEY]: JSON.stringify(next) });
}
