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
      if (
        process.env.ZOOM_CLIENT_ID &&
        process.env.ZOOM_CLIENT_SECRET &&
        process.env.ZOOM_ACCOUNT_ID &&
        slot
      ) {
        try {
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
            console.log("Zoom meeting created:", zoomLink);
          }
        } catch (error) {
          console.error("Error creating Zoom meeting:", error);
        }
      } else {
        console.log("Zoom not configured or slot not found");
      }

      // Crear evento en Google Calendar
      let gcalEventId = null;
      if (
        process.env.GOOGLE_CALENDAR_CLIENT_ID &&
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
        process.env.GOOGLE_CALENDAR_REFRESH_TOKEN &&
        slot &&
        service
      ) {
        try {
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
            console.log("Google Calendar event created:", gcalEventId);
          }
        } catch (error) {
          console.error("Error creating Google Calendar event:", error);
        }
      } else {
        console.log("Google Calendar not configured or slot/service not found");
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

      // Enviar emails (placeholder - requiere configuración)
      const resend = getResend();
      if (resend) {
        try {
          // Email al cliente
          await resend.emails.send({
            from: "Asesorías TST <noreply@tus-dominio.com>",
            to: bookingData.customer_email,
            subject: `Confirmación de Reserva - ${service?.title || "Mentoría"}`,
            html: `
              <h2>¡Reserva Confirmada!</h2>
              <p>Hola ${bookingData.customer_name},</p>
              <p>Tu reserva para <strong>${service?.title || "Mentoría"}</strong> ha sido confirmada.</p>
              ${zoomLink ? `<p>Link de Zoom: <a href="${zoomLink}">${zoomLink}</a></p>` : ""}
              <p>Gracias por confiar en nosotros.</p>
            `,
          });

          // Email al admin
          const adminEmail = process.env.ADMIN_EMAIL;
          if (adminEmail) {
            await resend.emails.send({
              from: "Asesorías TST <noreply@tus-dominio.com>",
              to: adminEmail,
              subject: `Nueva Reserva - ${bookingData.customer_name}`,
              html: `
                <h2>Nueva Reserva</h2>
                <p><strong>Cliente:</strong> ${bookingData.customer_name}</p>
                <p><strong>Email:</strong> ${bookingData.customer_email}</p>
                <p><strong>Servicio:</strong> ${service?.title || "N/A"}</p>
                <p><strong>Precio:</strong> $${service?.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "N/A"} USD</p>
              `,
            });
          }
        } catch (error) {
          console.error("Error sending emails:", error);
        }
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

