"use client";

import { useState } from "react";
import { X, Clock } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface SlotFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function SlotForm({ isOpen, onClose, onSave }: SlotFormProps) {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [duration, setDuration] = useState<number>(60);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate) {
      alert("Por favor selecciona una fecha y hora");
      return;
    }

    setLoading(true);

    try {
      const endDate = new Date(startDate.getTime() + duration * 60000);

      const response = await fetch("/api/admin/slots/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el slot");
      }

      if (data.success) {
        onSave();
        onClose();
        // Reset form
        setStartDate(new Date());
        setDuration(60);
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

