import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const status = statusParam === "closed" ? ["closed", "liquidated"] : statusParam === "all" ? ["open", "closed", "liquidated"] : ["open"];

  const { data } = await supabase
    .from("positions")
    .select("*")
    .eq("user_id", session.id)
    .in("status", status)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ positions: data ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { symbol, side, entryPrice, leverage, margin } = await req.json();

  if (!symbol || !side || !entryPrice || !leverage || !margin) {
    return NextResponse.json({ error: "Pflichtfelder fehlen." }, { status: 400 });
  }
  if (side !== "long" && side !== "short") {
    return NextResponse.json({ error: "Side muss 'long' oder 'short' sein." }, { status: 400 });
  }
  const lev = parseInt(leverage);
  const mar = parseFloat(margin);
  const ep  = parseFloat(entryPrice);
  if (!isFinite(lev) || lev < 1 || lev > 100) {
    return NextResponse.json({ error: "Hebel muss zwischen 1x und 100x liegen." }, { status: 400 });
  }
  if (!isFinite(mar) || mar <= 0) {
    return NextResponse.json({ error: "Margin muss größer als 0 sein." }, { status: 400 });
  }

  // Check USDT balance
  const { data: wallet } = await supabase
    .from("wallets")
    .select("id, balance")
    .eq("user_id", session.id)
    .eq("currency", "USDT")
    .maybeSingle();

  if (!wallet) return NextResponse.json({ error: "Kein USDT-Wallet gefunden." }, { status: 400 });
  const bal = parseFloat(wallet.balance || "0");
  if (bal < mar) {
    return NextResponse.json({ error: `Unzureichendes Guthaben. Verfügbar: ${bal.toFixed(2)} USDT.` }, { status: 400 });
  }

  // Lock margin (deduct from balance)
  await supabase.from("wallets").update({ balance: bal - mar }).eq("id", wallet.id);

  const size = (mar * lev) / ep;

  const { data: position, error } = await supabase
    .from("positions")
    .insert({
      user_id: session.id,
      symbol,
      side,
      size,
      entry_price: ep,
      leverage: lev,
      margin: mar,
      status: "open",
    })
    .select()
    .single();

  if (error || !position) {
    // Rollback balance
    await supabase.from("wallets").update({ balance: bal }).eq("id", wallet.id);
    return NextResponse.json({ error: "Position konnte nicht geöffnet werden." }, { status: 500 });
  }

  return NextResponse.json({ position });
}
