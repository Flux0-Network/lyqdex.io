"use client";

import { useState, useEffect, useCallback } from "react";

type Tab = "positions" | "history";

interface Position {
  id: string;
  symbol: string;
  side: "long" | "short";
  size: number;
  entry_price: number;
  leverage: number;
  margin: number;
  created_at: string;
  status: "open" | "closed" | "liquidated";
  close_price?: number;
  closed_at?: string;
  pnl?: number;
}

export function PositionsPanel() {
  const [tab, setTab] = useState<Tab>("positions");
  const [positions, setPositions] = useState<Position[]>([]);
  const [history, setHistory] = useState<Position[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [closing, setClosing] = useState<string | null>(null);

  const reload = useCallback(() => {
    fetch("/api/positions")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setPositions(d.positions ?? []); })
      .catch(() => {});
    fetch("/api/positions?status=closed")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setHistory(d.positions ?? []); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    reload();
    const h = () => reload();
    window.addEventListener("lyqdex-position-opened", h);
    return () => window.removeEventListener("lyqdex-position-opened", h);
  }, [reload]);

  // Live prices
  useEffect(() => {
    const syms = [...new Set(positions.map(p => p.symbol))];
    if (!syms.length) return;
    function fetchAll() {
      syms.forEach(sym =>
        fetch(`/api/market?symbol=${sym}`)
          .then(r => r.json())
          .then(d => { if (d.ticker?.price) setPrices(prev => ({ ...prev, [sym]: parseFloat(d.ticker.price) })); })
          .catch(() => {})
      );
    }
    fetchAll();
    const iv = setInterval(fetchAll, 3000);
    return () => clearInterval(iv);
  }, [positions]);

  async function closePosition(id: string) {
    const pos = positions.find(p => p.id === id);
    const cur = pos ? prices[pos.symbol] : null;
    if (!cur) return;
    setClosing(id);
    try {
      const res = await fetch(`/api/positions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ closePrice: cur }),
      });
      if (res.ok) reload();
    } finally {
      setClosing(null);
    }
  }

  function calcPnl(p: Position) {
    const cur = prices[p.symbol];
    if (!cur) return null;
    const raw = p.size * (cur - p.entry_price) * (p.side === "long" ? 1 : -1);
    const pct = (raw / p.margin) * 100;
    return { usdt: raw, pct };
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "positions", label: `Positionen (${positions.length})` },
    { key: "history",   label: `Historie` },
  ];

  return (
    <div className="h-full flex flex-col text-[11px] bg-[#080910]">
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

      {tab === "positions" && (
        positions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-600">Keine offenen Positionen</div>
        ) : (
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full min-w-[580px]">
              <thead>
                <tr className="text-gray-600 text-[10px] border-b border-white/[0.04]">
                  {["Symbol","Seite","Einstieg","Aktuell","Größe","Margin","PnL","Hebel",""].map((h, i) => (
                    <th key={i} className={`py-1 font-normal ${i === 0 ? "text-left px-3" : i === 8 ? "px-2" : "text-right px-2"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map(p => {
                  const cur = prices[p.symbol];
                  const pl = calcPnl(p);
                  return (
                    <tr key={p.id} className="border-t border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-3 py-1.5 text-white font-medium">{p.symbol.replace(/USDT$/i,"")}/USDT</td>
                      <td className="px-2 py-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${p.side === "long" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                          {p.side === "long" ? "Long" : "Short"}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-right text-gray-300 tabular-nums">${p.entry_price.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-gray-300">
                        {cur ? `$${cur.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "–"}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-gray-400">{p.size.toFixed(6)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums text-gray-400">${p.margin.toFixed(2)}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">
                        {pl ? (
                          <span className={pl.usdt >= 0 ? "text-emerald-400" : "text-red-400"}>
                            {pl.usdt >= 0 ? "+" : ""}{pl.usdt.toFixed(2)}
                            <span className="text-[10px] ml-1 opacity-70">({pl.pct >= 0 ? "+" : ""}{pl.pct.toFixed(2)}%)</span>
                          </span>
                        ) : "–"}
                      </td>
                      <td className="px-2 py-1.5 text-right text-amber-400 font-medium">{p.leverage}x</td>
                      <td className="px-2 py-1.5">
                        <button
                          onClick={() => closePosition(p.id)}
                          disabled={closing === p.id || !cur}
                          className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-40"
                        >
                          {closing === p.id ? "…" : "Schließen"}
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

      {tab === "history" && (
        history.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-600">Keine Trade-Historie</div>
        ) : (
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="text-gray-600 text-[10px] border-b border-white/[0.04]">
                  {["Symbol","Seite","Einstieg","Schlusskurs","PnL","Hebel","Datum"].map((h, i) => (
                    <th key={i} className={`py-1 font-normal ${i === 0 ? "text-left px-3" : "text-right px-2"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map(p => (
                  <tr key={p.id} className="border-t border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-3 py-1 text-white font-medium">{p.symbol.replace(/USDT$/i,"")}/USDT</td>
                    <td className="px-2 py-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${p.side === "long" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                        {p.side === "long" ? "Long" : "Short"}
                      </span>
                    </td>
                    <td className="px-2 py-1 text-right text-gray-300 tabular-nums">${p.entry_price.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                    <td className="px-2 py-1 text-right text-gray-300 tabular-nums">{p.close_price ? `$${p.close_price.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "–"}</td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {p.pnl != null ? (
                        <span className={p.pnl >= 0 ? "text-emerald-400" : "text-red-400"}>
                          {p.pnl >= 0 ? "+" : ""}{p.pnl.toFixed(2)} USDT
                        </span>
                      ) : "–"}
                    </td>
                    <td className="px-2 py-1 text-right text-amber-400">{p.leverage}x</td>
                    <td className="px-2 py-1 text-right text-gray-600 tabular-nums">
                      {new Date(p.created_at).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
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
