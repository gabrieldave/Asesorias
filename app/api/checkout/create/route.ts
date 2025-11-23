import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";
import { createBooking } from "@/lib/supabase/queries";
import type { Service } from "@/types/database.types";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const serviceId = searchParams.get("serviceId");
    const slotId = searchParams.get("slotId");
    const customerName = searchParams.get("name");
    const customerEmail = searchParams.get("email");

    if (!serviceId || !slotId || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verificar que el slot esté disponible
    const { data: slot, error: slotError } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("id", slotId)
      .eq("is_booked", false)
      .single();

    if (slotError || !slot) {
      return NextResponse.json(
        { error: "El slot seleccionado ya no está disponible" },
        { status: 400 }
      );
    }

    // Obtener el servicio
    const { data: serviceData, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .eq("active", true)
      .single();

    if (serviceError || !serviceData) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    const service = serviceData as Service;

    // Crear booking pendiente
    const booking = await createBooking({
      customer_email: customerEmail,
      customer_name: customerName,
      service_id: parseInt(serviceId),
      slot_id: parseInt(slotId),
      payment_status: "pending",
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Error al crear la reserva" },
        { status: 500 }
      );
    }

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "clp",
            product_data: {
              name: service.title,
              description: service.description,
            },
            unit_amount: service.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        booking_id: booking.id.toString(),
        service_id: serviceId,
        slot_id: slotId,
      },
    });

    // El stripe_session_id se actualizará en el webhook cuando se complete el pago
    // Por ahora, guardamos el session_id en metadata del booking
    return NextResponse.redirect(session.url || "/");
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear la sesión de pago" },
      { status: 500 }
    );
  }
}

