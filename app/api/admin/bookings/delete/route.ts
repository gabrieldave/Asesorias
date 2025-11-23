import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth/session";
import { deleteGoogleCalendarEvent } from "@/lib/google-calendar";
import { deleteZoomMeeting } from "@/lib/zoom";
import type { Booking } from "@/types/database.types";

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

    console.log("🗑️ Eliminando booking:", bookingId);

    // Primero obtener el booking para eliminar recursos externos
    const { data: booking, error: fetchError } = await (supabase.from("bookings") as any)
      .select("*")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      console.error("❌ Error obteniendo booking:", fetchError);
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    const bookingData = booking as Booking;
    console.log("📝 Booking a eliminar:", {
      id: bookingData.id,
      gcal_event_id: bookingData.gcal_event_id,
      zoom_link: bookingData.zoom_link,
      slot_id: bookingData.slot_id,
    });

    // Eliminar evento de Google Calendar si existe
    if (bookingData.gcal_event_id) {
      console.log("📅 Eliminando evento de Google Calendar...");
      const gcalDeleted = await deleteGoogleCalendarEvent(bookingData.gcal_event_id);
      if (gcalDeleted) {
        console.log("✅ Evento de Google Calendar eliminado");
      } else {
        console.log("⚠️ No se pudo eliminar el evento de Google Calendar (puede que ya no exista)");
      }
    }

    // Eliminar reunión de Zoom si existe
    if (bookingData.zoom_link) {
      console.log("📹 Eliminando reunión de Zoom...");
      const zoomDeleted = await deleteZoomMeeting(bookingData.zoom_link);
      if (zoomDeleted) {
        console.log("✅ Reunión de Zoom eliminada");
      } else {
        console.log("⚠️ No se pudo eliminar la reunión de Zoom (puede que ya no exista)");
      }
    }

    // Liberar el slot (marcarlo como disponible)
    console.log("🔄 Liberando slot...");
    const { error: slotUpdateError } = await (supabase.from("availability_slots") as any)
      .update({ is_booked: false })
      .eq("id", bookingData.slot_id);

    if (slotUpdateError) {
      console.error("⚠️ Error liberando slot:", slotUpdateError);
    } else {
      console.log("✅ Slot liberado");
    }

    // Finalmente, eliminar el booking de la base de datos
    console.log("🗑️ Eliminando booking de la base de datos...");
    const { error } = await (supabase.from("bookings") as any)
      .delete()
      .eq("id", bookingId);

    if (error) {
      console.error("❌ Error eliminando booking:", error);
      return NextResponse.json(
        { error: "Error al eliminar la reserva" },
        { status: 500 }
      );
    }

    console.log("✅ Booking eliminado exitosamente");

    return NextResponse.json({
      success: true,
      message: "Reserva cancelada exitosamente. Se eliminaron el evento de Google Calendar, la reunión de Zoom y se liberó el slot.",
    });
  } catch (error: any) {
    console.error("❌ Error eliminando booking:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar la reserva" },
      { status: 500 }
    );
  }
}


