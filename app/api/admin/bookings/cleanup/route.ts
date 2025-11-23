import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Limpiar bookings antiguos o cancelados
    const { error } = await (supabase.from("bookings") as any)
      .delete()
      .eq("payment_status", "failed")
      .lt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 30 días

    if (error) {
      console.error("Error cleaning up bookings:", error);
      return NextResponse.json(
        { error: "Error al limpiar bookings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bookings limpiados exitosamente",
    });
  } catch (error: any) {
    console.error("Error in cleanup:", error);
    return NextResponse.json(
      { error: error.message || "Error al limpiar" },
      { status: 500 }
    );
  }
}
