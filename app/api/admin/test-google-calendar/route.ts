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

    // Verificar primero si las credenciales están configuradas
    const hasConfig = 
      process.env.GOOGLE_CALENDAR_CLIENT_ID &&
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
      process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;

    if (!hasConfig) {
      const missing = [];
      if (!process.env.GOOGLE_CALENDAR_CLIENT_ID) missing.push("GOOGLE_CALENDAR_CLIENT_ID");
      if (!process.env.GOOGLE_CALENDAR_CLIENT_SECRET) missing.push("GOOGLE_CALENDAR_CLIENT_SECRET");
      if (!process.env.GOOGLE_CALENDAR_REFRESH_TOKEN) missing.push("GOOGLE_CALENDAR_REFRESH_TOKEN");

      return NextResponse.json(
        {
          success: false,
          error: "Google Calendar no está configurado",
          details: `Faltan las siguientes variables de entorno: ${missing.join(", ")}`,
          missingVariables: missing,
        },
        { status: 400 }
      );
    }

    try {
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
        // Si retorna null, puede ser por varias razones
        // Los logs deberían tener más información
        return NextResponse.json(
          {
            success: false,
            error: "No se pudo crear el evento",
            details: "La función createGoogleCalendarEvent retornó null. Esto puede deberse a:",
            possibleCauses: [
              "Error 403: El refresh token no tiene permisos o la API no está habilitada",
              "Error 401: El refresh token es inválido o ha expirado",
              "Las credenciales OAuth2 no están configuradas correctamente",
              "La API de Google Calendar no está habilitada en tu proyecto de Google Cloud",
            ],
            checkLogs: true,
            nextSteps: [
              "1. Revisa los logs de Vercel para ver el error específico",
              "2. Verifica que la API de Google Calendar esté habilitada en Google Cloud Console",
              "3. Asegúrate de que el refresh token tenga el scope 'https://www.googleapis.com/auth/calendar'",
              "4. Regenera el refresh token si es necesario",
            ],
          },
          { status: 500 }
        );
      }
    } catch (error: any) {
      console.error("Error en test de Google Calendar:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Error al crear el evento",
          details: error.stack || "Error desconocido",
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

