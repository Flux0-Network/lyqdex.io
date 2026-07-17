"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar, SIDEBAR_W } from "@/components/shared/app-sidebar";
import { IconTrendingUp, IconTrendingDown, IconRefresh, IconStar, IconStarFilled } from "@tabler/icons-react";

const ALL_SYMBOLS = [
  { symbol: "BTCUSDT",  name: "Bitcoin",   short: "BTC" },
  { symbol: "ETHUSDT",  name: "Ethereum",  short: "ETH" },
  { symbol: "SOLUSDT",  name: "Solana",    short: "SOL" },
  { symbol: "BNBUSDT",  name: "BNB",       short: "BNB" },
  { symbol: "XRPUSDT",  name: "XRP",       short: "XRP" },
  { symbol: "DOGEUSDT", name: "Dogecoin",  short: "DOGE" },
  { symbol: "ADAUSDT",  name: "Cardano",   short: "ADA" },
  { symbol: "AVAXUSDT", name: "Avalanche", short: "AVAX" },
];

interface Ticker {
  price: string;
  change: string;
}

interface Row {
  symbol: string;
  name: string;
  short: string;
  ticker: Ticker | null;
  loading: boolean;
}

function fmt(n: number) {
  if (n >= 1000) return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
}

export default function WatchlistPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(
    ALL_SYMBOLS.map(s => ({ ...s, ticker: null, loading: true }))
  );
  const [walletAddr, setWalletAddr] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pinned, setPinned] = useState<Set<string>>(new Set(["BTCUSDT", "ETHUSDT"]));

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all(
      ALL_SYMBOLS.map(async ({ symbol }, i) => {
        try {
          const r = await fetch(`/api/market?symbol=${symbol}&interval=1h`);
          const d = await r.json();
          setRows(prev => {
            const next = [...prev];
            next[i] = { ...next[i], ticker: d.ticker, loading: false };
            return next;
          });
        } catch {
          setRows(prev => {
            const next = [...prev];
            next[i] = { ...next[i], loading: false };
            return next;
          });
        }
      })
    );
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchAll();
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user?.wallet_address) setWalletAddr(d.user.wallet_address);
    });
  }, [fetchAll]);

  const sorted = [...rows].sort((a, b) => {
    const ap = pinned.has(a.symbol) ? 0 : 1;
    const bp = pinned.has(b.symbol) ? 0 : 1;
    return ap - bp;
  });

  return (
    <div className="min-h-screen bg-[#080910] text-white" style={{ paddingLeft: SIDEBAR_W }}>
      <AppSidebar active="watchlist" walletAddr={walletAddr} />

      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-sm font-semibold tracking-wide">Watchlist</h1>
          <button
            onClick={fetchAll}
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border border-white/[0.07] text-gray-600 hover:text-white transition"
          >
            <IconRefresh className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} /> Aktualisieren
          </button>
        </div>

        <div className="rounded-2xl border border-white/[0.05] overflow-hidden">
          <div className="grid grid-cols-[16px_1fr_auto_auto_auto] gap-4 px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.02]">
            <div />
            <span className="text-[10px] text-gray-700 uppercase tracking-widest">Asset</span>
            <span className="text-[10px] text-gray-700 uppercase tracking-widest text-right">Preis</span>
            <span className="text-[10px] text-gray-700 uppercase tracking-widest text-right">24h</span>
            <span className="text-[10px] text-gray-700 uppercase tracking-widest text-right">Handeln</span>
          </div>

          {sorted.map((row, i) => {
            const price = row.ticker ? parseFloat(row.ticker.price) : null;
            const change = row.ticker ? parseFloat(row.ticker.change) : null;
            const pos = change != null && change > 0;
            const neg = change != null && change < 0;
            const isPinned = pinned.has(row.symbol);

            return (
              <div
                key={row.symbol}
                className={`grid grid-cols-[16px_1fr_auto_auto_auto] gap-4 px-4 py-3.5 items-center border-b border-white/[0.03] hover:bg-white/[0.03] transition ${i === sorted.length - 1 ? "border-b-0" : ""}`}
              >
                <button
                  onClick={() => setPinned(prev => {
                    const next = new Set(prev);
                    next.has(row.symbol) ? next.delete(row.symbol) : next.add(row.symbol);
                    return next;
                  })}
                  className="text-gray-800 hover:text-yellow-400 transition"
                >
                  {isPinned
                    ? <IconStarFilled className="h-3 w-3 text-yellow-400" />
                    : <IconStar className="h-3 w-3" />
                  }
                </button>

                <div>
                  <span className="text-[13px] font-medium text-gray-200">{row.short}</span>
                  <span className="text-[11px] text-gray-700 ml-2">{row.name}</span>
                </div>

                <div className="text-right">
                  {row.loading ? (
                    <div className="h-3 w-20 bg-white/[0.05] rounded animate-pulse ml-auto" />
                  ) : price != null ? (
                    <span className="text-[13px] font-medium tabular-nums text-gray-200">${fmt(price)}</span>
                  ) : (
                    <span className="text-gray-700 text-[12px]">—</span>
                  )}
                </div>

                <div className="text-right">
                  {row.loading ? (
                    <div className="h-3 w-12 bg-white/[0.05] rounded animate-pulse ml-auto" />
                  ) : change != null ? (
                    <span className={`text-[12px] font-medium tabular-nums flex items-center gap-0.5 justify-end ${pos ? "text-emerald-400" : neg ? "text-red-400" : "text-gray-500"}`}>
                      {pos ? <IconTrendingUp className="h-3 w-3" /> : neg ? <IconTrendingDown className="h-3 w-3" /> : null}
                      {pos ? "+" : ""}{change.toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-gray-700 text-[12px]">—</span>
                  )}
                </div>

                <button
                  onClick={() => router.push(`/trade?symbol=${row.symbol}`)}
                  className="text-[10px] px-2.5 py-1 rounded-lg border border-white/[0.07] text-gray-600 hover:text-white hover:border-white/20 transition"
                >
                  Trade
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
