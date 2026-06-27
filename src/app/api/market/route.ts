import { NextResponse } from "next/server";

const COIN_IDS: Record<string, string> = {
  BTCUSDT: "bitcoin",
  ETHUSDT: "ethereum",
  BNBUSDT: "binancecoin",
  SOLUSDT: "solana",
  XRPUSDT: "ripple",
  DOGEUSDT: "dogecoin",
  ADAUSDT: "cardano",
  AVAXUSDT: "avalanche-2",
  DOTUSDT: "polkadot",
  MATICUSDT: "matic-network",
  LINKUSDT: "chainlink",
  LTCUSDT: "litecoin",
  UNIUSDT: "uniswap",
  ATOMUSDT: "cosmos",
};

function generateCandles(currentPrice: number, count: number) {
  const now = Math.floor(Date.now() / 1000);
  const candles = [];
  let price = currentPrice * (0.92 + Math.random() * 0.08);
  for (let i = count; i >= 0; i--) {
    const volatility = currentPrice * 0.008;
    const open = price;
    const close = open + (Math.random() - 0.48) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    price = close;
    candles.push({
      time: now - i * 3600,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
    });
  }
  return candles;
}

function generateOrderbook(price: number) {
  const asks = [];
  const bids = [];
  const spread = price * 0.0001;
  for (let i = 0; i < 15; i++) {
    const askPrice = price + spread * (i + 1) + Math.random() * spread;
    const bidPrice = price - spread * (i + 1) - Math.random() * spread;
    const askAmt = +(Math.random() * 2 + 0.01).toFixed(5);
    const bidAmt = +(Math.random() * 2 + 0.01).toFixed(5);
    asks.push({ price: askPrice.toFixed(2), amount: askAmt.toFixed(5) });
    bids.push({ price: bidPrice.toFixed(2), amount: bidAmt.toFixed(5) });
  }
  return { asks, bids };
}

function generateTrades(price: number) {
  const trades = [];
  for (let i = 0; i < 30; i++) {
    const side = Math.random() > 0.5 ? "buy" : "sell";
    const tradePrice = price + (Math.random() - 0.5) * price * 0.002;
    const amount = +(Math.random() * 1.5 + 0.001).toFixed(5);
    trades.push({
      price: tradePrice.toFixed(2),
      amount: amount.toFixed(5),
      side,
      time: Date.now() - i * (Math.random() * 5000 + 1000),
    });
  }
  return trades;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "BTCUSDT";
  const coinId = COIN_IDS[symbol] || "bitcoin";

  let currentPrice = 60000;
  let change24h = 0;

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_high_24h=true&include_low_24h=true`,
      { next: { revalidate: 30 } }
    );
    if (res.ok) {
      const data = await res.json();
      const coin = data[coinId];
      if (coin) {
        currentPrice = coin.usd;
        change24h = coin.usd_24h_change || 0;
      }
    }
  } catch {
    // fallback to default price
  }

  const high24 = currentPrice * (1 + Math.abs(change24h) / 100 * 0.6);
  const low24 = currentPrice * (1 - Math.abs(change24h) / 100 * 0.6);

  const candles = generateCandles(currentPrice, 200);
  const orderbook = generateOrderbook(currentPrice);
  const trades = generateTrades(currentPrice);

  return NextResponse.json({
    ticker: {
      price: currentPrice.toString(),
      change: change24h.toFixed(2),
      high: high24.toFixed(2),
      low: low24.toFixed(2),
      volume: (Math.random() * 50000 + 10000).toFixed(0),
    },
    candles,
    trades,
    orderbook,
  });
}
