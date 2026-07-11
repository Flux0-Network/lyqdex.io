import { NextResponse } from "next/server";

const COINGECKO = "https://api.coingecko.com/api/v3";
const BINANCE   = "https://api.binance.com/api/v3";

const SYMBOL_TO_COIN: Record<string, string> = {
  BTCUSDT: "bitcoin",
  ETHUSDT: "ethereum",
  SOLUSDT: "solana",
  BNBUSDT: "binancecoin",
};

function generateCandles(price: number, count: number, intervalSec = 3600) {
  const now = Math.floor(Date.now() / 1000);
  const candles = [];
  let p = price * (0.93 + Math.random() * 0.07);
  for (let i = count; i >= 0; i--) {
    const v = price * 0.006;
    const open = p;
    const close = open + (Math.random() - 0.48) * v;
    const high = Math.max(open, close) + Math.random() * v * 0.4;
    const low  = Math.min(open, close) - Math.random() * v * 0.4;
    p = close;
    candles.push({
      time: now - i * intervalSec,
      open: +open.toFixed(2), high: +high.toFixed(2),
      low: +low.toFixed(2),   close: +close.toFixed(2),
      volume: +(Math.random() * 2000 + 200).toFixed(2),
    });
  }
  return candles;
}

function generateOrderbook(price: number) {
  const asks = [], bids = [];
  const spread = price * 0.0001;
  for (let i = 0; i < 20; i++) {
    asks.push({ price: (price + spread * (i + 1) + Math.random() * spread).toFixed(2), amount: (Math.random() * 2 + 0.01).toFixed(5) });
    bids.push({ price: (price - spread * (i + 1) - Math.random() * spread).toFixed(2), amount: (Math.random() * 2 + 0.01).toFixed(5) });
  }
  return { asks, bids };
}

function generateTrades(price: number) {
  return Array.from({ length: 30 }, (_, i) => ({
    price: (price + (Math.random() - 0.5) * price * 0.002).toFixed(2),
    amount: (Math.random() * 1.5 + 0.001).toFixed(5),
    side: Math.random() > 0.5 ? "buy" : "sell",
    time: Date.now() - i * (Math.random() * 5000 + 500),
  }));
}

const INTERVAL_SECS: Record<string, number> = {
  "1m": 60, "5m": 300, "15m": 900, "1h": 3600, "4h": 14400, "1d": 86400,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol   = (searchParams.get("symbol") || "BTCUSDT").toUpperCase();
  const interval = searchParams.get("interval") || "1h";
  const coinId   = SYMBOL_TO_COIN[symbol] ?? "bitcoin";

  // ── 1. Fetch CoinGecko ticker (price source)
  let ticker: { price: string; change: string; high: string; low: string; volume: string } | null = null;
  try {
    const res = await fetch(
      `${COINGECKO}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_high_24h=true&include_low_24h=true&include_24hr_vol=true`,
      { next: { revalidate: 10 } }
    );
    if (res.ok) {
      const d = await res.json();
      const c = d[coinId];
      if (c) {
        ticker = {
          price:  c.usd.toFixed(2),
          change: (c.usd_24h_change ?? 0).toFixed(2),
          high:   (c.usd_24h_high  ?? c.usd * 1.01).toFixed(2),
          low:    (c.usd_24h_low   ?? c.usd * 0.99).toFixed(2),
          volume: Math.round((c.usd_24h_vol ?? 0) / c.usd).toString(),
        };
      }
    }
  } catch { /* fall through */ }

  // ── 2. Fetch Binance klines (candles — supports 1m/5m/15m etc.)
  let candles: { time: number; open: number; high: number; low: number; close: number; volume: number }[] | null = null;
  try {
    const res = await fetch(
      `${BINANCE}/klines?symbol=${symbol}&interval=${interval}&limit=200`,
      { next: { revalidate: 10 } }
    );
    if (res.ok) {
      const raw = await res.json() as string[][];
      candles = raw.map((k) => ({
        time:   Math.floor(Number(k[0]) / 1000),
        open:   parseFloat(k[1]),
        high:   parseFloat(k[2]),
        low:    parseFloat(k[3]),
        close:  parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));
    }
  } catch { /* fall through */ }

  // ── 3. Orderbook + trades (generated from current price)
  const price = ticker ? parseFloat(ticker.price) : 64000 + Math.random() * 4000;
  const orderbook = generateOrderbook(price);
  const trades    = generateTrades(price);

  // ── 4. Fallback ticker if CoinGecko failed
  if (!ticker) {
    const change = (Math.random() - 0.48) * 4;
    ticker = {
      price:  price.toFixed(2),
      change: change.toFixed(2),
      high:   (price * 1.015).toFixed(2),
      low:    (price * 0.985).toFixed(2),
      volume: (15000 + Math.random() * 10000).toFixed(0),
    };
  }

  // ── 5. Fallback candles if Binance failed
  if (!candles) {
    candles = generateCandles(price, 200, INTERVAL_SECS[interval] ?? 3600);
  }

  return NextResponse.json({
    ticker,
    candles,
    trades,
    orderbook,
    source: `coingecko+${candles ? "binance" : "simulated"}`,
  });
}
