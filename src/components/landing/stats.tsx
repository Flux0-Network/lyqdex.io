"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "24h Volumen", value: "$2.4B+" },
  { label: "Registrierte Nutzer", value: "1M+" },
  { label: "Unterstützte Assets", value: "500+" },
  { label: "Länder", value: "180+" },
];

export function Stats() {
  return (
    <section className="py-20 px-4 bg-gray-950/50 border-y border-gray-800/50">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-3xl md:text-4xl font-bold text-emerald-400">
              {stat.value}
            </div>
            <div className="mt-2 text-sm text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
