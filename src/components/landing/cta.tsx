"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/moving-border";

export function CTA() {
  return (
    <section className="py-32 px-4 bg-gray-950 flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-3xl md:text-5xl font-bold text-center text-gray-100 mb-4"
      >
        Bereit zu traden?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        viewport={{ once: true }}
        className="text-gray-400 text-center mb-8 max-w-md"
      >
        Erstelle dein Konto in unter 30 Sekunden und starte sofort mit dem
        Trading.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Button
          borderRadius="1.75rem"
          className="bg-gray-900 text-white border-emerald-500/20 font-semibold"
        >
          Konto erstellen
        </Button>
      </motion.div>
    </section>
  );
}
