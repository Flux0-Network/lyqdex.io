"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative bg-white dark:bg-[#080910] flex flex-col items-center overflow-hidden pt-24">

      {/* Content — left aligned */}
      <div className="relative z-10 w-full max-w-[1180px] mx-auto px-6 pt-16 pb-10">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white/60 animate-pulse" />
            Beta — Jetzt kostenlos testen
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] max-w-2xl"
        >
          <span className="text-black dark:text-white">Trade smarter.</span>
          <br />
          <span className="text-gray-300 dark:text-gray-600">Faster. Deeper.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-gray-400 max-w-lg leading-relaxed"
        >
          Professionelle Crypto-Trading-Plattform für Spot, Futures und Derivate.
          Gebaut für die nächste Generation Trader.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-3"
        >
          <Link
            href="/register"
            className="px-7 py-3 rounded-xl bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black font-semibold text-sm transition"
          >
            Jetzt kostenlos starten
          </Link>
          <Link
            href="/trade"
            className="px-7 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.05] text-gray-600 dark:text-gray-500 hover:text-black dark:hover:text-gray-300 font-semibold text-sm transition"
          >
            Live Demo ansehen →
          </Link>
        </motion.div>
      </div>

      {/* Dashboard image */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[1180px] mx-auto px-4 pb-0"
      >
        {/* App frame */}
        <div className="relative rounded-t-2xl overflow-hidden border border-gray-200 dark:border-white/[0.07] shadow-[0_20px_80px_rgba(0,0,0,0.10)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.6)]">

          {/* iOS-style app header — icon only */}
          <div className="bg-gray-50 dark:bg-[#0c0d14] border-b border-gray-100 dark:border-white/[0.05] px-5 py-3 flex items-center gap-2.5">
            <Image
              src="/lyqdex-icon.png"
              alt="LyqDex"
              width={20}
              height={20}
              className="invert dark:invert-0 flex-shrink-0"
            />
            <div className="ml-auto flex items-center gap-3">
              <div className="flex gap-[3px]">
                <div className="w-[3px] h-2.5 rounded-full bg-black/15 dark:bg-white/15" />
                <div className="w-[3px] h-3.5 rounded-full bg-black/25 dark:bg-white/25" />
                <div className="w-[3px] h-[18px] rounded-full bg-black/35 dark:bg-white/35" />
                <div className="w-[3px] h-[22px] rounded-full bg-black/50 dark:bg-white/50" />
              </div>
              <div className="text-[10px] text-black/30 dark:text-white/30 font-medium tabular-nums">9:41</div>
            </div>
          </div>

          <Image
            src="/hero-dashboard.png"
            alt="LYQDEX Trading Platform"
            width={2800}
            height={1760}
            className="w-full h-auto block"
            priority
          />
        </div>
      </motion.div>

    </section>
  );
}
