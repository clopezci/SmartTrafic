import type { BoardKind } from "./types";

export const BOARD_TEXT_MAX = 120;

export const BOARD_KINDS: { value: BoardKind; label: string }[] = [
  { value: "welcome", label: "Bienvenida" },
  { value: "rule", label: "Norma" },
  { value: "info", label: "Aviso" },
  { value: "alert", label: "Urgente" },
];

export function boardKindLabel(kind: BoardKind | null): string {
  return BOARD_KINDS.find((item) => item.value === kind)?.label ?? "Sin mensaje";
}
