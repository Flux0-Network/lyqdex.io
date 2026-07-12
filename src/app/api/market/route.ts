import { NextResponse } from "next/server";

// ── Exchange configs ──────────────────────────────────────────────
const BINANCE  = "https://api.binance.com/api/v3";
const BYBIT    = "https://api.bybit.com/v5/market";
const OKX      = "https://www.okx.com/api/v5/market";
const COINGECKO = "https://api.coingecko.com/api/v3";

// Interval mapping per exchange
const TF_BINANCE: Record<string, string> = {
  "1m":"1m","5m":"5m","15m":"15m","1h":"1h","4h":"4h","1d":"1d",
};
const TF_BYBIT: Record<string, string> = {
  "1m":"1","5m":"5","15m":"15","1h":"60","4h":"240","1d":"D",
};
const TF_OKX: Record<string, string> = {
  "1m":"1m","5m":"5m","15m":"15m","1h":"1H","4h":"4H","1d":"1D",
};

const COIN_IDS: Record<string, string> = {
  BTCUSDT: "bitcoin", ETHUSDT: "ethereum", SOLUSDT: "solana",
  BNBUSDT: "binancecoin", XRPUSDT: "ripple", DOGEUSDT: "dogecoin",
  ADAUSDT: "cardano", AVAXUSDT: "avalanche-2",
};

// ── Helpers ───────────────────────────────────────────────────────
function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function safeJson<T>(res: Response): Promise<T | null> {
  return res.ok ? res.json().catch(() => null) : Promise.resolve(null);
}

function generateCandles(price: number, count: number, intervalSec = 3600) {
  const now = Math.floor(Date.now() / 1000);
  let p = price * (0.93 + Math.random() * 0.07);
  return Array.from({ length: count + 1 }, (_, idx) => {
    const v = price * 0.006;
    const open  = p;
    const close = open + (Math.random() - 0.48) * v;
    const high  = Math.max(open, close) + Math.random() * v * 0.4;
    const low   = Math.min(open, close) - Math.random() * v * 0.4;
    p = close;
    return {
      time:   now - (count - idx) * intervalSec,
      open:   +open.toFixed(2), high: +high.toFixed(2),
      low:    +low.toFixed(2),  close: +close.toFixed(2),
      volume: +(Math.random() * 2000 + 200).toFixed(2),
    };
  });
}

function generateOrderbook(price: number) {
  const spread = price * 0.0001;
  return {
    asks: Array.from({ length: 20 }, (_, i) => ({
      price:  (price + spread * (i + 1) + Math.random() * spread).toFixed(2),
      amount: (Math.random() * 2 + 0.01).toFixed(5),
    })),
    bids: Array.from({ length: 20 }, (_, i) => ({
      price:  (price - spread * (i + 1) - Math.random() * spread).toFixed(2),
      amount: (Math.random() * 2 + 0.01).toFixed(5),
    })),
  };
}

function generateTrades(price: number) {
  return Array.from({ length: 30 }, (_, i) => ({
    price:  (price + (Math.random() - 0.5) * price * 0.002).toFixed(2),
    amount: (Math.random() * 1.5 + 0.001).toFixed(5),
    side:   Math.random() > 0.5 ? "buy" : "sell",
    time:   Date.now() - i * (Math.random() * 5000 + 500),
  }));
}

const INTERVAL_SECS: Record<string, number> = {
  "1m": 60, "5m": 300, "15m": 900, "1h": 3600, "4h": 14400, "1d": 86400,
};

// ── Price fetchers ────────────────────────────────────────────────
async function priceBinance(symbol: string): Promise<number | null> {
  try {
    const r = await fetch(`${BINANCE}/ticker/price?symbol=${symbol}`, { next: { revalidate: 5 } });
    const d = await safeJson<{ price: string }>(r!);
    return d ? parseFloat(d.price) : null;
  } catch { return null; }
}

async function priceBybit(symbol: string): Promise<number | null> {
  try {
    const r = await fetch(`${BYBIT}/tickers?category=spot&symbol=${symbol}`, { next: { revalidate: 5 } });
    const d = await safeJson<{ result?: { list?: { lastPrice: string }[] } }>(r!);
    const v = d?.result?.list?.[0]?.lastPrice;
    return v ? parseFloat(v) : null;
  } catch { return null; }
}

async function priceOKX(symbol: string): Promise<number | null> {
  const instId = symbol.replace("USDT", "-USDT");
  try {
    const r = await fetch(`${OKX}/ticker?instId=${instId}`, { next: { revalidate: 5 } });
    const d = await safeJson<{ data?: { last: string }[] }>(r!);
    const v = d?.data?.[0]?.last;
    return v ? parseFloat(v) : null;
  } catch { return null; }
}

async function priceCoinGecko(coinId: string): Promise<{ price: number; change: number; high: number; low: number; vol: number } | null> {
  try {
    const r = await fetch(
      `${COINGECKO}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_high_24h=true&include_low_24h=true&include_24hr_vol=true`,
      { next: { revalidate: 10 } }
    );
    const d = await safeJson<Record<string, { usd: number; usd_24h_change: number; usd_24h_high: number; usd_24h_low: number; usd_24h_vol: number }>>(r!);
    const c = d?.[coinId];
    if (!c) return null;
    return { price: c.usd, change: c.usd_24h_change, high: c.usd_24h_high, low: c.usd_24h_low, vol: c.usd_24h_vol };
  } catch { return null; }
}

// ── Candle fetchers ───────────────────────────────────────────────
type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number };

async function candlesBinance(symbol: string, interval: string): Promise<Candle[] | null> {
  try {
    const tf = TF_BINANCE[interval] ?? "1h";
    const r = await fetch(`${BINANCE}/klines?symbol=${symbol}&interval=${tf}&limit=200`, { next: { revalidate: 10 } });
    const d = await safeJson<string[][]>(r!);
    if (!d) return null;
    return d.map(k => ({
      time: Math.floor(Number(k[0]) / 1000),
      open: parseFloat(k[1]), high: parseFloat(k[2]),
      low:  parseFloat(k[3]), close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));
  } catch { return null; }
}

async function candlesBybit(symbol: string, interval: string): Promise<Candle[] | null> {
  try {
    const tf = TF_BYBIT[interval] ?? "60";
    const r = await fetch(`${BYBIT}/kline?category=spot&symbol=${symbol}&interval=${tf}&limit=200`, { next: { revalidate: 10 } });
    const d = await safeJson<{ result?: { list?: string[][] } }>(r!);
    const list = d?.result?.list;
    if (!list) return null;
    return list.reverse().map(k => ({
      time: Math.floor(Number(k[0]) / 1000),
      open: parseFloat(k[1]), high: parseFloat(k[2]),
      low:  parseFloat(k[3]), close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));
  } catch { return null; }
}

async function candlesOKX(symbol: string, interval: string): Promise<Candle[] | null> {
  const instId = symbol.replace("USDT", "-USDT");
  const tf = TF_OKX[interval] ?? "1H";
  try {
    const r = await fetch(`${OKX}/candles?instId=${instId}&bar=${tf}&limit=200`, { next: { revalidate: 10 } });
    const d = await safeJson<{ data?: string[][] }>(r!);
    const data = d?.data;
    if (!data) return null;
    return data.reverse().map(k => ({
      time: Math.floor(Number(k[0]) / 1000),
      open: parseFloat(k[1]), high: parseFloat(k[2]),
      low:  parseFloat(k[3]), close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));
  } catch { return null; }
}

// ── Main handler ──────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol   = (searchParams.get("symbol") || "BTCUSDT").toUpperCase();
  const interval = searchParams.get("interval") || "1h";
  const coinId   = COIN_IDS[symbol] ?? "bitcoin";

  // Fetch all price sources + candles in parallel
  const [
    pBinance, pBybit, pOKX, cgData,
    cBinance, cBybit, cOKX,
  ] = await Promise.all([
    priceBinance(symbol),
    priceBybit(symbol),
    priceOKX(symbol),
    priceCoinGecko(coinId),
    candlesBinance(symbol, interval),
    candlesBybit(symbol, interval),
    candlesOKX(symbol, interval),
  ]);

  // Aggregate spot price — median of all available sources
  const rawPrices = [pBinance, pBybit, pOKX, cgData?.price].filter((p): p is number => p != null && p > 0);
  const aggPrice  = rawPrices.length ? median(rawPrices) : 64000 + Math.random() * 4000;

  const sources = [
    pBinance  != null && "binance",
    pBybit    != null && "bybit",
    pOKX      != null && "okx",
    cgData    != null && "coingecko",
  ].filter(Boolean);

  // 24h stats — prefer CoinGecko (aggregated), else derive from price
  const change24 = cgData?.change ?? (Math.random() - 0.48) * 4;
  const high24   = cgData?.high   ?? aggPrice * 1.015;
  const low24    = cgData?.low    ?? aggPrice * 0.985;
  const vol24    = cgData?.vol    ?? aggPrice * (15000 + Math.random() * 10000);

  const ticker = {
    price:  aggPrice.toFixed(2),
    change: change24.toFixed(2),
    high:   high24.toFixed(2),
    low:    low24.toFixed(2),
    volume: Math.round(vol24 / aggPrice).toString(),
    sources,
  };

  // Best available candles
  const candles = cBinance ?? cBybit ?? cOKX
    ?? generateCandles(aggPrice, 200, INTERVAL_SECS[interval] ?? 3600);

  const candleSource = cBinance ? "binance" : cBybit ? "bybit" : cOKX ? "okx" : "simulated";

  return NextResponse.json({
    ticker,
    candles,
    trades:    generateTrades(aggPrice),
    orderbook: generateOrderbook(aggPrice),
    source:    `price:${sources.join("+")} candles:${candleSource}`,
  });
}
