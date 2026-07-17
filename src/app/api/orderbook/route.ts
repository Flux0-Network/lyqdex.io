import { NextResponse } from "next/server";

const OKX = "https://www.okx.com/api/v5/market";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") || "BTCUSDT").toUpperCase();
  const instId = symbol.replace("USDT", "-USDT");

  const [bookRes, tickerRes] = await Promise.all([
    fetch(`${OKX}/books?instId=${instId}&sz=20`, { next: { revalidate: 0 } }),
    fetch(`${OKX}/ticker?instId=${instId}`,      { next: { revalidate: 0 } }),
  ]);

  if (!bookRes.ok || !tickerRes.ok) {
    return NextResponse.json({ error: "upstream failed" }, { status: 502 });
  }

  const [bookJson, tickerJson] = await Promise.all([bookRes.json(), tickerRes.json()]);

  const book   = bookJson?.data?.[0];
  const ticker = tickerJson?.data?.[0];

  if (!book || !ticker) {
    return NextResponse.json({ error: "no data" }, { status: 502 });
  }

  const last  = parseFloat(ticker.last);
  const open  = parseFloat(ticker.open24h);
  const changePct = open > 0 ? (((last - open) / open) * 100).toFixed(2) : "0.00";

  return NextResponse.json({
    asks: (book.asks as string[][]).slice(0, 20).map(([price, amount]) => ({ price, amount })),
    bids: (book.bids as string[][]).slice(0, 20).map(([price, amount]) => ({ price, amount })),
    price:  last.toFixed(2),
    change: changePct,
  });
}
