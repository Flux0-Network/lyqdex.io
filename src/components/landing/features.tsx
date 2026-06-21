"use client";

import { motion } from "framer-motion";
import {
  IconChartBar,
  IconBolt,
  IconShieldCheck,
  IconWallet,
  IconArrowsExchange,
  IconCurrencyBitcoin,
} from "@tabler/icons-react";

const features = [
  {
    title: "Spot Trading",
    description:
      "500+ Kryptowährungen mit tiefer Liquidität und engen Spreads.",
    icon: IconCurrencyBitcoin,
  },
  {
    title: "Futures & Derivate",
    description: "Hebel bis zu 125x auf BTC, ETH und weitere Top-Assets.",
    icon: IconArrowsExchange,
  },
  {
    title: "Unter 5ms Latenz",
    description: "Order-Matching gebaut für High-Frequency Trading.",
    icon: IconBolt,
  },
  {
    title: "Profi-Charts",
    description: "TradingView-Integration mit 100+ Indikatoren.",
    icon: IconChartBar,
  },
  {
    title: "Maximale Sicherheit",
    description: "Multi-Sig Cold Wallets, 2FA und regelmäßige Audits.",
    icon: IconShieldCheck,
  },
  {
    title: "Earn & Staking",
    description: "Passives Einkommen mit flexiblem Staking und Savings.",
    icon: IconWallet,
  },
];

export function Features() {
  return (
    <section className="py-32 px-4 bg-gray-950 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white">
            Alles was du brauchst
          </h2>
          <p className="mt-3 text-gray-400">
            Professionelle Trading-Tools, vereinfacht für jeden.
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
              className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition"
            >
              <feature.icon className="h-5 w-5 text-violet-400 mb-4" />
              <h3 className="font-medium text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
