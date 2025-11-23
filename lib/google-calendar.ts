/**
 * Google Calendar API integration
 * Creates calendar events for bookings
 */

export async function createGoogleCalendarEvent(
  title: string,
  description: string,
  startTime: Date,
  endTime: Date,
  attendeeEmail: string,
  attendeeName: string,
  zoomLink?: string | null
): Promise<string | null> {
  try {
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      console.log("Google Calendar credentials not configured");
      return null;
    }

    // Obtener access token usando refresh token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error("❌ Error obteniendo access token de Google Calendar:", errorData);
      console.error("Status:", tokenResponse.status, tokenResponse.statusText);
      return null;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("❌ No access token received from Google");
      console.error("Token response:", tokenData);
      return null;
    }

    console.log("✅ Access token obtenido exitosamente");

    // Formatear fechas en formato RFC3339 para Google Calendar
    const formatDate = (date: Date): string => {
      return date.toISOString();
    };

    // Construir descripción del evento
    let eventDescription = description;
    if (zoomLink) {
      eventDescription += `\n\nLink de Zoom: ${zoomLink}`;
    }
    eventDescription += `\n\nCliente: ${attendeeName} (${attendeeEmail})`;

    // Preparar datos del evento
    const eventPayload = {
      summary: title,
      description: eventDescription,
      start: {
        dateTime: formatDate(startTime),
        timeZone: "America/Mexico_City",
      },
      end: {
        dateTime: formatDate(endTime),
        timeZone: "America/Mexico_City",
      },
      attendees: [
        {
          email: attendeeEmail,
          displayName: attendeeName,
        },
      ],
      sendUpdates: "all", // Enviar invitaciones a todos los attendees
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 día antes
          { method: "popup", minutes: 15 }, // 15 minutos antes
        ],
      },
    };

    console.log("📅 Creando evento con datos:", {
      title: eventPayload.summary,
      start: eventPayload.start.dateTime,
      end: eventPayload.end.dateTime,
      attendees: eventPayload.attendees.map(a => a.email),
    });

    // Crear evento en Google Calendar
    const eventResponse = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      }
    );

    if (!eventResponse.ok) {
      const errorData = await eventResponse.json().catch(() => ({}));
      console.error("❌ Error creando evento en Google Calendar:", errorData);
      console.error("Status:", eventResponse.status, eventResponse.statusText);
      return null;
    }

    const eventData = await eventResponse.json();
    console.log("✅ Evento creado en Google Calendar exitosamente!");
    console.log("📅 Event ID:", eventData.id);
    console.log("📅 Título:", eventData.summary);
    console.log("🕐 Inicio:", eventData.start?.dateTime);
    console.log("🕐 Fin:", eventData.end?.dateTime);
    console.log("👥 Attendees:", eventData.attendees?.map((a: any) => `${a.email} (${a.responseStatus || 'pending'})`).join(', '));
    console.log("🔗 Link del evento:", eventData.htmlLink);
    
    // Verificar que el evento tenga el link
    if (eventData.htmlLink) {
      console.log("✅ Link del evento disponible:", eventData.htmlLink);
    }
    
    return eventData.id || null;
  } catch (error: any) {
    console.error("❌ Error inesperado creando evento en Google Calendar:", error);
    console.error("Stack:", error.stack);
    return null;
  }
}


