"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Registrar service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✅ Service Worker registrado:", registration.scope);
          
          // Verificar actualizaciones periódicamente
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Cada hora
        })
        .catch((error) => {
          console.log("⚠️ Error al registrar Service Worker:", error);
        });

      // Manejar instalación de PWA
      let deferredPrompt: any;
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log("📱 PWA lista para instalar");
      });
    }
  }, []);

  return null;
}

