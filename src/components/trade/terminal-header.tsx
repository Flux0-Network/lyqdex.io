"use client";

import { useEffect, useState } from "react";
import { IconChevronDown, IconStar, IconArrowUpRight, IconArrowDownRight } from "@tabler/icons-react";

interface Ticker {
  price: string;
  change: string;
  high: string;
  low: string;
  volume: string;
}

export function TerminalHeader() {
  const [ticker, setTicker] = useState<Ticker | null>(null);

  useEffect(() => {
    function load() {
      fetch("/api/market?symbol=BTCUSDT")
        .then((r) => r.json())
        .then((d) => {
          if (d.ticker) setTicker(d.ticker);
        })
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const price = ticker ? parseFloat(ticker.price) : 0;
  const change = parseFloat(ticker?.change ?? "0");
  const isUp = change >= 0;

  return (
    <div className="flex items-center gap-6 px-4 h-11 border-b border-white/[0.06] bg-[#07080d] shrink-0 overflow-x-auto scrollbar-none">
      {/* Symbol */}
      <button className="flex items-center gap-1.5 shrink-0 group">
        <IconStar className="h-3.5 w-3.5 text-gray-600 group-hover:text-yellow-400 transition" />
        <span className="text-white font-semibold text-sm tracking-wide">BTC</span>
        <span className="text-gray-500 text-sm">/USDT</span>
        <IconChevronDown className="h-3 w-3 text-gray-600" />
      </button>

      <div className="w-px h-5 bg-white/[0.06] shrink-0" />

      {/* Price */}
      <div className="shrink-0">
        <div className={`text-lg font-bold tabular-nums leading-none ${isUp ? "text-emerald-400" : "text-red-400"}`}>
          {price > 0
            ? price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : "—"}
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5 tabular-nums">
          ≈ ${price > 0 ? price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
        </div>
      </div>

      {/* Change */}
      <div className={`flex items-center gap-0.5 shrink-0 text-xs font-medium tabular-nums ${isUp ? "text-emerald-400" : "text-red-400"}`}>
        {isUp ? <IconArrowUpRight className="h-3.5 w-3.5" /> : <IconArrowDownRight className="h-3.5 w-3.5" />}
        {isUp ? "+" : ""}{change.toFixed(2)}%
      </div>

      <div className="w-px h-5 bg-white/[0.06] shrink-0" />

      {/* 24h stats */}
      <div className="flex items-center gap-5 shrink-0">
        <div>
          <div className="text-[10px] text-gray-500">24h High</div>
          <div className="text-[11px] text-white tabular-nums font-medium">
            {ticker?.high
              ? parseFloat(ticker.high).toLocaleString("en-US", { minimumFractionDigits: 2 })
              : "—"}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500">24h Low</div>
          <div className="text-[11px] text-white tabular-nums font-medium">
            {ticker?.low
              ? parseFloat(ticker.low).toLocaleString("en-US", { minimumFractionDigits: 2 })
              : "—"}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500">24h Vol (BTC)</div>
          <div className="text-[11px] text-white tabular-nums font-medium">
            {ticker?.volume
              ? parseFloat(ticker.volume).toLocaleString("en-US", { maximumFractionDigits: 0 })
              : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
