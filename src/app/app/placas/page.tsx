import { Bento, Kicker, Pill } from "@/components/ui";
import { dbListPlates } from "@/lib/persist";
import { readSavedValues } from "@/lib/site-settings";
import { relativeTime } from "@/lib/format";

export default async function PlacasPage() {
  const settings = await readSavedValues();
  const legal = settings["feature.platesLegal"] === "true";
  const listed = legal ? await dbListPlates() : [];
  const rows = Array.isArray(listed) ? listed : [];
  return (
    <div className="space-y-5">
      <div>
        <Kicker>Módulo condicionado</Kicker>
        <h1 className="font-display text-4xl text-white">Placas</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--mute)]">
          La cámara cuenta clases. No guarda placas hasta que el municipio deje constancia legal y el dueño ponga el interruptor en Admin.
        </p>
      </div>
      <Bento glow={legal ? "green" : "amber"}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <Kicker>Base legal</Kicker>
            <p className="mt-2 text-sm text-white/75">
              {legal
                ? "El interruptor está activo. La ingesta acepta placas y las lista aquí."
                : "Apagado. /api/ingest descarta cualquier placa que mande el edge."}
            </p>
          </div>
          <Pill tone={legal ? "green" : "amber"}>{legal ? "activo" : "bloqueado"}</Pill>
        </div>
      </Bento>
      {legal ? (
        <Bento>
          <Kicker>Lecturas</Kicker>
          {rows.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--mute)]">
              {Array.isArray(listed) ? "Aún no hay lecturas." : "Falta la tabla plate_events. Corre supabase/migrate_v3.sql."}
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {rows.map((row) => (
                <li className="flex items-center justify-between text-sm" key={row.id}>
                  <span className="font-mono text-white">{row.plate}</span>
                  <span className="text-xs text-[var(--mute)]">{relativeTime(row.seenAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Bento>
      ) : null}
    </div>
  );
}
