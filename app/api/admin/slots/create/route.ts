import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { start_time, end_time, service_id } = await request.json();

    if (!start_time || !end_time) {
      return NextResponse.json(
        { error: "start_time y end_time son requeridos" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    const { data, error } = await (supabase.from("availability_slots") as any)
      .insert({
        start_time,
        end_time,
        service_id: service_id || null,
        is_available: true,
        is_booked: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating slot:", error);
      return NextResponse.json(
        { error: "Error al crear el slot" },
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
