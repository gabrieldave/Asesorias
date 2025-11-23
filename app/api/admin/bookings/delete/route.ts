import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth/session";
import { deleteGoogleCalendarEvent } from "@/lib/google-calendar";
import { deleteZoomMeeting } from "@/lib/zoom";
import { Resend } from "resend";
import type { Booking, Service, AvailabilitySlot } from "@/types/database.types";

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
      customer_email: bookingData.customer_email,
      customer_name: bookingData.customer_name,
    });

    // Obtener información del servicio y slot antes de eliminar (para el email)
    const [serviceResult, slotResult] = await Promise.all([
      (supabase.from("services") as any)
        .select("*")
        .eq("id", bookingData.service_id)
        .single(),
      (supabase.from("availability_slots") as any)
        .select("*")
        .eq("id", bookingData.slot_id)
        .single(),
    ]);

    const service = serviceResult.data as Service | null;
    const slot = slotResult.data as AvailabilitySlot | null;

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

    // Enviar email de cancelación al cliente
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && bookingData.customer_email) {
      try {
        console.log("📧 Enviando email de cancelación al cliente...");
        const resend = new Resend(resendApiKey);

        // Formatear fecha del slot en hora de México
        let slotDateStr = "N/A";
        let slotEndStr = "N/A";
        if (slot) {
          const slotStart = new Date(slot.start_time);
          const slotEnd = new Date(slot.end_time);
          slotDateStr = slotStart.toLocaleString("es-MX", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Mexico_City",
          });
          slotEndStr = slotEnd.toLocaleString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Mexico_City",
          });
        }

        const cancelEmailResult = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "Asesorías TST <noreply@mail.codextrader.tech>",
          to: bookingData.customer_email,
          subject: `❌ Reserva Cancelada - ${service?.title || "Mentoría"}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff3b30;">Reserva Cancelada</h2>
              <p>Hola <strong>${bookingData.customer_name}</strong>,</p>
              <p>Lamentamos informarte que tu reserva para <strong>${service?.title || "Mentoría"}</strong> ha sido cancelada.</p>
              
              <div style="background: #fff3f3; padding: 15px; border-radius: 5px; border-left: 4px solid #ff3b30; margin: 20px 0;">
                <h3>Detalles de la reserva cancelada:</h3>
                <p><strong>Servicio:</strong> ${service?.title || "N/A"}</p>
                <p><strong>Fecha y Hora:</strong> ${slotDateStr} - ${slotEndStr} (Hora de México)</p>
                <p><strong>Precio:</strong> $${service?.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "N/A"} USD</p>
              </div>
              
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0;"><strong>¿Qué sigue?</strong></p>
                <p style="margin: 10px 0 0 0;">Si realizaste un pago, el reembolso se procesará automáticamente según nuestras políticas. Si tienes alguna pregunta o deseas reagendar tu sesión, no dudes en contactarnos.</p>
              </div>
              
              <p>Gracias por tu comprensión.</p>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
          `,
        });

        if (cancelEmailResult.data) {
          console.log("✅ Email de cancelación enviado al cliente:", bookingData.customer_email);
        } else {
          console.error("❌ Error enviando email de cancelación:", cancelEmailResult.error);
        }
      } catch (emailError: any) {
        console.error("❌ Error enviando email de cancelación:", emailError);
        // No fallar la cancelación si el email falla
      }
    } else {
      if (!resendApiKey) {
        console.log("⚠️ Resend no configurado: falta variable de entorno RESEND_API_KEY");
      }
      if (!bookingData.customer_email) {
        console.log("⚠️ No hay email del cliente para enviar notificación");
      }
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
      message: "Reserva cancelada exitosamente. Se eliminaron el evento de Google Calendar, la reunión de Zoom, se liberó el slot y se notificó al cliente por email.",
    });
  } catch (error: any) {
    console.error("❌ Error eliminando booking:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar la reserva" },
      { status: 500 }
    );
  }
}


