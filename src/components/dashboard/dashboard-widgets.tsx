"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  IconStar, IconListDetails, IconChartLine, IconActivity,
  IconWallet, IconTrendingUp, IconTrendingDown, IconArrowUpRight, IconArrowDownRight, IconCopy, IconCheck,
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

interface WalletRow { id: string; currency: string; balance: string; }

function PortfolioWidget({ market: _market }: { market: MarketMap }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [walletAddr, setWalletAddr] = useState<string | null>(null);
  const [solAddr, setSolAddr] = useState<string | null>(null);
  const [showSolInput, setShowSolInput] = useState(false);
  const [solInput, setSolInput] = useState("");
  const [savingSol, setSavingSol] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [txError, setTxError] = useState("");
  const [syncStatus, setSyncStatus] = useState<"idle" | "checking" | "credited">("idle");

  const reload = useCallback(() => {
    fetch("/api/wallet")
      .then(r => { if (r.status === 401) { setAuthed(false); return null; } setAuthed(true); return r.json(); })
      .then(d => {
        const usdt = d?.wallets?.find((w: WalletRow) => w.currency === "USDT");
        setBalance(parseFloat(usdt?.balance || "0"));
        setWalletId(usdt?.id ?? null);
      })
      .catch(() => setAuthed(false));
  }, []);
  useEffect(() => { reload(); }, [reload]);

  // Auto-check for deposits every 30s
  useEffect(() => {
    async function checkDeposits() {
      setSyncStatus("checking");
      try {
        const res = await fetch("/api/wallet/sync", { method: "POST" });
        const d = await res.json();
        if (d.credited > 0) {
          setSyncStatus("credited");
          reload();
          setTimeout(() => setSyncStatus("idle"), 5000);
        } else {
          setSyncStatus("idle");
        }
      } catch { setSyncStatus("idle"); }
    }
    checkDeposits();
    const iv = setInterval(checkDeposits, 30_000);
    return () => clearInterval(iv);
  }, [reload]);
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user?.wallet_address) setWalletAddr(d.user.wallet_address);
      if (d?.user?.solana_address) setSolAddr(d.user.solana_address);
    });
  }, []);

  function copyAddr() {
    if (!walletAddr) return;
    navigator.clipboard.writeText(walletAddr).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  async function saveSolAddr() {
    setSavingSol(true);
    try {
      const res = await fetch("/api/auth/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solana_address: solInput.trim() }),
      });
      if (res.ok) { setSolAddr(solInput.trim() || null); setShowSolInput(false); setSolInput(""); }
    } finally { setSavingSol(false); }
  }

  async function withdraw() {
    if (!walletId) return;
    const amt = parseFloat(amount);
    if (!isFinite(amt) || amt <= 0) { setTxError("Betrag muss größer als 0 sein."); return; }
    setBusy(true); setTxError("");
    try {
      const res = await fetch("/api/wallet/transaction", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: "USDT", amount: amt, type: "withdraw" }),
      });
      const d = await res.json();
      if (!res.ok) { setTxError(d.error ?? "Fehler."); return; }
      setBalance(parseFloat(d.wallet.balance || "0"));
      setShowWithdraw(false); setAmount("");
    } catch { setTxError("Fehler."); } finally { setBusy(false); }
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
  if (balance === null) return <div className="text-gray-600 text-xs py-6 text-center">Lade…</div>;

  return (
    <div className="space-y-3">
      {/* Balance */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="text-[9px] uppercase tracking-widest text-gray-600">USDT Balance</div>
            {syncStatus === "checking" && <span className="text-[9px] text-gray-600 animate-pulse">prüfe…</span>}
            {syncStatus === "credited" && <span className="text-[9px] text-emerald-400">✓ Einzahlung erkannt</span>}
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">${fmtPrice(balance)}</div>
        </div>
        <button
          onClick={() => { setShowWithdraw(o => !o); setTxError(""); setAmount(""); }}
          className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border transition ${showWithdraw ? "border-red-500/40 text-red-400 bg-red-500/10" : "border-white/10 text-gray-300 hover:text-white hover:border-white/20"}`}
        >
          <IconArrowUpRight className="h-3 w-3" /> Auszahlen
        </button>
      </div>

      {showWithdraw && (
        <div>
          <div className="flex items-center gap-1.5">
            <input
              type="number" inputMode="decimal" autoFocus
              value={amount} onChange={e => { setAmount(e.target.value); setTxError(""); }}
              onKeyDown={e => { if (e.key === "Enter") withdraw(); if (e.key === "Escape") setShowWithdraw(false); }}
              placeholder="Betrag USDT"
              className="flex-1 min-w-0 bg-white/[0.05] border border-white/10 rounded px-2 py-1.5 text-[12px] text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
            />
            <button onClick={withdraw} disabled={busy} className="text-[11px] px-2.5 py-1.5 rounded font-medium bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-40">
              {busy ? "…" : "OK"}
            </button>
          </div>
          {txError && <p className="text-[10px] text-red-400 mt-1">{txError}</p>}
        </div>
      )}

      {/* ERC-20 deposit address */}
      {walletAddr && (
        <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[9px] uppercase tracking-widest text-gray-600">Einzahlen · ERC-20 / BEP-20</div>
            <button onClick={copyAddr} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-white transition">
              {copied ? <IconCheck className="h-3 w-3 text-emerald-400" /> : <IconCopy className="h-3 w-3" />}
              {copied ? "Kopiert" : "Kopieren"}
            </button>
          </div>
          <span className="text-[11px] text-gray-400 font-mono break-all">{walletAddr}</span>
        </div>
      )}

      {/* Solana address */}
      <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[9px] uppercase tracking-widest text-gray-600">Einzahlen · Solana (Phantom)</div>
          <button onClick={() => { setShowSolInput(o => !o); setSolInput(solAddr ?? ""); }} className="text-[10px] text-gray-500 hover:text-white transition">
            {solAddr ? "Ändern" : "+ Hinzufügen"}
          </button>
        </div>
        {showSolInput ? (
          <div className="flex items-center gap-1.5">
            <input autoFocus value={solInput} onChange={e => setSolInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") saveSolAddr(); if (e.key === "Escape") setShowSolInput(false); }}
              placeholder="Phantom-Adresse…"
              className="flex-1 min-w-0 bg-white/[0.05] border border-white/10 rounded px-2 py-1 text-[11px] text-white placeholder:text-gray-600 font-mono focus:outline-none focus:border-violet-500/50"
            />
            <button onClick={saveSolAddr} disabled={savingSol} className="shrink-0 text-[10px] px-2 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white transition disabled:opacity-40">
              {savingSol ? "…" : "OK"}
            </button>
          </div>
        ) : solAddr ? (
          <span className="text-[11px] text-gray-400 font-mono break-all">{solAddr}</span>
        ) : (
          <span className="text-[11px] text-gray-600">Noch nicht hinterlegt</span>
        )}
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
