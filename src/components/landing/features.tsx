"use client";

import { motion } from "framer-motion";
import {
  IconChartCandleFilled,
  IconBolt,
  IconShieldLock,
  IconChartArrows,
  IconSourceCode,
  IconCoin,
} from "@tabler/icons-react";

const features = [
  {
    title: "Professionelle Charts",
    description: "Eigene Candlestick-Charts mit MA, Volumen und Indikatoren — direkt im Browser, keine Plugins.",
    icon: IconChartCandleFilled,
    accent: "from-cyan-500/20 to-cyan-500/0",
    iconColor: "text-cyan-400",
  },
  {
    title: "Unter 5ms Latenz",
    description: "WebSocket-Feeds von Binance und Bybit parallel — Echtzeit-Tick-Daten, keine Verzögerung.",
    icon: IconBolt,
    accent: "from-amber-500/20 to-amber-500/0",
    iconColor: "text-amber-400",
  },
  {
    title: "Non-Custodial",
    description: "Du behältst immer deine Keys. Hybrid-Matching On-Chain — kein Vertrauen in eine Drittpartei nötig.",
    icon: IconShieldLock,
    accent: "from-emerald-500/20 to-emerald-500/0",
    iconColor: "text-emerald-400",
  },
  {
    title: "Aggregierte Preise",
    description: "Median aus Binance, Bybit, OKX und CoinGecko — manipulationsresistenter Referenzpreis.",
    icon: IconChartArrows,
    accent: "from-blue-500/20 to-blue-500/0",
    iconColor: "text-blue-400",
  },
  {
    title: "Open Source",
    description: "Vollständig verifizierbare Smart Contracts. Kein Blackbox-Backend — alles on-chain nachprüfbar.",
    icon: IconSourceCode,
    accent: "from-purple-500/20 to-purple-500/0",
    iconColor: "text-purple-400",
  },
  {
    title: "Kostenlos in der Beta",
    description: "Kein KYC. Kein Abo. Während der Beta-Phase kostenlos — direkt loslegen.",
    icon: IconCoin,
    accent: "from-pink-500/20 to-pink-500/0",
    iconColor: "text-pink-400",
  },
];

export function Features() {
  return (
    <section className="py-32 px-4 bg-gray-50 dark:bg-[#080910]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.03] text-xs text-gray-500 mb-5">
            Warum LyqDex
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
            Alles was du brauchst.
            <span className="block mt-1 bg-gradient-to-r from-cyan-500 to-emerald-400 bg-clip-text text-transparent">
              Nichts was du nicht brauchst.
            </span>
          </h2>
          <p className="mt-4 text-gray-500 text-sm max-w-md mx-auto">
            Professionelle Trading-Tools, vollständig dezentral und ohne Kompromisse.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group relative p-6 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] hover:border-black/[0.12] dark:hover:border-white/[0.1] hover:shadow-sm dark:hover:bg-white/[0.04] transition overflow-hidden"
            >
              {/* Accent glow */}
              <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${feature.accent} rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

              <feature.icon className={`relative h-5 w-5 ${feature.iconColor} mb-4`} />
              <h3 className="relative font-semibold text-black dark:text-white mb-1.5">{feature.title}</h3>
              <p className="relative text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
