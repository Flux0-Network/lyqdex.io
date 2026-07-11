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
    <section className="relative min-h-screen bg-[#0a0b0e] flex flex-col items-center overflow-hidden pt-16">

      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-[20%] w-[700px] h-[700px] rounded-full bg-violet-700/10 blur-[140px]" />
        <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-700/8 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[40%] w-[600px] h-[400px] rounded-full bg-violet-900/15 blur-[100px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 pt-20 pb-10">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-xs text-violet-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Beta — Jetzt kostenlos testen
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] max-w-3xl mx-auto"
        >
          Trade smarter.
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            Faster. Deeper.
          </span>
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
            className="px-7 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition shadow-lg shadow-violet-900/40"
          >
            Jetzt kostenlos starten
          </Link>
          <Link
            href="/trade"
            className="px-7 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-gray-300 hover:text-white font-semibold text-sm transition"
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
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
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
        {/* Glow behind image */}
        <div className="absolute inset-x-10 top-8 h-32 bg-violet-700/20 blur-[60px] rounded-full pointer-events-none" />

        {/* Image frame */}
        <div className="relative rounded-t-2xl overflow-hidden border border-white/[0.08] shadow-[0_0_80px_rgba(109,40,217,0.15),0_40px_120px_rgba(0,0,0,0.8)]">
          {/* Fake browser bar */}
          <div className="bg-[#10121a] border-b border-white/[0.06] px-4 py-2.5 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 mx-4 bg-white/[0.05] rounded-md px-3 py-1 text-xs text-gray-500">
              app.lyqdex.io/trade
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
          {/* Fade to dark at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0b0e] to-transparent pointer-events-none" />
        </div>
      </motion.div>

    </section>
  );
}
