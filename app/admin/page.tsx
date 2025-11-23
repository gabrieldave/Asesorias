"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { LogOut, Calendar, DollarSign, Users, Plus, Trash2, Edit2 } from "lucide-react";
import type { Service, AvailabilitySlot, Booking } from "@/types/database.types";
import { getActiveServices } from "@/lib/supabase/queries";
import ServiceForm from "@/components/ServiceForm";
import SlotForm from "@/components/SlotForm";
import { formatInMexico } from "@/lib/utils/timezone";
import { parseISO } from "date-fns";

export default function AdminDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"services" | "slots" | "bookings">("services");
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [isSlotFormOpen, setIsSlotFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesData, slotsData, bookingsData] = await Promise.all([
        (supabase.from("services") as any).select("*").order("created_at", { ascending: false }),
        (supabase.from("availability_slots") as any)
          .select("*")
          .order("start_time", { ascending: true }),
        (supabase.from("bookings") as any)
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (servicesData.data) setServices(servicesData.data);
      if (slotsData.data) setSlots(slotsData.data);
      if (bookingsData.data) {
        setBookings(bookingsData.data);
        
        // Actualizar is_booked en slots basado en bookings activos
        if (slotsData.data) {
          const activeBookings = bookingsData.data.filter((b: Booking) => 
            b.payment_status === "pending" || b.payment_status === "paid"
          );
          const bookedSlotIds = new Set(activeBookings.map((b: Booking) => b.slot_id));
          
          const updatedSlots = slotsData.data.map((slot: AvailabilitySlot) => ({
            ...slot,
            is_booked: bookedSlotIds.has(slot.id)
          }));
          
          setSlots(updatedSlots);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      router.push("/login");
    }
  };

  const handleDeleteSlot = async (id: number, force: boolean = false) => {
    const message = force 
      ? "¿Estás seguro de eliminar este slot? Esto eliminará TODAS las reservas asociadas (incluyendo pendientes y pagadas)."
      : "¿Estás seguro de eliminar este slot?";
    
    if (!confirm(message)) return;

    try {
      const url = force 
        ? `/api/admin/slots/delete?id=${id}&force=true`
        : `/api/admin/slots/delete?id=${id}`;
      
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include", // Asegurar que se envíen las cookies
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error response:", response.status, data);
        alert(`Error al eliminar el slot (${response.status}): ${data.error || "Error desconocido"}`);
        return;
      }

      if (data.success) {
        loadData();
      } else {
        alert("Error al eliminar el slot: " + (data.error || "Error desconocido"));
      }
    } catch (error: any) {
      console.error("Error deleting slot:", error);
      alert("Error al eliminar el slot: " + (error.message || "Error de conexión"));
    }
  };

  const handleDeleteBooking = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta reserva?")) return;

    try {
      const response = await fetch(`/api/admin/bookings/delete?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error response:", response.status, data);
        alert(`Error al eliminar la reserva (${response.status}): ${data.error || "Error desconocido"}`);
        return;
      }

      if (data.success) {
        loadData();
      } else {
        alert("Error al eliminar la reserva: " + (data.error || "Error desconocido"));
      }
    } catch (error: any) {
      console.error("Error deleting booking:", error);
      alert("Error al eliminar la reserva: " + (error.message || "Error de conexión"));
    }
  };

  const handleDeleteAllBookings = async () => {
    if (!confirm("⚠️ ADVERTENCIA: ¿Estás seguro de eliminar TODAS las reservas? Esta acción no se puede deshacer.")) return;

    try {
      const response = await fetch("/api/admin/bookings/delete-all", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error response:", response.status, data);
        alert(`Error al eliminar las reservas (${response.status}): ${data.error || "Error desconocido"}`);
        return;
      }

      if (data.success) {
        alert(`✅ ${data.message || `${data.count} reserva(s) eliminada(s)`}`);
        loadData();
      } else {
        alert("Error al eliminar las reservas: " + (data.error || "Error desconocido"));
      }
    } catch (error: any) {
      console.error("Error deleting all bookings:", error);
      alert("Error al eliminar las reservas: " + (error.message || "Error de conexión"));
    }
  };

  const handleDeleteAllSlots = async () => {
    if (!confirm("⚠️ ADVERTENCIA: ¿Estás seguro de eliminar TODOS los slots? Esto también eliminará todas las reservas asociadas. Esta acción no se puede deshacer.")) return;

    try {
      const response = await fetch("/api/admin/slots/delete-all", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error response:", response.status, data);
        alert(`Error al eliminar los slots (${response.status}): ${data.error || "Error desconocido"}`);
        return;
      }

      if (data.success) {
        alert(`✅ ${data.message || `${data.count} slot(s) eliminado(s)`}`);
        loadData();
      } else {
        alert("Error al eliminar los slots: " + (data.error || "Error desconocido"));
      }
    } catch (error: any) {
      console.error("Error deleting all slots:", error);
      alert("Error al eliminar los slots: " + (error.message || "Error de conexión"));
    }
  };

  const handleCreateSlot = () => {
    setIsSlotFormOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsServiceFormOpen(true);
  };

  const handleCreateService = () => {
    setEditingService(null);
    setIsServiceFormOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-terminal text-profit">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-border pb-4">
          <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-wider mb-4 sm:mb-0">
            Admin <span className="text-profit">Dashboard</span>
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border-terminal hover-terminal text-loss"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase">Salir</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          {[
            { id: "services", label: "Servicios", icon: DollarSign },
            { id: "slots", label: "Slots", icon: Calendar },
            { id: "bookings", label: "Reservas", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-profit text-profit"
                    : "border-transparent text-foreground/50 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-semibold uppercase text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="mt-8">
          {activeTab === "services" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold uppercase">Servicios</h2>
                <button
                  onClick={handleCreateService}
                  className="flex items-center gap-2 px-4 py-2 bg-profit text-background border-terminal hover-terminal"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-semibold uppercase">Nuevo Servicio</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="border-terminal p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{service.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 ${
                          service.active
                            ? "bg-profit/20 text-profit border border-profit"
                            : "bg-loss/20 text-loss border border-loss"
                        }`}
                      >
                        {service.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <p className="text-profit text-2xl font-bold mb-2">
                      ${service.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </p>
                    <p className="text-foreground/70 text-sm mb-4">{service.description}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditService(service)}
                        className="flex-1 px-3 py-2 border-terminal hover-terminal text-sm"
                      >
                        <Edit2 className="w-4 h-4 inline mr-2" />
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "slots" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold uppercase">Slots de Disponibilidad</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateSlot}
                    className="flex items-center gap-2 px-4 py-2 bg-profit text-background border-terminal hover-terminal"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-semibold uppercase">Nuevo Slot</span>
                  </button>
                  {slots.length > 0 && (
                    <button
                      onClick={handleDeleteAllSlots}
                      className="flex items-center gap-2 px-4 py-2 border-terminal hover-terminal text-loss bg-loss/10"
                      title="Eliminar todos los slots y sus reservas"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-semibold uppercase">Eliminar Todos</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`border-terminal p-4 ${
                      slot.is_booked ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-mono text-sm">
                          {formatInMexico(slot.start_time, "dd/MM/yyyy, h:mm:ss a")}
                        </p>
                        <p className="font-mono text-xs text-foreground/50">
                          {formatInMexico(slot.end_time, "dd/MM/yyyy, h:mm:ss a")}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 ${
                          slot.is_booked
                            ? "bg-loss/20 text-loss border border-loss"
                            : "bg-profit/20 text-profit border border-profit"
                        }`}
                      >
                        {slot.is_booked ? "Reservado" : "Disponible"}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      {!slot.is_booked ? (
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="px-3 py-1 border-terminal hover-terminal text-loss text-xs"
                        >
                          <Trash2 className="w-3 h-3 inline mr-1" />
                          Eliminar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeleteSlot(slot.id, true)}
                          className="px-3 py-1 border-terminal hover-terminal text-loss text-xs bg-loss/10"
                          title="Eliminar slot y todas sus reservas"
                        >
                          <Trash2 className="w-3 h-3 inline mr-1" />
                          Eliminar Forzado
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold uppercase">Reservas</h2>
                {bookings.length > 0 && (
                  <button
                    onClick={handleDeleteAllBookings}
                    className="flex items-center gap-2 px-4 py-2 border-terminal hover-terminal text-loss bg-loss/10"
                    title="Eliminar todas las reservas"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-semibold uppercase">Eliminar Todas</span>
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border-terminal p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="font-bold">{booking.customer_name}</p>
                        <p className="text-sm text-foreground/70">{booking.customer_email}</p>
                        <p className="text-xs text-foreground/50 font-mono mt-1">
                          {booking.created_at ? new Date(booking.created_at).toLocaleString("es-CL") : "N/A"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`text-xs px-2 py-1 ${
                            booking.payment_status === "paid"
                              ? "bg-profit/20 text-profit border border-profit"
                              : booking.payment_status === "pending"
                              ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500"
                              : "bg-loss/20 text-loss border border-loss"
                          }`}
                        >
                          {booking.payment_status === "paid"
                            ? "Pagado"
                            : booking.payment_status === "pending"
                            ? "Pendiente"
                            : "Fallido"}
                        </span>
                        {booking.zoom_link && (
                          <a
                            href={booking.zoom_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-profit hover:underline"
                          >
                            Link Zoom
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="mt-2 px-3 py-1 border-terminal hover-terminal text-loss text-xs"
                        >
                          <Trash2 className="w-3 h-3 inline mr-1" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service Form Modal */}
      <ServiceForm
        service={editingService}
        isOpen={isServiceFormOpen}
        onClose={() => {
          setIsServiceFormOpen(false);
          setEditingService(null);
        }}
        onSave={loadData}
      />

      {/* Slot Form Modal */}
      <SlotForm
        isOpen={isSlotFormOpen}
        onClose={() => setIsSlotFormOpen(false)}
        onSave={loadData}
      />
    </div>
  );
}

