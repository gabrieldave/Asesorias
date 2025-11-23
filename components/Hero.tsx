"use client";

import { motion } from "framer-motion";
import { TrendingUp, ArrowDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden border-b border-border">
      {/* Grid background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Glitch effect headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 glow-profit"
          >
            <span className="block">DOMINA LA</span>
            <span className="block text-profit">ESTRUCTURA</span>
            <span className="block">DEL MERCADO</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl mx-auto"
          >
            Mentorías profesionales de trading diseñadas para traders que buscan
            <span className="text-profit"> resultados reales</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button className="border-terminal hover-terminal px-8 py-4 bg-background text-profit font-semibold uppercase tracking-wider text-sm">
              Ver Servicios
            </button>
            <button className="border-terminal hover-terminal px-8 py-4 bg-profit text-background font-semibold uppercase tracking-wider text-sm">
              Agendar Ahora
            </button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs text-foreground/50 uppercase tracking-widest">
                Scroll
              </span>
              <ArrowDown className="w-5 h-5 text-profit animate-pulse-terminal" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Terminal-style corner decorations */}
      <div className="absolute top-4 left-4 text-xs text-foreground/30 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-profit">$</span>
          <span className="animate-blink">_</span>
        </div>
      </div>
      <div className="absolute top-4 right-4 text-xs text-foreground/30 font-mono">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3 h-3 text-profit" />
          <span>LIVE</span>
        </div>
      </div>
    </section>
  );
}

