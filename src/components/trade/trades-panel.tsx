"use client";

import { useEffect, useRef, useState } from "react";

interface Trade {
  price: string;
  amount: string;
  side: "buy" | "sell";
  time: number;
}

export function TradesPanel() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [flash, setFlash] = useState<number | null>(null);
  const prevTop = useRef<string | null>(null);

  useEffect(() => {
    function load() {
      fetch("/api/market?symbol=BTCUSDT")
        .then((r) => r.json())
        .then((d) => {
          if (d.trades) {
            setTrades(d.trades);
            if (prevTop.current !== d.trades[0]?.price) {
              setFlash(0);
              setTimeout(() => setFlash(null), 400);
              prevTop.current = d.trades[0]?.price;
            }
          }
        })
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col text-[11px]">
      <div className="grid px-3 py-1 border-b border-white/[0.06] text-gray-500"
        style={{ gridTemplateColumns: "1fr 1fr 1fr 14px" }}>
        <div>Preis (USDT)</div>
        <div className="text-right">Menge (BTC)</div>
        <div className="text-right">Zeit</div>
        <div />
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {trades.map((t, i) => {
          const isBuy = t.side === "buy";
          return (
            <div
              key={i}
              className={`grid px-3 py-[3px] transition-colors ${
                flash === i ? (isBuy ? "bg-emerald-500/10" : "bg-red-500/10") : "hover:bg-white/[0.02]"
              }`}
              style={{ gridTemplateColumns: "1fr 1fr 1fr 14px" }}
            >
              <div className={`tabular-nums font-medium ${isBuy ? "text-emerald-400" : "text-red-400"}`}>
                {parseFloat(t.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-right text-gray-400 tabular-nums">{parseFloat(t.amount).toFixed(4)}</div>
              <div className="text-right text-gray-600 tabular-nums">
                {new Date(t.time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
              <div className="flex items-center justify-end">
                {isBuy
                  ? <span className="text-emerald-400 text-[9px] leading-none">▲</span>
                  : <span className="text-red-400 text-[9px] leading-none">▼</span>
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
