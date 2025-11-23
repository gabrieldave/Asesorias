import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Verificar que el usuario es admin
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json(
        { error: "No autorizado. Se requiere sesión de administrador." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, title, price, description, features, active } = body;

    if (!title || price === undefined) {
      return NextResponse.json(
        { error: "Título y precio son requeridos" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Procesar features si es un array o string
    const featuresArray = Array.isArray(features)
      ? features
      : typeof features === "string"
      ? features
          .split("\n")
          .map((f: string) => f.trim())
          .filter((f: string) => f.length > 0)
      : [];

    if (id) {
      // Actualizar servicio existente
      const { data, error } = await (supabase.from("services") as any)
        .update({
          title,
          price: parseFloat(price),
          description: description || "",
          features: featuresArray,
          active: active !== undefined ? active : true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating service:", error);
        return NextResponse.json(
          {
            error: "Error al actualizar el servicio",
            details: error.message || error.code || "Error desconocido",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        service: data,
      });
    } else {
      // Crear nuevo servicio
      const { data, error } = await (supabase.from("services") as any)
        .insert({
          title,
          price: parseFloat(price),
          description: description || "",
          features: featuresArray,
          active: active !== undefined ? active : true,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating service:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        return NextResponse.json(
          {
            error: "Error al crear el servicio",
            details: error.message || error.code || "Error desconocido",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        service: data,
      });
    }
  } catch (error: any) {
    console.error("Error in service endpoint:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar el servicio" },
      { status: 500 }
    );
  }
}

