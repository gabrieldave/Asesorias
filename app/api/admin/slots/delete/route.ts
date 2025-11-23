import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export const dynamic = "force-dynamic";

// Endpoint para eliminar slots (usa service role key para bypass RLS)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID del slot es requerido" },
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

    const { error } = await supabase
      .from("availability_slots")
      .delete()
      .eq("id", parseInt(id));

    if (error) {
      console.error("Error deleting slot:", error);
      return NextResponse.json(
        { error: error.message || "Error al eliminar el slot" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Error deleting slot:", error);
    return NextResponse.json(
      { error: error.message || "Error al eliminar el slot" },
      { status: 500 }
    );
  }
}


