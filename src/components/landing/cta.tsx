"use client";

import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-32 px-4 bg-gray-950 flex flex-col items-center relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-violet-600/10 rounded-full blur-[100px]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative z-10 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-3">
          Bereit zu traden?
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Erstelle dein Konto in unter 30 Sekunden.
        </p>
        <button className="bg-white text-black font-medium px-8 py-3 rounded-full text-sm hover:bg-gray-200 transition">
          Konto erstellen
        </button>
      </motion.div>
    </section>
  );
}
