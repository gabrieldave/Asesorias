import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { Service, Booking, Database } from "@/types/database.types";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

const DEFAULT_STRIPE_CURRENCY = (process.env.STRIPE_DEFAULT_CURRENCY || "usd").toLowerCase();
const CURRENCY_REGEX = /^[a-z]{3}$/;

const getStripeCurrency = () => {
  if (CURRENCY_REGEX.test(DEFAULT_STRIPE_CURRENCY)) {
    return DEFAULT_STRIPE_CURRENCY;
  }
  console.warn(
    `[checkout/create] STRIPE_DEFAULT_CURRENCY inválida (${DEFAULT_STRIPE_CURRENCY}). Usando USD por defecto.`
  );
  return "usd";
};

// Cliente con service role key para bypass RLS
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase credentials not configured");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

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

    const supabase = getSupabaseAdmin();

    // Verificar que el slot esté disponible
    const { data: slot, error: slotError } = await (supabase.from("availability_slots") as any)
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
    const { data: serviceData, error: serviceError } = await (supabase.from("services") as any)
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

    // Limpiar bookings pendientes antiguos (más de 1 hora) para este slot
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    await (supabase.from("bookings") as any)
      .delete()
      .eq("slot_id", parseInt(slotId))
      .eq("payment_status", "pending")
      .lt("created_at", oneHourAgo.toISOString());

    // Verificar si ya existe un booking para este slot (pending o paid)
    const { data: existingBooking, error: existingBookingError } = await (supabase.from("bookings") as any)
      .select("*")
      .eq("slot_id", parseInt(slotId))
      .in("payment_status", ["pending", "paid"])
      .maybeSingle();

    if (existingBookingError) {
      console.error("Error checking existing booking:", existingBookingError);
      return NextResponse.json(
        { error: "Error al verificar disponibilidad" },
        { status: 500 }
      );
    }

    if (existingBooking) {
      return NextResponse.json(
        { error: "Este slot ya está reservado. Por favor, selecciona otro horario." },
        { status: 400 }
      );
    }

    // Crear booking pendiente usando el cliente del servidor
    const { data: booking, error: bookingError } = await (supabase.from("bookings") as any)
      .insert({
        customer_email: customerEmail,
        customer_name: customerName,
        service_id: parseInt(serviceId),
        slot_id: parseInt(slotId),
        payment_status: "pending",
        stripe_session_id: null,
        zoom_link: null,
        gcal_event_id: null,
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error("Error creating booking:", bookingError);
      
      // Si el error es por constraint único, significa que otro proceso creó un booking
      if (bookingError?.message?.includes("unique_slot_booking") || 
          bookingError?.code === "23505") {
        return NextResponse.json(
          { error: "Este slot fue reservado por otro usuario. Por favor, selecciona otro horario." },
          { status: 409 } // Conflict
        );
      }
      
      return NextResponse.json(
        { error: "Error al crear la reserva", details: bookingError?.message },
        { status: 500 }
      );
    }

    const bookingData = booking as Booking;

    // Crear sesión de Stripe Checkout
    // El precio base está en USD, pero Stripe mostrará automáticamente la conversión
    // según la ubicación del cliente si está habilitado en el Dashboard
    const priceInMinorUnit = Math.round(service.price * 100);
    const stripeCurrency = getStripeCurrency();
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: stripeCurrency,
            product_data: {
              name: service.title,
              description: service.description,
            },
            unit_amount: priceInMinorUnit,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Configuración para pagos internacionales
      billing_address_collection: "auto",
      locale: "auto", // Stripe detectará automáticamente el idioma del cliente
      payment_method_options: {
        card: {
          request_three_d_secure: "automatic", // 3D Secure automático para mayor seguridad
        },
      },
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        booking_id: bookingData.id.toString(),
        service_id: serviceId,
        slot_id: slotId,
      },
    });

    // El stripe_session_id se actualizará en el webhook cuando se complete el pago
    // Verificar si la solicitud viene de fetch (tiene header Accept: application/json) o navegador directo
    const acceptHeader = request.headers.get("accept") || "";
    const isJsonRequest = acceptHeader.includes("application/json");

    if (isJsonRequest && session.url) {
      // Si es una solicitud JSON (desde el modal), devolver la URL
      return NextResponse.json({ url: session.url });
    }

    // Si es una solicitud directa del navegador, redirigir
    return NextResponse.redirect(session.url || "/");
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear la sesión de pago" },
      { status: 500 }
    );
  }
}

