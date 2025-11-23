"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Service } from "@/types/database.types";

interface ServiceFormProps {
  service?: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function ServiceForm({
  service,
  isOpen,
  onClose,
  onSave,
}: ServiceFormProps) {
  const [formData, setFormData] = useState({
    title: service?.title || "",
    price: service?.price || 0,
    description: service?.description || "",
    features: service?.features?.join("\n") || "",
    active: service?.active ?? true,
  });
  const [loading, setLoading] = useState(false);

  // Actualizar formData cuando cambie el prop service o cuando se abra el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: service?.title || "",
        price: service?.price || 0,
        description: service?.description || "",
        features: service?.features?.join("\n") || "",
        active: service?.active ?? true,
      });
    }
  }, [service, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { supabase } = await import("@/lib/supabase/client");
      const featuresArray = formData.features
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      if (service) {
        // Actualizar
        await (supabase.from("services") as any)
          .update({
            title: formData.title,
            price: formData.price,
            description: formData.description,
            features: featuresArray,
            active: formData.active,
          })
          .eq("id", service.id);
      } else {
        // Crear nuevo
        await (supabase.from("services") as any).insert({
          title: formData.title,
          price: formData.price,
          description: formData.description,
          features: featuresArray,
          active: formData.active,
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Error al guardar el servicio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-background border-terminal w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold uppercase">
            {service ? "Editar Servicio" : "Nuevo Servicio"}
          </h2>
          <button onClick={onClose} className="p-2 border-terminal hover-terminal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold uppercase mb-2">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full px-4 py-2 bg-background border-terminal text-foreground font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold uppercase mb-2">
              Precio (CLP)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: parseInt(e.target.value) })
              }
              required
              min="0"
              className="w-full px-4 py-2 bg-background border-terminal text-foreground font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold uppercase mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows={3}
              className="w-full px-4 py-2 bg-background border-terminal text-foreground font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold uppercase mb-2">
              Características (una por línea)
            </label>
            <textarea
              value={formData.features}
              onChange={(e) =>
                setFormData({ ...formData, features: e.target.value })
              }
              rows={5}
              className="w-full px-4 py-2 bg-background border-terminal text-foreground font-mono"
              placeholder="Análisis de tu estrategia actual&#10;Identificación de errores comunes&#10;Plan de acción personalizado"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label htmlFor="active" className="text-sm font-semibold uppercase">
              Servicio Activo
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-profit text-background font-semibold uppercase tracking-wider text-sm border-terminal hover-terminal disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-terminal hover-terminal font-semibold uppercase tracking-wider text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
