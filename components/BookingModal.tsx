"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { getAvailableSlots } from "@/lib/supabase/queries";
import type { AvailabilitySlot, Service } from "@/types/database.types";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, getDay } from "date-fns";
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSlots();
      setError(null);
      setSelectedSlot(null);
      setSelectedDate(null);
      setCurrentMonth(new Date());
      setCustomerName("");
      setCustomerEmail("");
    }
  }, [isOpen]);

  const loadSlots = async () => {
    setLoading(true);
    try {
      // Usar el endpoint API que excluye slots con bookings activos
      const response = await fetch("/api/slots/available");
      const data = await response.json();
      if (response.ok && data.slots) {
        setSlots(data.slots);
      } else {
        // Fallback a la función original si el endpoint falla
        const availableSlots = await getAvailableSlots();
        setSlots(availableSlots);
      }
    } catch (error) {
      console.error("Error loading slots:", error);
      // Fallback a la función original si hay error
      try {
        const availableSlots = await getAvailableSlots();
        setSlots(availableSlots);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !customerName || !customerEmail) return;

    setProcessing(true);
    setError(null);

    try {
      // Hacer fetch a la API en lugar de redirigir directamente
      const response = await fetch(
        `/api/checkout/create?serviceId=${service.id}&slotId=${selectedSlot}&name=${encodeURIComponent(customerName)}&email=${encodeURIComponent(customerEmail)}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Si hay error, mostrarlo y recargar slots
        setError(data.error || "Error al procesar la reserva");
        
        // Recargar slots disponibles después de un breve delay
        setTimeout(() => {
          loadSlots();
          setSelectedSlot(null);
        }, 1000);
        
        return;
      }

      // Si hay URL en la respuesta, redirigir a Stripe
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error("Error processing booking:", err);
      setError("Error de conexión. Por favor, intenta de nuevo.");
      setTimeout(() => {
        loadSlots();
        setSelectedSlot(null);
      }, 1000);
    } finally {
      setProcessing(false);
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

  const formatTimeOnly = (slot: AvailabilitySlot) => {
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const start = formatInTimeZone(parseISO(slot.start_time), userTimeZone, "HH:mm");
      const end = formatInTimeZone(parseISO(slot.end_time), userTimeZone, "HH:mm");
      return `${start} - ${end}`;
    } catch {
      const start = format(parseISO(slot.start_time), "HH:mm");
      const end = format(parseISO(slot.end_time), "HH:mm");
      return `${start} - ${end}`;
    }
  };

  // Agrupar slots por día
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, AvailabilitySlot[]> = {};
    slots.forEach((slot) => {
      try {
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const slotDate = formatInTimeZone(parseISO(slot.start_time), userTimeZone, "yyyy-MM-dd");
        if (!grouped[slotDate]) {
          grouped[slotDate] = [];
        }
        grouped[slotDate].push(slot);
      } catch {
        const slotDate = format(parseISO(slot.start_time), "yyyy-MM-dd");
        if (!grouped[slotDate]) {
          grouped[slotDate] = [];
        }
        grouped[slotDate].push(slot);
      }
    });
    return grouped;
  }, [slots]);

  // Obtener slots del día seleccionado
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const dateKey = formatInTimeZone(selectedDate, userTimeZone, "yyyy-MM-dd");
      return slotsByDate[dateKey] || [];
    } catch {
      const dateKey = format(selectedDate, "yyyy-MM-dd");
      return slotsByDate[dateKey] || [];
    }
  }, [selectedDate, slotsByDate]);

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lunes
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Obtener clave de fecha para un objeto Date
  const getDateKey = (date: Date): string => {
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return formatInTimeZone(date, userTimeZone, "yyyy-MM-dd");
    } catch {
      return format(date, "yyyy-MM-dd");
    }
  };

  // Verificar si un día tiene slots disponibles
  const hasSlotsForDate = (date: Date): boolean => {
    const dateKey = getDateKey(date);
    return !!slotsByDate[dateKey] && slotsByDate[dateKey].length > 0;
  };

  const handleDateClick = (date: Date) => {
    if (hasSlotsForDate(date)) {
      setSelectedDate(date);
      setSelectedSlot(null);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDate(null);
    setSelectedSlot(null);
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
            className="fixed top-2 sm:top-[5%] left-1 right-1 sm:left-1/2 sm:-translate-x-1/2 max-w-lg w-auto sm:w-[calc(100%-2rem)] bg-background border-terminal z-50 p-3 sm:p-5 max-h-[96vh] sm:max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-3 sticky top-0 bg-background pb-1 z-10">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider pr-2">
                Agendar: {service.title || service.name}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 border-terminal hover-terminal flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Información del servicio */}
              <div className="border-terminal p-2 sm:p-3">
                <p className="text-profit text-lg sm:text-xl font-bold mb-1">
                  ${service.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
                <p className="text-foreground/70 text-[10px] sm:text-xs">{service.description}</p>
              </div>

              {/* Selección de slot con calendario */}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Selecciona un horario
                </label>
                {loading ? (
                  <div className="text-center py-4 text-foreground/50 text-xs">
                    Cargando horarios disponibles...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-4 text-loss border border-loss p-2 text-xs">
                    No hay horarios disponibles en este momento
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Calendario */}
                    <div className="border-terminal p-2 sm:p-3">
                      {/* Header del calendario */}
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={handlePrevMonth}
                          className="p-1.5 border-terminal hover-terminal min-w-[32px] min-h-[32px] flex items-center justify-center"
                          type="button"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider px-1 text-center">
                          {format(currentMonth, "MMMM yyyy")}
                        </h3>
                        <button
                          onClick={handleNextMonth}
                          className="p-1.5 border-terminal hover-terminal min-w-[32px] min-h-[32px] flex items-center justify-center"
                          type="button"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Días de la semana */}
                      <div className="grid grid-cols-7 gap-0.5 mb-1">
                        {["L", "M", "X", "J", "V", "S", "D"].map((day, idx) => (
                          <div
                            key={idx}
                            className="text-center text-[9px] sm:text-[10px] font-semibold text-foreground/60 py-0.5"
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Días del mes */}
                      <div className="grid grid-cols-7 gap-0.5">
                        {calendarDays.map((day, idx) => {
                          const isCurrentMonth = isSameMonth(day, currentMonth);
                          const hasSlots = hasSlotsForDate(day);
                          const isSelected = selectedDate && isSameDay(day, selectedDate);
                          const isToday = isSameDay(day, new Date());

                          return (
                            <button
                              key={idx}
                              onClick={() => handleDateClick(day)}
                              disabled={!hasSlots || !isCurrentMonth}
                              className={`
                                aspect-square min-h-[36px] sm:min-h-[40px] p-0.5 text-[10px] sm:text-[11px] font-mono border transition-all
                                ${!isCurrentMonth ? "text-foreground/20 border-border/20" : ""}
                                ${hasSlots && isCurrentMonth
                                  ? "border-terminal hover-terminal cursor-pointer active:scale-95"
                                  : "border-border/30 cursor-not-allowed opacity-50"
                                }
                                ${isSelected
                                  ? "bg-profit text-background border-profit"
                                  : ""
                                }
                                ${isToday && !isSelected && isCurrentMonth
                                  ? "border-profit/50 bg-profit/10"
                                  : ""
                                }
                                ${hasSlots && isCurrentMonth && !isSelected
                                  ? "relative"
                                  : ""
                                }
                              `}
                              type="button"
                            >
                              <div className="flex flex-col items-center justify-center h-full">
                                <span className="text-[10px] sm:text-[11px]">{format(day, "d")}</span>
                                {hasSlots && isCurrentMonth && (
                                  <span className="text-[6px] sm:text-[7px] text-profit leading-none">
                                    {slotsByDate[getDateKey(day)]?.length || 0}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Horarios del día seleccionado */}
                    {selectedDate && slotsForSelectedDate.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-1.5"
                      >
                        <label className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
                          Horarios para {format(selectedDate, "EEEE, d 'de' MMMM")}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto">
                          {slotsForSelectedDate.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot.id)}
                              className={`p-2 border-terminal text-left transition-all text-[9px] sm:text-[10px] min-h-[36px] active:scale-95 ${
                                selectedSlot === slot.id
                                  ? "bg-profit text-background border-profit"
                                  : "hover-terminal"
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                                <span className="font-mono">
                                  {formatTimeOnly(slot)}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Mensaje si no hay horarios para el día seleccionado */}
                    {selectedDate && slotsForSelectedDate.length === 0 && (
                      <div className="text-center py-2 text-foreground/50 text-[10px] border border-terminal">
                        No hay horarios disponibles para este día
                      </div>
                    )}

                    {/* Mensaje si no se ha seleccionado un día */}
                    {!selectedDate && (
                      <div className="text-center py-2 text-foreground/50 text-[10px] border border-terminal">
                        Selecciona un día del calendario para ver los horarios
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="border border-loss bg-loss/10 text-loss p-2 text-[10px] sm:text-xs">
                  {error}
                </div>
              )}

              {/* Formulario de cliente */}
              {selectedSlot && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div>
                    <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full px-2.5 py-2 bg-background border-terminal text-foreground font-mono text-xs focus:outline-none focus:border-profit"
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      className="w-full px-2.5 py-2 bg-background border-terminal text-foreground font-mono text-xs focus:outline-none focus:border-profit"
                      placeholder="juan@example.com"
                    />
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={!customerName || !customerEmail || processing}
                    className="w-full py-2.5 bg-profit text-background font-semibold uppercase tracking-wider text-[10px] sm:text-xs border-terminal hover-terminal disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] active:scale-95"
                  >
                    {processing ? "Procesando..." : "Continuar al Pago"}
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

