import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// Close a position at the given current price
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { id } = await params;
  const { closePrice } = await req.json();
  const cp = parseFloat(closePrice);
  if (!isFinite(cp) || cp <= 0) {
    return NextResponse.json({ error: "Ungültiger Schlusskurs." }, { status: 400 });
  }

  const { data: pos } = await supabase
    .from("positions")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.id)
    .eq("status", "open")
    .single();

  if (!pos) return NextResponse.json({ error: "Position nicht gefunden." }, { status: 404 });

  // P&L = size * (closePrice - entryPrice) * (side === long ? 1 : -1)
  const pnl =
    pos.size * (cp - pos.entry_price) * (pos.side === "long" ? 1 : -1);

  const returnedUsdt = pos.margin + pnl;
  const liquidated = returnedUsdt <= 0;

  const { data: updated } = await supabase
    .from("positions")
    .update({
      status: liquidated ? "liquidated" : "closed",
      close_price: cp,
      closed_at: new Date().toISOString(),
      pnl,
    })
    .eq("id", id)
    .select()
    .single();

  if (!liquidated) {
    // Return margin + PnL to USDT wallet
    const { data: wallet } = await supabase
      .from("wallets")
      .select("id, balance")
      .eq("user_id", session.id)
      .eq("currency", "USDT")
      .maybeSingle();

    if (wallet) {
      const newBal = parseFloat(wallet.balance || "0") + returnedUsdt;
      await supabase.from("wallets").update({ balance: newBal }).eq("id", wallet.id);
    }
  }

  return NextResponse.json({ position: updated, pnl, liquidated });
}
