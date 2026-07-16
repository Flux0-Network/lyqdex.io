import { NextResponse } from "next/server";

const POSITIVE_WORDS = ["surge", "soar", "rally", "gain", "bull", "high", "record", "rise", "pump", "moon", "boost", "top", "recover", "breakout", "adoption", "growth", "launch", "upgrade", "partnership", "approve", "beat", "profit", "win"];
const NEGATIVE_WORDS = ["crash", "drop", "fall", "bear", "low", "hack", "scam", "fraud", "loss", "dump", "ban", "warning", "risk", "fear", "sell", "liquidat", "collapse", "plunge", "sink", "cut", "decline", "fine", "sue", "lawsuit"];

function sentiment(title: string): "positive" | "negative" | "neutral" {
  const t = title.toLowerCase();
  const pos = POSITIVE_WORDS.filter(w => t.includes(w)).length;
  const neg = NEGATIVE_WORDS.filter(w => t.includes(w)).length;
  if (pos > neg) return "positive";
  if (neg > pos) return "negative";
  return "neutral";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `vor ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h}h`;
  return `vor ${Math.floor(h / 24)}d`;
}

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/news?per_page=50",
      { next: { revalidate: 300 }, headers: { "Accept": "application/json" } }
    );
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();

    const articles = (data.data ?? []).map((item: {
      title: string;
      description: string;
      url: string;
      thumb_2x?: string;
      author?: string;
      updated_at?: string;
    }) => ({
      title: item.title,
      description: item.description,
      url: item.url,
      image: item.thumb_2x ?? null,
      source: item.author ?? "CoinGecko",
      time: item.updated_at ? timeAgo(item.updated_at) : "",
      sentiment: sentiment(item.title),
    }));

    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
