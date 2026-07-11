"use client";

import { useEffect, useState, useMemo } from "react";
import { ChartCanvas, type Candle } from "./chart-canvas";

interface UserTrade {
  side: "buy" | "sell";
  price: number;
  time: number;
}

const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D"];
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
  const last = candles.at(-1);
  if (!last || candles.length < period) return null;
  return candles.slice(-period).reduce((s, c) => s + c.close, 0) / period;
}

export function ChartPanel() {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [ticker, setTicker] = useState<{ price: string; change: string; high: string; low: string; volume: string } | null>(null);
  const [timeframe, setTimeframe] = useState("1H");
  const [hoverCandle, setHoverCandle] = useState<Candle | null>(null);
  const [userTrades, setUserTrades] = useState<UserTrade[]>([]);

  // load persisted trades
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
      fetch(`/api/market?symbol=BTCUSDT&interval=${TF_INTERVAL[timeframe]}`)
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          if (d.candles) setCandles(d.candles);
          if (d.ticker)  setTicker(d.ticker);
        })
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
    n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-white/[0.06] shrink-0">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-2 py-0.5 text-[11px] rounded transition ${
              timeframe === tf ? "text-white bg-white/10" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tf}
          </button>
        ))}
        <div className="ml-auto flex items-center border border-white/[0.07] rounded overflow-hidden">
          {["Original", "Depth"].map((t) => (
            <button
              key={t}
              className={`px-2.5 py-0.5 text-[11px] border-r border-white/[0.06] last:border-r-0 transition ${
                t === "Original" ? "text-white bg-white/8" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* OHLC info bar */}
      {display && (
        <div className="flex flex-wrap items-center gap-x-3 px-2 py-0.5 text-[11px] shrink-0 border-b border-white/[0.03]">
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
                  {label}: {value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              ) : null
            )}
          </span>
        </div>
      )}

      {/* Custom canvas chart — no TradingView */}
      <div className="flex-1 min-h-0">
        {candles.length > 0 ? (
          <ChartCanvas
            candles={candles}
            userTrades={userTrades}
            onHover={setHoverCandle}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600 text-xs">
            Lade Marktdaten…
          </div>
        )}
      </div>
    </div>
  );
}
