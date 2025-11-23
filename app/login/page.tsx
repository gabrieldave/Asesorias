"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Verificar que sea el admin
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
        if (data.user.email === adminEmail || adminEmail === "") {
          router.push("/admin");
        } else {
          await supabase.auth.signOut();
          setError("No tienes permisos de administrador");
        }
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border-terminal p-8"
      >
        <div className="text-center mb-8">
          <LogIn className="w-12 h-12 text-profit mx-auto mb-4" />
          <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">
            Admin Login
          </h1>
          <p className="text-foreground/70 text-sm">
            Acceso exclusivo para administradores
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-3 border border-loss bg-loss/10 text-loss text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border-terminal text-foreground font-mono focus:outline-none focus:border-profit"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border-terminal text-foreground font-mono focus:outline-none focus:border-profit"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-profit text-background font-semibold uppercase tracking-wider text-sm border-terminal hover-terminal disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Iniciando sesión..." : "Ingresar"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

