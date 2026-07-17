import { NextResponse } from "next/server";

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "gerade eben";
  if (m < 60) return `vor ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h}h`;
  return `vor ${Math.floor(h / 24)}d`;
}

const POS_WORDS = ["surge", "soar", "rally", "gain", "bull", "record", "rise", "boost", "recover", "breakout", "adoption", "growth", "launch", "approve", "profit", "rate cut", "dovish", "beats", "partnership", "milestone", "jumps", "climbs", "tops"];
const NEG_WORDS = ["crash", "drop", "fall", "bear", "hack", "scam", "fraud", "loss", "ban", "fear", "liquidat", "collapse", "plunge", "decline", "fine", "sue", "hike", "hawkish", "recession", "inflation high", "sanction", "warning", "tumbles", "sinks", "bleeds"];

function sentiment(title: string): "positive" | "negative" | "neutral" {
  const t = title.toLowerCase();
  const pos = POS_WORDS.filter(w => t.includes(w)).length;
  const neg = NEG_WORDS.filter(w => t.includes(w)).length;
  if (pos > neg) return "positive";
  if (neg > pos) return "negative";
  return "neutral";
}

export interface Article {
  id: string;
  title: string;
  url: string;
  description: string;
  image: string | null;
  source: string;
  time: string;
  sentiment: "positive" | "negative" | "neutral";
  category: "crypto" | "macro" | "forex";
}

function parseRSS(xml: string, source: string, category: "crypto" | "macro" | "forex"): Article[] {
  const items: Article[] = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const match of itemMatches) {
    const block = match[1];
    const title = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() ?? "";

    // Try multiple URL patterns
    let url = block.match(/<link>\s*(https?:\/\/[^\s<]+)\s*<\/link>/)?.[1]?.trim() ?? "";
    if (!url) url = block.match(/<guid[^>]*isPermaLink="true"[^>]*>(https?:\/\/[^\s<]+)<\/guid>/)?.[1]?.trim() ?? "";
    if (!url) url = block.match(/<guid[^>]*>(https?:\/\/[^\s<]+)<\/guid>/)?.[1]?.trim() ?? "";
    if (!url) url = block.match(/<atom:link[^>]+href="([^"]+)"/)?.[1] ?? "";

    const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? "";
    const rawDesc = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1] ?? "";
    const desc = rawDesc.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").trim().slice(0, 300);

    const image = block.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1]
      ?? block.match(/<media:content[^>]+url="([^"]+)"/)?.[1]
      ?? block.match(/<enclosure[^>]+url="([^"]+\.(?:jpg|jpeg|png|webp))[^"]*"/)?.[1]
      ?? null;

    if (!title || !url) continue;

    const date = pubDate ? new Date(pubDate) : new Date();
    const id = Buffer.from(url).toString("base64url").slice(0, 32);

    items.push({ id, title, url, description: desc, image, source, time: timeAgo(date), sentiment: sentiment(title), category });
    if (items.length >= 20) break;
  }
  return items;
}

const FEEDS: { url: string; source: string; category: "crypto" | "macro" | "forex" }[] = [
  { url: "https://www.btc-echo.de/feed/", source: "BTC-Echo", category: "crypto" },
  { url: "https://cointelegraph.com/rss", source: "CoinTelegraph", category: "crypto" },
  { url: "https://coindesk.com/arc/outboundfeeds/rss/", source: "CoinDesk", category: "crypto" },
  { url: "https://cryptonews.com/news/feed/", source: "CryptoNews", category: "crypto" },
  { url: "https://decrypt.co/feed", source: "Decrypt", category: "crypto" },
  { url: "https://www.finanzen.net/rss/news", source: "Finanzen.net", category: "macro" },
  { url: "https://www.investing.com/rss/news_301.rss", source: "Investing.com", category: "macro" },
  { url: "https://feeds.reuters.com/reuters/businessNews", source: "Reuters", category: "macro" },
  { url: "https://www.forexlive.com/feed/news", source: "ForexLive", category: "forex" },
];

async function fetchFeed(feed: typeof FEEDS[0]): Promise<Article[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LyqDex/1.0; +https://lyqdex.io)" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRSS(xml, feed.source, feed.category);
  } catch {
    return [];
  }
}

export async function GET() {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  const all: Article[] = [];
  const seen = new Set<string>();

  for (const r of results) {
    if (r.status === "fulfilled") {
      for (const a of r.value) {
        if (a.url && !seen.has(a.url)) { seen.add(a.url); all.push(a); }
      }
    }
  }

  return NextResponse.json({ articles: all });
}
