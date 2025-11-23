import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verificar que el usuario es admin
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json(
        { error: "No autorizado. Se requiere sesión de administrador." },
        { status: 401 }
      );
    }

    // Verificar estado de las integraciones
    const integrations = {
      googleCalendar: {
        configured: !!(
          process.env.GOOGLE_CALENDAR_CLIENT_ID &&
          process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
          process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
        ),
        missing: [] as string[],
      },
      zoom: {
        configured: !!(
          process.env.ZOOM_CLIENT_ID &&
          process.env.ZOOM_CLIENT_SECRET &&
          process.env.ZOOM_ACCOUNT_ID
        ),
        missing: [] as string[],
      },
      resend: {
        configured: !!process.env.RESEND_API_KEY,
        missing: [] as string[],
      },
    };

    // Detectar qué variables faltan
    if (!integrations.googleCalendar.configured) {
      if (!process.env.GOOGLE_CALENDAR_CLIENT_ID) integrations.googleCalendar.missing.push("GOOGLE_CALENDAR_CLIENT_ID");
      if (!process.env.GOOGLE_CALENDAR_CLIENT_SECRET) integrations.googleCalendar.missing.push("GOOGLE_CALENDAR_CLIENT_SECRET");
      if (!process.env.GOOGLE_CALENDAR_REFRESH_TOKEN) integrations.googleCalendar.missing.push("GOOGLE_CALENDAR_REFRESH_TOKEN");
    }

    if (!integrations.zoom.configured) {
      if (!process.env.ZOOM_CLIENT_ID) integrations.zoom.missing.push("ZOOM_CLIENT_ID");
      if (!process.env.ZOOM_CLIENT_SECRET) integrations.zoom.missing.push("ZOOM_CLIENT_SECRET");
      if (!process.env.ZOOM_ACCOUNT_ID) integrations.zoom.missing.push("ZOOM_ACCOUNT_ID");
    }

    if (!integrations.resend.configured) {
      integrations.resend.missing.push("RESEND_API_KEY");
    }

    return NextResponse.json({
      integrations,
      notificationsEmail: "todossomostr4ders@gmail.com", // Email donde llegan las notificaciones de reservas
      adminEmail: process.env.ADMIN_EMAIL || null, // Email del admin (para otras funciones)
    });
  } catch (error: any) {
    console.error("Error getting integrations status:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener el estado de las integraciones" },
      { status: 500 }
    );
  }
}

