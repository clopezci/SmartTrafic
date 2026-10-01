import { Bento, Button, Field, Kicker, Pill } from "@/components/ui";
import { BOARD_KINDS, boardKindLabel } from "@/lib/boards";
import { catalogBoardMessages, catalogBoards, catalogMunicipalities } from "@/lib/catalog";
import { canManageNetwork, canPublishMessages, isPlatformAdmin } from "@/lib/format";
import { getSession } from "@/lib/session";
import { consumeFlash } from "@/lib/site-settings";
import { createBoard, publishBoardMessage } from "./actions";

export default async function LetrerosPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const flash = await consumeFlash();
  const user = await getSession();
  const [boards, messages, municipalities] = await Promise.all([
    catalogBoards(),
    catalogBoardMessages(),
    catalogMunicipalities(),
  ]);
  const mine = isPlatformAdmin(user)
    ? boards
    : boards.filter((board) => !user?.municipalityId || board.municipalityId === user.municipalityId);
  const history = messages.filter((message) => mine.some((board) => board.id === message.boardId));
  const canPublish = canPublishMessages(user);
  const canCreate = canManageNetwork(user);

  return (
    <div className="space-y-5">
      <div>
        <Kicker>Mensajes en la calle</Kicker>
        <h1 className="font-display text-4xl text-white">Letreros</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
          El municipio pone el tablero, el poste y el solar.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
          Desde aquí se escribe el texto que el controlador deja en pantalla.
        </p>
      </div>
      {flash ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            ok === "err"
              ? "bg-[rgba(255,77,77,0.12)] text-[var(--stop)]"
              : "border border-[var(--go)]/30 bg-[rgba(46,242,138,0.08)] text-[var(--go)]"
          }`}
        >
          {flash}
        </p>
      ) : null}

      <div className="grid gap-4">
        {mine.map((board) => (
          <Bento key={board.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Kicker>
                  {board.code} · {board.place || "Sin sitio"}
                </Kicker>
                <h2 className="font-display text-3xl text-white">{board.name}</h2>
              </div>
              <Pill tone={board.online ? "green" : "amber"}>{board.online ? "En línea" : "Sin señal"}</Pill>
            </div>
            <p className="mt-4 rounded-2xl border border-amber-300/30 bg-black px-4 py-6 text-center font-mono text-xl leading-snug text-amber-200">
              {board.currentText || "Pantalla en blanco."}
            </p>
            <p className="mt-3 text-xs text-[var(--mute)]">
              {boardKindLabel(board.currentKind)}
              {board.batteryPct != null ? ` · Batería ${board.batteryPct}%` : ""}
              {board.solar ? " · Solar" : ""}
            </p>
          </Bento>
        ))}
      </div>

      {canPublish && mine.length ? (
        <Bento>
          <Kicker>Publicar desde el celular</Kicker>
          <form action={publishBoardMessage} className="mt-4 grid gap-4">
            <Field
              label="Letrero"
              name="boardId"
              defaultValue={mine[0]?.id}
              options={mine.map((board) => ({ value: board.id, label: `${board.code} · ${board.name}` }))}
              required
            />
            <Field
              label="Tipo"
              name="kind"
              defaultValue="info"
              options={BOARD_KINDS.map((item) => ({ value: item.value, label: item.label }))}
            />
            <Field
              label="Mensaje"
              name="body"
              textarea
              required
              hint="Máximo 120 caracteres. Cabe en un letrero de texto."
            />
            <Field label="Quitar el mensaje el" name="endsAt" type="datetime-local" hint="Si lo dejas vacío, se queda hasta el siguiente." />
            <Button type="submit">Publicar</Button>
          </form>
        </Bento>
      ) : null}

      {canCreate ? (
        <Bento>
          <Kicker>Nuevo letrero</Kicker>
          <form action={createBoard} className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Nombre" name="name" required />
            <Field label="Código" name="code" required hint="Ejemplo: TB-02" />
            <Field label="Sitio" name="place" />
            <Field
              label="Municipio"
              name="municipalityId"
              defaultValue={user?.municipalityId || municipalities[0]?.id}
              options={municipalities.map((item) => ({ value: item.id, label: item.name }))}
              required
            />
            <div className="md:col-span-2">
              <Button type="submit">Crear letrero</Button>
            </div>
          </form>
        </Bento>
      ) : null}

      <Bento>
        <Kicker>Quién publicó</Kicker>
        <ul className="mt-4 space-y-3">
          {history.length ? (
            history.map((message) => {
              const board = mine.find((item) => item.id === message.boardId);
              return (
                <li className="border-t border-white/6 pt-3 text-sm" key={message.id}>
                  <p className="text-white">{message.body}</p>
                  <p className="mt-1 text-xs text-[var(--mute)]">
                    {board?.code || "Letrero"} · {boardKindLabel(message.kind)} · {message.authorEmail || "sin autor"} ·{" "}
                    {message.status === "live" ? "en pantalla" : "terminado"}
                  </p>
                </li>
              );
            })
          ) : (
            <li className="text-sm text-[var(--mute)]">Todavía no hay mensajes.</li>
          )}
        </ul>
      </Bento>
    </div>
  );
}
