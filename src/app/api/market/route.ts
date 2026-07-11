import { NextResponse } from "next/server";

const COINGECKO = "https://api.coingecko.com/api/v3";

const SYMBOL_TO_ID: Record<string, string> = {
  BTCUSDT: "bitcoin",
  ETHUSDT: "ethereum",
  SOLUSDT: "solana",
  BNBUSDT: "binancecoin",
};

const INTERVAL_TO_DAYS: Record<string, number> = {
  "1m": 1, "5m": 1, "15m": 1, "1h": 7, "4h": 14, "1d": 90,
};

function generateCandles(price: number, count: number) {
  const now = Math.floor(Date.now() / 1000);
  const candles = [];
  let p = price * (0.93 + Math.random() * 0.07);
  for (let i = count; i >= 0; i--) {
    const v = price * 0.006;
    const open = p;
    const close = open + (Math.random() - 0.48) * v;
    const high = Math.max(open, close) + Math.random() * v * 0.4;
    const low = Math.min(open, close) - Math.random() * v * 0.4;
    p = close;
    candles.push({ time: now - i * 3600, open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2), volume: +(Math.random() * 2000 + 200).toFixed(2) });
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "BTCUSDT").toUpperCase();
  const interval = searchParams.get("interval") || "1h";

  const coinId = SYMBOL_TO_ID[symbol] ?? "bitcoin";
  const days = INTERVAL_TO_DAYS[interval] ?? 7;

  try {
    const [priceRes, ohlcRes] = await Promise.all([
      fetch(
        `${COINGECKO}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_high_24h=true&include_low_24h=true&include_24hr_vol=true`,
        { next: { revalidate: 10 } }
      ),
      fetch(
        `${COINGECKO}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`,
        { next: { revalidate: 60 } }
      ),
    ]);

    if (!priceRes.ok || !ohlcRes.ok) throw new Error("CoinGecko API error");

    const [priceData, ohlcData] = await Promise.all([
      priceRes.json(),
      ohlcRes.json(),
    ]);

    const coin = priceData[coinId];
    if (!coin) throw new Error("No coin data");

    const price: number = coin.usd;
    const change: number = coin.usd_24h_change ?? 0;
    const high24: number = coin.usd_24h_high ?? price * 1.01;
    const low24: number = coin.usd_24h_low ?? price * 0.99;
    const vol24: number = coin.usd_24h_vol ?? 0;

    const candles = (ohlcData as number[][]).map(([ts, open, high, low, close]) => ({
      time: Math.floor(ts / 1000),
      open,
      high,
      low,
      close,
      volume: 0,
    }));

    const orderbook = generateOrderbook(price);
    const trades = generateTrades(price);

    return NextResponse.json({
      ticker: {
        price: price.toFixed(2),
        change: change.toFixed(2),
        high: high24.toFixed(2),
        low: low24.toFixed(2),
        volume: Math.round(vol24 / price).toString(),
      },
      candles,
      trades,
      orderbook,
      source: "coingecko",
    });
  } catch {
    const price = 64000 + Math.random() * 4000;
    const change = (Math.random() - 0.48) * 4;
    return NextResponse.json({
      ticker: {
        price: price.toFixed(2),
        change: change.toFixed(2),
        high: (price * 1.015).toFixed(2),
        low: (price * 0.985).toFixed(2),
        volume: (15000 + Math.random() * 10000).toFixed(0),
      },
      candles: generateCandles(price, 200),
      trades: generateTrades(price),
      orderbook: generateOrderbook(price),
      source: "simulated",
    });
  }
}
