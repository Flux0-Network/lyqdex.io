"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const steps = [
  {
    num: "01",
    title: "Konto erstellen",
    desc: "Registriere dich in Sekunden — kein KYC, keine langen Formulare. Nur E-Mail und Passwort.",
    color: "text-cyan-400",
    border: "border-cyan-500/20",
  },
  {
    num: "02",
    title: "Wallet verbinden",
    desc: "Verbinde MetaMask, WalletConnect oder eine andere kompatible Wallet. Deine Keys bleiben bei dir.",
    color: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  {
    num: "03",
    title: "Traden",
    desc: "Charts analysieren, Orders platzieren, live verfolgen. Alles in einem Interface — TradingView trifft Binance.",
    color: "text-purple-400",
    border: "border-purple-500/20",
  },
];

export function Download() {
  return (
    <section className="py-32 px-4 bg-white dark:bg-[#080910] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.03] text-xs text-gray-500 mb-5">
            So einfach geht&apos;s
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
            In 3 Schritten loslegen
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Keine Downloads, keine Setups — einfach im Browser starten.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className={`p-6 rounded-2xl border ${step.border} bg-white dark:bg-white/[0.02] shadow-sm dark:shadow-none`}
            >
              <div className={`text-4xl font-bold ${step.color} opacity-30 mb-4 font-mono`}>
                {step.num}
              </div>
              <h3 className="font-semibold text-black dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-14 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/register"
            className="px-8 py-3 rounded-xl bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black font-semibold text-sm transition"
          >
            Jetzt kostenlos starten
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
