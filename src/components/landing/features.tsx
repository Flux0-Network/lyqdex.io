"use client";

import { motion } from "framer-motion";
import {
  IconPlayerPlay,
  IconChartCandleFilled,
  IconMicroscope,
  IconCode,
  IconNews,
  IconAdjustments,
  IconUsers,
  IconBolt,
} from "@tabler/icons-react";

const features = [
  {
    title: "Chart Replay",
    description: "Spule jeden Markt zurück und trade historische Daten in Echtzeit — perfekt zum Üben und Backtesten.",
    icon: IconPlayerPlay,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    tag: "Einzigartig",
  },
  {
    title: "Trade Analyse",
    description: "Jeder Trade wird automatisch gespeichert. Analysiere Win-Rate, Drawdown, RRR und mehr auf einen Blick.",
    icon: IconMicroscope,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    tag: null,
  },
  {
    title: "Bot Coding",
    description: "Schreib und teste deine eigenen Trading-Bots direkt auf der Plattform — kein externes Setup nötig.",
    icon: IconCode,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    tag: "Bald",
  },
  {
    title: "Eigene Indikatoren",
    description: "Erstelle Custom-Indikatoren mit eigenem Code und binde sie direkt in deine Charts ein.",
    icon: IconAdjustments,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    tag: "Bald",
  },
  {
    title: "News & Sentiment",
    description: "Crypto-News, On-Chain Daten und Social Sentiment — alles aggregiert direkt neben dem Chart.",
    icon: IconNews,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    tag: "Bald",
  },
  {
    title: "Community Strategien",
    description: "Teile deine Setups, folge Top-Tradern und kopiere bewährte Strategien aus der Community.",
    icon: IconUsers,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    tag: "Bald",
  },
  {
    title: "Professionelle Charts",
    description: "Candlestick-Charts mit MA, RSI, MACD und dutzenden weiteren Indikatoren — alles im Browser.",
    icon: IconChartCandleFilled,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    tag: null,
  },
  {
    title: "Echtzeit-Daten",
    description: "WebSocket-Feeds von Binance, Bybit und OKX parallel — unter 1ms Latenz, keine Verzögerung.",
    icon: IconBolt,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    tag: null,
  },
];

export function Features() {
  return (
    <section className="py-24 px-5 bg-gray-50 dark:bg-[#080910]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.03] text-xs text-gray-500 mb-4">
            Was LyqDex kann
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white">
            Mehr als nur ein Exchange.
            <span className="block mt-1 bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
              Deine komplette Trading-Plattform.
            </span>
          </h2>
          <p className="mt-3 text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
            Traden, analysieren, backtesten, automatisieren — alles auf einer Plattform, dezentral und ohne Kompromisse.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="relative p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] hover:border-black/[0.1] dark:hover:border-white/[0.1] hover:shadow-sm transition"
            >
              {f.tag && (
                <span className={`absolute top-3 right-3 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                  f.tag === "Einzigartig"
                    ? "bg-violet-500/15 text-violet-400 border border-violet-500/20"
                    : "bg-white/5 text-gray-500 border border-white/10"
                }`}>
                  {f.tag}
                </span>
              )}
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${f.bg} mb-3`}>
                <f.icon className={`h-4 w-4 ${f.color}`} strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-black dark:text-white mb-1 text-sm">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
