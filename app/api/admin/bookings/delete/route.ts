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

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID del booking es requerido" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();
    const bookingId = parseInt(id);

    // Eliminar el booking
    const { error } = await (supabase.from("bookings") as any)
      .delete()
      .eq("id", bookingId);

    if (error) {
      console.error("Error deleting booking:", error);
      return NextResponse.json(
        { error: "Error al eliminar la reserva" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reserva eliminada exitosamente",
    });
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar la reserva" },
      { status: 500 }
    );
  }
}

