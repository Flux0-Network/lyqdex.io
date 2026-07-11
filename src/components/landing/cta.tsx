"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-32 px-4 bg-black flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Bereit zu traden?
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
          Erstelle dein Konto in unter 30 Sekunden.
        </p>
        <Link
          href="/register"
          className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-full text-sm hover:bg-gray-100 transition"
        >
          Konto erstellen
        </Link>
      </motion.div>
    </section>
  );
}
