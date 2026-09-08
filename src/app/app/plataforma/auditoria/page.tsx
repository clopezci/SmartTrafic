import { Bento, Kicker } from "@/components/ui";
import { catalogAudit } from "@/lib/catalog";
import { relativeTime } from "@/lib/format";

export default async function AuditoriaPage() {
  const auditEvents = await catalogAudit();
  return (
    <div>
      <Kicker>Append-only</Kicker>
      <h1 className="font-display text-4xl text-white">Auditoría</h1>
      <p className="mt-2 text-sm text-[var(--mute)]">
        Quién tocó qué. En Postgres esta tabla no se actualiza ni se borra.
      </p>
      <Bento className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-[var(--mute)]">
              <tr>
                <th className="pb-3">Cuándo</th>
                <th className="pb-3">Actor</th>
                <th className="pb-3">Acción</th>
                <th className="pb-3">Entidad</th>
                <th className="pb-3">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {auditEvents.map((e) => (
                <tr className="border-t border-white/6" key={e.id}>
                  <td className="py-3 text-[var(--mute)]">{relativeTime(e.createdAt)}</td>
                  <td className="py-3 text-white">{e.actorEmail}</td>
                  <td className="py-3 font-mono text-xs text-[var(--go)]">{e.action}</td>
                  <td className="py-3">{e.entity}</td>
                  <td className="py-3 text-white/60">{e.diff ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Bento>
    </div>
  );
}
