"use client";

import { useState, useEffect } from "react";

export function OrderFormPanel() {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetch("/api/market?symbol=BTCUSDT")
      .then((r) => r.json())
      .then((d) => {
        if (d.ticker?.price) setPrice(parseFloat(d.ticker.price).toFixed(2));
      })
      .catch(() => {});
  }, []);

  const total = price && amount ? (parseFloat(price) * parseFloat(amount)).toFixed(2) : "0.00";

  return (
    <div className="h-full flex flex-col text-xs">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="grid grid-cols-2 gap-1 bg-gray-900 rounded-lg p-0.5">
          <button
            onClick={() => setSide("buy")}
            className={`py-1.5 rounded-md font-medium transition ${
              side === "buy" ? "bg-emerald-500 text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            Kaufen
          </button>
          <button
            onClick={() => setSide("sell")}
            className={`py-1.5 rounded-md font-medium transition ${
              side === "sell" ? "bg-red-500 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Verkaufen
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setOrderType("limit")}
            className={`text-[11px] px-2 py-1 rounded ${orderType === "limit" ? "bg-white/10 text-white" : "text-gray-500"}`}
          >
            Limit
          </button>
          <button
            onClick={() => setOrderType("market")}
            className={`text-[11px] px-2 py-1 rounded ${orderType === "market" ? "bg-white/10 text-white" : "text-gray-500"}`}
          >
            Market
          </button>
        </div>

        {orderType === "limit" && (
          <div>
            <label className="text-gray-500 text-[11px]">Preis (USDT)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full mt-1 bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-500/50"
            />
          </div>
        )}

        <div>
          <label className="text-gray-500 text-[11px]">Menge (BTC)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full mt-1 bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-500/50"
          />
        </div>

        <div className="flex justify-between text-[11px]">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              className="px-2 py-0.5 rounded bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition"
            >
              {pct}%
            </button>
          ))}
        </div>

        <div className="flex justify-between text-gray-500 text-[11px]">
          <span>Gesamt</span>
          <span className="text-white">{total} USDT</span>
        </div>

        <button
          className={`w-full py-2.5 rounded-lg font-semibold transition ${
            side === "buy"
              ? "bg-emerald-500 hover:bg-emerald-600 text-black"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          BTC {side === "buy" ? "Kaufen" : "Verkaufen"}
        </button>
      </div>
    </div>
  );
}
