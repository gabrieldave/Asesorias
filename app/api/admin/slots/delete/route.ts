import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  try {
    // Verificar que el usuario es admin
    const adminSession = await getAdminSession();
    console.log("🔐 Admin session check:", adminSession ? "✅ Authenticated" : "❌ Not authenticated");
    
    if (!adminSession) {
      console.error("❌ Unauthorized: No admin session found");
      return NextResponse.json(
        { error: "No autorizado. Se requiere sesión de administrador." },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID del slot es requerido" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Verificar que el slot no esté reservado
    const { data: slot, error: fetchError } = await (supabase.from("availability_slots") as any)
      .select("*")
      .eq("id", parseInt(id))
      .single();

    if (fetchError || !slot) {
      return NextResponse.json(
        { error: "Slot no encontrado" },
        { status: 404 }
      );
    }

    if (slot.is_booked) {
      return NextResponse.json(
        { error: "No se puede eliminar un slot reservado" },
        { status: 400 }
      );
    }

    const { error } = await (supabase.from("availability_slots") as any)
      .delete()
      .eq("id", parseInt(id));

    if (error) {
      console.error("Error deleting slot:", error);
      return NextResponse.json(
        { error: "Error al eliminar el slot" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Slot eliminado exitosamente",
    });
  } catch (error: any) {
    console.error("Error deleting slot:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar el slot" },
      { status: 500 }
    );
  }
}
