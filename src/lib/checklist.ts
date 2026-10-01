import type { CheckItem } from "./types";

export const CHECKLIST: CheckItem[] = [
  { id: "gabinete", label: "Gabinete cerrado y seco", done: false },
  { id: "bateria", label: "Batería medida", done: false },
  { id: "peaton", label: "Botón peatonal responde", done: false },
  { id: "ambar", label: "Ámbar de conflicto probado", done: false },
  { id: "foto", label: "Foto del cruce tomada", done: false },
];

export function freshChecklist(code: string): { code: string; items: CheckItem[] } {
  return { code, items: CHECKLIST.map((item) => ({ ...item })) };
}
