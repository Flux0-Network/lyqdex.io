"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar, SIDEBAR_W } from "@/components/shared/app-sidebar";
import { IconRefresh, IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";

type Sentiment = "positive" | "negative" | "neutral";
type Category = "all" | "crypto" | "macro";
type SentimentFilter = "all" | Sentiment;

interface Article {
  title: string;
  url: string;
  description: string;
  image: string | null;
  source: string;
  time: string;
  sentiment: Sentiment;
  category: "crypto" | "macro";
}

const SENT_CONFIG: Record<Sentiment, { label: string; dot: string; bar: string; icon: React.ReactNode }> = {
  positive: { label: "Positiv",  dot: "bg-emerald-400", bar: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400", icon: <IconTrendingUp className="h-3 w-3" /> },
  negative: { label: "Negativ",  dot: "bg-red-400",     bar: "bg-red-500/20 border-red-500/30 text-red-400",             icon: <IconTrendingDown className="h-3 w-3" /> },
  neutral:  { label: "Neutral",  dot: "bg-gray-600",    bar: "bg-white/[0.04] border-white/[0.08] text-gray-500",        icon: <IconMinus className="h-3 w-3" /> },
};

const CAT_BADGE: Record<"crypto" | "macro", string> = {
  crypto: "text-cyan-500",
  macro:  "text-violet-400",
};

export default function NewsPage() {
  const router = useRouter();
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

  function openArticle(a: Article) {
    const data = btoa(JSON.stringify(a));
    router.push(`/news/article?d=${data}`);
  }

  const shown = articles
    .filter(a => cat === "all" || a.category === cat)
    .filter(a => sent === "all" || a.sentiment === sent);

  const total = articles.filter(a => cat === "all" || a.category === cat);
  const counts = {
    positive: total.filter(a => a.sentiment === "positive").length,
    negative: total.filter(a => a.sentiment === "negative").length,
    neutral:  total.filter(a => a.sentiment === "neutral").length,
  };
  const totalCount = total.length;
  const posPercent = totalCount ? Math.round((counts.positive / totalCount) * 100) : 0;
  const negPercent = totalCount ? Math.round((counts.negative / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#080910] text-white" style={{ paddingLeft: SIDEBAR_W }}>
      <AppSidebar active="news" walletAddr={walletAddr} />

      <div className="max-w-2xl mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-sm font-semibold tracking-wide">News</h1>
          <button onClick={load} className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border border-white/[0.07] text-gray-600 hover:text-white transition">
            <IconRefresh className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Aktualisieren
          </button>
        </div>

        {/* Sentiment bar */}
        {!loading && totalCount > 0 && (
          <div className="mb-5 p-3.5 rounded-2xl bg-white/[0.025] border border-white/[0.05]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] text-gray-600 uppercase tracking-widest">Marktstimmung</span>
              <span className="text-[10px] text-gray-600">{totalCount} Artikel</span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5 mb-2.5">
              <div className="bg-emerald-500 rounded-full transition-all" style={{ width: `${posPercent}%` }} />
              <div className="bg-gray-800 rounded-full transition-all" style={{ width: `${100 - posPercent - negPercent}%` }} />
              <div className="bg-red-500 rounded-full transition-all" style={{ width: `${negPercent}%` }} />
            </div>
            <div className="flex gap-4">
              {(["positive", "negative", "neutral"] as const).map(s => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${SENT_CONFIG[s].dot}`} />
                  <span className="text-[10px] text-gray-500">{SENT_CONFIG[s].label}</span>
                  <span className="text-[10px] text-white font-medium">{counts[s]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {(["all", "crypto", "macro"] as const).map(k => (
            <button key={k} onClick={() => setCat(k)}
              className={`text-[11px] px-3 py-1 rounded-full border transition ${cat === k ? "border-white/20 text-white bg-white/[0.07]" : "border-white/[0.06] text-gray-600 hover:text-gray-300"}`}>
              {k === "all" ? "Alle" : k === "crypto" ? "Crypto" : "Makro & Zins"}
            </button>
          ))}
          <div className="flex gap-1.5 ml-auto">
            {(["all", "positive", "negative", "neutral"] as const).map(k => (
              <button key={k} onClick={() => setSent(k)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition ${sent === k ? "border-white/20 text-white bg-white/[0.06]" : "border-white/[0.05] text-gray-700 hover:text-gray-400"}`}>
                {k === "all" ? "Alle" : SENT_CONFIG[k].label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-gray-700 mb-4">{shown.length} Artikel</p>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-[76px] rounded-2xl bg-white/[0.03] animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-20 text-gray-700 text-sm">Keine Artikel gefunden</div>
        ) : (
          <div className="space-y-1.5">
            {shown.map((a, i) => {
              const s = SENT_CONFIG[a.sentiment];
              return (
                <button
                  key={i}
                  onClick={() => openArticle(a)}
                  className="w-full text-left group flex gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.09] transition-all"
                >
                  <div className={`w-0.5 self-stretch rounded-full shrink-0 ${s.dot}`} />
                  {a.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 opacity-70 group-hover:opacity-90 transition" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded border ${s.bar}`}>
                        {s.icon}{s.label}
                      </span>
                      <span className={`text-[9px] font-medium ${CAT_BADGE[a.category]}`}>
                        {a.category === "crypto" ? "Crypto" : "Makro"}
                      </span>
                      <span className="text-[10px] text-gray-700 ml-auto shrink-0">{a.time}</span>
                    </div>
                    <p className="text-[12px] font-medium text-gray-300 group-hover:text-white transition line-clamp-2 leading-snug">
                      {a.title}
                    </p>
                    <p className="text-[10px] text-gray-700 mt-0.5">{a.source}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
