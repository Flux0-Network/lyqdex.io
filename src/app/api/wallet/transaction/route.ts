import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// Deposit / withdraw funds for a wallet (paper trading — updates DB balance).
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { currency, amount, type, mode } = await req.json();
  const cur = String(currency || "").toUpperCase();
  const amt = Number(amount);
  const col = mode === "real" ? "balance" : "demo_balance"; // default demo

  if (type !== "deposit" && type !== "withdraw") {
    return NextResponse.json({ error: "Ungültiger Transaktionstyp." }, { status: 400 });
  }
  if (!cur) {
    return NextResponse.json({ error: "Währung fehlt." }, { status: 400 });
  }
  if (!isFinite(amt) || amt <= 0) {
    return NextResponse.json({ error: "Betrag muss größer als 0 sein." }, { status: 400 });
  }

  // Load the wallet
  const { data: rows } = await supabase
    .from("wallets")
    .select("id, currency, balance, demo_balance")
    .eq("user_id", session.id)
    .eq("currency", cur);

  const wallet = rows?.[0];
  if (!wallet) {
    return NextResponse.json({ error: "Wallet für diese Währung nicht gefunden." }, { status: 404 });
  }

  const current = parseFloat((wallet as Record<string, string>)[col] ?? "0");
  const next = type === "deposit" ? current + amt : current - amt;

  if (next < 0) {
    return NextResponse.json({ error: "Unzureichendes Guthaben." }, { status: 400 });
  }

  const { data: updated, error } = await supabase
    .from("wallets")
    .update({ [col]: next })
    .eq("id", wallet.id)
    .eq("user_id", session.id)
    .select("id, currency, balance, demo_balance, created_at")
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: "Transaktion fehlgeschlagen." }, { status: 500 });
  }

  return NextResponse.json({ wallet: updated });
}
