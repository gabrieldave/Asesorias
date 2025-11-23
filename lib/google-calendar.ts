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
      console.error("Failed to get Google Calendar access token:", errorData);
      return null;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("No access token received from Google");
      return null;
    }

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

    // Crear evento en Google Calendar
    const eventResponse = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email", minutes: 24 * 60 }, // 1 día antes
              { method: "popup", minutes: 15 }, // 15 minutos antes
            ],
          },
        }),
      }
    );

    if (!eventResponse.ok) {
      const errorData = await eventResponse.json().catch(() => ({}));
      console.error("Failed to create Google Calendar event:", errorData);
      return null;
    }

    const eventData = await eventResponse.json();
    return eventData.id || null;
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
    return null;
  }
}


