"use client";

import { useMemo } from "react";

function generateTrades(count: number) {
  const trades = [];
  const basePrice = 43251.20;
  for (let i = 0; i < count; i++) {
    const side = Math.random() > 0.5 ? "buy" : "sell";
    const price = basePrice + (Math.random() - 0.5) * 30;
    const amount = Math.random() * 1.5 + 0.001;
    const time = new Date(Date.now() - i * (Math.random() * 5000 + 1000));
    trades.push({
      side,
      price: price.toFixed(2),
      amount: amount.toFixed(4),
      time: time.toLocaleTimeString("de-DE"),
    });
  }
  return trades;
}

export function TradesPanel() {
  const trades = useMemo(() => generateTrades(30), []);

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
              {t.price}
            </div>
            <div className="text-right text-gray-400">{t.amount}</div>
            <div className="text-right text-gray-500">{t.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
