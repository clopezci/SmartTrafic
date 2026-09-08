import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function updateSupabaseAccount(
  email: string,
  patch: { password?: string; fullName?: string },
): Promise<string | null> {
  const admin = createSupabaseAdmin();
  if (!admin) return null;
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) return error.message;
  const user = data.users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
  if (!user) return "no-user";
  const { error: upd } = await admin.auth.admin.updateUserById(user.id, {
    password: patch.password,
    user_metadata: patch.fullName ? { full_name: patch.fullName } : undefined,
  });
  if (upd) return upd.message;
  if (patch.fullName) {
    await admin.from("profiles").update({ full_name: patch.fullName }).eq("id", user.id);
  }
  return null;
}
