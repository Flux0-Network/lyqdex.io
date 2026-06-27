import { NextResponse } from "next/server";

const PAIRS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "DOGEUSDT", "ADAUSDT", "AVAXUSDT", "DOTUSDT", "MATICUSDT", "LINKUSDT", "LTCUSDT", "UNIUSDT", "ATOMUSDT"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "BTCUSDT";

  try {
    const [tickerRes, klinesRes, tradesRes, depthRes] = await Promise.all([
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`),
      fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=200`),
      fetch(`https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=30`),
      fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=15`),
    ]);

    const ticker = await tickerRes.json();
    const klines = await klinesRes.json();
    const trades = await tradesRes.json();
    const depth = await depthRes.json();

    const candles = klines.map((k: string[]) => ({
      time: Math.floor(Number(k[0]) / 1000),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
    }));

    const recentTrades = trades.map((t: { price: string; qty: string; isBuyerMaker: boolean; time: number }) => ({
      price: t.price,
      amount: t.qty,
      side: t.isBuyerMaker ? "sell" : "buy",
      time: t.time,
    }));

    const orderbook = {
      asks: depth.asks?.slice(0, 15).map((a: string[]) => ({ price: a[0], amount: a[1] })) || [],
      bids: depth.bids?.slice(0, 15).map((b: string[]) => ({ price: b[0], amount: b[1] })) || [],
    };

    return NextResponse.json({
      ticker: {
        price: ticker.lastPrice,
        change: ticker.priceChangePercent,
        high: ticker.highPrice,
        low: ticker.lowPrice,
        volume: ticker.volume,
      },
      candles,
      trades: recentTrades,
      orderbook,
    });
  } catch {
    return NextResponse.json({ error: "Marktdaten nicht verfügbar" }, { status: 500 });
  }
}

export async function GET_PAIRS() {
  return PAIRS;
}

export { PAIRS };
