import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function findAuthUser(admin: SupabaseClient, email: string) {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) throw new Error(error.message);
  return data.users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase()) ?? null;
}

/**
 * Optional sync to Supabase Auth. Login still uses the signed cookie.
 * Schema + seed do not create auth.users; missing users are created on first
 * password change when the service role key is present.
 * Never throws — the tablero must keep working without Auth users.
 */
export async function updateSupabaseAccount(
  email: string,
  patch: { password?: string; fullName?: string },
): Promise<string | null> {
  try {
    const admin = createSupabaseAdmin();
    if (!admin) return null;

    let user = await findAuthUser(admin, email);

    if (!user) {
      if (!patch.password) return "no-user";
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: patch.password,
        email_confirm: true,
        user_metadata: patch.fullName ? { full_name: patch.fullName } : undefined,
      });
      if (error) return error.message;
      user = data.user;
      if (!user) return "no-user";
      return null;
    }

    const payload: { password?: string; user_metadata?: { full_name: string } } = {};
    if (patch.password) payload.password = patch.password;
    if (patch.fullName) payload.user_metadata = { full_name: patch.fullName };
    if (Object.keys(payload).length) {
      const { error: upd } = await admin.auth.admin.updateUserById(user.id, payload);
      if (upd) return upd.message;
    }

    if (patch.fullName) {
      await admin.from("profiles").update({ full_name: patch.fullName }).eq("id", user.id);
    }
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : "supabase";
  }
}
