"use client";

import { motion } from "framer-motion";
import {
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  MessageSquare,
  Users,
  Star,
  Phone,
} from "lucide-react";

const socialLinks = [
  {
    name: "WhatsApp",
    icon: Phone,
    href: "https://wa.me/5215645530082",
    color: "text-green-400",
    description: "Soporte técnico y ventas",
  },
  {
    name: "Grupo WhatsApp",
    icon: MessageSquare,
    href: "https://chat.whatsapp.com/Lryh2qr01r24zLPw3Yojmt?mode=ems_copy_c",
    color: "text-green-500",
    description: "Comunidad",
  },
  {
    name: "Telegram",
    icon: MessageCircle,
    href: "https://t.me/todoss0mostr4ders",
    color: "text-blue-400",
    description: "Comunidad",
  },
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://www.instagram.com/todoss0mostr4ders?igsh=eDJtZTkzZHVodWp0",
    color: "text-pink-400",
  },
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://www.facebook.com/share/1Jq9XMZ6xN/",
    color: "text-blue-500",
  },
  {
    name: "X (Twitter)",
    icon: Twitter,
    href: "https://x.com/todoss0mostr4dr?t=Bg2Cq-mbev0HsZm0_CyzFg&s=09",
    color: "text-foreground",
  },
  {
    name: "YouTube",
    icon: Youtube,
    href: "https://www.youtube.com/@todossomostraders",
    color: "text-red-500",
  },
  {
    name: "TikTok",
    icon: Users,
    href: "https://www.tiktok.com/@todossomostraders0?_t=ZS-90TOLp5oE53&_r=1",
    color: "text-foreground",
  },
  {
    name: "Threads",
    icon: MessageCircle,
    href: "https://www.threads.com/@todoss0mostr4ders",
    color: "text-foreground",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://www.linkedin.com/in/david-del-rio-93512538a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    color: "text-blue-600",
  },
  {
    name: "Trustpilot",
    icon: Star,
    href: "https://es.trustpilot.com/review/tradingsinperdidas.com",
    color: "text-yellow-400",
    description: "Testimonios",
  },
];

export default function SocialProof() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 uppercase tracking-wider">
            Únete a la <span className="text-profit">Comunidad</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-terminal hover-terminal px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-background group min-w-[140px] sm:min-w-0"
                >
                  <Icon className={`w-5 h-5 ${social.color} group-hover:scale-110 transition-transform flex-shrink-0`} />
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="font-semibold uppercase tracking-wider text-xs sm:text-sm text-center sm:text-left">
                      {social.name}
                    </span>
                    {social.description && (
                      <span className="text-xs text-foreground/50 text-center sm:text-left">
                        {social.description}
                      </span>
                    )}
                  </div>
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

