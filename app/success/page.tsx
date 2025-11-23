"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Calendar, Mail } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-terminal text-profit">Procesando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full border-terminal p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-6"
        >
          <CheckCircle className="w-20 h-20 text-profit mx-auto" />
        </motion.div>

        <h1 className="text-3xl font-bold uppercase tracking-wider mb-4">
          ¡Pago <span className="text-profit">Confirmado</span>!
        </h1>

        <p className="text-foreground/70 mb-6">
          Tu reserva ha sido procesada exitosamente. Recibirás un email de
          confirmación con todos los detalles.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center gap-2 text-sm text-foreground/70">
            <Calendar className="w-4 h-4" />
            <span>Revisa tu email para el link de la sesión</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-foreground/70">
            <Mail className="w-4 h-4" />
            <span>Confirmación enviada a tu correo</span>
          </div>
        </div>

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-profit text-background font-semibold uppercase tracking-wider text-sm border-terminal hover-terminal"
        >
          Volver al Inicio
        </Link>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-terminal text-profit">Cargando...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

