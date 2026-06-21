"use client";

import { motion } from "framer-motion";
import { IconBrandApple, IconBrandWindows, IconDeviceMobile } from "@tabler/icons-react";

const platforms = [
  {
    name: "macOS",
    icon: IconBrandApple,
    label: "Bald verfügbar",
  },
  {
    name: "Windows",
    icon: IconBrandWindows,
    label: "Bald verfügbar",
  },
  {
    name: "iOS",
    icon: IconDeviceMobile,
    label: "Bald verfügbar",
  },
];

export function Download() {
  return (
    <section className="py-32 px-4 bg-gray-950 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-violet-950/10 to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-3">
            Überall traden
          </h2>
          <p className="text-gray-400 max-w-md mx-auto mb-12">
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
              className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col items-center gap-3 cursor-not-allowed"
            >
              <platform.icon className="h-8 w-8 text-white/60 group-hover:text-white/80 transition" />
              <span className="text-sm font-medium text-white">{platform.name}</span>
              <span className="text-xs text-violet-400/80 bg-violet-500/10 px-2.5 py-0.5 rounded-full">
                {platform.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
