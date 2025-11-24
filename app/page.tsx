"use client";

import { motion } from "framer-motion";
import { TrendingUp, Zap, Target } from "lucide-react";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import SocialProof from "@/components/SocialProof";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Services />
      <SocialProof />
    </main>
  );
}




