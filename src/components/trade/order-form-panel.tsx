"use client";

import { useState, useEffect } from "react";
import { IconCheck } from "@tabler/icons-react";

const LEVERAGES = [1, 2, 5, 10, 20, 50, 100];

export function OrderFormPanel({ symbol = "BTCUSDT", base = "BTC", mode = "demo" }: { symbol?: string; base?: string; mode?: "demo" | "real" }) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [price, setPrice] = useState("");
  const [mktPrice, setMktPrice] = useState(0);
  const [amount, setAmount] = useState("");
  const [leverage, setLeverage] = useState(1);
  const [avail, setAvail] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  // Live market price for the selected symbol
  useEffect(() => {
    let alive = true;
    function load() {
      fetch(`/api/market?symbol=${symbol}`)
        .then((r) => r.json())
        .then((d) => { if (alive && d.ticker?.price) setMktPrice(parseFloat(d.ticker.price)); })
        .catch(() => {});
    }
    load();
    const iv = setInterval(load, 5000);
    return () => { alive = false; clearInterval(iv); };
  }, [symbol]);

  // Available USDT (buying power) — re-fetches when mode changes
  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.wallets) return;
        const usdt = d.wallets.find((w: { currency: string; balance: string; demo_balance?: string }) => w.currency === "USDT");
        if (!usdt) { setAvail(0); return; }
        const bal = mode === "real" ? usdt.balance : (usdt.demo_balance ?? "0");
        setAvail(parseFloat(bal || "0"));
      })
      .catch(() => {});
  }, [mode]);

  const effPrice = orderType === "limit" && price ? parseFloat(price) : mktPrice;
  const amt = parseFloat(amount) || 0;
  const notional = effPrice * amt;
  const margin = leverage > 0 ? notional / leverage : notional;

  function setPct(pct: number) {
    if (!effPrice || avail <= 0) return;
    const buyingPower = avail * (pct / 100) * leverage;
    setAmount((buyingPower / effPrice).toFixed(6));
  }

  function handleOrder() {
    if (amt <= 0 || effPrice <= 0) return;
    const entry = {
      id: Math.random().toString(36).slice(2, 10),
      side, price: effPrice, amount: amt, leverage, symbol,
      time: Date.now(), orderType,
    };
    if (orderType === "limit") {
      // Limit orders go to pending orders tab
      const orders = JSON.parse(localStorage.getItem("lyqdex_orders") || "[]");
      orders.push(entry);
      localStorage.setItem("lyqdex_orders", JSON.stringify(orders.slice(-50)));
      window.dispatchEvent(new CustomEvent("lyqdex-order", { detail: entry }));
    } else {
      // Market orders open immediately as a position
      const positions = JSON.parse(localStorage.getItem("lyqdex_positions") || "[]");
      positions.push(entry);
      localStorage.setItem("lyqdex_positions", JSON.stringify(positions.slice(-50)));
      window.dispatchEvent(new CustomEvent("lyqdex-trade", { detail: entry }));
    }
    setAmount("");
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 1500);
  }

  return (
    <div className="flex flex-col text-xs">
      {/* Buy/Sell + order type */}
      <div className="px-3 pt-3 pb-2 space-y-2">
        <div className="grid grid-cols-2 gap-1 bg-black/40 rounded-lg p-0.5">
          <button
            onClick={() => setSide("buy")}
            className={`py-1.5 rounded-md font-medium transition ${side === "buy" ? "bg-emerald-500 text-black" : "text-gray-400 hover:text-white"}`}
          >
            Kaufen / Long
          </button>
          <button
            onClick={() => setSide("sell")}
            className={`py-1.5 rounded-md font-medium transition ${side === "sell" ? "bg-red-500 text-white" : "text-gray-400 hover:text-white"}`}
          >
            Verkaufen / Short
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setOrderType("market")} className={`text-[11px] px-2 py-1 rounded transition ${orderType === "market" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}>Markt</button>
          <button onClick={() => { setOrderType("limit"); if (!price && mktPrice) setPrice(mktPrice.toFixed(2)); }} className={`text-[11px] px-2 py-1 rounded transition ${orderType === "limit" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}>Limit</button>
        </div>
      </div>

      <div className="px-3 pb-3 space-y-2.5">
        {orderType === "limit" && (
          <div>
            <label className="text-gray-500 text-[11px]">Preis (USDT)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-white/20" />
          </div>
        )}

        <div>
          <label className="text-gray-500 text-[11px]">Menge ({base})</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full mt-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-white/20" />
        </div>

        <div className="flex justify-between gap-1">
          {[25, 50, 75, 100].map((pct) => (
            <button key={pct} onClick={() => setPct(pct)} className="flex-1 py-0.5 rounded bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition text-[11px]">{pct}%</button>
          ))}
        </div>

        {/* Leverage / Hebel */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-gray-500 text-[11px]">Hebel</label>
            <span className="text-[11px] font-semibold text-amber-400">{leverage}x</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {LEVERAGES.map((lv) => (
              <button
                key={lv}
                onClick={() => setLeverage(lv)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition ${leverage === lv ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-white/5 text-gray-400 border border-transparent hover:text-white"}`}
              >
                {lv}x
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1 pt-1 border-t border-white/[0.05] text-[11px]">
          <div className="flex justify-between text-gray-500"><span>Verfügbar</span><span className="text-gray-300 tabular-nums">{avail.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDT</span></div>
          <div className="flex justify-between text-gray-500"><span>Order-Wert</span><span className="text-white tabular-nums">{notional.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDT</span></div>
          <div className="flex justify-between text-gray-500"><span>Margin ({leverage}x)</span><span className="text-white tabular-nums">{margin.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDT</span></div>
        </div>

        <button
          onClick={handleOrder}
          className={`w-full py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
            confirmed ? "bg-white/10 text-white" : side === "buy" ? "bg-emerald-500 hover:bg-emerald-600 text-black" : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {confirmed ? (
            <><IconCheck className="h-4 w-4" /> Order platziert</>
          ) : (
            <>{base} {side === "buy" ? "Kaufen" : "Verkaufen"} · {leverage}x</>
          )}
        </button>
      </div>
    </div>
  );
}
