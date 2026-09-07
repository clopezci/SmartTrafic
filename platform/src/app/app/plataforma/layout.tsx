import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isPlatformAdmin } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSession();
  if (!isPlatformAdmin(user)) redirect("/app/tablero");
  return (
    <div>
      <p className="mb-4 rounded-2xl border border-[rgba(61,255,138,0.25)] bg-[rgba(61,255,138,0.06)] px-4 py-2 text-xs text-[var(--go)]">
        Módulo de plataforma · visible solo para {user?.email}
      </p>
      {children}
    </div>
  );
}
