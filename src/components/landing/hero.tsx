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
    <section className="relative min-h-screen bg-[#080910] flex flex-col items-center overflow-hidden pt-24">

      {/* Background glows — violet only, no cyan */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-5%] left-[25%] w-[600px] h-[600px] rounded-full bg-violet-800/8 blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[35%] w-[500px] h-[400px] rounded-full bg-violet-900/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 pt-16 pb-10">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-gray-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
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
          <span className="text-white">Trade smarter.</span>
          <br />
          <span className="text-gray-500">Faster. Deeper.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-center text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed"
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
            className="px-7 py-3 rounded-xl bg-white hover:bg-gray-100 text-black font-semibold text-sm transition"
          >
            Jetzt kostenlos starten
          </Link>
          <Link
            href="/trade"
            className="px-7 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-gray-500 hover:text-gray-300 font-semibold text-sm transition"
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
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-600 mt-0.5">{stat.label}</div>
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
        {/* Subtle glow behind */}
        <div className="absolute inset-x-20 top-6 h-24 bg-violet-900/15 blur-[60px] rounded-full pointer-events-none" />

        {/* App frame */}
        <div className="relative rounded-t-2xl overflow-hidden border border-white/[0.07] shadow-[0_0_60px_rgba(80,20,180,0.08),0_40px_120px_rgba(0,0,0,0.9)]">

          {/* iOS-style app header */}
          <div className="bg-[#0c0d14] border-b border-white/[0.05] px-5 py-3 flex items-center gap-2.5">
            <Image
              src="/lyqdex-icon.png"
              alt="LyqDex"
              width={20}
              height={20}
              className="brightness-[2] flex-shrink-0"
            />
            <span className="text-xs font-bold text-white tracking-[0.18em]">LYQDEX</span>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex gap-[3px]">
                <div className="w-[3px] h-2.5 rounded-full bg-white/20" />
                <div className="w-[3px] h-3.5 rounded-full bg-white/30" />
                <div className="w-[3px] h-[18px] rounded-full bg-white/40" />
                <div className="w-[3px] h-[22px] rounded-full bg-white/50" />
              </div>
              <div className="text-[10px] text-white/30 font-medium tabular-nums">9:41</div>
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

          {/* Fade to dark */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080910] to-transparent pointer-events-none" />
        </div>
      </motion.div>

    </section>
  );
}
