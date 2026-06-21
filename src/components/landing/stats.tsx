"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "24h Volumen", value: "$2.4B+" },
  { label: "Nutzer", value: "1M+" },
  { label: "Assets", value: "500+" },
  { label: "Länder", value: "180+" },
];

export function Stats() {
  return (
    <section className="py-20 px-4 border-y border-white/5">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-2xl md:text-3xl font-semibold text-white">
              {stat.value}
            </div>
            <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
