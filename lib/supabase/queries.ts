import { supabase } from "./client";
import type { Service, AvailabilitySlot, Booking } from "@/types/database.types";

// Obtener todos los servicios activos
export async function getActiveServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("price", { ascending: true });

  if (error) {
    console.error("Error fetching services:", error);
    return [];
  }

  return data || [];
}

// Obtener un servicio por ID
export async function getServiceById(id: number): Promise<Service | null> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .single();

  if (error) {
    console.error("Error fetching service:", error);
    return null;
  }

  return data;
}

// Obtener slots disponibles
export async function getAvailableSlots(): Promise<AvailabilitySlot[]> {
  const { data, error } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("is_booked", false)
    .gt("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching available slots:", error);
    return [];
  }

  return data || [];
}

// Contar slots disponibles para un servicio
export async function countAvailableSlots(): Promise<number> {
  const { count, error } = await supabase
    .from("availability_slots")
    .select("id", { count: "exact", head: true })
    .eq("is_booked", false)
    .gt("start_time", new Date().toISOString());

  if (error) {
    console.error("Error counting available slots:", error);
    return 0;
  }

  return count || 0;
}

// Crear una reserva
export async function createBooking(
  booking: Partial<Omit<Booking, "id" | "created_at">> & {
    customer_email: string;
    customer_name: string;
    service_id: number;
    slot_id: number;
  }
): Promise<Booking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      ...booking,
      stripe_session_id: booking.stripe_session_id || null,
      payment_status: booking.payment_status || "pending",
      zoom_link: booking.zoom_link || null,
      gcal_event_id: booking.gcal_event_id || null,
    } as any)
    .select()
    .single();

  if (error) {
    console.error("Error creating booking:", error);
    return null;
  }

  return data;
}

