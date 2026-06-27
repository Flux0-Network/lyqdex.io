"use client";

import { useEffect, useState } from "react";

interface OrderEntry {
  price: string;
  amount: string;
}

export function OrderbookPanel() {
  const [asks, setAsks] = useState<OrderEntry[]>([]);
  const [bids, setBids] = useState<OrderEntry[]>([]);
  const [midPrice, setMidPrice] = useState("0");

  useEffect(() => {
    function load() {
      fetch("/api/market?symbol=BTCUSDT")
        .then((r) => r.json())
        .then((d) => {
          if (d.orderbook) {
            setAsks(d.orderbook.asks.slice(0, 12).reverse());
            setBids(d.orderbook.bids.slice(0, 12));
          }
          if (d.ticker) setMidPrice(d.ticker.price);
        })
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const maxTotal = Math.max(
    ...asks.map((o) => parseFloat(o.price) * parseFloat(o.amount)),
    ...bids.map((o) => parseFloat(o.price) * parseFloat(o.amount)),
    1
  );

  return (
    <div className="h-full flex flex-col text-[11px]">
      <div className="grid grid-cols-3 gap-2 px-3 py-1 text-gray-500 border-b border-white/5">
        <div>Preis</div>
        <div className="text-right">Menge</div>
        <div className="text-right">Gesamt</div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col justify-end">
          {asks.map((o, i) => {
            const total = parseFloat(o.price) * parseFloat(o.amount);
            return (
              <div key={`a${i}`} className="relative grid grid-cols-3 gap-2 px-3 py-0.5">
                <div className="absolute right-0 top-0 bottom-0 bg-red-500/10" style={{ width: `${(total / maxTotal) * 100}%` }} />
                <div className="relative text-red-400">{parseFloat(o.price).toLocaleString("de-DE", { minimumFractionDigits: 2 })}</div>
                <div className="relative text-right text-gray-400">{parseFloat(o.amount).toFixed(4)}</div>
                <div className="relative text-right text-gray-400">{total.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
        <div className="px-3 py-1.5 text-center border-y border-white/5">
          <span className="text-emerald-400 font-semibold text-sm">
            {parseFloat(midPrice).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div>
          {bids.map((o, i) => {
            const total = parseFloat(o.price) * parseFloat(o.amount);
            return (
              <div key={`b${i}`} className="relative grid grid-cols-3 gap-2 px-3 py-0.5">
                <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/10" style={{ width: `${(total / maxTotal) * 100}%` }} />
                <div className="relative text-emerald-400">{parseFloat(o.price).toLocaleString("de-DE", { minimumFractionDigits: 2 })}</div>
                <div className="relative text-right text-gray-400">{parseFloat(o.amount).toFixed(4)}</div>
                <div className="relative text-right text-gray-400">{total.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
