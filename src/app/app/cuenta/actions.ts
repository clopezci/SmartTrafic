"use server";

import { redirect } from "next/navigation";
import { DEMO_USERS } from "@/lib/demo-data";
import { currentPasswordValid, getSession, setSession } from "@/lib/session";
import { setDisplayName, setFlash, setPasswordHash } from "@/lib/site-settings";
import { updateSupabaseAccount } from "@/lib/supabase/admin";

export async function updateProfile(formData: FormData) {
  const user = await getSession();
  if (!user) redirect("/entrar");
  const fullName = String(formData.get("fullName") || "").trim();
  if (fullName.length < 3) {
    await setFlash("El nombre queda muy corto.");
    redirect("/app/cuenta?ok=err");
  }
  await setDisplayName(user.email, fullName);
  await updateSupabaseAccount(user.email, { fullName });
  await setSession({ ...user, fullName });
  await setFlash("Nombre actualizado.");
  redirect("/app/cuenta?ok=1");
}

export async function updatePassword(formData: FormData) {
  const user = await getSession();
  if (!user) redirect("/entrar");
  if (user.isGuest || !DEMO_USERS[user.email.toLowerCase()]) {
    await setFlash("Las claves de prueba las emite el dueño en Admin. Pídele una nueva.");
    redirect("/app/cuenta?ok=err");
  }
  const current = String(formData.get("current") || "");
  const next = String(formData.get("next") || "");
  const confirm = String(formData.get("confirm") || "");
  if (!(await currentPasswordValid(user.email, current))) {
    await setFlash("La clave actual no coincide.");
    redirect("/app/cuenta?ok=err");
  }
  if (next.length < 10) {
    await setFlash("La nueva clave necesita al menos 10 caracteres.");
    redirect("/app/cuenta?ok=err");
  }
  if (next !== confirm) {
    await setFlash("La confirmación no coincide.");
    redirect("/app/cuenta?ok=err");
  }
  try {
    await setPasswordHash(user.email, next);
  } catch {
    await setFlash("No se pudo guardar la clave en este navegador. Recarga e inténtalo otra vez.");
    redirect("/app/cuenta?ok=err");
  }
  const sb = await updateSupabaseAccount(user.email, {
    password: next,
    fullName: user.fullName,
  });
  await setFlash(
    sb && sb !== "no-user"
      ? "Clave del tablero cambiada. Auth de Supabase aún no tiene este usuario (el seed no lo crea); entra con la nueva clave igual."
      : "Clave cambiada. Entra con esa a partir de ahora.",
  );
  redirect("/app/cuenta?ok=1");
}
