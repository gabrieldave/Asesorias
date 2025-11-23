"use client";

import { motion } from "framer-motion";
import { MessageCircle, Instagram, Users } from "lucide-react";

const socialLinks = [
  {
    name: "Telegram",
    icon: MessageCircle,
    href: "#",
    color: "text-blue-400",
  },
  {
    name: "Discord",
    icon: Users,
    href: "#",
    color: "text-indigo-400",
  },
  {
    name: "Instagram",
    icon: Instagram,
    href: "#",
    color: "text-pink-400",
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
          <div className="flex flex-wrap justify-center gap-6">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.name}
                  href={social.href}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-terminal hover-terminal px-8 py-4 flex items-center gap-3 bg-background group"
                >
                  <Icon className={`w-5 h-5 ${social.color} group-hover:scale-110 transition-transform`} />
                  <span className="font-semibold uppercase tracking-wider text-sm">
                    {social.name}
                  </span>
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

