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
        timezone: "America/Santiago",
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

