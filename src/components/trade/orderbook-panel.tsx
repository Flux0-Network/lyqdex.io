"use client";

import { useMemo } from "react";

function generateOrders(basePrice: number, side: "ask" | "bid", count: number) {
  const orders = [];
  for (let i = 0; i < count; i++) {
    const offset = side === "ask" ? i * (Math.random() * 5 + 1) : -i * (Math.random() * 5 + 1);
    const price = basePrice + offset;
    const amount = Math.random() * 2 + 0.01;
    orders.push({ price: price.toFixed(2), amount: amount.toFixed(4), total: (price * amount).toFixed(2) });
  }
  return orders;
}

export function OrderbookPanel() {
  const basePrice = 43251.20;
  const asks = useMemo(() => generateOrders(basePrice, "ask", 12).reverse(), []);
  const bids = useMemo(() => generateOrders(basePrice, "bid", 12), []);
  const maxTotal = Math.max(
    ...asks.map((o) => parseFloat(o.total)),
    ...bids.map((o) => parseFloat(o.total))
  );

  return (
    <div className="h-full flex flex-col text-[11px]">
      <div className="px-3 py-2 border-b border-white/5 font-semibold text-xs text-white">
        Orderbuch
      </div>
      <div className="grid grid-cols-3 gap-2 px-3 py-1 text-gray-500 border-b border-white/5">
        <div>Preis</div>
        <div className="text-right">Menge</div>
        <div className="text-right">Gesamt</div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col justify-end">
          {asks.map((o, i) => (
            <div key={`a${i}`} className="relative grid grid-cols-3 gap-2 px-3 py-0.5">
              <div
                className="absolute right-0 top-0 bottom-0 bg-red-500/10"
                style={{ width: `${(parseFloat(o.total) / maxTotal) * 100}%` }}
              />
              <div className="relative text-red-400">{o.price}</div>
              <div className="relative text-right text-gray-400">{o.amount}</div>
              <div className="relative text-right text-gray-400">{o.total}</div>
            </div>
          ))}
        </div>
        <div className="px-3 py-1.5 text-center border-y border-white/5">
          <span className="text-emerald-400 font-semibold text-sm">{basePrice.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</span>
        </div>
        <div>
          {bids.map((o, i) => (
            <div key={`b${i}`} className="relative grid grid-cols-3 gap-2 px-3 py-0.5">
              <div
                className="absolute right-0 top-0 bottom-0 bg-emerald-500/10"
                style={{ width: `${(parseFloat(o.total) / maxTotal) * 100}%` }}
              />
              <div className="relative text-emerald-400">{o.price}</div>
              <div className="relative text-right text-gray-400">{o.amount}</div>
              <div className="relative text-right text-gray-400">{o.total}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
