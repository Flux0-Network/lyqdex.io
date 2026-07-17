"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppSidebar, SIDEBAR_W } from "@/components/shared/app-sidebar";
import { IconRefresh, IconExternalLink } from "@tabler/icons-react";

type Sentiment = "positive" | "negative" | "neutral";
type Category = "all" | "crypto" | "macro";
type SentimentFilter = "all" | Sentiment;

interface Article {
  title: string;
  description: string;
  url: string;
  image: string | null;
  source: string;
  time: string;
  sentiment: Sentiment;
  category: "crypto" | "macro";
}

const SENTIMENT_BADGE: Record<Sentiment, { label: string; cls: string }> = {
  positive: { label: "Positiv",  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  negative: { label: "Negativ",  cls: "bg-red-500/15 text-red-400 border-red-500/30" },
  neutral:  { label: "Neutral",  cls: "bg-white/[0.05] text-gray-500 border-white/[0.08]" },
};

const CAT_LABEL: Record<"crypto" | "macro", { label: string; cls: string }> = {
  crypto: { label: "Crypto",       cls: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  macro:  { label: "Makro & Zins", cls: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
};

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<Category>("all");
  const [sent, setSent] = useState<SentimentFilter>("all");
  const [walletAddr, setWalletAddr] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/news")
      .then(r => r.json())
      .then(d => { setArticles(d.articles ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    load();
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user?.wallet_address) setWalletAddr(d.user.wallet_address);
    });
  }, []);

  const shown = articles
    .filter(a => cat === "all" || a.category === cat)
    .filter(a => sent === "all" || a.sentiment === sent);

  const counts = {
    positive: articles.filter(a => (cat === "all" || a.category === cat) && a.sentiment === "positive").length,
    negative: articles.filter(a => (cat === "all" || a.category === cat) && a.sentiment === "negative").length,
    neutral:  articles.filter(a => (cat === "all" || a.category === cat) && a.sentiment === "neutral").length,
  };

  return (
    <div className="min-h-screen bg-[#080910] text-white" style={{ paddingLeft: SIDEBAR_W }}>
      <AppSidebar active="news" walletAddr={walletAddr} />

      <div className="max-w-3xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide">News</h1>
            <p className="text-[11px] text-gray-600 mt-0.5">{articles.length} Artikel geladen</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border border-white/[0.07] text-gray-500 hover:text-white hover:border-white/20 transition"
          >
            <IconRefresh className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Neu laden
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 mb-3">
          {([["all", "Alle"], ["crypto", "Crypto"], ["macro", "Makro & Zins"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCat(key)}
              className={`text-[11px] px-3 py-1 rounded-full border transition ${
                cat === key
                  ? "border-white/20 text-white bg-white/[0.07]"
                  : "border-white/[0.06] text-gray-600 hover:text-gray-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sentiment filter */}
        <div className="flex gap-1.5 mb-6">
          {([
            ["all",      "Alle",    "text-gray-400"],
            ["positive", "Positiv", "text-emerald-400"],
            ["negative", "Negativ", "text-red-400"],
            ["neutral",  "Neutral", "text-gray-500"],
          ] as const).map(([key, label, color]) => (
            <button
              key={key}
              onClick={() => setSent(key)}
              className={`flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full border transition ${
                sent === key
                  ? "border-white/20 bg-white/[0.06] text-white"
                  : `border-white/[0.05] ${color} hover:border-white/10`
              }`}
            >
              {label}
              {key !== "all" && <span className="opacity-60">{counts[key]}</span>}
            </button>
          ))}
        </div>

        {/* Articles */}
        {loading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white/[0.03] animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-20 text-gray-600 text-sm">Keine Artikel gefunden</div>
        ) : (
          <div className="space-y-2">
            {shown.map((a, i) => {
              const badge = SENTIMENT_BADGE[a.sentiment];
              const catBadge = CAT_LABEL[a.category];
              return (
                <Link
                  key={i}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-3 p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.05] hover:bg-white/[0.045] hover:border-white/[0.09] transition-all"
                >
                  {a.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.image}
                      alt=""
                      className="w-[60px] h-[60px] rounded-lg object-cover shrink-0 opacity-75 group-hover:opacity-100 transition"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    {/* Badges row */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${badge.cls}`}>
                        {badge.label}
                      </span>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${catBadge.cls}`}>
                        {catBadge.label}
                      </span>
                      <span className="text-[10px] text-gray-700 ml-auto">{a.time}</span>
                      <span className="text-[10px] text-gray-700 truncate max-w-[80px]">{a.source}</span>
                      <IconExternalLink className="h-3 w-3 text-gray-700 group-hover:text-gray-500 transition shrink-0" />
                    </div>
                    {/* Title */}
                    <p className="text-[12px] font-medium text-gray-200 group-hover:text-white transition line-clamp-2 leading-snug">
                      {a.title}
                    </p>
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
