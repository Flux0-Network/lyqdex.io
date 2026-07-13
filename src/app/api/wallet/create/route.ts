import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const SUPPORTED_CURRENCIES = [
  "USDT", "BTC", "ETH", "BNB", "SOL", "XRP", "DOGE", "ADA",
  "AVAX", "DOT", "MATIC", "LINK", "LTC", "UNI", "ATOM",
];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { currency } = await req.json();

  if (!currency || !SUPPORTED_CURRENCIES.includes(currency.toUpperCase())) {
    return NextResponse.json(
      { error: "Ungültige Währung.", supported: SUPPORTED_CURRENCIES },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", session.id)
    .eq("currency", currency.toUpperCase());

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "Wallet für diese Währung existiert bereits." },
      { status: 409 }
    );
  }

  const { data: wallet, error } = await supabase
    .from("wallets")
    .insert({ user_id: session.id, currency: currency.toUpperCase(), balance: 0 })
    .select("id, currency, balance, created_at")
    .single();

  if (error || !wallet) {
    return NextResponse.json(
      { error: "Wallet konnte nicht erstellt werden." },
      { status: 500 }
    );
  }

  return NextResponse.json({ wallet });
}
