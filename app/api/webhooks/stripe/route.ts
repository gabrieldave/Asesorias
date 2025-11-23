import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { createZoomMeeting } from "@/lib/zoom";
import { createGoogleCalendarEvent } from "@/lib/google-calendar";
import type { Booking, Service, AvailabilitySlot } from "@/types/database.types";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      console.log("🔔 Webhook recibido: checkout.session.completed");
      console.log("📋 Session ID:", session.id);
      console.log("📋 Metadata:", session.metadata);

      const supabase = createServiceRoleClient();

      // Obtener el booking usando metadata o session_id
      const bookingId = session.metadata?.booking_id;
      let booking = null;

      if (bookingId) {
        console.log("🔍 Buscando booking por ID:", bookingId);
        const { data, error } = await (supabase.from("bookings") as any)
          .select("*")
          .eq("id", parseInt(bookingId))
          .single();
        if (!error && data) {
          booking = data;
          console.log("✅ Booking encontrado por ID:", booking.id);
        } else {
          console.error("❌ Error buscando por ID:", error);
        }
      }

      // Si no se encuentra por metadata, buscar por session_id
      if (!booking) {
        console.log("🔍 Buscando booking por session_id:", session.id);
        const { data, error } = await (supabase.from("bookings") as any)
          .select("*")
          .eq("stripe_session_id", session.id)
          .single();
        if (!error && data) {
          booking = data as Booking;
          console.log("✅ Booking encontrado por session_id:", booking.id);
        } else {
          console.error("❌ Error buscando por session_id:", error);
        }
      }

      if (!booking) {
        console.error("❌ Booking not found for session:", session.id);
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      const bookingData = booking as Booking;
      console.log("📝 Booking actual:", {
        id: bookingData.id,
        payment_status: bookingData.payment_status,
        stripe_session_id: bookingData.stripe_session_id,
      });

      // Actualizar booking a pagado y guardar session_id usando service role
      console.log("💾 Actualizando booking a 'paid'...");
      const { data: updatedBooking, error: updateError } = await (supabase.from("bookings") as any)
        .update({
          payment_status: "paid",
          stripe_session_id: session.id,
        })
        .eq("id", bookingData.id)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Error actualizando booking:", updateError);
        return NextResponse.json(
          { error: "Error updating booking", details: updateError.message },
          { status: 500 }
        );
      }

      console.log("✅ Booking actualizado:", {
        id: updatedBooking.id,
        payment_status: updatedBooking.payment_status,
      });

      // Marcar slot como reservado
      console.log("💾 Marcando slot como reservado...");
      const { error: slotUpdateError } = await (supabase.from("availability_slots") as any)
        .update({ is_booked: true })
        .eq("id", bookingData.slot_id);

      if (slotUpdateError) {
        console.error("❌ Error actualizando slot:", slotUpdateError);
      } else {
        console.log("✅ Slot marcado como reservado");
      }

      // Obtener servicio y slot
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

      // Crear Zoom meeting
      let zoomLink = null;
      const hasZoomConfig = 
        process.env.ZOOM_CLIENT_ID &&
        process.env.ZOOM_CLIENT_SECRET &&
        process.env.ZOOM_ACCOUNT_ID;
      
      if (hasZoomConfig && slot) {
        try {
          console.log("📹 Creando reunión de Zoom...");
          const startTime = new Date(slot.start_time);
          const endTime = new Date(slot.end_time);
          const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000); // minutos

          zoomLink = await createZoomMeeting(
            `${service?.title || "Mentoría"} - ${bookingData.customer_name}`,
            startTime,
            duration,
            bookingData.customer_email
          );

          if (zoomLink) {
            console.log("✅ Reunión de Zoom creada:", zoomLink);
          } else {
            console.log("⚠️ No se pudo crear la reunión de Zoom");
          }
        } catch (error) {
          console.error("❌ Error creando reunión de Zoom:", error);
        }
      } else {
        if (!hasZoomConfig) {
          console.log("⚠️ Zoom no configurado: faltan variables de entorno (ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_ACCOUNT_ID)");
        }
        if (!slot) {
          console.log("⚠️ Slot no encontrado para crear reunión de Zoom");
        }
      }

      // Crear evento en Google Calendar
      let gcalEventId = null;
      const hasGCalConfig = 
        process.env.GOOGLE_CALENDAR_CLIENT_ID &&
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
        process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;
      
      if (hasGCalConfig && slot && service) {
        try {
          console.log("📅 Creando evento en Google Calendar...");
          const startTime = new Date(slot.start_time);
          const endTime = new Date(slot.end_time);

          gcalEventId = await createGoogleCalendarEvent(
            `${service.title} - ${bookingData.customer_name}`,
            service.description || "",
            startTime,
            endTime,
            bookingData.customer_email,
            bookingData.customer_name,
            zoomLink
          );

          if (gcalEventId) {
            console.log("✅ Evento de Google Calendar creado exitosamente!");
            console.log("📅 Event ID:", gcalEventId);
          } else {
            console.log("⚠️ No se pudo crear el evento en Google Calendar");
            console.log("💡 Revisa los logs anteriores para ver el error específico");
          }
        } catch (error: any) {
          console.error("❌ Error inesperado creando evento en Google Calendar:", error);
          console.error("Stack:", error.stack);
        }
      } else {
        if (!hasGCalConfig) {
          console.log("⚠️ Google Calendar no configurado: faltan variables de entorno (GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET, GOOGLE_CALENDAR_REFRESH_TOKEN)");
        }
        if (!slot || !service) {
          console.log("⚠️ Slot o servicio no encontrado para crear evento en Google Calendar");
        }
      }

      // Actualizar booking con links
      if (zoomLink || gcalEventId) {
        console.log("💾 Actualizando booking con links...");
        const { error: linksUpdateError } = await (supabase.from("bookings") as any)
          .update({
            zoom_link: zoomLink,
            gcal_event_id: gcalEventId,
          })
          .eq("id", bookingData.id);

        if (linksUpdateError) {
          console.error("❌ Error actualizando links:", linksUpdateError);
        } else {
          console.log("✅ Links actualizados");
        }
      }

      // Enviar emails
      const resend = getResend();
      if (resend) {
        try {
          console.log("📧 Enviando emails de confirmación...");
          
          // Formatear fecha del slot en hora de México
          const slotStart = new Date(slot?.start_time || new Date());
          const slotEnd = new Date(slot?.end_time || new Date());
          const slotDateStr = slotStart.toLocaleString("es-MX", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Mexico_City",
          });
          const slotEndStr = slotEnd.toLocaleString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Mexico_City",
          });

          // Email al cliente
          const customerEmailResult = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "Asesorías TST <noreply@todossomostraders.com>",
            to: bookingData.customer_email,
            subject: `✅ Reserva Confirmada - ${service?.title || "Mentoría"}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #00ff00;">¡Reserva Confirmada!</h2>
                <p>Hola <strong>${bookingData.customer_name}</strong>,</p>
                <p>Tu reserva para <strong>${service?.title || "Mentoría"}</strong> ha sido confirmada exitosamente.</p>
                
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3>Detalles de tu reserva:</h3>
                  <p><strong>Servicio:</strong> ${service?.title || "N/A"}</p>
                  <p><strong>Fecha y Hora:</strong> ${slotDateStr} - ${slotEndStr} (Hora de México)</p>
                  <p><strong>Precio:</strong> $${service?.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "N/A"} USD</p>
                </div>
                
                ${zoomLink ? `<div style="background: #e8f5e9; padding: 15px; border-radius: 5px; border-left: 4px solid #00ff00; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0;"><strong>🔗 Link de Zoom:</strong></p>
                  <p style="margin: 0;"><a href="${zoomLink}" style="color: #0066cc; word-break: break-all;">${zoomLink}</a></p>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Guarda este link para acceder a tu sesión</p>
                </div>` : ""}
                
                <p>Gracias por confiar en nosotros. ¡Te esperamos!</p>
              </div>
            `,
          });

          if (customerEmailResult.data) {
            console.log("✅ Email enviado al cliente:", bookingData.customer_email);
          } else {
            console.error("❌ Error enviando email al cliente:", customerEmailResult.error);
          }

          // Email de notificación de nuevas reservas (siempre a este email)
          const notificationsEmail = "todossomostr4ders@gmail.com";
          const adminEmailResult = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "Asesorías TST <noreply@mail.codextrader.tech>",
            to: notificationsEmail,
            subject: `📅 Nueva Reserva - ${bookingData.customer_name}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Nueva Reserva Recibida</h2>
                  <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                    <p><strong>Cliente:</strong> ${bookingData.customer_name}</p>
                    <p><strong>Email:</strong> ${bookingData.customer_email}</p>
                    <p><strong>Servicio:</strong> ${service?.title || "N/A"}</p>
                    <p><strong>Fecha y Hora:</strong> ${slotDateStr} - ${slotEndStr} (Hora de México)</p>
                    <p><strong>Precio:</strong> $${service?.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "N/A"} USD</p>
                    ${zoomLink ? `<p><strong>Link de Zoom:</strong> <a href="${zoomLink}">${zoomLink}</a></p>` : ""}
                    ${gcalEventId ? `<p><strong>Google Calendar Event ID:</strong> ${gcalEventId}</p>` : ""}
                  </div>
                </div>
              `,
          });

          if (adminEmailResult.data) {
            console.log("✅ Email de notificación enviado a:", notificationsEmail);
          } else {
            console.error("❌ Error enviando email de notificación:", adminEmailResult.error);
          }
        } catch (error) {
          console.error("❌ Error enviando emails:", error);
        }
      } else {
        console.log("⚠️ Resend no configurado: falta variable de entorno RESEND_API_KEY");
      }

      return NextResponse.json({ received: true });
    } catch (error: any) {
      console.error("Error processing webhook:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

