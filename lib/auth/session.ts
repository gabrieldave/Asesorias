import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

export interface AdminSession {
  id: number;
  email: string;
  name: string | null;
}

// Verificar sesión de admin
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  const adminEmail = cookieStore.get("admin_email")?.value;

  if (!sessionToken || !adminEmail) {
    return null;
  }

  try {
    // Verificar que el admin existe y está activo
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, email, name, active")
      .eq("email", adminEmail)
      .eq("active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
    };
  } catch (error) {
    console.error("Error verifying admin session:", error);
    return null;
  }
}


