import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database, AvailabilitySlot } from "@/types/database.types";

export const dynamic = "force-dynamic";

// Endpoint para obtener slots realmente disponibles (excluye slots con bookings activos)
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Configuración de Supabase incompleta" },
        { status: 500 }
      );
    }

    // Usar service role key para poder limpiar bookings antiguos
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Limpiar bookings pendientes antiguos (más de 1 hora)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    await supabase
      .from("bookings")
      .delete()
      .eq("payment_status", "pending")
      .lt("created_at", oneHourAgo.toISOString());

    // Obtener todos los slots que no están marcados como booked
    const { data: slots, error: slotsError } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("is_booked", false)
      .gt("start_time", new Date().toISOString())
      .order("start_time", { ascending: true });

    if (slotsError) {
      console.error("Error fetching slots:", slotsError);
      return NextResponse.json(
        { error: "Error al obtener slots" },
        { status: 500 }
      );
    }

    if (!slots || slots.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    // Obtener todos los bookings activos (pending o paid)
    const { data: activeBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("slot_id")
      .in("payment_status", ["pending", "paid"]);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      // Si hay error, devolvemos todos los slots (fallback)
      return NextResponse.json({ slots: slots as AvailabilitySlot[] });
    }

    // Crear un Set con los slot_ids que tienen bookings activos
    const bookedSlotIds = new Set(
      (activeBookings || []).map((b) => b.slot_id)
    );

    // Filtrar slots que no tienen bookings activos
    const availableSlots = (slots as AvailabilitySlot[]).filter(
      (slot) => !bookedSlotIds.has(slot.id)
    );

    return NextResponse.json({ slots: availableSlots });
  } catch (error: any) {
    console.error("Error in available slots endpoint:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener slots disponibles" },
      { status: 500 }
    );
  }
}

