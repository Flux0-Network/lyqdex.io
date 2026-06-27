"use client";

import { useState, useEffect } from "react";

interface Position {
  id: string;
  pair: string;
  side: "long" | "short";
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
}

type Tab = "positions" | "orders" | "history";

export function PositionsPanel() {
  const [tab, setTab] = useState<Tab>("positions");
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    fetch("/api/market?symbol=BTCUSDT")
      .then((r) => r.json())
      .then((d) => {
        const btcPrice = parseFloat(d.ticker?.price || "60000");
        setPositions([
          {
            id: "1",
            pair: "BTC/USDT",
            side: "long",
            size: 0.05,
            entryPrice: +(btcPrice * 0.985).toFixed(2),
            markPrice: btcPrice,
            leverage: 10,
          },
          {
            id: "2",
            pair: "ETH/USDT",
            side: "short",
            size: 1.2,
            entryPrice: 3420,
            markPrice: 3385.5,
            leverage: 5,
          },
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col text-[11px]">
      <div className="flex items-center gap-0 border-b border-white/5 shrink-0">
        {(["positions", "orders", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-xs transition ${tab === t ? "text-white border-b border-violet-500" : "text-gray-500 hover:text-gray-300"}`}
          >
            {t === "positions" ? `Positionen (${positions.length})` : t === "orders" ? "Offene Orders" : "Historie"}
          </button>
        ))}
      </div>

      {tab === "positions" && (
        <div className="flex-1 overflow-y-auto min-h-0">
          {positions.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-xs">Keine offenen Positionen</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-gray-500 border-b border-white/5">
                  <th className="px-3 py-1.5 text-left font-normal">Paar</th>
                  <th className="px-2 py-1.5 text-left font-normal">Seite</th>
                  <th className="px-2 py-1.5 text-right font-normal">Größe</th>
                  <th className="px-2 py-1.5 text-right font-normal">Einstieg</th>
                  <th className="px-2 py-1.5 text-right font-normal">Mark</th>
                  <th className="px-2 py-1.5 text-right font-normal">PnL</th>
                  <th className="px-3 py-1.5 text-right font-normal">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => {
                  const pnl = p.side === "long"
                    ? (p.markPrice - p.entryPrice) * p.size
                    : (p.entryPrice - p.markPrice) * p.size;
                  const pnlPct = ((pnl / (p.entryPrice * p.size)) * 100) * p.leverage;
                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-3 py-1.5">
                        <span className="text-white font-medium">{p.pair}</span>
                        <span className="ml-1 text-[10px] text-gray-500">{p.leverage}x</span>
                      </td>
                      <td className={`px-2 py-1.5 ${p.side === "long" ? "text-emerald-400" : "text-red-400"}`}>
                        {p.side === "long" ? "Long" : "Short"}
                      </td>
                      <td className="px-2 py-1.5 text-right text-gray-300">{p.size}</td>
                      <td className="px-2 py-1.5 text-right text-gray-300">{p.entryPrice.toLocaleString("de-DE")}</td>
                      <td className="px-2 py-1.5 text-right text-gray-300">{p.markPrice.toLocaleString("de-DE")}</td>
                      <td className={`px-2 py-1.5 text-right ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)} $
                        <div className="text-[10px]">{pnl >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%</div>
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        <button className="text-[10px] text-red-400 hover:text-red-300 border border-red-500/20 rounded px-1.5 py-0.5">
                          Schließen
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div className="flex items-center justify-center flex-1 text-gray-500 text-xs">Keine offenen Orders</div>
      )}

      {tab === "history" && (
        <div className="flex items-center justify-center flex-1 text-gray-500 text-xs">Keine Trade-Historie</div>
      )}
    </div>
  );
}
