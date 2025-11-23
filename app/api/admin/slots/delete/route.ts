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
    const force = searchParams.get("force") === "true"; // Permitir eliminación forzada

    if (!id) {
      return NextResponse.json(
        { error: "ID del slot es requerido" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();
    const slotId = parseInt(id);
    console.log("🗑️ Intentando eliminar slot ID:", slotId);

    // Verificar que el slot no esté reservado
    const { data: slot, error: fetchError } = await (supabase.from("availability_slots") as any)
      .select("*")
      .eq("id", slotId)
      .single();

    if (fetchError || !slot) {
      console.error("❌ Error al buscar slot:", fetchError);
      return NextResponse.json(
        { error: "Slot no encontrado" },
        { status: 404 }
      );
    }

    console.log("📋 Slot encontrado:", { id: slot.id, is_booked: slot.is_booked });

    // Verificar si hay bookings asociados a este slot
    const { data: bookings, error: bookingsError } = await (supabase.from("bookings") as any)
      .select("id, payment_status")
      .eq("slot_id", slotId);

    if (bookingsError) {
      console.error("⚠️ Error al verificar bookings:", bookingsError);
    } else if (bookings && bookings.length > 0) {
      const activeBookings = bookings.filter((b: any) => 
        b.payment_status === "pending" || b.payment_status === "paid"
      );
      
      if (activeBookings.length > 0 && !force) {
        console.error("❌ Slot tiene bookings activos:", activeBookings);
        return NextResponse.json(
          { error: `No se puede eliminar un slot con reservas activas (${activeBookings.length} reserva(s))` },
          { status: 400 }
        );
      }
      
      // Si force=true, eliminar todos los bookings primero
      if (force && bookings.length > 0) {
        console.log("🧹 Eliminando todos los bookings asociados al slot (forzado)...");
        const { error: deleteBookingsError } = await (supabase.from("bookings") as any)
          .delete()
          .eq("slot_id", slotId);
        
        if (deleteBookingsError) {
          console.error("❌ Error al eliminar bookings:", deleteBookingsError);
          return NextResponse.json(
            { error: "Error al eliminar las reservas asociadas" },
            { status: 500 }
          );
        }
        console.log("✅ Bookings eliminados, procediendo a eliminar slot...");
      } else if (bookings.length > 0) {
        // Si hay bookings pero están fallidos, los eliminamos primero
        console.log("🧹 Eliminando bookings fallidos asociados al slot...");
        await (supabase.from("bookings") as any)
          .delete()
          .eq("slot_id", slotId)
          .eq("payment_status", "failed");
      }
    }

    if (slot.is_booked) {
      return NextResponse.json(
        { error: "No se puede eliminar un slot reservado" },
        { status: 400 }
      );
    }

    console.log("✅ Intentando eliminar slot de la base de datos...");
    const { error, data } = await (supabase.from("availability_slots") as any)
      .delete()
      .eq("id", slotId)
      .select();

    if (error) {
      console.error("❌ Error al eliminar slot de Supabase:", error);
      console.error("❌ Detalles del error:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { 
          error: "Error al eliminar el slot",
          details: error.message || error.code || "Error desconocido"
        },
        { status: 500 }
      );
    }

    console.log("✅ Slot eliminado exitosamente");

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
