"use client";

import { useEffect, useState } from "react";

interface Trade {
  price: string;
  amount: string;
  side: "buy" | "sell";
  time: number;
}

export function TradesPanel() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    function load() {
      fetch("/api/market?symbol=BTCUSDT")
        .then((r) => r.json())
        .then((d) => {
          if (d.trades) setTrades(d.trades);
        })
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col text-[11px]">
      <div className="px-3 py-2 border-b border-white/5 font-semibold text-xs text-white">
        Letzte Trades
      </div>
      <div className="grid grid-cols-3 gap-2 px-3 py-1 text-gray-500 border-b border-white/5">
        <div>Preis</div>
        <div className="text-right">Menge</div>
        <div className="text-right">Zeit</div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {trades.map((t, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 px-3 py-0.5">
            <div className={t.side === "buy" ? "text-emerald-400" : "text-red-400"}>
              {parseFloat(t.price).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-right text-gray-400">{parseFloat(t.amount).toFixed(4)}</div>
            <div className="text-right text-gray-500">
              {new Date(t.time).toLocaleTimeString("de-DE")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
