import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id es requerido" },
        { status: 400 }
      );
    }

    // Obtener la sesión de Stripe para obtener el booking_id de los metadata
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const bookingId = session.metadata?.booking_id;

    const supabase = createServiceRoleClient();

    let booking = null;

    // Primero intentar buscar por booking_id de metadata (más confiable)
    if (bookingId) {
      const { data, error } = await (supabase.from("bookings") as any)
        .select("*")
        .eq("id", parseInt(bookingId))
        .single();
      
      if (!error && data) {
        booking = data;
      }
    }

    // Si no se encuentra, buscar por stripe_session_id
    if (!booking) {
      const { data, error } = await (supabase.from("bookings") as any)
        .select("*")
        .eq("stripe_session_id", sessionId)
        .single();
      
      if (!error && data) {
        booking = data;
      }
    }

    if (!booking) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    // Si el pago está completo en Stripe pero el booking aún está pendiente,
    // actualizar el estado manualmente (el webhook puede tardar)
    if (session.payment_status === "paid" && booking.payment_status !== "paid") {
      console.log("⚠️ Pago completado en Stripe pero booking está pendiente. Actualizando...");
      
      const { data: updatedBooking, error: updateError } = await (supabase.from("bookings") as any)
        .update({
          payment_status: "paid",
          stripe_session_id: sessionId,
        })
        .eq("id", booking.id)
        .select()
        .single();

      if (!updateError && updatedBooking) {
        console.log("✅ Booking actualizado manualmente a 'paid'");
        booking = updatedBooking;
        
        // También marcar el slot como reservado
        await (supabase.from("availability_slots") as any)
          .update({ is_booked: true })
          .eq("id", booking.slot_id);
      }
    }

    // Obtener el servicio
    const { data: service, error: serviceError } = await (supabase.from("services") as any)
      .select("*")
      .eq("id", booking.service_id)
      .single();

    return NextResponse.json({
      booking,
      service: service || null,
    });
  } catch (error: any) {
    console.error("Error getting booking:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener la reserva" },
      { status: 500 }
    );
  }
}

