import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { sendUSDT } from "@/lib/platform-wallet";

const MIN_WITHDRAW = 1;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { amount, address } = await req.json();

  if (!amount || isNaN(amount) || amount < MIN_WITHDRAW)
    return NextResponse.json({ error: `Mindestbetrag: ${MIN_WITHDRAW} USDT` }, { status: 400 });

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address))
    return NextResponse.json({ error: "Ungültige BSC-Adresse" }, { status: 400 });

  const { data: wallet } = await supabase
    .from("wallets")
    .select("id, balance")
    .eq("user_id", session.id)
    .eq("currency", "USDT")
    .maybeSingle();

  if (!wallet) return NextResponse.json({ error: "Wallet nicht gefunden" }, { status: 404 });

  const balance = parseFloat(wallet.balance || "0");
  if (balance < amount)
    return NextResponse.json({ error: "Guthaben nicht ausreichend" }, { status: 400 });

  // Deduct first, then send
  await supabase.from("wallets").update({ balance: balance - amount }).eq("id", wallet.id);

  try {
    const txHash = await sendUSDT(address, amount);
    return NextResponse.json({ success: true, txHash });
  } catch (err) {
    // Refund on failure
    await supabase.from("wallets").update({ balance }).eq("id", wallet.id);
    return NextResponse.json({ error: "Transaktion fehlgeschlagen: " + (err as Error).message }, { status: 500 });
  }
}
