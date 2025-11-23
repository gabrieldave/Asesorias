"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Calendar, Mail, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Booking, Service } from "@/types/database.types";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.push("/");
      return;
    }

    loadBookingData();
  }, [sessionId]);

  const loadBookingData = async (retryCount = 0) => {
    try {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      // Usar el endpoint de API que obtiene el booking desde Stripe metadata
      const response = await fetch(`/api/checkout/get-booking?session_id=${sessionId}`);
      const data = await response.json();

      if (!response.ok) {
        // Si no se encuentra y aún no hemos hecho todos los reintentos, esperar y reintentar
        // El webhook puede tardar en procesarse
        if (retryCount < 5) {
          console.log(`Reserva no encontrada, reintentando... (${retryCount + 1}/5)`);
          setTimeout(() => {
            loadBookingData(retryCount + 1);
          }, 2000); // Esperar 2 segundos antes de reintentar
          return;
        }
        
        console.error("Error loading booking:", data.error);
        setLoading(false);
        return;
      }

      if (data.booking) {
        setBooking(data.booking as Booking);
        if (data.service) {
          setService(data.service as Service);
        }
        setLoading(false);
      } else {
        // Si no hay booking pero la respuesta fue OK, reintentar
        if (retryCount < 5) {
          setTimeout(() => {
            loadBookingData(retryCount + 1);
          }, 2000);
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      // Si hay error y aún no hemos hecho todos los reintentos, intentar de nuevo
      if (retryCount < 5) {
        setTimeout(() => {
          loadBookingData(retryCount + 1);
        }, 2000);
      } else {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-profit">Cargando...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Reserva no encontrada</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-profit text-background border-terminal hover-terminal"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full border-terminal p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block mb-4"
          >
            <CheckCircle className="w-20 h-20 text-profit" />
          </motion.div>
          <h1 className="text-4xl font-bold uppercase mb-2">
            ¡Reserva <span className="text-profit">Confirmada</span>!
          </h1>
          <p className="text-foreground/70">
            Tu pago ha sido procesado exitosamente
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="border-terminal p-6">
            <h2 className="text-xl font-bold uppercase mb-4">Detalles de la Reserva</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-profit mt-1" />
                <div>
                  <p className="text-sm text-foreground/50 uppercase">Cliente</p>
                  <p className="font-semibold">{booking.customer_name}</p>
                  <p className="text-sm text-foreground/70">{booking.customer_email}</p>
                </div>
              </div>

              {service && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-profit mt-1" />
                  <div>
                    <p className="text-sm text-foreground/50 uppercase">Servicio</p>
                    <p className="font-semibold">{service.title}</p>
                    <p className="text-sm text-foreground/70">{service.description}</p>
                    <p className="text-profit text-lg font-bold mt-1">
                      ${service.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} USD
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-profit mt-1" />
                <div>
                  <p className="text-sm text-foreground/50 uppercase">Estado del Pago</p>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold ${
                      booking.payment_status === "paid"
                        ? "bg-profit/20 text-profit border border-profit"
                        : "bg-loss/20 text-loss border border-loss"
                    }`}
                  >
                    {booking.payment_status === "paid" ? "Pagado" : "Pendiente"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {booking.zoom_link && (
            <div className="border-terminal p-6 bg-profit/5">
              <h3 className="text-lg font-bold uppercase mb-3">Link de Zoom</h3>
              <a
                href={booking.zoom_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-profit hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="font-mono text-sm break-all">{booking.zoom_link}</span>
              </a>
              <p className="text-xs text-foreground/50 mt-2">
                Guarda este link para acceder a tu sesión
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex-1 px-6 py-3 border-terminal hover-terminal text-sm font-semibold uppercase"
          >
            Volver al inicio
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-pulse text-profit">Cargando...</div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
