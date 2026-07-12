"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconBell, IconStar,
  IconChevronDown, IconArrowUpRight, IconArrowDownRight,
  IconPlayerPlay, IconCamera, IconCheck,
} from "@tabler/icons-react";

interface Ticker { price: string; change: string; high: string; low: string; volume: string }

const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D"];

const PAIRS = [
  { base: "BTC",  quote: "USDT", symbol: "BTCUSDT"  },
  { base: "ETH",  quote: "USDT", symbol: "ETHUSDT"  },
  { base: "SOL",  quote: "USDT", symbol: "SOLUSDT"  },
  { base: "BNB",  quote: "USDT", symbol: "BNBUSDT"  },
  { base: "XRP",  quote: "USDT", symbol: "XRPUSDT"  },
  { base: "DOGE", quote: "USDT", symbol: "DOGEUSDT" },
  { base: "ADA",  quote: "USDT", symbol: "ADAUSDT"  },
  { base: "AVAX", quote: "USDT", symbol: "AVAXUSDT" },
];

function fmtPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1)    return p.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return p.toLocaleString("en-US", { minimumFractionDigits: 5, maximumFractionDigits: 5 });
}

export function AppNavbar({
  sidebarWidth = 0,
  symbol,
  onSymbol,
  timeframe,
  onTimeframe,
  replayActive,
  onReplayToggle,
  onSaveChart,
}: {
  sidebarWidth?:   number;
  symbol?:         string;
  onSymbol?:       (s: string) => void;
  timeframe?:      string;
  onTimeframe?:    (tf: string) => void;
  replayActive?:   boolean;
  onReplayToggle?: () => void;
  onSaveChart?:    () => void;
}) {
  const [pairOpen,  setPairOpen]  = useState(false);
  const [ticker,    setTicker]    = useState<Ticker | null>(null);
  const [tickerSym, setTickerSym] = useState<string>("");
  const pairRef = useRef<HTMLDivElement>(null);

  const activeSym = symbol ?? "BTCUSDT";
  const activePair = PAIRS.find(p => p.symbol === activeSym) ?? PAIRS[0];

  useEffect(() => {
    let alive = true;
    function load() {
      fetch(`/api/market?symbol=${activeSym}`)
        .then((r) => r.json())
        .then((d) => { if (alive && d.ticker) { setTicker(d.ticker); setTickerSym(activeSym); } })
        .catch(() => {});
    }
    load();
    const iv = setInterval(load, 5000);
    return () => { alive = false; clearInterval(iv); };
  }, [activeSym]);

  // Show the ticker only once it matches the currently selected symbol
  const ready = ticker !== null && tickerSym === activeSym;

  // Close pair dropdown on outside click
  useEffect(() => {
    if (!pairOpen) return;
    function handler(e: MouseEvent) {
      if (pairRef.current && !pairRef.current.contains(e.target as Node)) setPairOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pairOpen]);

  const price  = parseFloat(ticker?.price  ?? "0");
  const change = parseFloat(ticker?.change ?? "0");
  const isUp   = change >= 0;

  return (
    <nav
      className="fixed top-0 right-0 z-40 h-11 bg-[#0c0d14] border-b border-white/[0.06] flex items-center gap-2 px-3"
      style={{ left: sidebarWidth }}
    >
      {/* Pair selector */}
      <div ref={pairRef} className="relative shrink-0">
        <button
          onClick={() => setPairOpen(o => !o)}
          className="flex items-center gap-1.5 group"
        >
          <IconStar className="h-3.5 w-3.5 text-gray-600 group-hover:text-yellow-400 transition" />
          <span className="text-white font-semibold text-sm">{activePair.base}</span>
          <span className="text-gray-500 text-sm">/{activePair.quote}</span>
          <IconChevronDown className={`h-3 w-3 text-gray-600 transition-transform ${pairOpen ? "rotate-180" : ""}`} />
        </button>

        {pairOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setPairOpen(false)} />
            <div className="absolute left-0 top-full mt-1 z-50 w-44 bg-[#0f1018] border border-white/[0.08] rounded-xl py-1 shadow-2xl">
              <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-gray-600">Handelspaar wählen</div>
              {PAIRS.map(p => (
                <button
                  key={p.symbol}
                  onClick={() => { onSymbol?.(p.symbol); setPairOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition hover:bg-white/[0.04] ${
                    p.symbol === activeSym ? "text-cyan-400" : "text-gray-300"
                  }`}
                >
                  <span>
                    <span className="font-semibold">{p.base}</span>
                    <span className="text-gray-500">/{p.quote}</span>
                  </span>
                  {p.symbol === activeSym && <IconCheck className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="w-px h-5 bg-white/[0.07] shrink-0" />

      {/* Live price */}
      {ticker && ready ? (
        <>
          <div className="shrink-0">
            <div className={`text-base font-bold tabular-nums leading-tight ${isUp ? "text-emerald-400" : "text-red-400"}`}>
              {fmtPrice(price)}
            </div>
            <div className="text-[10px] text-gray-500 tabular-nums leading-tight">
              ≈ ${fmtPrice(price)}
            </div>
          </div>

          <div className={`flex items-center gap-0.5 text-xs font-medium tabular-nums shrink-0 ${isUp ? "text-emerald-400" : "text-red-400"}`}>
            {isUp ? <IconArrowUpRight className="h-3.5 w-3.5" /> : <IconArrowDownRight className="h-3.5 w-3.5" />}
            {isUp ? "+" : ""}{change.toFixed(2)}%
          </div>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <div className="w-px h-5 bg-white/[0.07]" />
            {[
              { label: "24h High",      value: ticker.high,   isPrice: true  },
              { label: "24h Low",       value: ticker.low,    isPrice: true  },
              { label: `24h Vol (${activePair.base})`, value: ticker.volume, isPrice: false },
            ].map(({ label, value, isPrice }) => (
              <div key={label}>
                <div className="text-[10px] text-gray-500 leading-tight">{label}</div>
                <div className="text-[11px] text-white font-medium tabular-nums leading-tight">
                  {isPrice
                    ? fmtPrice(parseFloat(value))
                    : parseFloat(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-[11px] text-gray-600">Lade…</div>
      )}

      {/* Timeframe buttons */}
      {onTimeframe && (
        <>
          <div className="w-px h-5 bg-white/[0.07] shrink-0 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-0.5 shrink-0">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframe(tf)}
                className={`px-2 py-0.5 text-[11px] rounded transition ${
                  timeframe === tf ? "text-white bg-white/10" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="flex-1" />

      {/* Replay button */}
      {onReplayToggle && (
        <button
          onClick={onReplayToggle}
          title="Replay / Backtest"
          className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border transition font-medium ${
            replayActive
              ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
              : "border-white/[0.08] text-gray-500 hover:text-white hover:border-white/[0.18]"
          }`}
        >
          <IconPlayerPlay className="h-2.5 w-2.5" />
          Replay
        </button>
      )}

      {/* Save chart */}
      {onSaveChart && (
        <button onClick={onSaveChart} title="Chart als Bild speichern" className="p-1.5 text-gray-500 hover:text-white transition">
          <IconCamera className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Bell */}
      <button className="p-1.5 text-gray-500 hover:text-white transition">
        <IconBell className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
}
