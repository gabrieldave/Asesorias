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
          <div className={`grid grid-cols-1 ${
            services.length === 4 
              ? 'md:grid-cols-2 lg:grid-cols-4' 
              : services.length === 3
              ? 'md:grid-cols-3'
              : 'md:grid-cols-2 lg:grid-cols-3'
          } gap-6 lg:gap-6 max-w-7xl mx-auto`}>
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
                  className="border-terminal hover-terminal bg-background p-6 lg:p-7 flex flex-col h-full transition-all duration-300 group"
                >
                  {/* Badge e Icon en la misma línea */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-block px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border border-profit text-profit bg-profit/10">
                      {level}
                    </span>
                    <div className="p-2 border border-profit/30 rounded group-hover:border-profit transition-colors">
                      <Icon className="w-5 h-5 text-profit" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl lg:text-2xl font-bold mb-3 uppercase tracking-wide leading-tight min-h-[3rem]">
                    {service.title}
                  </h3>

                  {/* Price */}
                  <div className="mb-5 pb-4 border-b border-border/30">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl lg:text-4xl font-bold text-profit">
                        ${service.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-foreground/60 text-sm">USD</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-foreground/70 mb-5 text-sm leading-relaxed min-h-[3rem]">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="flex-1 space-y-2.5 mb-6 min-h-[8rem]">
                    {service.features && service.features.length > 0 ? (
                      service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm">
                          <Check className="w-4 h-4 text-profit flex-shrink-0 mt-0.5" />
                          <span className="text-foreground/80 leading-relaxed text-[13px]">{feature}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-foreground/50 text-sm">Sin características listadas</li>
                    )}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleBooking(service)}
                    className="w-full border-terminal hover-terminal py-3.5 bg-profit text-background font-semibold uppercase tracking-wider text-sm mt-auto transition-all duration-200 hover:bg-profit/90 hover:shadow-lg hover:shadow-profit/20"
                  >
                    Agendar Sesión
                  </button>

                  {/* Availability indicator */}
                  <div className="mt-3 text-xs text-foreground/50 text-center">
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

