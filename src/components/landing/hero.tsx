"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const CANDLES = [
  [0,   68,  80,  40,  55],
  [55,  90, 100,  50,  85],
  [85,  70,  92,  65,  68],
  [68,  75,  88,  60,  72],
  [72,  60,  76,  55,  58],
  [58,  50,  65,  44,  48],
  [48,  55,  62,  42,  56],
  [56,  80,  88,  52,  78],
  [78,  85,  98,  72,  90],
  [90,  82,  95,  78,  84],
  [84,  72,  86,  68,  70],
  [70,  65,  74,  58,  62],
  [62,  70,  78,  60,  74],
  [74,  88,  96,  70,  86],
  [86,  92, 105,  82,  98],
  [98, 105, 115,  92, 108],
  [108,100, 112,  95,  96],
  [96,  88,  98,  82,  85],
  [85,  90, 102,  82,  98],
  [98, 106, 114,  96, 110],
  [110,102, 112,  98, 100],
  [100, 95, 104,  88,  92],
  [92,  98, 108,  88, 105],
  [105,112, 120, 102, 115],
  [115,108, 118, 104, 106],
  [106,100, 110,  96,  98],
  [98, 104, 112,  94, 108],
  [108,115, 124, 106, 120],
  [120,116, 126, 112, 118],
  [118,122, 130, 115, 128],
] as [number, number, number, number, number][];

// lowest ask first (closest to spread), highest last
const ASKS = [
  ["64,060.13", "1.2293"], ["64,069.25", "0.8883"], ["64,077.60", "0.7301"],
  ["64,084.41", "0.9852"], ["64,090.34", "0.5023"], ["64,098.25", "1.4087"],
  ["64,109.82", "0.0656"], ["64,116.29", "0.9996"], ["64,119.09", "0.2581"],
];
// highest bid first (closest to spread), lowest last
const BIDS = [
  ["64,040.74", "0.6281"], ["64,028.52", "1.5265"], ["64,021.71", "1.5014"],
  ["64,015.67", "1.5210"], ["64,011.61", "0.6707"], ["64,005.36", "0.8975"],
  ["63,997.12", "0.5463"], ["63,993.52", "0.7980"], ["63,987.52", "0.3544"],
];

const MA_LINES = [
  { period: 5,  color: "#f59e0b", label: "MA5"  },
  { period: 10, color: "#22d3ee", label: "MA10" },
  { period: 30, color: "#3b82f6", label: "MA30" },
];

function calcMA(period: number): (number | null)[] {
  return CANDLES.map((_, i) => {
    if (i < period - 1) return null;
    return CANDLES.slice(i - period + 1, i + 1).reduce((s, c) => s + c[4], 0) / period;
  });
}

function HeroChart() {
  const W = 680, H = 280;
  const pad = { l: 6, r: 52, t: 10, b: 22 };
  const cw = (W - pad.l - pad.r) / CANDLES.length;
  const bw = cw * 0.55;

  const allVals = CANDLES.flatMap(([, o, h, l, c]) => [o, h, l, c]);
  const lo = Math.min(...allVals) - 6;
  const hi = Math.max(...allVals) + 6;
  const range = hi - lo;

  const py = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - (v - lo) / range);
  const cx = (i: number) => pad.l + i * cw + cw / 2;

  const maData = MA_LINES.map(({ period, color }) => ({
    color,
    path: calcMA(period).reduce((p, v, i) => {
      if (v == null) return p;
      return p + `${p ? "L" : "M"}${cx(i)},${py(v)} `;
    }, ""),
  }));

  const lastClose = CANDLES[CANDLES.length - 1][4];
  const lastY = py(lastClose);
  const isUp = lastClose >= CANDLES[CANDLES.length - 1][1];

  const gridPrices = [0.2, 0.4, 0.6, 0.8].map(t => ({
    y: pad.t + (H - pad.t - pad.b) * (1 - t),
    v: Math.round(lo + range * t),
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" xmlns="http://www.w3.org/2000/svg">
      {/* Grid lines */}
      {gridPrices.map(({ y }) => (
        <line key={y} x1={pad.l} y1={y} x2={W - pad.r} y2={y}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      <line x1={W - pad.r} y1={pad.t} x2={W - pad.r} y2={H - pad.b}
        stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

      {/* Price labels */}
      {gridPrices.map(({ y, v }) => (
        <text key={v} x={W - pad.r + 3} y={y} fill="rgba(255,255,255,0.18)"
          fontSize="6.5" fontFamily="monospace" dominantBaseline="middle">{v}</text>
      ))}

      {/* MA lines */}
      {maData.map(({ color, path }) => (
        <path key={color} d={path} fill="none" stroke={color} strokeWidth="1" opacity="0.85" />
      ))}

      {/* Candles */}
      {CANDLES.map(([, o, h, l, c], i) => {
        const up  = c >= o;
        const col = up ? "#26a69a" : "#ef5350";
        const top = py(Math.max(o, c));
        const bot = py(Math.min(o, c));
        const bh  = Math.max(1, bot - top);
        const x   = cx(i);
        return (
          <g key={i}>
            <line x1={x} y1={py(h)} x2={x} y2={py(l)} stroke={col} strokeWidth="1" />
            <rect x={x - bw / 2} y={top} width={bw} height={bh} fill={col} />
          </g>
        );
      })}

      {/* Current price dashed line */}
      <line x1={pad.l} y1={lastY} x2={W - pad.r} y2={lastY}
        stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
      <rect x={W - pad.r} y={lastY - 8} width={pad.r - 2} height={16}
        fill={isUp ? "#26a69a" : "#ef5350"} rx="2" />
      <text x={W - pad.r + (pad.r - 2) / 2} y={lastY}
        fill="white" fontSize="7" fontFamily="monospace" textAnchor="middle"
        dominantBaseline="middle" fontWeight="bold">
        64,256
      </text>

      {/* Time labels */}
      {[3, 10, 19, 27].map((i, idx) => (
        <text key={i} x={cx(i)} y={H - 5} fill="rgba(255,255,255,0.18)"
          fontSize="6" fontFamily="monospace" textAnchor="middle">
          {["07/12 00:00", "07/12 06:00", "07/12 12:00", "07/12 18:00"][idx]}
        </text>
      ))}
    </svg>
  );
}

function LivePrice() {
  const [price, setPrice] = useState(64053.00);
  const [dir, setDir]     = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      setPrice(prev => {
        const next = prev + (Math.random() - 0.49) * 10;
        setDir(next > prev ? "up" : "down");
        setTimeout(() => setDir(null), 600);
        return +next.toFixed(2);
      });
    }, 1800);
    return () => clearInterval(iv);
  }, []);

  return (
    <span className={`tabular-nums transition-colors duration-300 ${
      dir === "up" ? "text-emerald-400" : dir === "down" ? "text-red-400" : "text-white"
    }`}>
      {price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}

const PILLS = [
  { label: "Non-custodial", dot: "bg-emerald-400" },
  { label: "<1ms Latenz",   dot: "bg-cyan-400"    },
  { label: "Replay-Modus",  dot: "bg-amber-400"   },
  { label: "Beta · Kostenlos", dot: "bg-purple-400" },
];

export function Hero() {
  return (
    <section className="min-h-screen bg-white dark:bg-[#080910] overflow-hidden relative flex items-center">

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.3] hidden dark:block" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />
      <div className="absolute inset-0 opacity-[0.35] dark:hidden" style={{
        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />

      {/* Glow orbs */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[400px] bg-cyan-500/6 dark:bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/5 dark:bg-purple-500/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: text ── */}
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="mb-7">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] text-xs text-gray-500 dark:text-gray-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Beta · Jetzt kostenlos starten
              </div>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.06]">
              <span className="text-black dark:text-white">Charts. Trades.</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-500 to-emerald-400 bg-clip-text text-transparent">
                Eine Plattform.
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-base text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
              Echtzeit-Charts mit Indikatoren, Replay-Modus und unter 1ms Matching — alles non-custodial. Deine Keys, deine Coins.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link href="/register"
                className="px-8 py-3 rounded-xl bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black font-semibold text-sm transition text-center">
                Konto erstellen
              </Link>
              <Link href="/trade"
                className="px-8 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.07] dark:hover:bg-white/[0.08] text-gray-700 dark:text-gray-300 font-semibold text-sm transition text-center">
                Live Demo →
              </Link>
            </motion.div>

            {/* Feature pills */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-10 flex flex-wrap gap-2">
              {PILLS.map(({ label, dot }) => (
                <div key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/[0.07] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] text-xs text-gray-600 dark:text-gray-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: terminal mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-[#0c0d14] shadow-[0_32px_80px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">

              {/* ── Ticker bar ── */}
              <div className="flex items-center gap-2 px-3 h-9 border-b border-white/[0.06] bg-[#0c0d14] shrink-0">
                <Image src="/lyqdex-icon.png" alt="LyqDex" width={15} height={15} />
                <span className="text-[10px] font-bold text-white">
                  BTC<span className="text-gray-500">/USDT</span>
                </span>
                <span className="text-[10px] font-bold"><LivePrice /></span>
                <span className="text-[9px] text-emerald-400 font-medium">+0.06%</span>
                <span className="hidden sm:flex items-center gap-2 text-[9px] text-gray-600 ml-1">
                  <span>H <span className="text-gray-400">65,013</span></span>
                  <span>L <span className="text-gray-400">63,092</span></span>
                </span>
                <div className="ml-auto flex items-center gap-0.5">
                  {["1m","5m","15m","1H","4H","1D"].map(tf => (
                    <span key={tf} className={`text-[9px] px-1 py-0.5 rounded ${tf === "1m" ? "bg-white/10 text-white" : "text-gray-600 hover:text-gray-400"}`}>
                      {tf}
                    </span>
                  ))}
                </div>
                <span className="flex items-center gap-1 text-[8px] text-gray-600 ml-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Binance
                </span>
              </div>

              {/* ── OHLC + MA bar ── */}
              <div className="flex items-center gap-2 px-3 py-1 border-b border-white/[0.04] text-[9px] font-mono shrink-0">
                <span className="text-gray-600">O<span className="text-emerald-400 ml-0.5">64,294</span></span>
                <span className="text-gray-600">H<span className="text-emerald-400 ml-0.5">64,294</span></span>
                <span className="text-gray-600">L<span className="text-red-400 ml-0.5">64,265</span></span>
                <span className="text-gray-600">C<span className="text-red-400 ml-0.5">64,265</span></span>
                <span className="text-red-400">-29.10 (-0.05%)</span>
                <span className="hidden sm:flex gap-2 ml-1">
                  {MA_LINES.map(({ label, color }) => (
                    <span key={label} style={{ color }}>
                      {label}: {label === "MA5" ? "64,092" : label === "MA10" ? "64,124" : "64,163"}
                    </span>
                  ))}
                </span>
              </div>

              {/* ── Chart + Orderbook ── */}
              <div className="flex">
                {/* Chart area */}
                <div className="flex-1 min-w-0 bg-[#0a0b10]">
                  <HeroChart />
                </div>

                {/* Orderbook */}
                <div className="w-[108px] shrink-0 border-l border-white/[0.05] flex flex-col bg-[#0c0d14] text-[8px] font-mono">
                  <div className="flex justify-between px-2 py-1 text-[7px] text-gray-600 border-b border-white/[0.04]">
                    <span>Preis</span><span>Menge</span>
                  </div>

                  {/* Asks — rendered bottom-up so lowest ask is closest to spread */}
                  <div className="flex flex-col-reverse">
                    {ASKS.slice(0, 7).map(([p, q]) => (
                      <div key={p} className="flex justify-between items-center px-2 py-[2.5px]">
                        <span className="text-red-400">{p}</span>
                        <span className="text-gray-600">{q}</span>
                      </div>
                    ))}
                  </div>

                  {/* Spread / current price */}
                  <div className="px-2 py-1.5 border-y border-white/[0.06] bg-[#0e0f16]">
                    <div className="text-[9px] font-bold text-white tabular-nums">64,053.00</div>
                    <div className="text-[7px] text-emerald-400 mt-0.5">↑ +0.06%</div>
                  </div>

                  {/* Bids */}
                  <div className="flex flex-col">
                    {BIDS.slice(0, 7).map(([p, q]) => (
                      <div key={p} className="flex justify-between items-center px-2 py-[2.5px]">
                        <span className="text-emerald-400">{p}</span>
                        <span className="text-gray-600">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
