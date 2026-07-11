"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const stats = [
  { value: "$4.2B+", label: "24h Volumen" },
  { value: "500+", label: "Trading Paare" },
  { value: "<5ms", label: "Order Latenz" },
  { value: "2M+", label: "Aktive Trader" },
];

export function Hero() {
  return (
    <section className="relative bg-white flex flex-col items-center overflow-hidden pt-24">

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 pt-16 pb-10">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            Beta — Jetzt kostenlos testen
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] max-w-3xl mx-auto"
        >
          <span className="text-black">Trade smarter.</span>
          <br />
          <span className="text-gray-300">Faster. Deeper.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-center text-base sm:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed"
        >
          Professionelle Crypto-Trading-Plattform für Spot, Futures und Derivate.
          Gebaut für die nächste Generation Trader.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/register"
            className="px-7 py-3 rounded-xl bg-black hover:bg-gray-800 text-white font-semibold text-sm transition"
          >
            Jetzt kostenlos starten
          </Link>
          <Link
            href="/trade"
            className="px-7 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-black font-semibold text-sm transition"
          >
            Live Demo ansehen →
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-bold text-black">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
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
        <div className="relative rounded-t-2xl overflow-hidden border border-gray-200 shadow-[0_20px_80px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]">

          {/* iOS-style app header */}
          <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-2.5">
            <Image
              src="/lyqdex-icon.png"
              alt="LyqDex"
              width={20}
              height={20}
              className="invert flex-shrink-0"
            />
            <span className="text-xs font-bold text-black tracking-[0.18em]">LYQDEX</span>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex gap-[3px]">
                <div className="w-[3px] h-2.5 rounded-full bg-black/15" />
                <div className="w-[3px] h-3.5 rounded-full bg-black/25" />
                <div className="w-[3px] h-[18px] rounded-full bg-black/35" />
                <div className="w-[3px] h-[22px] rounded-full bg-black/50" />
              </div>
              <div className="text-[10px] text-black/30 font-medium tabular-nums">9:41</div>
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

          {/* Fade to white */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>
      </motion.div>

    </section>
  );
}
