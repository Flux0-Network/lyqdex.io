"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ChartCanvas, type Candle } from "./chart-canvas";
import { ReplayBar } from "./replay-bar";
import { useMarketWS } from "@/hooks/use-market-ws";
import { useReplay } from "@/hooks/use-replay";

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
  const [history, setHistory]         = useState<Candle[]>([]);
  const [hoverCandle, setHoverCandle] = useState<Candle | null>(null);
  const [userTrades, setUserTrades]   = useState<UserTrade[]>([]);

  const { candle: liveCandle, source: wsSource, connected } = useMarketWS("BTCUSDT", timeframe);
  const replay = useReplay(history);

  // Load historical candles via REST
  useEffect(() => {
    let cancelled = false;
    const interval = TF_INTERVAL[timeframe] ?? "1h";
    fetch(`/api/market?symbol=BTCUSDT&interval=${interval}`)
      .then(r => r.json())
      .then(d => { if (!cancelled && d.candles) setHistory(d.candles); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [timeframe]);

  // Exit replay on timeframe switch
  useEffect(() => {
    if (replay.active) replay.toggle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  // Merge live candle into history (skipped during replay)
  const candles = useMemo<Candle[]>(() => {
    if (replay.active) return history.slice(0, replay.cursor);
    if (!liveCandle || !history.length) return history;
    const last = history[history.length - 1];
    if (last.time === liveCandle.time) return [...history.slice(0, -1), liveCandle];
    return [...history, liveCandle].slice(-500);
  }, [history, liveCandle, replay.active, replay.cursor]);

  // Absorb closed candle into history
  useEffect(() => {
    if (replay.active || !liveCandle || !history.length) return;
    const last = history[history.length - 1];
    if (liveCandle.time > last.time) setHistory(prev => [...prev, liveCandle].slice(-500));
  }, [liveCandle, history, replay.active]);

  // User trades
  useEffect(() => {
    try { setUserTrades(JSON.parse(localStorage.getItem("lyqdex_trades") || "[]")); } catch {}
  }, []);
  useEffect(() => {
    const handler = (e: Event) =>
      setUserTrades(p => [...p, (e as CustomEvent<UserTrade>).detail]);
    window.addEventListener("lyqdex-trade", handler);
    return () => window.removeEventListener("lyqdex-trade", handler);
  }, []);

  // In replay mode, only show trades up to the current cursor candle's timestamp
  const visibleTrades = useMemo(() => {
    if (!replay.active || !candles.at(-1)) return userTrades;
    const cutoff = candles.at(-1)!.time * 1000;
    return userTrades.filter(t => t.time <= cutoff);
  }, [userTrades, replay.active, candles]);

  const maValues = useMemo(
    () => MA_CONFIG.map(({ period, color, label }) => ({ label, color, value: calcMA(candles, period) })),
    [candles],
  );

  const display  = hoverCandle ?? candles.at(-1) ?? null;
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
              ) : null,
            )}
          </span>

          {/* Right: replay toggle + WS status */}
          <span className="ml-auto flex items-center gap-2">
            <button
              onClick={replay.toggle}
              title="Replay / Backtest"
              className={`text-[9px] px-1.5 py-0.5 rounded border transition font-medium ${
                replay.active
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                  : "border-white/[0.08] text-gray-600 hover:text-gray-300 hover:border-white/[0.18]"
              }`}
            >
              ⏮ Replay
            </button>
            {!replay.active && (
              <span className="flex items-center gap-1 text-[10px] text-gray-600">
                <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-gray-600"}`} />
                {connected ? wsSource : "connecting…"}
              </span>
            )}
          </span>
        </div>
      )}

      {/* Chart canvas */}
      <div className="flex-1 min-h-0">
        {candles.length > 0 ? (
          <ChartCanvas candles={candles} userTrades={visibleTrades} onHover={setHoverCandle} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600 text-xs">
            Lade Marktdaten…
          </div>
        )}
      </div>

      {/* Replay control bar — shown only when replay is active */}
      {replay.active && (
        <ReplayBar replay={replay} current={candles.at(-1) ?? null} timeframe={timeframe} />
      )}

    </div>
  );
}
