import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export const dynamic = "force-dynamic";

// Endpoint para crear slots (usa service role key para bypass RLS)
export async function POST(request: NextRequest) {
  try {
    const { start_time, end_time } = await request.json();

    if (!start_time || !end_time) {
      return NextResponse.json(
        { error: "start_time y end_time son requeridos" },
        { status: 400 }
      );
    }

    // Usar service role key para bypass RLS
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

    const { data, error } = await supabase
      .from("availability_slots")
      .insert({
        start_time,
        end_time,
        is_booked: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating slot:", error);
      return NextResponse.json(
        { error: error.message || "Error al crear el slot" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      slot: data,
    });
  } catch (error: any) {
    console.error("Error creating slot:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear el slot" },
      { status: 500 }
    );
  }
}


