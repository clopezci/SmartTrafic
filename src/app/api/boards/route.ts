import { NextRequest, NextResponse } from "next/server";
import { catalogBoardMessages, catalogBoards } from "@/lib/catalog";
import { hmacOk } from "@/lib/hmac";
import { readOverlay, writeOverlay } from "@/lib/ops";
import { dbTouchBoard } from "@/lib/persist";
import { allowRequest } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowRequest(`board:${ip}`, 120, 60_000)) {
    return NextResponse.json({ ok: false, error: "demasiadas peticiones" }, { status: 429 });
  }
  const code = req.nextUrl.searchParams.get("code") || "";
  if (!code) return NextResponse.json({ ok: false, error: "code" }, { status: 400 });
  if (!hmacOk(code, req.headers.get("x-smarttrafic-signature"))) {
    return NextResponse.json({ ok: false, error: "firma inválida" }, { status: 401 });
  }
  const boards = await catalogBoards();
  const board = boards.find((item) => item.code.toUpperCase() === code.toUpperCase());
  if (!board) return NextResponse.json({ ok: false, error: "letrero desconocido" }, { status: 404 });

  const batteryRaw = req.nextUrl.searchParams.get("battery");
  const battery = batteryRaw == null || batteryRaw === "" ? null : Number(batteryRaw);
  const touch = await dbTouchBoard(board.code, Number.isFinite(battery) ? battery : null);
  if (touch) {
    const overlay = await readOverlay();
    overlay.boards = overlay.boards.some((item) => item.id === board.id)
      ? overlay.boards.map((item) =>
          item.id === board.id
            ? {
                ...item,
                online: true,
                lastSeenAt: new Date().toISOString(),
                batteryPct: Number.isFinite(battery) ? battery : item.batteryPct,
              }
            : item,
        )
      : [
          ...overlay.boards,
          {
            ...board,
            online: true,
            lastSeenAt: new Date().toISOString(),
            batteryPct: Number.isFinite(battery) ? battery : board.batteryPct,
          },
        ];
    await writeOverlay(overlay);
  }

  const messages = await catalogBoardMessages();
  const live = messages.find((message) => message.boardId === board.id && message.status === "live");
  const expired = Boolean(live?.endsAt && new Date(live.endsAt).getTime() <= Date.now());
  return NextResponse.json({
    ok: true,
    code: board.code,
    kind: expired ? null : live?.kind || board.currentKind,
    text: expired ? "" : live?.body || board.currentText,
    until: expired ? null : live?.endsAt || null,
  });
}
