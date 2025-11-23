import { compare, hash } from "bcryptjs";
import { createServerClient } from "@/lib/supabase/server";

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  active: boolean;
  created_at: string;
  last_login_at: string | null;
}

// Verificar credenciales de admin
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminUser | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .eq("active", true)
    .single();

  if (error || !data) {
    return null;
  }

  // Verificar contraseña
  const isValid = await compare(password, data.password_hash);
  if (!isValid) {
    return null;
  }

  // Actualizar último login
  await supabase
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", data.id);

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    active: data.active,
    created_at: data.created_at,
    last_login_at: data.last_login_at,
  };
}

// Crear o actualizar admin
export async function createOrUpdateAdmin(
  email: string,
  password: string,
  name?: string
): Promise<AdminUser | null> {
  const supabase = createServerClient();
  const passwordHash = await hash(password, 10);

  const { data, error } = await supabase
    .from("admin_users")
    .upsert(
      {
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        name: name || null,
        active: true,
      },
      {
        onConflict: "email",
      }
    )
    .select()
    .single();

  if (error || !data) {
    console.error("Error creating/updating admin:", error);
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    active: data.active,
    created_at: data.created_at,
    last_login_at: data.last_login_at,
  };
}

// Cambiar contraseña de admin
export async function changeAdminPassword(
  email: string,
  newPassword: string
): Promise<boolean> {
  const supabase = createServerClient();
  const passwordHash = await hash(newPassword, 10);

  const { error } = await supabase
    .from("admin_users")
    .update({ password_hash: passwordHash })
    .eq("email", email.toLowerCase().trim());

  return !error;
}

