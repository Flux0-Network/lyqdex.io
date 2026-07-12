"use client";

import { motion } from "framer-motion";

const SOCIALS = [
  {
    name: "Discord",
    desc: "Join unserer Community. Strategien, Alpha und Support.",
    members: "12.4K",
    color: "#5865F2",
    bg: "rgba(88,101,242,0.12)",
    border: "rgba(88,101,242,0.25)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    desc: "News, Ankündigungen und direkter Draht zum Team.",
    members: "8.1K",
    color: "#26A5E4",
    bg: "rgba(38,165,228,0.12)",
    border: "rgba(38,165,228,0.25)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
  },
  {
    name: "Twitter / X",
    desc: "Alpha, Charts und Updates direkt in deinem Feed.",
    members: "23.7K",
    color: "#ffffff",
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.15)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
];

export function Community() {
  return (
    <section className="py-24 px-4 bg-[#06070f] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position:"absolute", width:800, height:400,
          bottom:-200, left:"50%", transform:"translateX(-50%)",
          background:"radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)",
        }} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-medium border border-violet-500/20 bg-violet-500/10 text-violet-400">
            Community
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Join der Bewegung.
          </h2>
          <p className="mt-3 text-gray-500 text-sm max-w-sm mx-auto">
            Tausende Trader bauen LyqDex mit uns. Sei dabei von Anfang an.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SOCIALS.map((s, i) => (
            <motion.a
              key={s.name}
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl p-5 flex flex-col gap-4 overflow-hidden cursor-pointer"
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 50% 0%, ${s.color}20, transparent 60%)` }}
              />
              <div className="relative flex items-center justify-between">
                <div style={{ color: s.color }}>{s.icon}</div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}30` }}>
                  {s.members} Mitglieder
                </span>
              </div>
              <div className="relative">
                <div className="text-sm font-bold text-white">{s.name}</div>
                <div className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</div>
              </div>
              <div className="relative flex items-center gap-1 text-xs font-medium" style={{ color: s.color }}>
                Jetzt beitreten →
              </div>
            </motion.a>
          ))}
        </div>

        {/* partners strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-xs text-gray-600 mb-6 uppercase tracking-widest">Unterstützt von</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {["Binance Feed", "CoinGecko", "Chainlink", "The Graph"].map((p) => (
              <span key={p} className="text-sm font-semibold text-gray-600 hover:text-gray-400 transition cursor-default">
                {p}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
