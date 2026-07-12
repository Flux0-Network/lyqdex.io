"use client";

import { useEffect, useState, useRef } from "react";

const INITIAL = [
  { symbol: "BTC", price: 64253.40, change: 2.34,  color: "#f59e0b" },
  { symbol: "ETH", price: 3421.18,  change: -1.12, color: "#6366f1" },
  { symbol: "SOL", price: 178.92,   change: 5.67,  color: "#22d3ee" },
  { symbol: "BNB", price: 589.34,   change: 0.88,  color: "#eab308" },
  { symbol: "ARB", price: 1.24,     change: -2.45, color: "#3b82f6" },
  { symbol: "OP",  price: 2.87,     change: 3.21,  color: "#ef4444" },
  { symbol: "AVAX",price: 38.14,    change: 1.76,  color: "#ef4444" },
  { symbol: "LINK",price: 18.43,    change: -0.54, color: "#3b82f6" },
];

export function Ticker() {
  const [coins, setCoins] = useState(INITIAL);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      setCoins(prev => prev.map(c => ({
        ...c,
        price: +(c.price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(c.price > 100 ? 2 : 4),
        change: +(c.change + (Math.random() - 0.5) * 0.1).toFixed(2),
      })));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  const items = [...coins, ...coins];

  return (
    <div className="relative overflow-hidden border-y border-white/[0.06] bg-[#06070f]/80 backdrop-blur-sm py-3">
      <div
        ref={trackRef}
        className="flex gap-8 animate-[ticker_30s_linear_infinite]"
        style={{ width: "max-content" }}
      >
        {items.map((c, i) => (
          <div key={i} className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-bold" style={{ color: c.color }}>{c.symbol}</span>
            <span className="text-xs text-white font-mono tabular-nums">
              ${c.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-[11px] font-medium tabular-nums ${c.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {c.change >= 0 ? "+" : ""}{c.change.toFixed(2)}%
            </span>
            <span className="text-white/10 text-xs">•</span>
          </div>
        ))}
      </div>

      {/* fade edges */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#06070f] to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#06070f] to-transparent pointer-events-none z-10" />

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
