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
    description: "500+ Kryptowährungen mit tiefer Liquidität und engen Spreads.",
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
    <section className="py-32 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-black">
            Alles was du brauchst
          </h2>
          <p className="mt-3 text-gray-400 text-sm">
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
              className="group p-6 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition"
            >
              <feature.icon className="h-5 w-5 text-black mb-4" />
              <h3 className="font-semibold text-black mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
