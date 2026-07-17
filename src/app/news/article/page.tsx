"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppSidebar, SIDEBAR_W } from "@/components/shared/app-sidebar";
import { IconArrowLeft, IconExternalLink } from "@tabler/icons-react";

type Sentiment = "positive" | "negative" | "neutral";

const BADGE: Record<Sentiment, { label: string; cls: string }> = {
  positive: { label: "Positiv",  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  negative: { label: "Negativ",  cls: "bg-red-500/15 text-red-400 border-red-500/30" },
  neutral:  { label: "Neutral",  cls: "bg-white/[0.05] text-gray-500 border-white/[0.08]" },
};

const CAT: Record<string, { label: string; cls: string }> = {
  crypto: { label: "Crypto",       cls: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  macro:  { label: "Makro & Zins", cls: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
};

interface Article {
  title: string;
  url: string;
  description: string;
  image: string | null;
  source: string;
  time: string;
  sentiment: Sentiment;
  category: string;
}

function ArticleContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [walletAddr, setWalletAddr] = useState<string | null>(null);

  useEffect(() => {
    const data = params.get("d");
    if (data) {
      try { setArticle(JSON.parse(atob(data))); } catch { router.push("/news"); }
    } else { router.push("/news"); }

    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user?.wallet_address) setWalletAddr(d.user.wallet_address);
    });
  }, [params, router]);

  if (!article) return <div className="text-gray-600 text-sm py-20 text-center">Lade…</div>;

  const badge = BADGE[article.sentiment];
  const cat = CAT[article.category] ?? CAT.crypto;

  return (
    <div className="min-h-screen bg-[#07080d] text-white" style={{ paddingLeft: SIDEBAR_W }}>
      <AppSidebar active="news" walletAddr={walletAddr} />

      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[11px] text-gray-600 hover:text-gray-300 transition mb-6"
        >
          <IconArrowLeft className="h-3.5 w-3.5" /> Zurück zu News
        </button>

        {/* Hero image */}
        {article.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image}
            alt=""
            className="w-full h-48 object-cover rounded-2xl mb-6 opacity-90"
          />
        )}

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${badge.cls}`}>{badge.label}</span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${cat.cls}`}>{cat.label}</span>
          <span className="text-[11px] text-gray-600">{article.source}</span>
          <span className="text-[11px] text-gray-700">·</span>
          <span className="text-[11px] text-gray-600">{article.time}</span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-white leading-snug mb-4">{article.title}</h1>

        {/* Description */}
        {article.description && (
          <p className="text-[14px] text-gray-400 leading-relaxed mb-8 border-l-2 border-white/[0.07] pl-4">
            {article.description}
          </p>
        )}

        {/* CTA */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-[13px] text-gray-200 hover:text-white hover:bg-white/[0.09] hover:border-white/20 transition"
        >
          <IconExternalLink className="h-4 w-4" />
          Ganzen Artikel lesen auf {article.source}
        </a>

        {/* Source URL */}
        <p className="text-[10px] text-gray-700 mt-3 break-all">{article.url}</p>
      </div>
    </div>
  );
}

export default function ArticlePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07080d]" />}>
      <ArticleContent />
    </Suspense>
  );
}
