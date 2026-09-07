import type { ReactNode } from "react";
import {
  Activity,
  Bell,
  Building2,
  Cpu,
  Gauge,
  LayoutGrid,
  LogOut,
  Map,
  Settings2,
  Shield,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { isPlatformAdmin, roleLabel } from "@/lib/format";
import type { SessionUser } from "@/lib/types";

const NAV = [
  { href: "/app/tablero", label: "Tablero", icon: LayoutGrid },
  { href: "/app/cruces", label: "Cruces", icon: Map },
  { href: "/app/alertas", label: "Alertas", icon: Bell },
  { href: "/app/tecnicos", label: "Técnicos", icon: Wrench },
  { href: "/app/alcaldias", label: "Alcaldías", icon: Building2 },
  { href: "/app/activos", label: "Activos", icon: Cpu },
  { href: "/app/simulador", label: "Simulador", icon: Gauge },
  { href: "/app/reportes", label: "Reportes", icon: Activity },
  { href: "/app/configuracion", label: "Variables", icon: Settings2 },
];

const PLATFORM = [
  { href: "/app/plataforma/salud", label: "Salud del sistema", icon: Shield },
  { href: "/app/plataforma/auditoria", label: "Auditoría", icon: Users },
  { href: "/app/plataforma/variables", label: "Variables globales", icon: Settings2 },
];

export function Shell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const admin = isPlatformAdmin(user);
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-white/8 bg-[#080b11]/90 px-4 py-5 backdrop-blur lg:border-b-0 lg:border-r">
        <Link className="flex items-center gap-2 px-2" href="/app/tablero">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--go)] text-[11px] font-black text-[#04210f]">
            ST
          </span>
          <span>
            <span className="block font-display text-lg leading-none text-white">
              SmartTrafic
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--mute)]">
              fase 1
            </span>
          </span>
        </Link>
        <nav className="mt-8 flex gap-1 overflow-x-auto lg:flex-col">
          {NAV.map((item) => (
            <Link className="nav-link" href={item.href} key={item.href}>
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
        {admin ? (
          <div className="mt-8 hidden lg:block">
            <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--go)]">
              Solo dueño
            </p>
            {PLATFORM.map((item) => (
              <Link className="nav-link" href={item.href} key={item.href}>
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
        <form action="/api/auth/logout" className="mt-8 px-2" method="post">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
            <p className="text-sm font-medium text-white">{user.fullName}</p>
            <p className="text-[11px] text-[var(--mute)]">{roleLabel(user.role)}</p>
            <button className="mt-3 flex items-center gap-2 text-xs text-white/60 hover:text-white" type="submit">
              <LogOut size={14} />
              Salir
            </button>
          </div>
        </form>
      </aside>
      <div className="min-h-screen">
        <header className="flex items-center justify-between border-b border-white/8 px-5 py-4 md:px-8">
          <div>
            <p className="kicker">Operación en vivo</p>
            <p className="text-sm text-white/80">
              {user.municipalityName ?? "Todas las alcaldías"} · {user.email}
            </p>
          </div>
          <span className="live-dot">
            <span className="pulse" />
            Red municipal
          </span>
        </header>
        <main className="px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
