import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { createGoogleCalendarEvent } from "@/lib/google-calendar";

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

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido para la prueba" },
        { status: 400 }
      );
    }

    // Crear un evento de prueba (1 hora desde ahora)
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    console.log("🧪 Probando creación de evento en Google Calendar...");
    console.log("📅 Inicio:", startTime.toISOString());
    console.log("📅 Fin:", endTime.toISOString());
    console.log("👤 Email del attendee:", email);

    const eventId = await createGoogleCalendarEvent(
      "Prueba de Evento - Sistema de Asesorías",
      "Este es un evento de prueba para verificar la integración con Google Calendar",
      startTime,
      endTime,
      email,
      "Usuario de Prueba",
      null
    );

    if (eventId) {
      return NextResponse.json({
        success: true,
        message: "Evento de prueba creado exitosamente",
        eventId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo crear el evento. Revisa los logs para más detalles.",
          checkLogs: true,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error en test de Google Calendar:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al probar Google Calendar",
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

