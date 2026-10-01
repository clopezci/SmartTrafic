"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { BOARD_KINDS, BOARD_TEXT_MAX } from "@/lib/boards";
import { catalogBoardMessages, catalogBoards } from "@/lib/catalog";
import { canManageNetwork, canPublishMessages, isPlatformAdmin } from "@/lib/format";
import { readOverlay, writeOverlay } from "@/lib/ops";
import { dbAudit, dbCreateBoard, dbPublishBoardMessage } from "@/lib/persist";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/site-settings";
import type { BoardKind, BoardMessage, MessageBoard } from "@/lib/types";

function cleanText(raw: FormDataEntryValue | null): string {
  return String(raw || "").replace(/\s+/g, " ").trim().slice(0, BOARD_TEXT_MAX);
}

function asKind(raw: FormDataEntryValue | null): BoardKind {
  const value = String(raw || "info");
  return BOARD_KINDS.some((item) => item.value === value) ? (value as BoardKind) : "info";
}

export async function publishBoardMessage(form: FormData) {
  const user = await getSession();
  if (!canPublishMessages(user) || !user) {
    await setFlash("No tienes permiso para publicar en el letrero.");
    redirect("/app/letreros?ok=err");
  }
  const boardId = String(form.get("boardId") || "");
  const body = cleanText(form.get("body"));
  const kind = asKind(form.get("kind"));
  const until = String(form.get("endsAt") || "");
  if (!boardId || !body) {
    await setFlash("Escribe el mensaje y elige el letrero.");
    redirect("/app/letreros?ok=err");
  }
  const boards = await catalogBoards();
  const board = boards.find((item) => item.id === boardId);
  if (!board) {
    await setFlash("Ese letrero no existe.");
    redirect("/app/letreros?ok=err");
  }
  if (!isPlatformAdmin(user) && user.municipalityId && board.municipalityId !== user.municipalityId) {
    await setFlash("Ese letrero es de otro municipio.");
    redirect("/app/letreros?ok=err");
  }
  const endsAt = until ? new Date(until).toISOString() : null;
  const err = await dbPublishBoardMessage({
    boardId: board.id,
    municipalityId: board.municipalityId,
    kind,
    body,
    authorEmail: user.email,
    endsAt,
  });
  if (err) {
    const overlay = await readOverlay();
    const now = new Date().toISOString();
    const prior = await catalogBoardMessages();
    for (const message of prior) {
      if (message.boardId !== board.id || message.status !== "live") continue;
      if (overlay.boardMessages.some((item) => item.id === message.id)) continue;
      overlay.boardMessages.push({ ...message, status: "ended" });
    }
    overlay.boardMessages = overlay.boardMessages.map((message) =>
      message.boardId === board.id && message.status === "live" ? { ...message, status: "ended" } : message,
    );
    const message: BoardMessage = {
      id: randomUUID(),
      boardId: board.id,
      municipalityId: board.municipalityId,
      kind,
      body,
      authorEmail: user.email,
      status: "live",
      startsAt: now,
      endsAt,
      createdAt: now,
    };
    overlay.boardMessages.unshift(message);
    const next: MessageBoard = { ...board, currentText: body, currentKind: kind };
    const idx = overlay.boards.findIndex((item) => item.id === board.id);
    if (idx >= 0) overlay.boards[idx] = { ...overlay.boards[idx], ...next };
    else overlay.boards.push(next);
    await writeOverlay(overlay);
    await setFlash("Mensaje guardado en este navegador. Con Supabase queda en la base.");
  } else {
    await dbAudit({
      actorEmail: user.email,
      action: "board.publish",
      entity: "message_boards",
      entityId: board.id,
      diff: { kind, body },
    });
    await setFlash("Mensaje publicado en el letrero.");
  }
  redirect("/app/letreros?ok=1");
}

export async function createBoard(form: FormData) {
  const user = await getSession();
  if (!canManageNetwork(user) || !user) {
    await setFlash("Solo la alcaldía puede dar de alta un letrero.");
    redirect("/app/letreros?ok=err");
  }
  const name = String(form.get("name") || "").trim();
  const place = String(form.get("place") || "").trim();
  const code = String(form.get("code") || "")
    .trim()
    .toUpperCase();
  const municipalityId = String(form.get("municipalityId") || user.municipalityId || "");
  if (!name || !code || !municipalityId) {
    await setFlash("Faltan el nombre, el código o el municipio.");
    redirect("/app/letreros?ok=err");
  }
  if (!isPlatformAdmin(user) && user.municipalityId && municipalityId !== user.municipalityId) {
    await setFlash("No puedes crear un letrero en otro municipio.");
    redirect("/app/letreros?ok=err");
  }
  const created = await dbCreateBoard({ municipalityId, code, name, place });
  if ("error" in created) {
    const overlay = await readOverlay();
    overlay.boards.push({
      id: randomUUID(),
      municipalityId,
      code,
      name,
      place,
      solar: true,
      batteryPct: null,
      online: false,
      lastSeenAt: null,
      currentText: "",
      currentKind: null,
    });
    await writeOverlay(overlay);
    await setFlash("Letrero guardado en este navegador. Con Supabase queda en la base.");
  } else {
    await dbAudit({
      actorEmail: user.email,
      action: "board.create",
      entity: "message_boards",
      entityId: created.id,
      diff: { code, name },
    });
    await setFlash("Letrero creado.");
  }
  redirect("/app/letreros?ok=1");
}
