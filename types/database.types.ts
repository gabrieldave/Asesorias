export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    }
    Views: {
      [key: string]: {
        Row: Record<string, unknown>
      }
    }
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>
        Returns: unknown
      }
    }
    Enums: {
      [key: string]: string
    }
  }
}

// Tipos específicos para la aplicación
export interface Service {
  id: number;
  name?: string;
  title: string;
  description: string;
  price: number;
  stripe_price_id?: string;
  duration?: number;
  features?: string[];
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AvailabilitySlot {
  id: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: number;
  service_id: number;
  slot_id: number;
  customer_name: string;
  customer_email: string;
  status?: string;
  payment_status?: string;
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
  zoom_meeting_id?: string;
  zoom_meeting_url?: string;
  zoom_link?: string;
  gcal_event_id?: string;
  created_at?: string;
  updated_at?: string;
}

