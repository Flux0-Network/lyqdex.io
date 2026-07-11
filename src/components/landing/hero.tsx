"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const STATS = [
  { label: "24h Volumen",   value: "$4.2B+"  },
  { label: "Aktive Trader", value: "280K+"   },
  { label: "Latenz",        value: "<5ms"    },
  { label: "Märkte",        value: "500+"    },
];

// Pre-generated realistic-looking BTC candles for the hero preview
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

function HeroChart() {
  const W = 720, H = 220;
  const pad = { l: 8, r: 56, t: 12, b: 28 };
  const cw = (W - pad.l - pad.r) / CANDLES.length;
  const bw = cw * 0.55;

  const allVals = CANDLES.flatMap(([, o, h, l, c]) => [o, h, l, c]);
  const lo = Math.min(...allVals) - 6;
  const hi = Math.max(...allVals) + 6;
  const range = hi - lo;

  function py(v: number) { return pad.t + (H - pad.t - pad.b) * (1 - (v - lo) / range); }
  function cx(i: number) { return pad.l + i * cw + cw / 2; }

  // Simple MA5
  const ma5 = CANDLES.map((_, i) => {
    if (i < 4) return null;
    const avg = CANDLES.slice(i - 4, i + 1).reduce((s, c) => s + c[4], 0) / 5;
    return avg;
  });
  const ma5Path = ma5.reduce((p, v, i) => {
    if (v == null) return p;
    return p + `${p ? "L" : "M"}${cx(i)},${py(v)} `;
  }, "");

  const ma20 = CANDLES.map((_, i) => {
    if (i < 19) return null;
    const avg = CANDLES.slice(i - 19, i + 1).reduce((s, c) => s + c[4], 0) / 20;
    return avg;
  });
  const ma20Path = ma20.reduce((p, v, i) => {
    if (v == null) return p;
    return p + `${p ? "L" : "M"}${cx(i)},${py(v)} `;
  }, "");

  const lastClose = CANDLES[CANDLES.length - 1][4];
  const lastY = py(lastClose);
  const isUp = lastClose >= CANDLES[CANDLES.length - 1][1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      {/* Grid */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={pad.l} y1={pad.t + (H - pad.t - pad.b) * t}
          x2={W - pad.r} y2={pad.t + (H - pad.t - pad.b) * t}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      <line x1={W - pad.r} y1={pad.t} x2={W - pad.r} y2={H - pad.b}
        stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

      {/* MA lines */}
      <path d={ma20Path} fill="none" stroke="#3b82f6" strokeWidth="1.2" opacity="0.8" />
      <path d={ma5Path}  fill="none" stroke="#f59e0b" strokeWidth="1.2" opacity="0.9" />

      {/* Candles */}
      {CANDLES.map(([, o, h, l, c], i) => {
        const up   = c >= o;
        const col  = up ? "#26a69a" : "#ef5350";
        const top  = py(Math.max(o, c));
        const bot  = py(Math.min(o, c));
        const bh   = Math.max(1, bot - top);
        const x    = cx(i);
        return (
          <g key={i}>
            <line x1={x} y1={py(h)} x2={x} y2={py(l)} stroke={col} strokeWidth="1" />
            <rect x={x - bw / 2} y={top} width={bw} height={bh} fill={col} />
          </g>
        );
      })}

      {/* Current price line */}
      <line x1={pad.l} y1={lastY} x2={W - pad.r} y2={lastY}
        stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3 3" />
      <rect x={W - pad.r} y={lastY - 9} width={pad.r - 2} height={18}
        fill={isUp ? "#26a69a" : "#ef5350"} rx="2" />
      <text x={W - pad.r + (pad.r - 2) / 2} y={lastY + 1}
        fill="white" fontSize="8" fontFamily="monospace" textAnchor="middle" dominantBaseline="middle"
        fontWeight="bold">
        64,256
      </text>

      {/* Time labels */}
      {[6, 14, 22, 29].map((i) => (
        <text key={i} x={cx(i)} y={H - 6} fill="rgba(255,255,255,0.25)"
          fontSize="7" fontFamily="monospace" textAnchor="middle">
          {["07/11", "07/12", "07/12", "07/13"][Math.floor(i / 7)]} 00:00
        </text>
      ))}
    </svg>
  );
}

function LivePrice() {
  const [price, setPrice] = useState(64256.00);
  const [dir, setDir]     = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      setPrice(prev => {
        const next = prev + (Math.random() - 0.49) * 12;
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

export function Hero() {
  return (
    <section className="min-h-screen bg-[#080910] overflow-hidden relative flex flex-col">

      {/* Dot grid background */}
      <div className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-purple-500/6 rounded-full blur-[100px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-36 pb-20 flex-1">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs text-gray-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Beta · Jetzt kostenlos starten
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] max-w-3xl"
        >
          <span className="text-white">Charts. Trades.</span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Eine Plattform.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-base text-gray-400 max-w-lg leading-relaxed"
        >
          Professionelle Charts wie TradingView. Trading wie Binance.
          Non-custodial, hybrid — du behältst deine Keys.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-9 flex flex-col sm:flex-row gap-3"
        >
          <Link href="/register"
            className="px-8 py-3 rounded-xl bg-white hover:bg-gray-100 text-black font-semibold text-sm transition">
            Konto erstellen
          </Link>
          <Link href="/trade"
            className="px-8 py-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white font-semibold text-sm transition">
            Live Demo →
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-4"
        >
          {STATS.map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-lg font-bold text-white">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Terminal preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 w-full max-w-4xl"
        >
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d14] shadow-[0_40px_120px_rgba(0,0,0,0.7)] overflow-hidden">

            {/* Terminal top bar */}
            <div className="flex items-center gap-3 px-4 h-10 border-b border-white/[0.06] bg-[#0c0d14]">
              <Image src="/lyqdex-icon.png" alt="LyqDex" width={18} height={18} />
              <div className="flex items-center gap-1.5 text-xs text-white font-semibold">
                BTC<span className="text-gray-500">/USDT</span>
              </div>
              <div className="text-sm font-bold">
                <LivePrice />
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">+0.28%</span>
              <div className="ml-auto flex gap-1">
                {["1m","5m","15m","1H","4H","1D"].map(tf => (
                  <span key={tf} className={`text-[10px] px-1.5 py-0.5 rounded ${tf === "1H" ? "bg-white/10 text-white" : "text-gray-600"}`}>
                    {tf}
                  </span>
                ))}
              </div>
            </div>

            {/* Chart SVG */}
            <div className="bg-[#0a0b10] px-2 pt-2 pb-1">
              <HeroChart />
            </div>

            {/* Bottom bar */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-white/[0.04] text-[10px] text-gray-600">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> WebSocket Live
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-0.5 bg-[#f59e0b] rounded" /> MA5
                <span className="w-2 h-0.5 bg-[#3b82f6] rounded" /> MA20
              </span>
              <span className="ml-auto">Binance · Bybit · OKX</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
