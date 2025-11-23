// Integración con Zoom API usando OAuth 2.0 Server-to-Server
// Requiere: ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET

interface ZoomMeetingResponse {
  join_url: string;
  start_url: string;
  id: string;
  password?: string;
}

/**
 * Obtiene un access token de Zoom usando OAuth 2.0 Server-to-Server
 */
async function getZoomAccessToken(): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error("Zoom credentials not configured");
  }

  // Codificar credenciales en base64
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Zoom OAuth failed: ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error: any) {
    console.error("Error getting Zoom access token:", error);
    throw new Error(`Failed to get Zoom access token: ${error.message}`);
  }
}

/**
 * Crea una reunión de Zoom programada
 * @param topic Título de la reunión
 * @param startTime Fecha y hora de inicio
 * @param duration Duración en minutos
 * @param attendeeEmail Email del asistente (opcional)
 * @returns URL de unión a la reunión o null si falla
 */
export async function createZoomMeeting(
  topic: string,
  startTime: Date,
  duration: number,
  attendeeEmail?: string
): Promise<string | null> {
  try {
    const accessToken = await getZoomAccessToken();

    // Formatear fecha para Zoom (debe ser ISO 8601)
    const startTimeISO = startTime.toISOString().replace(/\.\d{3}Z$/, "Z");

    const meetingData = {
      topic: topic || "Mentoría de Trading",
      type: 2, // Scheduled meeting
      start_time: startTimeISO,
      duration: duration, // en minutos
      timezone: "America/Santiago",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: false,
        waiting_room: false,
        approval_type: 0, // Automatically approve
        audio: "both", // Both telephony and VoIP
        auto_recording: "none", // No auto recording
      },
    };

    // Si hay email del asistente, agregarlo como participante
    if (attendeeEmail) {
      meetingData.settings.alternative_hosts = attendeeEmail;
    }

    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meetingData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Zoom API error:", errorText);
      throw new Error(`Failed to create Zoom meeting: ${errorText}`);
    }

    const data: ZoomMeetingResponse = await response.json();

    if (!data.join_url) {
      throw new Error("Zoom meeting created but no join URL returned");
    }

    console.log("Zoom meeting created successfully:", data.id);
    return data.join_url;
  } catch (error: any) {
    console.error("Error creating Zoom meeting:", error);
    return null;
  }
}

