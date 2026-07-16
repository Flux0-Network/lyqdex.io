"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppSidebar, SIDEBAR_W } from "@/components/shared/app-sidebar";
import { IconRefresh, IconExternalLink } from "@tabler/icons-react";

type Sentiment = "positive" | "negative" | "neutral";

interface Article {
  title: string;
  description: string;
  url: string;
  image: string | null;
  source: string;
  time: string;
  sentiment: Sentiment;
}

const BADGE: Record<Sentiment, { label: string; cls: string }> = {
  positive: { label: "Positiv",  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  negative: { label: "Negativ",  cls: "bg-red-500/15 text-red-400 border-red-500/25" },
  neutral:  { label: "Neutral",  cls: "bg-white/[0.06] text-gray-500 border-white/[0.08]" },
};

const FILTERS: { key: Sentiment | "all"; label: string }[] = [
  { key: "all",      label: "Alle" },
  { key: "positive", label: "Positiv" },
  { key: "negative", label: "Negativ" },
  { key: "neutral",  label: "Neutral" },
];

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Sentiment | "all">("all");
  const [walletAddr, setWalletAddr] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/news")
      .then(r => r.json())
      .then(d => { setArticles(d.articles ?? []); setLoading(false); });
  }

  useEffect(() => {
    load();
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user?.wallet_address) setWalletAddr(d.user.wallet_address);
    });
  }, []);

  const shown = filter === "all" ? articles : articles.filter(a => a.sentiment === filter);

  return (
    <div className="min-h-screen bg-[#080910] text-white" style={{ paddingLeft: SIDEBAR_W }}>
      <AppSidebar active="news" walletAddr={walletAddr} />

      <div className="max-w-3xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-sm font-semibold text-white">Crypto News</h1>
            <p className="text-[11px] text-gray-600 mt-0.5">Powered by CoinGecko</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border border-white/[0.07] text-gray-500 hover:text-white hover:border-white/20 transition"
          >
            <IconRefresh className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Aktualisieren
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-5">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[11px] px-3 py-1 rounded-full border transition ${
                filter === f.key
                  ? "border-white/20 text-white bg-white/[0.07]"
                  : "border-white/[0.06] text-gray-600 hover:text-gray-400"
              }`}
            >
              {f.label}
              {f.key !== "all" && (
                <span className="ml-1 text-[10px] opacity-60">
                  {articles.filter(a => a.sentiment === f.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Articles */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-16 text-gray-600 text-sm">Keine Artikel gefunden</div>
        ) : (
          <div className="space-y-2">
            {shown.map((a, i) => {
              const badge = BADGE[a.sentiment];
              return (
                <Link
                  key={i}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-3 p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.05] hover:bg-white/[0.045] hover:border-white/[0.09] transition"
                >
                  {a.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.image}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover shrink-0 opacity-80 group-hover:opacity-100 transition"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <span className={`shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded border ${badge.cls}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] text-gray-600 shrink-0">{a.time}</span>
                      <span className="text-[10px] text-gray-700 truncate">{a.source}</span>
                      <IconExternalLink className="h-3 w-3 text-gray-700 group-hover:text-gray-400 transition shrink-0 ml-auto" />
                    </div>
                    <p className="text-[12px] font-medium text-gray-200 group-hover:text-white transition line-clamp-2 leading-snug">
                      {a.title}
                    </p>
                    {a.description && (
                      <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-1">{a.description}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
