import { NextResponse } from "next/server";

const BINANCE = "https://api.binance.com/api/v3";

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
    candles.push({ time: now - i * 3600, open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) });
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

  try {
    const [tickerRes, klinesRes, depthRes, tradesRes] = await Promise.all([
      fetch(`${BINANCE}/ticker/24hr?symbol=${symbol}`, { next: { revalidate: 10 } }),
      fetch(`${BINANCE}/klines?symbol=${symbol}&interval=${interval}&limit=200`, { next: { revalidate: 10 } }),
      fetch(`${BINANCE}/depth?symbol=${symbol}&limit=20`, { next: { revalidate: 5 } }),
      fetch(`${BINANCE}/trades?symbol=${symbol}&limit=30`, { next: { revalidate: 5 } }),
    ]);

    if (!tickerRes.ok || !klinesRes.ok || !depthRes.ok || !tradesRes.ok) throw new Error("API error");

    const [tickerData, klinesData, depthData, tradesData] = await Promise.all([
      tickerRes.json(), klinesRes.json(), depthRes.json(), tradesRes.json(),
    ]);

    const candles = (klinesData as string[][]).map((k) => ({
      time: Math.floor(Number(k[0]) / 1000),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
    }));

    const orderbook = {
      asks: (depthData.asks as string[][]).map(([price, amount]) => ({ price, amount })),
      bids: (depthData.bids as string[][]).map(([price, amount]) => ({ price, amount })),
    };

    const trades = (tradesData as { price: string; qty: string; time: number; isBuyerMaker: boolean }[]).map((t) => ({
      price: t.price,
      amount: t.qty,
      side: t.isBuyerMaker ? "sell" : "buy",
      time: t.time,
    }));

    return NextResponse.json({
      ticker: {
        price: tickerData.lastPrice,
        change: parseFloat(tickerData.priceChangePercent).toFixed(2),
        high: tickerData.highPrice,
        low: tickerData.lowPrice,
        volume: parseFloat(tickerData.volume).toFixed(0),
      },
      candles,
      trades,
      orderbook,
      source: "binance",
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
