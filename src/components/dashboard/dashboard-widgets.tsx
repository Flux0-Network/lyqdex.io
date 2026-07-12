"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  IconStar, IconListDetails, IconChartLine, IconActivity,
  IconWallet, IconTrendingUp, IconTrendingDown, IconArrowUpRight, IconArrowDownRight, IconArrowDownLeft,
} from "@tabler/icons-react";

// ── Types ──────────────────────────────────────────────────────────
export type WidgetType = "watchlist" | "movers" | "chart" | "stats" | "trades" | "portfolio";
export interface WidgetConfig { id: string; type: WidgetType; size: 1 | 2 | 3; symbol?: string; }

export interface MarketResp {
  ticker: { price: string; change: string; high: string; low: string; volume: string };
  candles: { time: number; close: number }[];
  trades: { price: string; amount: string; side: string; time: number }[];
}
export type MarketMap = Record<string, MarketResp>;

export const SYMBOLS = [
  { sym: "BTCUSDT",  base: "BTC",  color: "#f7931a" },
  { sym: "ETHUSDT",  base: "ETH",  color: "#627eea" },
  { sym: "SOLUSDT",  base: "SOL",  color: "#9945ff" },
  { sym: "BNBUSDT",  base: "BNB",  color: "#f3ba2f" },
  { sym: "XRPUSDT",  base: "XRP",  color: "#00aae4" },
  { sym: "DOGEUSDT", base: "DOGE", color: "#c2a633" },
  { sym: "ADAUSDT",  base: "ADA",  color: "#0033ad" },
  { sym: "AVAXUSDT", base: "AVAX", color: "#e84142" },
];

export const WIDGET_META: Record<WidgetType, { label: string; needsSymbol: boolean; defaultSize: 1 | 2 | 3 }> = {
  portfolio: { label: "Wallet & Portfolio", needsSymbol: false, defaultSize: 2 },
  watchlist: { label: "Watchlist",        needsSymbol: false, defaultSize: 1 },
  movers:    { label: "Top Bewegungen",   needsSymbol: false, defaultSize: 1 },
  chart:     { label: "Mini-Chart",       needsSymbol: true,  defaultSize: 2 },
  stats:     { label: "Markt-Statistik",  needsSymbol: true,  defaultSize: 1 },
  trades:    { label: "Letzte Trades",    needsSymbol: true,  defaultSize: 1 },
};

export function baseOf(sym: string) { return SYMBOLS.find(s => s.sym === sym)?.base ?? sym.replace("USDT", ""); }
export function colorOf(sym: string) { return SYMBOLS.find(s => s.sym === sym)?.color ?? "#22d3ee"; }

function fmtPrice(p: number): string {
  if (!isFinite(p)) return "—";
  if (p >= 1000) return p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1)    return p.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return p.toLocaleString("en-US", { minimumFractionDigits: 5, maximumFractionDigits: 5 });
}

// ── Sparkline ──────────────────────────────────────────────────────
function Sparkline({ data, color, height = 48 }: { data: number[]; color: string; height?: number }) {
  if (!data || data.length < 2) return <div style={{ height }} />;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const w = 100;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * height}`).join(" ");
  const up = data[data.length - 1] >= data[0];
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <polyline points={pts} fill="none" stroke={color || (up ? "#26a69a" : "#ef5350")} strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

// ── Individual widgets ─────────────────────────────────────────────
function WatchlistWidget({ market }: { market: MarketMap }) {
  return (
    <div className="divide-y divide-white/[0.04]">
      {SYMBOLS.map(({ sym, base, color }) => {
        const t = market[sym]?.ticker;
        const price = parseFloat(t?.price ?? "0");
        const change = parseFloat(t?.change ?? "0");
        const up = change >= 0;
        return (
          <Link key={sym} href={`/trade?symbol=${sym}`} className="flex items-center justify-between py-1.5 px-0.5 hover:bg-white/[0.03] rounded transition">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
              <span className="text-[12px] text-white font-medium">{base}</span>
              <span className="text-[10px] text-gray-600">/USDT</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[12px] text-gray-200 tabular-nums">{t ? fmtPrice(price) : "…"}</span>
              <span className={`text-[11px] tabular-nums w-14 text-right ${up ? "text-emerald-400" : "text-red-400"}`}>
                {t ? `${up ? "+" : ""}${change.toFixed(2)}%` : ""}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function MoversWidget({ market }: { market: MarketMap }) {
  const rows = SYMBOLS
    .map(s => ({ ...s, change: parseFloat(market[s.sym]?.ticker?.change ?? "0"), has: !!market[s.sym] }))
    .filter(r => r.has)
    .sort((a, b) => b.change - a.change);
  if (!rows.length) return <div className="text-gray-600 text-xs py-6 text-center">Lade…</div>;
  const gainers = rows.slice(0, 3);
  const losers = [...rows].reverse().slice(0, 3);
  const Row = ({ base, change }: { base: string; change: number }) => {
    const up = change >= 0;
    return (
      <div className="flex items-center justify-between py-1">
        <span className="text-[12px] text-white">{base}</span>
        <span className={`flex items-center gap-0.5 text-[11px] tabular-nums ${up ? "text-emerald-400" : "text-red-400"}`}>
          {up ? <IconArrowUpRight className="h-3 w-3" /> : <IconArrowDownRight className="h-3 w-3" />}
          {up ? "+" : ""}{change.toFixed(2)}%
        </span>
      </div>
    );
  };
  return (
    <div className="grid grid-cols-2 gap-x-4">
      <div>
        <p className="text-[9px] uppercase tracking-widest text-emerald-500/70 mb-1 flex items-center gap-1"><IconTrendingUp className="h-3 w-3" /> Gewinner</p>
        {gainers.map(r => <Row key={r.sym} base={r.base} change={r.change} />)}
      </div>
      <div>
        <p className="text-[9px] uppercase tracking-widest text-red-500/70 mb-1 flex items-center gap-1"><IconTrendingDown className="h-3 w-3" /> Verlierer</p>
        {losers.map(r => <Row key={r.sym} base={r.base} change={r.change} />)}
      </div>
    </div>
  );
}

function ChartWidget({ market, symbol }: { market: MarketMap; symbol: string }) {
  const m = market[symbol];
  const closes = m?.candles?.slice(-80).map(c => c.close) ?? [];
  const price = parseFloat(m?.ticker?.price ?? "0");
  const change = parseFloat(m?.ticker?.change ?? "0");
  const up = change >= 0;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-[13px] text-white font-semibold">{baseOf(symbol)}<span className="text-gray-600 text-[11px]">/USDT</span></div>
          <div className={`text-lg font-bold tabular-nums ${up ? "text-emerald-400" : "text-red-400"}`}>{m ? fmtPrice(price) : "…"}</div>
        </div>
        <div className={`text-[12px] tabular-nums ${up ? "text-emerald-400" : "text-red-400"}`}>{m ? `${up ? "+" : ""}${change.toFixed(2)}%` : ""}</div>
      </div>
      <div className="flex-1 min-h-[60px] flex items-end">
        <Sparkline data={closes} color={up ? "#26a69a" : "#ef5350"} height={90} />
      </div>
    </div>
  );
}

function StatsWidget({ market, symbol }: { market: MarketMap; symbol: string }) {
  const t = market[symbol]?.ticker;
  const items = [
    { label: "Preis",      value: t ? fmtPrice(parseFloat(t.price)) : "…" },
    { label: "24h Hoch",   value: t ? fmtPrice(parseFloat(t.high)) : "…" },
    { label: "24h Tief",   value: t ? fmtPrice(parseFloat(t.low)) : "…" },
    { label: `24h Vol (${baseOf(symbol)})`, value: t ? parseFloat(t.volume).toLocaleString("en-US", { maximumFractionDigits: 0 }) : "…" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(i => (
        <div key={i.label} className="bg-white/[0.02] rounded-lg px-2.5 py-2">
          <div className="text-[9px] uppercase tracking-widest text-gray-600">{i.label}</div>
          <div className="text-[13px] text-white font-medium tabular-nums mt-0.5">{i.value}</div>
        </div>
      ))}
    </div>
  );
}

function TradesWidget({ market, symbol }: { market: MarketMap; symbol: string }) {
  const trades = market[symbol]?.trades?.slice(0, 8) ?? [];
  if (!trades.length) return <div className="text-gray-600 text-xs py-6 text-center">Lade…</div>;
  return (
    <div className="text-[11px]">
      <div className="flex justify-between text-gray-600 text-[9px] uppercase tracking-widest pb-1">
        <span>Preis</span><span>Menge</span><span>Zeit</span>
      </div>
      {trades.map((tr, i) => {
        const buy = tr.side === "buy";
        return (
          <div key={i} className="flex justify-between py-0.5 tabular-nums">
            <span className={buy ? "text-emerald-400" : "text-red-400"}>{fmtPrice(parseFloat(tr.price))}</span>
            <span className="text-gray-400">{parseFloat(tr.amount).toFixed(4)}</span>
            <span className="text-gray-600">{new Date(tr.time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          </div>
        );
      })}
    </div>
  );
}

interface WalletRow { id: string; currency: string; balance: string; demo_balance?: string; }
type AccountMode = "demo" | "real";

function PortfolioWidget({ market }: { market: MarketMap }) {
  const [wallets, setWallets] = useState<WalletRow[] | null>(null);
  const [supported, setSupported] = useState<string[]>([]);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const [action, setAction] = useState<{ id: string; currency: string; type: "deposit" | "withdraw" } | null>(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [txError, setTxError] = useState("");
  const [mode, setMode] = useState<AccountMode>("demo");

  const balOf = (w: WalletRow) => parseFloat((mode === "real" ? w.balance : w.demo_balance ?? "0") || "0");

  const reload = useCallback(() => {
    fetch("/api/wallet")
      .then(r => { if (r.status === 401) { setAuthed(false); return null; } setAuthed(true); return r.json(); })
      .then(d => { if (d) { setWallets(d.wallets ?? []); setSupported(d.supported ?? []); } })
      .catch(() => setAuthed(false));
  }, []);
  useEffect(() => { reload(); }, [reload]);

  async function createWallet(cur: string) {
    setCreating(cur);
    try {
      const res = await fetch("/api/wallet/create", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currency: cur }),
      });
      if (res.ok) {
        const d = await res.json();
        setWallets(prev => [...(prev ?? []), d.wallet].sort((a, b) => a.currency.localeCompare(b.currency)));
        setShowAdd(false);
      }
    } finally { setCreating(null); }
  }

  function openAction(id: string, currency: string, type: "deposit" | "withdraw") {
    setTxError("");
    setAmount("");
    setAction(prev => (prev && prev.id === id && prev.type === type ? null : { id, currency, type }));
  }

  async function submitAction() {
    if (!action) return;
    const amt = parseFloat(amount);
    if (!isFinite(amt) || amt <= 0) { setTxError("Betrag muss größer als 0 sein."); return; }
    setBusy(true);
    setTxError("");
    try {
      const res = await fetch("/api/wallet/transaction", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: action.currency, amount: amt, type: action.type, mode }),
      });
      const d = await res.json();
      if (!res.ok) { setTxError(d.error ?? "Fehler."); return; }
      setWallets(prev => (prev ?? []).map(w => w.id === d.wallet.id ? d.wallet : w));
      setAction(null);
      setAmount("");
    } catch {
      setTxError("Fehler bei der Transaktion.");
    } finally { setBusy(false); }
  }

  if (authed === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-4 gap-2">
        <IconWallet className="h-6 w-6 text-gray-600" />
        <p className="text-[12px] text-gray-500">Melde dich an, um dein Wallet zu sehen.</p>
        <Link href="/login" className="text-[12px] text-violet-400 hover:text-violet-300">Anmelden →</Link>
      </div>
    );
  }
  if (!wallets) return <div className="text-gray-600 text-xs py-6 text-center">Lade…</div>;

  const priceOf = (cur: string) => cur === "USDT" ? 1 : parseFloat(market[`${cur}USDT`]?.ticker?.price ?? "0");
  const total = wallets.reduce((s, w) => s + balOf(w) * priceOf(w.currency), 0);
  const available = supported.filter(c => !wallets.some(w => w.currency === c));

  return (
    <div>
      {/* Demo / Real switch */}
      <div className="flex items-center gap-1 mb-3 p-0.5 rounded-lg bg-white/[0.04] w-max">
        {(["demo", "real"] as AccountMode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setAction(null); }}
            className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition ${
              mode === m
                ? (m === "demo" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300")
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {m === "demo" ? "Demo" : "Real"}
          </button>
        ))}
      </div>

      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[9px] uppercase tracking-widest text-gray-600 flex items-center gap-1">
            Gesamtwert
            <span className={`px-1 py-px rounded text-[8px] ${mode === "demo" ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>
              {mode === "demo" ? "DEMO" : "REAL"}
            </span>
          </div>
          <div className="text-xl font-bold text-white tabular-nums">${fmtPrice(total)}</div>
        </div>
        {available.length > 0 && (
          <button
            onClick={() => setShowAdd(o => !o)}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition"
          >
            <IconWallet className="h-3 w-3" /> {showAdd ? "Schließen" : "Wallet +"}
          </button>
        )}
      </div>

      {showAdd && (
        <div className="grid grid-cols-4 gap-1.5 mb-3 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
          {available.map(cur => (
            <button
              key={cur}
              onClick={() => createWallet(cur)}
              disabled={!!creating}
              className="flex flex-col items-center gap-1 py-2 rounded-md border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition disabled:opacity-40"
            >
              <span className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: colorOf(`${cur}USDT`) }}>{cur.slice(0, 2)}</span>
              <span className="text-[10px] text-gray-300">{cur}</span>
            </button>
          ))}
        </div>
      )}

      <div className="divide-y divide-white/[0.04]">
        {wallets.length === 0 && <div className="text-gray-600 text-xs py-2">Noch keine Wallets vorhanden — oben rechts eins hinzufügen.</div>}
        {wallets.map(w => {
          const bal = balOf(w);
          const val = bal * priceOf(w.currency);
          const open = action?.id === w.id;
          return (
            <div key={w.id} className="py-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: colorOf(`${w.currency}USDT`) }}>{w.currency.slice(0, 2)}</span>
                  <span className="text-[12px] text-white font-medium">{w.currency}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-right">
                    <span className="text-[12px] text-gray-200 tabular-nums block leading-tight">{bal.toLocaleString("en-US", { maximumFractionDigits: 6 })}</span>
                    <span className="text-[10px] text-gray-600 tabular-nums">${fmtPrice(val)}</span>
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <button onClick={() => openAction(w.id, w.currency, "deposit")} title="Einzahlen" className={`h-4 w-4 rounded flex items-center justify-center border transition ${open && action?.type === "deposit" ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-gray-500 hover:text-emerald-400 hover:border-emerald-500/40"}`}>
                      <IconArrowDownLeft className="h-2.5 w-2.5" />
                    </button>
                    <button onClick={() => openAction(w.id, w.currency, "withdraw")} title="Auszahlen" className={`h-4 w-4 rounded flex items-center justify-center border transition ${open && action?.type === "withdraw" ? "border-red-500/50 text-red-400 bg-red-500/10" : "border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/40"}`}>
                      <IconArrowUpRight className="h-2.5 w-2.5" />
                    </button>
                  </span>
                </span>
              </div>

              {open && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <input
                    type="number"
                    inputMode="decimal"
                    autoFocus
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") submitAction(); if (e.key === "Escape") setAction(null); }}
                    placeholder={`Betrag ${w.currency}`}
                    className="flex-1 min-w-0 bg-white/[0.05] border border-white/10 rounded px-2 py-1 text-[12px] text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    onClick={submitAction}
                    disabled={busy}
                    className={`text-[11px] px-2.5 py-1 rounded font-medium transition disabled:opacity-40 ${action?.type === "deposit" ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-red-600 hover:bg-red-500 text-white"}`}
                  >
                    {busy ? "…" : action?.type === "deposit" ? "Einzahlen" : "Auszahlen"}
                  </button>
                </div>
              )}
              {open && txError && <p className="text-[10px] text-red-400 mt-1">{txError}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Renderer + icons ───────────────────────────────────────────────
export function widgetIcon(type: WidgetType, cls = "h-3.5 w-3.5") {
  switch (type) {
    case "watchlist": return <IconStar className={cls} />;
    case "movers":    return <IconTrendingUp className={cls} />;
    case "chart":     return <IconChartLine className={cls} />;
    case "stats":     return <IconListDetails className={cls} />;
    case "trades":    return <IconActivity className={cls} />;
    case "portfolio": return <IconWallet className={cls} />;
  }
}

export function widgetTitle(cfg: WidgetConfig) {
  const base = WIDGET_META[cfg.type].label;
  return WIDGET_META[cfg.type].needsSymbol && cfg.symbol ? `${base} · ${baseOf(cfg.symbol)}` : base;
}

export function WidgetBody({ cfg, market }: { cfg: WidgetConfig; market: MarketMap }) {
  const sym = cfg.symbol ?? "BTCUSDT";
  switch (cfg.type) {
    case "watchlist": return <WatchlistWidget market={market} />;
    case "movers":    return <MoversWidget market={market} />;
    case "chart":     return <ChartWidget market={market} symbol={sym} />;
    case "stats":     return <StatsWidget market={market} symbol={sym} />;
    case "trades":    return <TradesWidget market={market} symbol={sym} />;
    case "portfolio": return <PortfolioWidget market={market} />;
  }
}
