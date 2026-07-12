"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  IconAdjustments, IconPlus, IconX, IconGripVertical, IconArrowsMaximize, IconCheck,
} from "@tabler/icons-react";
import { AppSidebar, SIDEBAR_W } from "@/components/shared/app-sidebar";
import {
  SYMBOLS, WIDGET_META, WidgetBody, widgetIcon, widgetTitle,
  type WidgetConfig, type WidgetType, type MarketMap, type MarketResp,
} from "@/components/dashboard/dashboard-widgets";

const STORAGE_KEY = "lyqdex_dashboard_v1";

const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: "w-portfolio", type: "portfolio", size: 1 },
  { id: "w-watchlist", type: "watchlist", size: 1 },
  { id: "w-movers",    type: "movers",    size: 1 },
  { id: "w-chart",     type: "chart",     size: 2, symbol: "BTCUSDT" },
  { id: "w-stats",     type: "stats",     size: 1, symbol: "BTCUSDT" },
];

// Hydration-safe client flag (no setState-in-effect)
const emptySubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function uid() { return "w-" + Math.random().toString(36).slice(2, 8); }
function sizeClass(size: 1 | 2 | 3) {
  if (size === 3) return "md:col-span-2 xl:col-span-3";
  if (size === 2) return "md:col-span-2 xl:col-span-2";
  return "md:col-span-1 xl:col-span-1";
}

export default function DashboardPage() {
  const [market, setMarket]     = useState<MarketMap>({});
  const [layout, setLayout]     = useState<WidgetConfig[]>(() => {
    if (typeof window === "undefined") return DEFAULT_LAYOUT;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { const p = JSON.parse(raw); if (Array.isArray(p) && p.length) return p as WidgetConfig[]; }
    } catch {}
    return DEFAULT_LAYOUT;
  });
  const [edit, setEdit]         = useState(false);
  const [addOpen, setAddOpen]   = useState(false);
  const [walletAddr, setWalletAddr] = useState<string | null>(null);
  const dragIdx = useRef<number | null>(null);
  const mounted = useHydrated();

  // Load auth
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => (r.ok ? r.json() : null))
      .then(d => d?.user?.wallet_address && setWalletAddr(d.user.wallet_address))
      .catch(() => {});
  }, []);

  // Persist layout whenever it changes
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(layout)); } catch {}
  }, [layout]);

  // Fetch all market data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const entries = await Promise.all(SYMBOLS.map(async ({ sym }) => {
        try {
          const r = await fetch(`/api/market?symbol=${sym}`);
          const d: MarketResp = await r.json();
          return [sym, d] as const;
        } catch { return [sym, null] as const; }
      }));
      if (cancelled) return;
      setMarket(prev => {
        const next = { ...prev };
        for (const [sym, d] of entries) if (d) next[sym] = d;
        return next;
      });
    }
    load();
    const iv = setInterval(load, 15000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  // Layout ops
  const removeWidget = (id: string) => setLayout(l => l.filter(w => w.id !== id));
  const cycleSize    = (id: string) => setLayout(l => l.map(w => w.id === id ? { ...w, size: (w.size === 3 ? 1 : (w.size + 1)) as 1 | 2 | 3 } : w));
  const setSymbol    = (id: string, symbol: string) => setLayout(l => l.map(w => w.id === id ? { ...w, symbol } : w));
  const addWidget    = (type: WidgetType) => {
    const meta = WIDGET_META[type];
    setLayout(l => [...l, { id: uid(), type, size: meta.defaultSize, ...(meta.needsSymbol ? { symbol: "BTCUSDT" } : {}) }]);
    setAddOpen(false);
  };
  const resetLayout  = () => setLayout(DEFAULT_LAYOUT);

  function onDrop(targetIdx: number) {
    const from = dragIdx.current;
    dragIdx.current = null;
    if (from == null || from === targetIdx) return;
    setLayout(l => {
      const next = [...l];
      const [moved] = next.splice(from, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0b0e]">
      <AppSidebar active="dashboard" walletAddr={walletAddr} />

      {/* Content */}
      <div style={{ marginLeft: SIDEBAR_W }} className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-[#0a0b0e]/90 backdrop-blur border-b border-white/[0.06] px-4 sm:px-6 py-3 flex items-center gap-3">
          <div>
            <h1 className="text-white font-semibold text-base leading-tight">Dashboard</h1>
            <p className="text-[11px] text-gray-500 leading-tight">Deine Übersicht · individuell anpassbar</p>
          </div>
          <div className="flex-1" />

          {edit && (
            <div className="relative">
              <button onClick={() => setAddOpen(o => !o)} className="flex items-center gap-1 text-[12px] px-2.5 py-1.5 rounded-lg border border-white/[0.1] text-gray-300 hover:text-white hover:border-white/[0.2] transition">
                <IconPlus className="h-3.5 w-3.5" /> Widget
              </button>
              {addOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAddOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-[#0f1018] border border-white/[0.08] rounded-xl py-1 shadow-2xl">
                    {(Object.keys(WIDGET_META) as WidgetType[]).map(type => (
                      <button key={type} onClick={() => addWidget(type)} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-gray-300 hover:bg-white/[0.04] hover:text-white transition">
                        {widgetIcon(type)} {WIDGET_META[type].label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {edit && (
            <button onClick={resetLayout} title="Layout zurücksetzen" className="text-[12px] px-2.5 py-1.5 rounded-lg border border-white/[0.1] text-gray-400 hover:text-white hover:border-white/[0.2] transition">
              Zurücksetzen
            </button>
          )}
          <button
            onClick={() => setEdit(e => !e)}
            className={`flex items-center gap-1 text-[12px] px-2.5 py-1.5 rounded-lg border transition ${
              edit ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" : "border-white/[0.1] text-gray-300 hover:text-white hover:border-white/[0.2]"
            }`}
          >
            {edit ? <IconCheck className="h-3.5 w-3.5" /> : <IconAdjustments className="h-3.5 w-3.5" />}
            {edit ? "Fertig" : "Anpassen"}
          </button>
        </div>

        {/* Grid */}
        <div className="p-4 sm:p-6">
          {!mounted ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {[0, 1, 2].map(i => <div key={i} className="rounded-xl border border-white/[0.06] bg-[#0c0d14] h-[180px] animate-pulse" />)}
            </div>
          ) : layout.length === 0 ? (
            <div className="text-center text-gray-600 text-sm py-20">
              Keine Widgets. Klicke auf <span className="text-gray-400">Anpassen → Widget</span>, um welche hinzuzufügen.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 auto-rows-[minmax(0,auto)]">
              {layout.map((cfg, idx) => (
                <div
                  key={cfg.id}
                  draggable={edit}
                  onDragStart={() => { dragIdx.current = idx; }}
                  onDragOver={(e) => { if (edit) e.preventDefault(); }}
                  onDrop={() => onDrop(idx)}
                  className={`${sizeClass(cfg.size)} rounded-xl border bg-[#0c0d14] flex flex-col ${
                    edit ? "border-cyan-500/25 cursor-move" : "border-white/[0.07]"
                  }`}
                >
                  {/* Widget header */}
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.05]">
                    {edit && <IconGripVertical className="h-3.5 w-3.5 text-gray-600 shrink-0" />}
                    <span className="text-cyan-400/80 shrink-0">{widgetIcon(cfg.type)}</span>
                    <span className="text-[12px] text-gray-300 font-medium truncate">{widgetTitle(cfg)}</span>
                    <div className="flex-1" />
                    {edit && WIDGET_META[cfg.type].needsSymbol && (
                      <select
                        value={cfg.symbol ?? "BTCUSDT"}
                        onChange={(e) => setSymbol(cfg.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white/[0.05] border border-white/10 rounded text-[10px] text-gray-300 px-1 py-0.5 focus:outline-none"
                      >
                        {SYMBOLS.map(s => <option key={s.sym} value={s.sym} className="bg-[#0f1018]">{s.base}</option>)}
                      </select>
                    )}
                    {edit && (
                      <>
                        <button onClick={() => cycleSize(cfg.id)} title="Größe ändern" className="text-gray-500 hover:text-white transition p-0.5">
                          <IconArrowsMaximize className="h-3.5 w-3.5" />
                          <span className="sr-only">Größe</span>
                        </button>
                        <span className="text-[9px] text-gray-600 tabular-nums w-3 text-center">{cfg.size}</span>
                        <button onClick={() => removeWidget(cfg.id)} title="Entfernen" className="text-gray-500 hover:text-red-400 transition p-0.5">
                          <IconX className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                  {/* Widget body */}
                  <div className="p-3 flex-1 min-h-[120px]">
                    <WidgetBody cfg={cfg} market={market} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
