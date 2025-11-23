import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  try {
    // Verificar que el usuario es admin
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json(
        { error: "No autorizado. Se requiere sesión de administrador." },
        { status: 401 }
      );
    }

    const supabase = createServiceRoleClient();

    // Primero eliminar todas las reservas asociadas a los slots
    console.log("🧹 Eliminando todas las reservas asociadas a slots...");
    await (supabase.from("bookings") as any).delete().neq("id", 0);

    // Luego eliminar todos los slots
    console.log("🗑️ Eliminando todos los slots...");
    const { data, error } = await (supabase.from("availability_slots") as any)
      .delete()
      .neq("id", 0) // Esto elimina todos los registros
      .select();

    if (error) {
      console.error("Error deleting all slots:", error);
      return NextResponse.json(
        {
          error: "Error al eliminar los slots",
          details: error.message || error.code || "Error desconocido",
        },
        { status: 500 }
      );
    }

    const count = data?.length || 0;

    return NextResponse.json({
      success: true,
      message: `${count} slot(s) eliminado(s) exitosamente`,
      count,
    });
  } catch (error: any) {
    console.error("Error deleting all slots:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar los slots" },
      { status: 500 }
    );
  }
}

