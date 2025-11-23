import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

// Lista de emails permitidos para acceso admin
const ALLOWED_ADMIN_EMAILS = [
  "david.del.rio.colin@gmail.com",
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "",
].filter((email) => email !== "");

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Verificar que el email del usuario esté en la lista de permitidos
  const userEmail = session.user?.email || "";
  if (!ALLOWED_ADMIN_EMAILS.includes(userEmail)) {
    // Cerrar sesión y redirigir si no está autorizado
    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }

  return <>{children}</>;
}

