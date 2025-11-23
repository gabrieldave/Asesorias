"use client";

import { useState } from "react";
import { X, Clock, Calendar, Repeat } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface SlotFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

type ModeType = "single" | "recurring";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Lunes", short: "Lun" },
  { value: 2, label: "Martes", short: "Mar" },
  { value: 3, label: "Miércoles", short: "Mié" },
  { value: 4, label: "Jueves", short: "Jue" },
  { value: 5, label: "Viernes", short: "Vie" },
  { value: 6, label: "Sábado", short: "Sáb" },
];

export default function SlotForm({ isOpen, onClose, onSave }: SlotFormProps) {
  const [mode, setMode] = useState<ModeType>("single");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [duration, setDuration] = useState<number>(60);
  const [loading, setLoading] = useState(false);
  
  // Modo recurrente
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startRange, setStartRange] = useState<Date | null>(new Date());
  const [endRange, setEndRange] = useState<Date | null>(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  });
  const [startTime, setStartTime] = useState<string>("08:00");
  const [endTime, setEndTime] = useState<string>("14:00");

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      let response;
      
      if (mode === "single") {
        if (!startDate) {
          alert("Por favor selecciona una fecha y hora");
          setLoading(false);
          return;
        }

        const endDate = new Date(startDate.getTime() + duration * 60000);

        response = await fetch("/api/admin/slots/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
          }),
        });
      } else {
        // Modo recurrente
        if (selectedDays.length === 0) {
          alert("Por favor selecciona al menos un día de la semana");
          setLoading(false);
          return;
        }

        if (!startRange || !endRange) {
          alert("Por favor selecciona el rango de fechas");
          setLoading(false);
          return;
        }

        if (startRange >= endRange) {
          alert("La fecha de inicio debe ser anterior a la fecha de fin");
          setLoading(false);
          return;
        }

        const [startHour, startMin] = startTime.split(":").map(Number);
        const [endHour, endMin] = endTime.split(":").map(Number);

        response = await fetch("/api/admin/slots/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: "recurring",
            selectedDays,
            startRange: startRange.toISOString(),
            endRange: endRange.toISOString(),
            startTime: `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`,
            endTime: `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`,
            duration,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el slot");
      }

      if (data.success) {
        const count = data.count || 1;
        alert(`✅ ${count} slot(s) creado(s) exitosamente`);
        onSave();
        onClose();
        // Reset form
        setStartDate(new Date());
        setDuration(60);
        setSelectedDays([]);
        setMode("single");
      }
    } catch (error: any) {
      console.error("Error saving slot:", error);
      alert("Error al crear el slot: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Estilos personalizados para react-datepicker con tema Terminal Bloomberg
  const datePickerStyles = {
    backgroundColor: "#0a0a0a",
    color: "#e5e5e5",
    border: "1px solid #333333",
    fontFamily: "monospace",
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-background border-terminal w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold uppercase">Nuevo Slot de Disponibilidad</h2>
          <button onClick={onClose} className="p-2 border-terminal hover-terminal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selector de modo */}
          <div>
            <label className="block text-sm font-semibold uppercase mb-3">
              Modo de Creación
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`flex-1 px-4 py-2 border-terminal font-mono text-sm transition-all ${
                  mode === "single"
                    ? "bg-profit text-background border-profit"
                    : "hover-terminal"
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Slot Único
              </button>
              <button
                type="button"
                onClick={() => setMode("recurring")}
                className={`flex-1 px-4 py-2 border-terminal font-mono text-sm transition-all ${
                  mode === "recurring"
                    ? "bg-profit text-background border-profit"
                    : "hover-terminal"
                }`}
              >
                <Repeat className="w-4 h-4 inline mr-2" />
                Recurrente
              </button>
            </div>
          </div>

          {mode === "single" ? (
            <>
              <div>
                <label className="block text-sm font-semibold uppercase mb-3">
                  Fecha y Hora de Inicio
                </label>
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                minDate={new Date()}
                className="w-full px-4 py-3 bg-background border-terminal text-foreground font-mono focus:outline-none focus:border-profit"
                wrapperClassName="w-full"
                placeholderText="Selecciona fecha y hora"
                required
              />
              <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50 pointer-events-none" />
            </div>
            {startDate && (
              <p className="mt-2 text-xs text-foreground/50 font-mono">
                Seleccionado: {startDate.toLocaleString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold uppercase mb-3">
              Duración (minutos)
            </label>
            <div className="flex gap-2">
              {[30, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDuration(mins)}
                  className={`flex-1 px-4 py-2 border-terminal font-mono text-sm transition-all ${
                    duration === mins
                      ? "bg-profit text-background border-profit"
                      : "hover-terminal"
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
              min="15"
              step="15"
              className="w-full mt-3 px-4 py-2 bg-background border-terminal text-foreground font-mono focus:outline-none focus:border-profit"
              placeholder="O ingresa duración personalizada"
            />
          </div>

          {startDate && (
            <div className="p-4 border-terminal bg-background/50">
              <p className="text-sm text-foreground/70 mb-1">Resumen del slot:</p>
              <p className="font-mono text-sm text-profit">
                Inicio: {startDate.toLocaleString("es-CL")}
              </p>
              <p className="font-mono text-sm text-profit">
                Fin: {new Date(startDate.getTime() + duration * 60000).toLocaleString("es-CL")}
              </p>
              <p className="font-mono text-xs text-foreground/50 mt-2">
                Duración: {duration} minutos
              </p>
            </div>
          )}
            </>
          ) : (
            <>
              {/* Días de la semana */}
              <div>
                <label className="block text-sm font-semibold uppercase mb-3">
                  Días de la Semana
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-3 py-2 border-terminal font-mono text-xs transition-all ${
                        selectedDays.includes(day.value)
                          ? "bg-profit text-background border-profit"
                          : "hover-terminal"
                      }`}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rango de fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold uppercase mb-3">
                    Fecha de Inicio
                  </label>
                  <DatePicker
                    selected={startRange}
                    onChange={(date) => setStartRange(date)}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                    className="w-full px-4 py-3 bg-background border-terminal text-foreground font-mono focus:outline-none focus:border-profit"
                    wrapperClassName="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold uppercase mb-3">
                    Fecha de Fin
                  </label>
                  <DatePicker
                    selected={endRange}
                    onChange={(date) => setEndRange(date)}
                    dateFormat="dd/MM/yyyy"
                    minDate={startRange || new Date()}
                    className="w-full px-4 py-3 bg-background border-terminal text-foreground font-mono focus:outline-none focus:border-profit"
                    wrapperClassName="w-full"
                    required
                  />
                </div>
              </div>

              {/* Horario */}
              <div>
                <label className="block text-sm font-semibold uppercase mb-3">
                  Horario (Formato 24 horas)
                </label>
                <p className="text-xs text-foreground/50 mb-3">
                  Usa formato 24 horas: 09:00 = 9 AM, 14:00 = 2 PM, 20:00 = 8 PM
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase mb-2 text-foreground/70">
                      Hora de Inicio
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-3 bg-background border-terminal text-foreground font-mono focus:outline-none focus:border-profit"
                      required
                    />
                    {startTime && (
                      <p className="text-xs text-foreground/50 mt-1 font-mono">
                        {(() => {
                          const [h, m] = startTime.split(":").map(Number);
                          const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                          const ampm = h < 12 ? "AM" : "PM";
                          return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
                        })()}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase mb-2 text-foreground/70">
                      Hora de Fin
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-3 bg-background border-terminal text-foreground font-mono focus:outline-none focus:border-profit"
                      required
                    />
                    {endTime && (
                      <p className="text-xs text-foreground/50 mt-1 font-mono">
                        {(() => {
                          const [h, m] = endTime.split(":").map(Number);
                          const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                          const ampm = h < 12 ? "AM" : "PM";
                          return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
                        })()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Duración */}
              <div>
                <label className="block text-sm font-semibold uppercase mb-3">
                  Duración (minutos)
                </label>
                <div className="flex gap-2">
                  {[30, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDuration(mins)}
                      className={`flex-1 px-4 py-2 border-terminal font-mono text-sm transition-all ${
                        duration === mins
                          ? "bg-profit text-background border-profit"
                          : "hover-terminal"
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                  min="15"
                  step="15"
                  className="w-full mt-3 px-4 py-2 bg-background border-terminal text-foreground font-mono focus:outline-none focus:border-profit"
                  placeholder="O ingresa duración personalizada"
                />
              </div>

              {/* Resumen recurrente */}
              {startRange && endRange && selectedDays.length > 0 && (
                <div className="p-4 border-terminal bg-background/50">
                  <p className="text-sm text-foreground/70 mb-2">Resumen de slots recurrentes:</p>
                  <p className="font-mono text-sm text-profit">
                    Días: {selectedDays.map(d => DAYS_OF_WEEK[d].label).join(", ")}
                  </p>
                  <p className="font-mono text-sm text-profit">
                    Desde: {startRange.toLocaleDateString("es-CL")} hasta {endRange.toLocaleDateString("es-CL")}
                  </p>
                  <p className="font-mono text-sm text-profit">
                    Horario: {startTime} - {endTime}
                  </p>
                  <p className="font-mono text-xs text-foreground/50 mt-2">
                    Duración: {duration} minutos por slot
                  </p>
                  <p className="font-mono text-xs text-foreground/50 mt-1">
                    Se crearán múltiples slots automáticamente
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-terminal hover-terminal text-sm font-semibold uppercase"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !startDate}
              className="flex-1 px-4 py-3 bg-profit text-background border-terminal hover-terminal disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold uppercase"
            >
              {loading ? "Creando..." : "Crear Slot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

