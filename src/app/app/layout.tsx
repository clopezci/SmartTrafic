import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { getSession } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/entrar");
  return <Shell user={user}>{children}</Shell>;
}
