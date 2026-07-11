"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ChartCanvas, type Candle } from "./chart-canvas";
import { useMarketWS } from "@/hooks/use-market-ws";

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
  const [history, setHistory] = useState<Candle[]>([]);
  const [hoverCandle, setHoverCandle] = useState<Candle | null>(null);
  const [userTrades, setUserTrades] = useState<UserTrade[]>([]);

  // WebSocket — real-time current candle
  const { candle: liveCandle, source: wsSource, connected } = useMarketWS("BTCUSDT", timeframe);

  // Load historical candles via REST
  useEffect(() => {
    let cancelled = false;
    const interval = TF_INTERVAL[timeframe] ?? "1h";
    fetch(`/api/market?symbol=BTCUSDT&interval=${interval}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d.candles) setHistory(d.candles); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [timeframe]);

  // Merge live candle into history
  const candles = useMemo<Candle[]>(() => {
    if (!liveCandle || !history.length) return history;
    const last = history[history.length - 1];
    if (last.time === liveCandle.time) {
      // Update the forming candle
      return [...history.slice(0, -1), liveCandle];
    }
    // New candle started
    return [...history, liveCandle].slice(-500);
  }, [history, liveCandle]);

  // When a new candle closes, absorb it into history so it stays
  useEffect(() => {
    if (!liveCandle || !history.length) return;
    const last = history[history.length - 1];
    if (liveCandle.time > last.time) {
      setHistory(prev => [...prev, liveCandle].slice(-500));
    }
  }, [liveCandle, history]);

  // User trades
  useEffect(() => {
    try { setUserTrades(JSON.parse(localStorage.getItem("lyqdex_trades") || "[]")); } catch {}
  }, []);
  useEffect(() => {
    const handler = (e: Event) =>
      setUserTrades((p) => [...p, (e as CustomEvent<UserTrade>).detail]);
    window.addEventListener("lyqdex-trade", handler);
    return () => window.removeEventListener("lyqdex-trade", handler);
  }, []);

  const maValues = useMemo(
    () => MA_CONFIG.map(({ period, color, label }) => ({ label, color, value: calcMA(candles, period) })),
    [candles]
  );

  const display = hoverCandle ?? candles.at(-1) ?? null;
  const delta    = display ? display.close - display.open : 0;
  const deltaPct = display?.open ? (delta / display.open) * 100 : 0;
  const isUp     = delta >= 0;
  const fmt      = useCallback((n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), []);

  return (
    <div className="h-full flex flex-col">
      {/* OHLC info bar */}
      {display && (
        <div className="flex flex-wrap items-center gap-x-3 px-2 py-0.5 text-[11px] shrink-0 border-b border-white/[0.04]">
          <span className="text-gray-500">O: <span className={isUp ? "text-emerald-400" : "text-red-400"}>{fmt(display.open)}</span></span>
          <span className="text-gray-500">H: <span className="text-emerald-400">{fmt(display.high)}</span></span>
          <span className="text-gray-500">L: <span className="text-red-400">{fmt(display.low)}</span></span>
          <span className="text-gray-500">C: <span className={isUp ? "text-emerald-400" : "text-red-400"}>{fmt(display.close)}</span></span>
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
          {/* WS status indicator */}
          <span className="ml-auto flex items-center gap-1 text-[10px] text-gray-600">
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-gray-600"}`} />
            {connected ? wsSource : "connecting…"}
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
