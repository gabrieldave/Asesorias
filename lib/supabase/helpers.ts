import { createServerClient } from "./server";

// Helper para updates que evita problemas de tipos
export async function updateBooking(
  bookingId: number,
  data: Partial<{
    payment_status: string;
    stripe_session_id: string;
    zoom_link: string | null;
    gcal_event_id: string | null;
  }>
) {
  const supabase = createServerClient();
  // Usar cast directo para evitar problemas de tipos
  return await (supabase.from("bookings") as any)
    .update(data)
    .eq("id", bookingId);
}

export async function updateSlot(slotId: number, isBooked: boolean) {
  const supabase = createServerClient();
  return await (supabase.from("availability_slots") as any)
    .update({ is_booked: isBooked })
    .eq("id", slotId);
}

