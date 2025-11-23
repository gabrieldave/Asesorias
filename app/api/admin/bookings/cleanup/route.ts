import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// Endpoint para limpiar bookings pendientes antiguos (más de 24 horas)
export async function POST(request: NextRequest) {
  try {
    // Verificar sesión de admin
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Configuración de Supabase incompleta" },
        { status: 500 }
      );
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Calcular fecha límite (24 horas atrás)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Buscar bookings pendientes antiguos
    const { data: oldBookings, error: fetchError } = await supabase
      .from("bookings")
      .select("id, slot_id")
      .eq("payment_status", "pending")
      .lt("created_at", twentyFourHoursAgo.toISOString());

    if (fetchError) {
      console.error("Error fetching old bookings:", fetchError);
      return NextResponse.json(
        { error: "Error al buscar bookings antiguos" },
        { status: 500 }
      );
    }

    if (!oldBookings || oldBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay bookings pendientes antiguos para limpiar",
        deleted: 0,
      });
    }

    // Eliminar bookings antiguos
    const { error: deleteError } = await supabase
      .from("bookings")
      .delete()
      .eq("payment_status", "pending")
      .lt("created_at", twentyFourHoursAgo.toISOString());

    if (deleteError) {
      console.error("Error deleting old bookings:", deleteError);
      return NextResponse.json(
        { error: "Error al eliminar bookings antiguos" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Se eliminaron ${oldBookings.length} bookings pendientes antiguos`,
      deleted: oldBookings.length,
    });
  } catch (error: any) {
    console.error("Error in cleanup endpoint:", error);
    return NextResponse.json(
      { error: error.message || "Error al limpiar bookings" },
      { status: 500 }
    );
  }
}

