"use client";

import { motion } from "framer-motion";

const CHAINS = [
  { name: "Bitcoin",   symbol: "BTC", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  icon: "₿" },
  { name: "Ethereum",  symbol: "ETH", color: "#6366f1", bg: "rgba(99,102,241,0.1)",   icon: "Ξ" },
  { name: "Solana",    symbol: "SOL", color: "#22d3ee", bg: "rgba(34,211,238,0.1)",   icon: "◎" },
  { name: "BNB Chain", symbol: "BNB", color: "#eab308", bg: "rgba(234,179,8,0.1)",    icon: "⬡" },
  { name: "Arbitrum",  symbol: "ARB", color: "#3b82f6", bg: "rgba(59,130,246,0.1)",   icon: "△" },
  { name: "Optimism",  symbol: "OP",  color: "#ef4444", bg: "rgba(239,68,68,0.1)",    icon: "○" },
  { name: "Avalanche", symbol: "AVAX",color: "#ef4444", bg: "rgba(239,68,68,0.1)",    icon: "△" },
  { name: "Chainlink", symbol: "LINK",color: "#2563eb", bg: "rgba(37,99,235,0.1)",    icon: "⬡" },
];

const STATS = [
  { label: "Unterstützte Assets",  value: "500+",   color: "#7c3aed" },
  { label: "24h Handelsvolumen",   value: "$2.4B+", color: "#06b6d4" },
  { label: "Aktive Trader",        value: "1M+",    color: "#a855f7" },
  { label: "Länder",               value: "180+",   color: "#3b82f6" },
];

export function Chains() {
  return (
    <section className="py-24 px-4 bg-[#06070f] relative overflow-hidden">
      {/* subtle bg glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position:"absolute", width:600, height:600,
          top:"50%", left:"50%", transform:"translate(-50%,-50%)",
          borderRadius:"50%",
          background:"radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
        }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-center overflow-hidden group hover:border-white/[0.12] transition"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 50% 50%, ${s.color}15, transparent 70%)` }}
              />
              <div className="text-3xl font-bold text-white tabular-nums" style={{ textShadow: `0 0 30px ${s.color}60` }}>
                {s.value}
              </div>
              <div className="mt-1 text-xs text-gray-500">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Chains */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-medium border border-violet-500/20 bg-violet-500/10 text-violet-400">
            Multi-Chain
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Alle großen Chains. Eine Plattform.
          </h2>
          <p className="mt-3 text-gray-500 text-sm max-w-sm mx-auto">
            Handel nahtlos über alle führenden Blockchains hinweg.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CHAINS.map((c, i) => (
            <motion.div
              key={c.symbol}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
              className="group relative rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 flex items-center gap-3 cursor-default overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: `radial-gradient(circle at 30% 50%, ${c.color}18, transparent 60%)` }}
              />
              <div
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}30` }}
              >
                {c.icon}
              </div>
              <div className="relative">
                <div className="text-xs font-bold text-white">{c.symbol}</div>
                <div className="text-[10px] text-gray-500">{c.name}</div>
              </div>
              <div
                className="absolute right-3 top-3 w-1.5 h-1.5 rounded-full opacity-60"
                style={{ background: c.color, boxShadow: `0 0 6px ${c.color}` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
