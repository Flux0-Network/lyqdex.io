import { NextResponse } from "next/server";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts * 1000;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "gerade eben";
  if (m < 60) return `vor ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h}h`;
  return `vor ${Math.floor(h / 24)}d`;
}

function getSentiment(item: { sentiment_votes_bullish_percentage?: number; sentiment_votes_bearish_percentage?: number; title: string }): "positive" | "negative" | "neutral" {
  if (item.sentiment_votes_bullish_percentage && item.sentiment_votes_bearish_percentage) {
    if (item.sentiment_votes_bullish_percentage > 60) return "positive";
    if (item.sentiment_votes_bearish_percentage > 60) return "negative";
  }
  const t = item.title.toLowerCase();
  const pos = ["surge", "soar", "rally", "gain", "bull", "high", "record", "rise", "boost", "recover", "breakout", "adoption", "growth", "launch", "approve", "beat", "profit", "cut rate", "rate cut", "dovish"].filter(w => t.includes(w)).length;
  const neg = ["crash", "drop", "fall", "bear", "hack", "scam", "fraud", "loss", "ban", "fear", "liquidat", "collapse", "plunge", "decline", "fine", "sue", "hike", "hawkish", "recession", "inflation", "sanction"].filter(w => t.includes(w)).length;
  if (pos > neg) return "positive";
  if (neg > pos) return "negative";
  return "neutral";
}

async function fetchCryptoNews() {
  const res = await fetch(
    "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest&limit=50",
    { next: { revalidate: 180 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.Data ?? []).map((item: {
    title: string;
    body: string;
    url: string;
    imageurl?: string;
    source_info?: { name: string };
    published_on: number;
    sentiment_votes_bullish_percentage?: number;
    sentiment_votes_bearish_percentage?: number;
  }) => ({
    title: item.title,
    description: item.body?.slice(0, 120) + "…",
    url: item.url,
    image: item.imageurl ?? null,
    source: item.source_info?.name ?? "CryptoCompare",
    time: timeAgo(item.published_on),
    sentiment: getSentiment(item),
    category: "crypto",
  }));
}

async function fetchMacroNews() {
  const res = await fetch(
    "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest&limit=30&categories=Macro,Regulation",
    { next: { revalidate: 180 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.Data ?? []).map((item: {
    title: string;
    body: string;
    url: string;
    imageurl?: string;
    source_info?: { name: string };
    published_on: number;
    sentiment_votes_bullish_percentage?: number;
    sentiment_votes_bearish_percentage?: number;
  }) => ({
    title: item.title,
    description: item.body?.slice(0, 120) + "…",
    url: item.url,
    image: item.imageurl ?? null,
    source: item.source_info?.name ?? "CryptoCompare",
    time: timeAgo(item.published_on),
    sentiment: getSentiment(item),
    category: "macro",
  }));
}

export async function GET() {
  try {
    const [crypto, macro] = await Promise.all([fetchCryptoNews(), fetchMacroNews()]);

    // Merge and deduplicate by URL
    const seen = new Set<string>();
    const articles = [...macro, ...crypto].filter(a => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
