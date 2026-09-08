"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, MoreHorizontal, X } from "lucide-react";
import { APP_NAV, MOBILE_TABS, PLATFORM_NAV } from "@/lib/nav";
import { cn, roleLabel } from "@/lib/format";
import type { SessionUser } from "@/lib/types";

function isActive(path: string, href: string) {
  if (href === "/app/tablero") return path === href;
  return path === href || path.startsWith(`${href}/`);
}

export function DesktopNav({ admin }: { admin: boolean }) {
  const path = usePathname();
  return (
    <>
      <nav className="mt-8 flex flex-col gap-1">
        {APP_NAV.map((item) => (
          <Link
            className={cn("nav-link", isActive(path, item.href) && "is-active")}
            href={item.href}
            key={item.href}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>
      {admin ? (
        <div className="mt-8">
          <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--go)]">
            Plataforma
          </p>
          {PLATFORM_NAV.map((item) => (
            <Link
              className={cn("nav-link", isActive(path, item.href) && "is-active")}
              href={item.href}
              key={item.href}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );
}

export function MobileDock({
  user,
  admin,
}: {
  user: SessionUser;
  admin: boolean;
}) {
  const path = usePathname();
  const [more, setMore] = useState(false);
  const extra = APP_NAV.filter((item) => !MOBILE_TABS.some((tab) => tab.href === item.href));

  return (
    <>
      <nav className="mobile-dock lg:hidden">
        {MOBILE_TABS.map((item) => (
          <Link
            className={cn("dock-item", isActive(path, item.href) && "is-active")}
            href={item.href}
            key={item.href}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
        <button
          className={cn("dock-item", more && "is-active")}
          onClick={() => setMore(true)}
          type="button"
        >
          <MoreHorizontal size={20} />
          Más
        </button>
      </nav>

      {more ? (
        <div className="mobile-sheet lg:hidden">
          <button className="absolute inset-0 bg-black/55" onClick={() => setMore(false)} type="button" />
          <div className="mobile-sheet-panel">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{user.fullName}</p>
                <p className="text-[11px] text-[var(--mute)]">{roleLabel(user.role)}</p>
              </div>
              <button aria-label="Cerrar menú" className="rounded-full p-2 text-white/70" onClick={() => setMore(false)} type="button">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {extra.map((item) => (
                <Link
                  className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/8 bg-white/4 px-2 py-3 text-center text-[11px] text-white/80"
                  href={item.href}
                  key={item.href}
                  onClick={() => setMore(false)}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
              {admin
                ? PLATFORM_NAV.map((item) => (
                    <Link
                      className="flex flex-col items-center gap-1.5 rounded-2xl border border-[color-mix(in_srgb,var(--go)_28%,transparent)] bg-[color-mix(in_srgb,var(--go)_8%,transparent)] px-2 py-3 text-center text-[11px] text-[var(--go)]"
                      href={item.href}
                      key={item.href}
                      onClick={() => setMore(false)}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  ))
                : null}
            </div>
            <form action="/api/auth/logout" className="mt-4" method="post">
              <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 py-3 text-sm text-white/70" type="submit">
                <LogOut size={16} />
                Salir
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
