/**
 * Zoom API integration
 * Creates Zoom meetings for bookings
 */

export async function createZoomMeeting(
  topic: string,
  startTime: Date,
  duration: number,
  attendeeEmail?: string
): Promise<string | null> {
  try {
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;
    const accountId = process.env.ZOOM_ACCOUNT_ID;

    if (!clientId || !clientSecret || !accountId) {
      console.log("Zoom credentials not configured");
      return null;
    }

    // Obtener access token
    const tokenResponse = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      console.error("Failed to get Zoom access token");
      return null;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Crear meeting
    const meetingResponse = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        type: 2, // Scheduled meeting
        start_time: startTime.toISOString(),
        duration,
        timezone: "America/Mexico_City",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: false,
          waiting_room: false,
        },
      }),
    });

    if (!meetingResponse.ok) {
      const errorData = await meetingResponse.json();
      console.error("Failed to create Zoom meeting:", errorData);
      return null;
    }

    const meetingData = await meetingResponse.json();
    return meetingData.join_url || null;
  } catch (error) {
    console.error("Error creating Zoom meeting:", error);
    return null;
  }
}

/**
 * Elimina una reunión de Zoom
 * Extrae el meeting ID del zoom_link o lo recibe directamente
 */
export async function deleteZoomMeeting(zoomLinkOrMeetingId: string): Promise<boolean> {
  try {
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;
    const accountId = process.env.ZOOM_ACCOUNT_ID;

    if (!clientId || !clientSecret || !accountId) {
      console.log("⚠️ Zoom credentials not configured, no se puede eliminar la reunión");
      return false;
    }

    if (!zoomLinkOrMeetingId) {
      console.log("⚠️ No hay zoom link o meeting ID para eliminar");
      return false;
    }

    // Extraer meeting ID del zoom_link si es una URL
    let meetingId: string;
    if (zoomLinkOrMeetingId.startsWith("http")) {
      // Es una URL, extraer el meeting ID
      // Formato: https://us06web.zoom.us/j/MEETING_ID?pwd=...
      const match = zoomLinkOrMeetingId.match(/\/j\/([^/?]+)/);
      if (!match || !match[1]) {
        console.error("❌ No se pudo extraer el meeting ID del zoom link:", zoomLinkOrMeetingId);
        return false;
      }
      meetingId = match[1];
    } else {
      // Ya es un meeting ID
      meetingId = zoomLinkOrMeetingId;
    }

    // Obtener access token
    const tokenResponse = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      console.error("❌ Error obteniendo access token de Zoom para eliminar reunión");
      return false;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Eliminar meeting
    const deleteResponse = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (deleteResponse.ok || deleteResponse.status === 404) {
      // 404 significa que la reunión ya no existe, lo consideramos éxito
      console.log("✅ Reunión de Zoom eliminada:", meetingId);
      return true;
    } else {
      const errorData = await deleteResponse.json().catch(() => ({}));
      console.error("❌ Error eliminando reunión de Zoom:", errorData);
      console.error("Status:", deleteResponse.status, deleteResponse.statusText);
      return false;
    }
  } catch (error: any) {
    console.error("❌ Error inesperado eliminando reunión de Zoom:", error);
    return false;
  }
}
