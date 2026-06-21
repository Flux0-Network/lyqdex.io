"use client";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
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
      "Kaufe und verkaufe über 500+ Kryptowährungen mit tiefer Liquidität und engen Spreads.",
    icon: <IconCurrencyBitcoin className="h-6 w-6 text-emerald-400" />,
    className: "md:col-span-2",
  },
  {
    title: "Futures & Derivate",
    description:
      "Hebel bis zu 125x auf BTC, ETH und weitere Top-Assets.",
    icon: <IconArrowsExchange className="h-6 w-6 text-emerald-400" />,
    className: "md:col-span-1",
  },
  {
    title: "Blitzschnell",
    description:
      "Order-Matching in unter 5ms. Gebaut für High-Frequency Trading.",
    icon: <IconBolt className="h-6 w-6 text-emerald-400" />,
    className: "md:col-span-1",
  },
  {
    title: "Profi-Charts",
    description:
      "TradingView-Integration mit über 100 Indikatoren und Zeichentools.",
    icon: <IconChartBar className="h-6 w-6 text-emerald-400" />,
    className: "md:col-span-1",
  },
  {
    title: "Maximale Sicherheit",
    description:
      "Multi-Sig Cold Wallets, 2FA, und regelmäßige Security Audits.",
    icon: <IconShieldCheck className="h-6 w-6 text-emerald-400" />,
    className: "md:col-span-1",
  },
  {
    title: "Earn & Staking",
    description:
      "Verdiene passives Einkommen mit flexiblem Staking und Savings.",
    icon: <IconWallet className="h-6 w-6 text-emerald-400" />,
    className: "md:col-span-3",
  },
];

export function Features() {
  return (
    <section className="py-20 px-4 bg-gray-950">
      <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-100 mb-4">
        Alles was du brauchst
      </h2>
      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
        Professionelle Trading-Tools, vereinfacht für jeden.
      </p>
      <BentoGrid className="max-w-5xl mx-auto">
        {features.map((feature) => (
          <BentoGridItem
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            className={feature.className}
          />
        ))}
      </BentoGrid>
    </section>
  );
}
