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

    // Eliminar todas las reservas
    const { data, error } = await (supabase.from("bookings") as any)
      .delete()
      .neq("id", 0) // Esto elimina todos los registros
      .select();

    if (error) {
      console.error("Error deleting all bookings:", error);
      return NextResponse.json(
        {
          error: "Error al eliminar las reservas",
          details: error.message || error.code || "Error desconocido",
        },
        { status: 500 }
      );
    }

    const count = data?.length || 0;

    return NextResponse.json({
      success: true,
      message: `${count} reserva(s) eliminada(s) exitosamente`,
      count,
    });
  } catch (error: any) {
    console.error("Error deleting all bookings:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar las reservas" },
      { status: 500 }
    );
  }
}



