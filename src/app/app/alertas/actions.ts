"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { dbAckAlert } from "@/lib/persist";
import { setFlash } from "@/lib/site-settings";

export async function acknowledgeAlert(formData: FormData) {
  const user = await getSession();
  if (!user) redirect("/entrar");
  const id = String(formData.get("id") || "");
  if (!id) redirect("/app/alertas");
  const err = await dbAckAlert(id, user.email);
  await setFlash(err ? `No se pudo acusar: ${err}` : "Alerta vista.");
  redirect(err ? "/app/alertas?ok=err" : "/app/alertas?ok=1");
}
