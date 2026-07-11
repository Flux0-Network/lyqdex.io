"use client";

import { motion } from "framer-motion";
import { IconBrandApple, IconBrandWindows, IconDeviceMobile } from "@tabler/icons-react";

const platforms = [
  { name: "macOS", icon: IconBrandApple, label: "Bald verfügbar" },
  { name: "Windows", icon: IconBrandWindows, label: "Bald verfügbar" },
  { name: "iOS", icon: IconDeviceMobile, label: "Bald verfügbar" },
];

export function Download() {
  return (
    <section className="py-32 px-4 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">
            Überall traden
          </h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-12">
            LyqDex für Desktop und Mobile – bald auf allen Plattformen.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {platforms.map((platform, i) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group p-8 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition flex flex-col items-center gap-4 cursor-not-allowed"
            >
              <platform.icon className="h-8 w-8 text-black/70 group-hover:text-black transition" />
              <span className="text-sm font-semibold text-black">{platform.name}</span>
              <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                {platform.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
