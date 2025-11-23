import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

// Endpoint para crear/actualizar admin (solo para desarrollo inicial)
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const admin = await createOrUpdateAdmin(email, password, name);

    if (!admin) {
      return NextResponse.json(
        { error: "Error al crear/actualizar admin" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin creado/actualizado exitosamente",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error: any) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear admin" },
      { status: 500 }
    );
  }
}


