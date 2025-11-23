import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID del slot es requerido" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verificar que el slot no esté reservado
    const { data: slot, error: fetchError } = await supabase
      .from("availability_slots")
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

    const { error } = await supabase
      .from("availability_slots")
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
