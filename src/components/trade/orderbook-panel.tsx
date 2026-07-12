"use client";

import { useEffect, useState } from "react";
import { IconArrowUp } from "@tabler/icons-react";

interface OrderEntry {
  price: string;
  amount: string;
}

function BookRow({
  entry,
  maxTotal,
  side,
}: {
  entry: OrderEntry;
  maxTotal: number;
  side: "ask" | "bid";
}) {
  const price = parseFloat(entry.price);
  const amount = parseFloat(entry.amount);
  const total = price * amount;
  const pct = Math.min((total / maxTotal) * 100, 100);
  const isBid = side === "bid";

  return (
    <div className="relative grid px-2 py-[3px] hover:bg-white/[0.02] cursor-pointer"
      style={{ gridTemplateColumns: "1fr 1fr 1fr 14px" }}>
      {/* depth bar from right */}
      <div
        className={`absolute right-0 top-0 bottom-0 ${isBid ? "bg-emerald-500/20" : "bg-red-500/20"}`}
        style={{ width: `${pct}%` }}
      />
      {/* right-edge accent line */}
      <div
        className={`absolute right-0 top-[1px] bottom-[1px] w-[2px] ${isBid ? "bg-emerald-500/40" : "bg-red-500/40"}`}
        style={{ right: `${100 - pct}%` }}
      />
      <div className={`relative tabular-nums font-medium text-[11px] ${isBid ? "text-emerald-400" : "text-red-400"}`}>
        {price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="relative text-right text-gray-400 text-[11px] tabular-nums">
        {amount.toFixed(4)}
      </div>
      <div className="relative text-right text-gray-500 text-[11px] tabular-nums">
        {total.toFixed(2)}
      </div>
      {/* right-side buy/sell indicator */}
      <div className="relative flex items-center justify-end">
        <span className={`text-[9px] leading-none ${isBid ? "text-emerald-400" : "text-red-400"}`}>
          {isBid ? "▲" : "▼"}
        </span>
      </div>
    </div>
  );
}

export function OrderbookPanel({ symbol = "BTCUSDT" }: { symbol?: string }) {
  const [asks, setAsks] = useState<OrderEntry[]>([]);
  const [bids, setBids] = useState<OrderEntry[]>([]);
  const [midPrice, setMidPrice] = useState("0");
  const [change, setChange] = useState("0");

  const base = symbol.replace(/USDT$/i, "");

  useEffect(() => {
    function load() {
      fetch(`/api/market?symbol=${symbol}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.orderbook) {
            setAsks(d.orderbook.asks.slice(0, 12).reverse());
            setBids(d.orderbook.bids.slice(0, 12));
          }
          if (d.ticker) {
            setMidPrice(d.ticker.price);
            setChange(d.ticker.change);
          }
        })
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [symbol]);

  const maxTotal = Math.max(
    ...asks.map((o) => parseFloat(o.price) * parseFloat(o.amount)),
    ...bids.map((o) => parseFloat(o.price) * parseFloat(o.amount)),
    1
  );

  const isUp = parseFloat(change) >= 0;

  return (
    <div className="h-full flex flex-col text-[11px]">
      {/* header */}
      <div className="grid px-2 py-1 text-gray-500 border-b border-white/[0.06]"
        style={{ gridTemplateColumns: "1fr 1fr 1fr 14px" }}>
        <div>Preis (USDT)</div>
        <div className="text-right">Menge ({base})</div>
        <div className="text-right">Gesamt</div>
        <div />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        {/* asks (red) — bottom-aligned */}
        <div className="flex-1 flex flex-col justify-end">
          {asks.map((o, i) => (
            <BookRow key={`a${i}`} entry={o} maxTotal={maxTotal} side="ask" />
          ))}
        </div>

        {/* mid price */}
        <div className="flex items-center gap-2 px-2 py-1.5 border-y border-white/[0.06] bg-white/[0.01] shrink-0">
          <span className={`font-bold text-sm tabular-nums ${isUp ? "text-emerald-400" : "text-red-400"}`}>
            {parseFloat(midPrice).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <IconArrowUp className={`h-3 w-3 transition-transform ${isUp ? "text-emerald-400" : "text-red-400 rotate-180"}`} />
          <span className={`text-[10px] tabular-nums ${isUp ? "text-emerald-400" : "text-red-400"}`}>
            {isUp ? "+" : ""}{parseFloat(change).toFixed(2)}%
          </span>
        </div>

        {/* bids (green) */}
        <div className="flex-1 flex flex-col">
          {bids.map((o, i) => (
            <BookRow key={`b${i}`} entry={o} maxTotal={maxTotal} side="bid" />
          ))}
        </div>
      </div>
    </div>
  );
}
