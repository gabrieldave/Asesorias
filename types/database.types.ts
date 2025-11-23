// Tipos de base de datos generados desde Supabase

export type Service = {
  id: number;
  title: string;
  price: number;
  description: string;
  features: string[];
  image_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type AvailabilitySlot = {
  id: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at: string;
};

export type Booking = {
  id: number;
  created_at: string;
  customer_email: string;
  customer_name: string;
  service_id: number;
  slot_id: number;
  stripe_session_id: string | null;
  payment_status: "pending" | "paid" | "failed";
  zoom_link: string | null;
  gcal_event_id: string | null;
};

export type AdminUser = {
  id: number;
  email: string;
  password_hash: string;
  name: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
};

// Tipo Database para Supabase
export type Database = {
  public: {
    Tables: {
      services: {
        Row: Service;
        Insert: Omit<Service, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Service, "id" | "created_at" | "updated_at">>;
      };
      availability_slots: {
        Row: AvailabilitySlot;
        Insert: Omit<AvailabilitySlot, "id" | "created_at">;
        Update: Partial<Omit<AvailabilitySlot, "id" | "created_at">>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, "id" | "created_at">;
        Update: Partial<Omit<Booking, "id" | "created_at">>;
      };
      admin_users: {
        Row: AdminUser;
        Insert: Omit<AdminUser, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<AdminUser, "id" | "created_at" | "updated_at">>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

