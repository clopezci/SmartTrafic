import { BiDashboard } from "@/components/bi-dashboard";
import { catalogAlerts, catalogIntersections, catalogMunicipalities } from "@/lib/catalog";
import { loadReportKpis } from "@/lib/report";
import { getSession } from "@/lib/session";

export default async function TableroPage() {
  const user = await getSession();
  const [munis, intersections, alerts] = await Promise.all([
    catalogMunicipalities(),
    catalogIntersections(),
    catalogAlerts(),
  ]);
  const mine = user?.municipalityId ? munis.find((m) => m.id === user.municipalityId) : munis[0];
  const report = await loadReportKpis({
    municipalityName: mine?.name || "la red",
    openAlerts: alerts.filter((a) => !a.acknowledged).length,
    intersectionsOnline: intersections.filter((i) => i.online).length,
    intersectionsTotal: intersections.length,
  });
  return <BiDashboard source={report.source} />;
}
