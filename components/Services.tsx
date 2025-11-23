"use client";

import { motion } from "framer-motion";
import { Check, Clock, Users, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getActiveServices, countAvailableSlots } from "@/lib/supabase/queries";
import type { Service } from "@/types/database.types";
import BookingModal from "./BookingModal";
import { useRouter } from "next/navigation";

const iconMap = {
  inicial: TrendingUp,
  intermedio: Users,
  avanzado: Clock,
};

const levelMap: Record<string, string> = {
  inicial: "Inicial",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [availableCount, setAvailableCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesData, count] = await Promise.all([
          getActiveServices(),
          countAvailableSlots(),
        ]);
        setServices(servicesData);
        setAvailableCount(count);
      } catch (error) {
        console.error("Error loading services:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleBooking = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (
    slotId: number,
    customerName: string,
    customerEmail: string
  ) => {
    if (!selectedService) return;

    // Redirigir a la API de checkout
    router.push(
      `/api/checkout/create?serviceId=${selectedService.id}&slotId=${slotId}&name=${encodeURIComponent(customerName)}&email=${encodeURIComponent(customerEmail)}`
    );
  };
  return (
    <section id="services-section" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border">
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 uppercase tracking-wider">
            Niveles de <span className="text-profit">Mentoría</span>
          </h2>
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
            Elige el nivel que mejor se adapte a tu experiencia y objetivos
          </p>
        </motion.div>

        {/* Services Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-pulse-terminal text-profit">
              Cargando servicios...
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground/70">No hay servicios disponibles en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, index) => {
              // Determinar icono basado en el título
              const titleLower = service.title.toLowerCase();
              let iconKey = "inicial";
              if (titleLower.includes("intermedio") || titleLower.includes("intermedia")) {
                iconKey = "intermedio";
              } else if (titleLower.includes("avanzado") || titleLower.includes("avanzada")) {
                iconKey = "avanzado";
              }
              const Icon = iconMap[iconKey as keyof typeof iconMap] || TrendingUp;
              const level = levelMap[iconKey] || "Inicial";

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="border-terminal hover-terminal bg-background p-6 flex flex-col"
                >
                  {/* Badge */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider border border-profit text-profit bg-profit/10">
                      {level}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="mb-4">
                    <Icon className="w-8 h-8 text-profit" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-2 uppercase tracking-wide">
                    {service.title}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-profit">
                      ${service.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-foreground/70 ml-2">USD</span>
                  </div>

                  {/* Description */}
                  <p className="text-foreground/70 mb-6 text-sm">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="flex-1 space-y-3 mb-6">
                    {service.features && service.features.length > 0 ? (
                      service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-profit flex-shrink-0 mt-0.5" />
                          <span className="text-foreground/80">{feature}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-foreground/50 text-sm">Sin características listadas</li>
                    )}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleBooking(service)}
                    className="w-full border-terminal hover-terminal py-3 bg-profit text-background font-semibold uppercase tracking-wider text-sm mt-auto"
                  >
                    Agendar Sesión
                  </button>

                  {/* Availability indicator */}
                  <div className="mt-4 text-xs text-foreground/50 text-center">
                    {availableCount > 0 ? (
                      <span className="text-profit">
                        Solo quedan {availableCount} cupos disponibles
                      </span>
                    ) : (
                      <span className="text-loss">Sin cupos disponibles</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Booking Modal */}
        {selectedService && (
          <BookingModal
            service={selectedService}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedService(null);
            }}
            onConfirm={handleConfirmBooking}
          />
        )}
      </div>
    </section>
  );
}

