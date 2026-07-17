"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { ChartCanvas, type Candle, type Drawing, type DrawingTool, type ChartType, type MagnetMode, type OpenPosition } from "./chart-canvas";
import { ChartToolbar } from "./chart-toolbar";
import { ReplayBar } from "./replay-bar";
import { useMarketWS } from "@/hooks/use-market-ws";
import { useReplay } from "@/hooks/use-replay";
import { IconSettings, IconX } from "@tabler/icons-react";

interface UserTrade { side: "buy" | "sell"; price: number; time: number; }

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


export function ChartPanel({
  symbol = "BTCUSDT",
  timeframe = "1H",
  onReplayChange,
  saveRef,
}: {
  symbol?:          string;
  timeframe?:       string;
  onReplayChange?:  (active: boolean, toggle: () => void) => void;
  saveRef?:         React.MutableRefObject<(() => void) | null>;
}) {
  const [history,      setHistory]      = useState<Candle[]>([]);
  const [hoverCandle,  setHoverCandle]  = useState<Candle | null>(null);
  const [userTrades,   setUserTrades]   = useState<UserTrade[]>([]);

  const [activeTool,   setActiveTool]   = useState<DrawingTool>("cursor");
  const [drawings,     setDrawings]     = useState<Drawing[]>([]);
  const [chartType,    setChartType]    = useState<ChartType>("candle");
  const [visibleMAs,   setVisibleMAs]   = useState([true, true, true, true]);
  const [showVolume,   setShowVolume]   = useState(true);
  const [candleColors, setCandleColors] = useState({ up: "#26a69a", down: "#ef5350" });
  const [magnetMode,   setMagnetMode]   = useState<MagnetMode>("off");
  const [chartBg,      setChartBg]      = useState("#0a0b10");
  const [showSettings,   setShowSettings]   = useState(false);
  const [openPositions,  setOpenPositions]  = useState<OpenPosition[]>([]);
  const settingsRef   = useRef<HTMLDivElement>(null);
  const canvasSaveRef = useRef<(() => void) | null>(null);

  const { candle: liveCandle, source: wsSource, connected } = useMarketWS(symbol, timeframe);
  const replay = useReplay(history);

  useEffect(() => {
    if (!saveRef) return;
    saveRef.current = () => canvasSaveRef.current?.();
  }, [saveRef]);

  // Sync open positions from API → chart overlay
  const reloadPositions = useCallback(() => {
    fetch("/api/positions")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.positions) return;
        setOpenPositions(d.positions.map((p: { symbol: string; side: string; entry_price: number; leverage: number }) => ({
          symbol:   p.symbol,
          side:     p.side === "long" ? "buy" : "sell",
          price:    p.entry_price,
          leverage: p.leverage,
        })));
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    reloadPositions();
    window.addEventListener("lyqdex-position-opened", reloadPositions);
    window.addEventListener("lyqdex-position-closed", reloadPositions);
    return () => {
      window.removeEventListener("lyqdex-position-opened", reloadPositions);
      window.removeEventListener("lyqdex-position-closed", reloadPositions);
    };
  }, [reloadPositions]);

  useEffect(() => {
    onReplayChange?.(replay.active, replay.toggle);
  }, [replay.active, replay.toggle, onReplayChange]);

  // Reset history when symbol or timeframe changes
  useEffect(() => {
    setHistory([]);
    let cancelled = false;
    const interval = TF_INTERVAL[timeframe] ?? "1h";
    fetch(`/api/market?symbol=${symbol}&interval=${interval}`)
      .then(r => r.json())
      .then(d => { if (!cancelled && d.candles) setHistory(d.candles); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [symbol, timeframe]);

  useEffect(() => {
    if (replay.active) replay.toggle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, symbol]);

  useEffect(() => {
    if (!showSettings) return;
    function handler(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSettings]);

  const candles = useMemo<Candle[]>(() => {
    if (replay.active) return history.slice(0, replay.cursor);
    if (!liveCandle || !history.length) return history;
    const last = history[history.length - 1];
    if (last.time === liveCandle.time) return [...history.slice(0, -1), liveCandle];
    return [...history, liveCandle].slice(-1500);
  }, [history, liveCandle, replay.active, replay.cursor]);

  useEffect(() => {
    if (replay.active || !liveCandle || !history.length) return;
    const last = history[history.length - 1];
    if (liveCandle.time > last.time) setHistory(prev => [...prev, liveCandle].slice(-1500));
  }, [liveCandle, history, replay.active]);

  // Load trade markers from Supabase positions (all-time, not just open)
  const reloadTrades = useCallback(() => {
    fetch("/api/positions?status=all")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.positions) return;
        setUserTrades(d.positions.map((p: { side: string; entry_price: number; created_at: string }) => ({
          side:  p.side === "long" ? "buy" : "sell",
          price: p.entry_price,
          time:  new Date(p.created_at).getTime(),
        })));
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    reloadTrades();
    window.addEventListener("lyqdex-position-opened", reloadTrades);
    window.addEventListener("lyqdex-position-closed", reloadTrades);
    return () => {
      window.removeEventListener("lyqdex-position-opened", reloadTrades);
      window.removeEventListener("lyqdex-position-closed", reloadTrades);
    };
  }, [reloadTrades]);

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
            {maValues.map(({ label, color, value }, i) =>
              visibleMAs[i] && value ? (
                <span key={label} style={{ color }} className="tabular-nums">{label}: {fmt(value)}</span>
              ) : null,
            )}
          </span>

          <span className="ml-auto flex items-center gap-2 relative">
            <div ref={settingsRef} className="relative">
              <button
                onClick={() => setShowSettings(s => !s)}
                title="Chart-Einstellungen"
                className={`p-0.5 rounded border transition ${showSettings ? "border-white/[0.18] text-gray-300" : "border-white/[0.06] text-gray-600 hover:text-gray-300 hover:border-white/[0.14]"}`}
              >
                <IconSettings className="h-3 w-3" />
              </button>

              {showSettings && (
                <div className="absolute right-0 top-6 z-50 w-52 rounded-lg border border-white/[0.08] bg-[#0d0e15] shadow-xl p-3 text-[10px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 font-medium">Einstellungen</span>
                    <button onClick={() => setShowSettings(false)} className="text-gray-600 hover:text-white"><IconX className="h-3 w-3" /></button>
                  </div>
                  <p className="text-gray-600 mb-1 uppercase tracking-widest text-[8px]">Moving Averages</p>
                  {MA_CONFIG.map(({ label, color }, i) => (
                    <label key={label} className="flex items-center gap-2 py-0.5 cursor-pointer hover:text-white text-gray-400">
                      <input type="checkbox" checked={visibleMAs[i]} onChange={() => setVisibleMAs(prev => prev.map((v, j) => j === i ? !v : v))} className="accent-cyan-500 h-2.5 w-2.5" />
                      <span style={{ color }}>{label}</span>
                    </label>
                  ))}
                  <div className="border-t border-white/[0.06] my-2" />
                  <label className="flex items-center gap-2 mb-2 cursor-pointer hover:text-white text-gray-400">
                    <input type="checkbox" checked={showVolume} onChange={() => setShowVolume(v => !v)} className="accent-cyan-500 h-2.5 w-2.5" />
                    Volumen
                  </label>
                  <div className="border-t border-white/[0.06] my-2" />
                  <p className="text-gray-600 mb-1.5 uppercase tracking-widest text-[8px]">Kerzen-Farben</p>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-emerald-400">
                      <input type="color" value={candleColors.up} onChange={e => setCandleColors(c => ({ ...c, up: e.target.value }))} className="h-4 w-6 rounded border-0 cursor-pointer bg-transparent p-0" />
                      Long
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-red-400">
                      <input type="color" value={candleColors.down} onChange={e => setCandleColors(c => ({ ...c, down: e.target.value }))} className="h-4 w-6 rounded border-0 cursor-pointer bg-transparent p-0" />
                      Short
                    </label>
                  </div>
                  <div className="border-t border-white/[0.06] my-2" />
                  <p className="text-gray-600 mb-1.5 uppercase tracking-widest text-[8px]">Hintergrund</p>
                  <label className="flex items-center gap-2 cursor-pointer text-gray-400">
                    <input type="color" value={chartBg} onChange={e => setChartBg(e.target.value)} className="h-4 w-6 rounded border-0 cursor-pointer bg-transparent p-0" />
                    Chart Hintergrund
                  </label>
                </div>
              )}
            </div>

            {!replay.active && (
              <span className="flex items-center gap-1 text-[10px] text-gray-600">
                <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-gray-600"}`} />
                {connected ? wsSource : "connecting…"}
              </span>
            )}
          </span>
        </div>
      )}

      {/* Toolbar + chart canvas */}
      <div className="flex-1 min-h-0 flex flex-col relative">
        <div className="flex-1 min-h-0 flex">
          <ChartToolbar
            activeTool={activeTool}
            onToolChange={t => setActiveTool(t)}
            chartType={chartType}
            onTypeChange={t => setChartType(t)}
            magnetMode={magnetMode}
            onMagnetChange={setMagnetMode}
            onClearAll={() => setDrawings([])}
          />
          <div className="flex-1 min-w-0">
            {candles.length > 0 ? (
              <ChartCanvas
                candles={candles}
                userTrades={visibleTrades}
                onHover={setHoverCandle}
                chartType={chartType}
                visibleMAs={visibleMAs}
                showVolume={showVolume}
                candleColors={candleColors}
                magnetMode={magnetMode}
                activeTool={activeTool}
                drawings={drawings}
                onAddDrawing={d => { setDrawings(prev => [...prev, d]); setActiveTool("cursor"); }}
                onUpdateDrawing={d => setDrawings(prev => prev.map(x => x.id === d.id ? d : x))}
                onDeleteDrawing={id => setDrawings(prev => prev.filter(x => x.id !== id))}
                saveRef={canvasSaveRef}
                symbol={symbol}
                chartBg={chartBg}
                openPositions={openPositions}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-600 text-xs">
                Lade Marktdaten…
              </div>
            )}
          </div>
        </div>

      </div>

      {replay.active && (
        <ReplayBar replay={replay} current={candles.at(-1) ?? null} timeframe={timeframe} />
      )}
    </div>
  );
}
