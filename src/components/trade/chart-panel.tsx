"use client";

import { useEffect, useState, useMemo } from "react";
import { ChartCanvas, type Candle } from "./chart-canvas";

interface UserTrade {
  side: "buy" | "sell";
  price: number;
  time: number;
}

const TF_INTERVAL: Record<string, string> = {
  "1m": "1m", "5m": "5m", "15m": "15m", "1H": "1h", "4H": "4h", "1D": "1d",
};
const MA_CONFIG = [
  { period: 5,  color: "#f59e0b", label: "MA5"  },
  { period: 10, color: "#22d3ee", label: "MA10" },
  { period: 30, color: "#3b82f6", label: "MA30" },
  { period: 60, color: "#a855f7", label: "MA60" },
];

function calcMA(candles: Candle[], period: number) {
  if (candles.length < period) return null;
  return candles.slice(-period).reduce((s, c) => s + c.close, 0) / period;
}

export function ChartPanel({ timeframe = "1H" }: { timeframe?: string }) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [hoverCandle, setHoverCandle] = useState<Candle | null>(null);
  const [userTrades, setUserTrades] = useState<UserTrade[]>([]);

  useEffect(() => {
    try { setUserTrades(JSON.parse(localStorage.getItem("lyqdex_trades") || "[]")); } catch {}
  }, []);
  useEffect(() => {
    const handler = (e: Event) => setUserTrades((p) => [...p, (e as CustomEvent<UserTrade>).detail]);
    window.addEventListener("lyqdex-trade", handler);
    return () => window.removeEventListener("lyqdex-trade", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetch(`/api/market?symbol=BTCUSDT&interval=${TF_INTERVAL[timeframe] ?? "1h"}`)
        .then((r) => r.json())
        .then((d) => { if (!cancelled && d.candles) setCandles(d.candles); })
        .catch(() => {});
    }
    load();
    const iv = setInterval(load, 10000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [timeframe]);

  const maValues = useMemo(
    () => MA_CONFIG.map(({ period, color, label }) => ({ label, color, value: calcMA(candles, period) })),
    [candles]
  );

  const display = hoverCandle ?? candles.at(-1) ?? null;
  const delta = display ? display.close - display.open : 0;
  const deltaPct = display?.open ? (delta / display.open) * 100 : 0;
  const isUp = delta >= 0;
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="h-full flex flex-col">
      {/* OHLC info bar */}
      {display && (
        <div className="flex flex-wrap items-center gap-x-3 px-2 py-0.5 text-[11px] shrink-0 border-b border-white/[0.04]">
          <span className="text-gray-500">Open: <span className={isUp ? "text-emerald-400" : "text-red-400"}>{fmt(display.open)}</span></span>
          <span className="text-gray-500">Close: <span className={isUp ? "text-emerald-400" : "text-red-400"}>{fmt(display.close)}</span></span>
          <span className="text-gray-500">High: <span className="text-emerald-400">{fmt(display.high)}</span></span>
          <span className="text-gray-500">Low: <span className="text-red-400">{fmt(display.low)}</span></span>
          <span className={isUp ? "text-emerald-400" : "text-red-400"}>
            {isUp ? "+" : ""}{fmt(delta)} ({isUp ? "+" : ""}{deltaPct.toFixed(2)}%)
          </span>
          <span className="hidden xl:flex items-center gap-2 ml-1">
            {maValues.map(({ label, color, value }) =>
              value ? (
                <span key={label} style={{ color }} className="tabular-nums">
                  {label}: {fmt(value)}
                </span>
              ) : null
            )}
          </span>
        </div>
      )}

      <div className="flex-1 min-h-0">
        {candles.length > 0 ? (
          <ChartCanvas candles={candles} userTrades={userTrades} onHover={setHoverCandle} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600 text-xs">
            Lade Marktdaten…
          </div>
        )}
      </div>
    </div>
  );
}
