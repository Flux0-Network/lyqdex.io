import { NextResponse } from "next/server";

const BINANCE = "https://api.binance.com/api/v3";

function fmtPrice(p: number) {
  if (p >= 1000) return p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1)    return p.toFixed(4);
  return p.toFixed(5);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") || "BTCUSDT").toUpperCase();

  const [bookRes, tickerRes] = await Promise.all([
    fetch(`${BINANCE}/depth?symbol=${symbol}&limit=20`, { next: { revalidate: 0 } }),
    fetch(`${BINANCE}/ticker/24hr?symbol=${symbol}`,   { next: { revalidate: 0 } }),
  ]);

  if (!bookRes.ok || !tickerRes.ok) {
    return NextResponse.json({ error: "upstream failed" }, { status: 502 });
  }

  const [book, ticker] = await Promise.all([bookRes.json(), tickerRes.json()]);

  return NextResponse.json({
    asks: (book.asks as [string, string][]).slice(0, 20).map(([price, amount]) => ({ price, amount })),
    bids: (book.bids as [string, string][]).slice(0, 20).map(([price, amount]) => ({ price, amount })),
    price:  fmtPrice(parseFloat(ticker.lastPrice)),
    change: parseFloat(ticker.priceChangePercent).toFixed(2),
  });
}
