import { NextResponse } from "next/server";

const BINANCE = "https://api.binance.com/api/v3";

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

    if (!tickerRes.ok || !klinesRes.ok || !depthRes.ok || !tradesRes.ok) {
      throw new Error("Binance API error");
    }

    const [tickerData, klinesData, depthData, tradesData] = await Promise.all([
      tickerRes.json(),
      klinesRes.json(),
      depthRes.json(),
      tradesRes.json(),
    ]);

    // Candles: [openTime, open, high, low, close, volume, ...]
    const candles = (klinesData as string[][]).map((k) => ({
      time: Math.floor(Number(k[0]) / 1000),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
    }));

    // Orderbook
    const orderbook = {
      asks: (depthData.asks as string[][]).map(([price, amount]) => ({ price, amount })),
      bids: (depthData.bids as string[][]).map(([price, amount]) => ({ price, amount })),
    };

    // Trades: isBuyerMaker=true means the buyer is the maker → sell-side aggressor
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
    });
  } catch {
    return NextResponse.json({ error: "Market data unavailable" }, { status: 503 });
  }
}
