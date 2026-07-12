"use client";

import { useState, useEffect, useCallback } from "react";

type Tab = "positions" | "orders" | "history";

interface Position {
  id: string;
  side: "buy" | "sell";
  symbol: string;
  price: number;
  amount: number;
  leverage: number;
  time: number;
  orderType?: "market" | "limit";
}

const POS_KEY   = "lyqdex_positions";
const ORD_KEY   = "lyqdex_orders";
const HIST_KEY  = "lyqdex_trades";

export function PositionsPanel() {
  const [tab,       setTab]       = useState<Tab>("positions");
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders,    setOrders]    = useState<Position[]>([]);
  const [history,   setHistory]   = useState<Position[]>([]);
  const [prices,    setPrices]    = useState<Record<string, number>>({});

  const reload = useCallback(() => {
    try { setPositions(JSON.parse(localStorage.getItem(POS_KEY)  || "[]")); } catch { /* ignore */ }
    try { setOrders   (JSON.parse(localStorage.getItem(ORD_KEY)  || "[]")); } catch { /* ignore */ }
    try { setHistory  (JSON.parse(localStorage.getItem(HIST_KEY) || "[]")); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    reload();
    const h = () => reload();
    window.addEventListener("lyqdex-trade",           h);
    window.addEventListener("lyqdex-order",           h);
    window.addEventListener("lyqdex-position-closed", h);
    return () => {
      window.removeEventListener("lyqdex-trade",           h);
      window.removeEventListener("lyqdex-order",           h);
      window.removeEventListener("lyqdex-position-closed", h);
    };
  }, [reload]);

  // Live prices for all open positions + pending orders
  useEffect(() => {
    const syms = [...new Set([...positions, ...orders].map((p) => p.symbol))];
    if (!syms.length) return;
    function fetchAll() {
      syms.forEach((sym) =>
        fetch(`/api/market?symbol=${sym}`)
          .then((r) => r.json())
          .then((d) => { if (d.ticker?.price) setPrices((prev) => ({ ...prev, [sym]: parseFloat(d.ticker.price) })); })
          .catch(() => {})
      );
    }
    fetchAll();
    const iv = setInterval(fetchAll, 5000);
    return () => clearInterval(iv);
  }, [positions]);

  function cancelOrder(id: string) {
    const updated = orders.filter((o) => o.id !== id);
    localStorage.setItem(ORD_KEY, JSON.stringify(updated));
    setOrders(updated);
  }

  function closePosition(id: string) {
    const pos = positions.find((p) => p.id === id);
    const updated = positions.filter((p) => p.id !== id);
    localStorage.setItem(POS_KEY, JSON.stringify(updated));
    if (pos) {
      const hist: Position[] = JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
      hist.push({ ...pos, time: Date.now() });
      localStorage.setItem(HIST_KEY, JSON.stringify(hist.slice(-100)));
    }
    setPositions(updated);
    window.dispatchEvent(new CustomEvent("lyqdex-position-closed", { detail: { id } }));
  }

  function pnl(p: Position) {
    const cur = prices[p.symbol];
    if (!cur) return null;
    const diff = p.side === "buy" ? cur - p.price : p.price - cur;
    return { usdt: diff * p.amount, pct: (diff / p.price) * 100 * p.leverage };
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "positions", label: `Positionen (${positions.length})` },
    { key: "orders",    label: `Orders (${orders.length})` },
    { key: "history",   label: `Historie (${history.length})` },
  ];

  return (
    <div className="h-full flex flex-col text-[11px] bg-[#080910]">
      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-white/[0.06] shrink-0">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-1.5 text-xs transition ${tab === key ? "text-white border-b border-violet-500" : "text-gray-500 hover:text-gray-300"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Positions tab */}
      {tab === "positions" && (
        positions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-600">Keine offenen Positionen</div>
        ) : (
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="text-gray-600 text-[10px] border-b border-white/[0.04]">
                  {["Symbol","Seite","Einstieg","Aktuell","Menge","PnL","Hebel",""].map((h, i) => (
                    <th key={i} className={`py-1 font-normal ${i === 0 ? "text-left px-3" : i === 7 ? "px-2" : "text-right px-2"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => {
                  const cur = prices[p.symbol];
                  const pl  = pnl(p);
                  const isLong = p.side === "buy";
                  return (
                    <tr key={p.id} className="border-t border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-3 py-1.5 text-white font-medium">{p.symbol.replace(/USDT$/i,"")}/USDT</td>
                      <td className="px-2 py-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${isLong ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                          {isLong ? "Long" : "Short"}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-right text-gray-300 tabular-nums">
                        {p.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-gray-300">
                        {cur ? cur.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "–"}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-gray-400">{p.amount.toFixed(6)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">
                        {pl ? (
                          <span className={pl.usdt >= 0 ? "text-emerald-400" : "text-red-400"}>
                            {pl.usdt >= 0 ? "+" : ""}{pl.usdt.toFixed(2)}
                            <span className="text-[10px] ml-1 opacity-70">({pl.pct >= 0 ? "+" : ""}{pl.pct.toFixed(2)}%)</span>
                          </span>
                        ) : "–"}
                      </td>
                      <td className="px-2 py-1.5 text-right text-amber-400 tabular-nums font-medium">{p.leverage}x</td>
                      <td className="px-2 py-1.5">
                        <button
                          onClick={() => closePosition(p.id)}
                          className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                        >
                          Schließen
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Orders tab – pending limit orders */}
      {tab === "orders" && (
        orders.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-600">Keine offenen Orders</div>
        ) : (
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="text-gray-600 text-[10px] border-b border-white/[0.04]">
                  {["Symbol","Typ","Seite","Limit-Preis","Aktuell","Menge","Hebel",""].map((h, i) => (
                    <th key={i} className={`py-1 font-normal ${i === 0 ? "text-left px-3" : i === 7 ? "px-2" : "text-right px-2"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const cur = prices[o.symbol];
                  const isLong = o.side === "buy";
                  return (
                    <tr key={o.id} className="border-t border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-3 py-1.5 text-white font-medium">{o.symbol.replace(/USDT$/i,"")}/USDT</td>
                      <td className="px-2 py-1.5 text-gray-400">Limit</td>
                      <td className="px-2 py-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${isLong ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                          {isLong ? "Long" : "Short"}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-right text-gray-300 tabular-nums">
                        {o.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-gray-400">
                        {cur ? cur.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "–"}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-gray-400">{o.amount.toFixed(6)}</td>
                      <td className="px-2 py-1.5 text-right text-amber-400 tabular-nums font-medium">{o.leverage}x</td>
                      <td className="px-2 py-1.5">
                        <button
                          onClick={() => cancelOrder(o.id)}
                          className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
                        >
                          Stornieren
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* History tab */}
      {tab === "history" && (
        history.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-600">Keine Trade-Historie</div>
        ) : (
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full min-w-[440px]">
              <thead>
                <tr className="text-gray-600 text-[10px] border-b border-white/[0.04]">
                  {["Symbol","Seite","Preis","Menge","Hebel","Zeit"].map((h, i) => (
                    <th key={i} className={`py-1 font-normal ${i === 0 ? "text-left px-3" : "text-right px-2"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((p, i) => (
                  <tr key={i} className="border-t border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-3 py-1 text-white font-medium">{p.symbol.replace(/USDT$/i,"")}/USDT</td>
                    <td className="px-2 py-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${p.side === "buy" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                        {p.side === "buy" ? "Long" : "Short"}
                      </span>
                    </td>
                    <td className="px-2 py-1 text-right text-gray-300 tabular-nums">
                      {p.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-1 text-right text-gray-400 tabular-nums">{p.amount.toFixed(6)}</td>
                    <td className="px-2 py-1 text-right text-amber-400 tabular-nums">{p.leverage}x</td>
                    <td className="px-2 py-1 text-right text-gray-600 tabular-nums">
                      {new Date(p.time).toLocaleString("de-DE", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
