"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gray-950 px-4">
      {/* Gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center max-w-3xl"
      >
        <div className="inline-block mb-6 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-gray-400">
          Jetzt in der Beta verfügbar
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.1]">
          Die Zukunft des
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
            Krypto-Tradings
          </span>
        </h1>
        <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
          Schnell, sicher und intuitiv. Professionelle Tools für Spot, Futures
          und Derivate – gebaut für die nächste Generation Trader.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <button className="bg-white text-black font-medium px-6 py-2.5 rounded-full text-sm hover:bg-gray-200 transition">
            Jetzt starten
          </button>
          <button className="border border-white/10 text-gray-300 font-medium px-6 py-2.5 rounded-full text-sm hover:bg-white/5 transition">
            Mehr erfahren
          </button>
        </div>
      </motion.div>
    </section>
  );
}
