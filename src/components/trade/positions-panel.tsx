"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { IconX, IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

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

/* ── Draggable bottom-sheet hook ── */
function useBottomSheet(defaultH: number, minH: number, maxH: number) {
  const [height, setHeight] = useState(defaultH);
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);

  function onHandlePointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, startH: height };
  }
  function onHandlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dy = dragRef.current.startY - e.clientY; // drag up = positive
    const next = Math.max(minH, Math.min(maxH, dragRef.current.startH + dy));
    setHeight(next);
  }
  function onHandlePointerUp() { dragRef.current = null; }

  return { height, setHeight, onHandlePointerDown, onHandlePointerMove, onHandlePointerUp };
}

export function PositionsPanel({ isMobile = false }: { isMobile?: boolean }) {
  const [tab, setTab] = useState<Tab>("positions");
  const [positions, setPositions] = useState<Position[]>([]);
  const [history, setHistory] = useState<Position[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [closing, setClosing] = useState<string | null>(null);

  const sheet = useBottomSheet(140, 52, typeof window !== "undefined" ? window.innerHeight * 0.75 : 500);

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
    window.addEventListener("lyqdex-position-closed", h);
    return () => {
      window.removeEventListener("lyqdex-position-opened", h);
      window.removeEventListener("lyqdex-position-closed", h);
    };
  }, [reload]);

  useEffect(() => {
    const syms = [...new Set(positions.map(p => p.symbol))];
    if (!syms.length) return;
    function fetchAll() {
      syms.forEach(sym =>
        fetch(`/api/orderbook?symbol=${sym}`)
          .then(r => r.json())
          .then(d => { if (d.price) setPrices(prev => ({ ...prev, [sym]: d.price })); })
          .catch(() => {})
      );
    }
    fetchAll();
    const iv = setInterval(fetchAll, 2000);
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
      if (res.ok) { reload(); window.dispatchEvent(new CustomEvent("lyqdex-position-closed")); }
    } finally { setClosing(null); }
  }

  function calcPnl(p: Position) {
    const cur = prices[p.symbol];
    if (!cur) return null;
    const raw = p.size * (cur - p.entry_price) * (p.side === "long" ? 1 : -1);
    const pct = (raw / p.margin) * 100;
    return { usdt: raw, pct };
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "positions", label: `Positionen${positions.length ? ` (${positions.length})` : ""}` },
    { key: "history",   label: "Historie" },
  ];

  /* ── Shared card grid ── */
  function PositionCards() {
    if (positions.length === 0)
      return <div className="flex-1 flex items-center justify-center text-[11px] text-gray-600">Keine offenen Positionen</div>;
    return (
      <div className="flex-1 overflow-auto min-h-0 p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 content-start">
        {positions.map(p => {
          const cur = prices[p.symbol];
          const pl = calcPnl(p);
          const isLong = p.side === "long";
          const accentPos = "text-emerald-400";
          const accentNeg = "text-red-400";
          const bgPos = "bg-emerald-500/10 border-emerald-500/20";
          const bgNeg = "bg-red-500/10 border-red-500/20";
          return (
            <div
              key={p.id}
              className={`rounded-xl border p-3 flex flex-col gap-2 ${isLong ? bgPos : bgNeg}`}
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {isLong
                    ? <IconTrendingUp className={`h-3.5 w-3.5 ${accentPos}`} />
                    : <IconTrendingDown className={`h-3.5 w-3.5 ${accentNeg}`} />}
                  <span className="text-[12px] font-semibold text-white">
                    {p.symbol.replace(/USDT$/i, "")}<span className="text-gray-600 font-normal">/USDT</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isLong ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                    {isLong ? "Long" : "Short"}
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold">{p.leverage}x</span>
                </div>
                <button
                  onClick={() => closePosition(p.id)}
                  disabled={closing === p.id || !cur}
                  title="Schließen"
                  className="ml-auto flex items-center justify-center w-5 h-5 rounded-md bg-white/[0.05] text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-30"
                >
                  {closing === p.id ? <span className="text-[9px]">…</span> : <IconX className="h-3 w-3" />}
                </button>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                <Stat label="Einstieg" value={`$${p.entry_price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`} />
                <Stat label="Aktuell"  value={cur ? `$${cur.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "–"} />
                <Stat label="Margin"   value={`$${p.margin.toFixed(2)}`} />
                <Stat label="Größe"    value={p.size.toFixed(4)} />
              </div>

              {/* PnL bar */}
              <div className={`rounded-lg px-2 py-1.5 flex items-center justify-between ${
                pl ? (pl.usdt >= 0 ? "bg-emerald-500/10" : "bg-red-500/10") : "bg-white/[0.03]"
              }`}>
                <span className="text-[10px] text-gray-500">PnL</span>
                {pl ? (
                  <span className={`text-[12px] font-semibold tabular-nums ${pl.usdt >= 0 ? accentPos : accentNeg}`}>
                    {pl.usdt >= 0 ? "+" : ""}{pl.usdt.toFixed(2)}{" "}
                    <span className="text-[10px] opacity-70">({pl.pct >= 0 ? "+" : ""}{pl.pct.toFixed(2)}%)</span>
                  </span>
                ) : <span className="text-gray-600 text-[11px]">Laden…</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function HistoryCards() {
    if (history.length === 0)
      return <div className="flex-1 flex items-center justify-center text-[11px] text-gray-600">Keine Trade-Historie</div>;
    return (
      <div className="flex-1 overflow-auto min-h-0 p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 content-start">
        {[...history].reverse().map(p => {
          const isLong = p.side === "long";
          return (
            <div key={p.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-semibold text-white">
                  {p.symbol.replace(/USDT$/i, "")}<span className="text-gray-600 font-normal">/USDT</span>
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isLong ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                  {isLong ? "Long" : "Short"}
                </span>
                <span className="text-[10px] text-amber-400 font-semibold">{p.leverage}x</span>
                <span className="ml-auto text-[10px] text-gray-600 tabular-nums">
                  {new Date(p.created_at).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                <Stat label="Einstieg"    value={`$${p.entry_price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`} />
                <Stat label="Schlusskurs" value={p.close_price ? `$${p.close_price.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "–"} />
              </div>
              {p.pnl != null && (
                <div className={`rounded-lg px-2 py-1.5 flex items-center justify-between ${p.pnl >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                  <span className="text-[10px] text-gray-500">PnL</span>
                  <span className={`text-[12px] font-semibold tabular-nums ${p.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {p.pnl >= 0 ? "+" : ""}{p.pnl.toFixed(2)} USDT
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /* ── Mobile: draggable bottom sheet ── */
  if (isMobile) {
    return (
      <div
        className="flex flex-col bg-[#07080d] border-t border-white/[0.07] transition-none"
        style={{ height: sheet.height }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center items-center py-1.5 cursor-ns-resize shrink-0 touch-none"
          onPointerDown={sheet.onHandlePointerDown}
          onPointerMove={sheet.onHandlePointerMove}
          onPointerUp={sheet.onHandlePointerUp}
        >
          <div className="w-8 h-0.5 rounded-full bg-white/20" />
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-white/[0.06] shrink-0 px-2">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-3 py-1.5 text-[11px] transition ${tab === key ? "text-white border-b border-violet-500" : "text-gray-500"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "positions" ? <PositionCards /> : <HistoryCards />}
      </div>
    );
  }

  /* ── Desktop: fixed-height strip ── */
  return (
    <div className="h-full flex flex-col bg-[#07080d]">
      <div className="flex items-center border-b border-white/[0.06] shrink-0">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-3 py-1.5 text-xs transition ${tab === key ? "text-white border-b border-violet-500" : "text-gray-500 hover:text-gray-300"}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === "positions" ? <PositionCards /> : <HistoryCards />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] text-gray-600 uppercase tracking-wide">{label}</span>
      <span className="text-[11px] text-gray-300 tabular-nums font-medium">{value}</span>
    </div>
  );
}
