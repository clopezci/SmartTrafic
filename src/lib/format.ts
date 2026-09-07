import { SUPERADMIN_EMAIL } from "./types";
import type { Role, SessionUser } from "./types";

export { SUPERADMIN_EMAIL } from "./types";

export function isPlatformAdmin(user: SessionUser | null | undefined): boolean {
  if (!user) return false;
  return (
    user.isPlatformAdmin ||
    user.role === "superadmin" ||
    user.email.toLowerCase() === SUPERADMIN_EMAIL
  );
}

export function canWriteMunicipality(user: SessionUser | null | undefined): boolean {
  if (!user) return false;
  if (isPlatformAdmin(user)) return true;
  return user.role === "municipality_admin" || user.role === "technician";
}

export function roleLabel(role: Role): string {
  const map: Record<Role, string> = {
    superadmin: "Dueño de plataforma",
    platform_ops: "Operación SmartTrafic",
    municipality_admin: "Alcaldía",
    technician: "Técnico",
    viewer: "Visor",
  };
  return map[role];
}

export const cop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} d`;
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
