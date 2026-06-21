"use client";

import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";
import { Button } from "@/components/ui/moving-border";

export function Hero() {
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 bg-gradient-to-br from-gray-100 to-gray-400 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        Trade Smarter <br /> mit LyqDex
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-4 text-center text-gray-400 text-lg max-w-xl"
      >
        Die nächste Generation Krypto-Trading. Schnell, sicher und mit
        professionellen Tools für jeden Trader.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-8 flex gap-4"
      >
        <Button
          borderRadius="1.75rem"
          className="bg-gray-900 text-white border-emerald-500/20 font-semibold"
        >
          Jetzt starten
        </Button>
      </motion.div>
    </LampContainer>
  );
}
