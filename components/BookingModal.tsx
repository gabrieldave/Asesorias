"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock } from "lucide-react";
import { getAvailableSlots } from "@/lib/supabase/queries";
import type { AvailabilitySlot, Service } from "@/types/database.types";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

interface BookingModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (slotId: number, customerName: string, customerEmail: string) => void;
}

export default function BookingModal({
  service,
  isOpen,
  onClose,
  onConfirm,
}: BookingModalProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSlots();
    }
  }, [isOpen]);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const availableSlots = await getAvailableSlots();
      setSlots(availableSlots);
    } catch (error) {
      console.error("Error loading slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedSlot && customerName && customerEmail) {
      onConfirm(selectedSlot, customerName, customerEmail);
    }
  };

  const formatSlotTime = (slot: AvailabilitySlot) => {
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const start = formatInTimeZone(parseISO(slot.start_time), userTimeZone, "PPp");
      const end = formatInTimeZone(parseISO(slot.end_time), userTimeZone, "HH:mm");
      return `${start} - ${end}`;
    } catch {
      return `${format(parseISO(slot.start_time), "PPp")}`;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-2xl w-full bg-background border-terminal z-50 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold uppercase tracking-wider">
                Agendar: {service.title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 border-terminal hover-terminal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Información del servicio */}
              <div className="border-terminal p-4">
                <p className="text-profit text-2xl font-bold mb-2">
                  ${service.price.toLocaleString("es-CL")} CLP
                </p>
                <p className="text-foreground/70 text-sm">{service.description}</p>
              </div>

              {/* Selección de slot */}
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Selecciona un horario
                </label>
                {loading ? (
                  <div className="text-center py-8 text-foreground/50">
                    Cargando horarios disponibles...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-8 text-loss border border-loss p-4">
                    No hay horarios disponibles en este momento
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`p-3 border-terminal text-left transition-all ${
                          selectedSlot === slot.id
                            ? "bg-profit text-background border-profit"
                            : "hover-terminal"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-mono">
                            {formatSlotTime(slot)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Formulario de cliente */}
              {selectedSlot && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-background border-terminal text-foreground font-mono focus:outline-none focus:border-profit"
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-background border-terminal text-foreground font-mono focus:outline-none focus:border-profit"
                      placeholder="juan@example.com"
                    />
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={!customerName || !customerEmail}
                    className="w-full py-3 bg-profit text-background font-semibold uppercase tracking-wider text-sm border-terminal hover-terminal disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar al Pago
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

