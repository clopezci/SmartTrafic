import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { DesktopNav, MobileDock } from "@/components/app-nav";
import { isPlatformAdmin, roleLabel } from "@/lib/format";
import { SignalMark } from "@/components/signal";
import type { SessionUser } from "@/lib/types";

export function Shell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const admin = isPlatformAdmin(user);
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-white/8 bg-[#080b11]/90 px-4 py-5 backdrop-blur lg:flex lg:flex-col">
        <Link className="flex items-center gap-2 px-2" href="/app/tablero">
          <SignalMark size={26} />
          <span>
            <span className="block font-display text-lg leading-none text-white">
              SmartTrafic
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--mute)]">
              fase 1
            </span>
          </span>
        </Link>
        <DesktopNav admin={admin} />
        <form action="/api/auth/logout" className="mt-auto px-2 pt-8" method="post">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
            <p className="text-sm font-medium text-white">{user.fullName}</p>
            <p className="text-[11px] text-[var(--mute)]">
              {roleLabel(user.role)}
              {user.grantExpiresAt
                ? ` · prueba hasta ${user.grantExpiresAt.slice(0, 10)}`
                : ""}
            </p>
            <Link className="mt-3 flex items-center gap-2 text-xs text-white/60 hover:text-white" href="/app/cuenta">
              Cambiar nombre o clave
            </Link>
            <button className="mt-2 flex items-center gap-2 text-xs text-white/60 hover:text-white" type="submit">
              <LogOut size={14} />
              Salir
            </button>
          </div>
        </form>
      </aside>
      <div className="flex min-h-dvh flex-col pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0">
        <header className="app-topbar">
          <Link className="lg:hidden" href="/app/tablero">
            <SignalMark size={22} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="kicker hidden sm:block">Centro de mando</p>
            <p className="truncate text-sm text-white/80">
              {user.municipalityName ?? "Todas las alcaldías"}
              <span className="hidden text-white/45 sm:inline"> · {user.email}</span>
            </p>
          </div>
          <span className="live-dot">
            <span className="pulse" />
            Red
          </span>
        </header>
        <main className="flex-1 px-3 py-4 md:px-8 md:py-8">{children}</main>
      </div>
      <MobileDock admin={admin} user={user} />
    </div>
  );
}
