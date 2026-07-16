import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { currency, amount, type } = await req.json();
  const cur = String(currency || "").toUpperCase();
  const amt = Number(amount);

  if (type !== "deposit" && type !== "withdraw" && type !== "set") {
    return NextResponse.json({ error: "Ungültiger Transaktionstyp." }, { status: 400 });
  }
  if (!cur) {
    return NextResponse.json({ error: "Währung fehlt." }, { status: 400 });
  }
  if (!isFinite(amt) || amt <= 0) {
    return NextResponse.json({ error: "Betrag muss größer als 0 sein." }, { status: 400 });
  }

  const { data: rows } = await supabase
    .from("wallets")
    .select("id, currency, balance")
    .eq("user_id", session.id)
    .eq("currency", cur);

  const wallet = rows?.[0];
  if (!wallet) {
    return NextResponse.json({ error: "Wallet für diese Währung nicht gefunden." }, { status: 404 });
  }

  const current = parseFloat(wallet.balance ?? "0");
  const next = type === "set" ? amt : type === "deposit" ? current + amt : current - amt;

  if (next < 0 && type !== "set") {
    return NextResponse.json({ error: "Unzureichendes Guthaben." }, { status: 400 });
  }

  const { data: updated, error } = await supabase
    .from("wallets")
    .update({ balance: next })
    .eq("id", wallet.id)
    .eq("user_id", session.id)
    .select("id, currency, balance, created_at")
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: "Transaktion fehlgeschlagen." }, { status: 500 });
  }

  return NextResponse.json({ wallet: updated });
}
