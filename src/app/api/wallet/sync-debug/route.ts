import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { data: user } = await supabase
    .from("users")
    .select("wallet_address, email")
    .eq("id", session.id)
    .single();

  const addr = user?.wallet_address?.toLowerCase();
  if (!addr) return NextResponse.json({ error: "keine wallet_address in DB", user });

  // Check BSC directly
  const bscUrl = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=0x55d398326f99059fF775485246999027B3197955&address=${addr}&sort=desc&page=1&offset=20`;
  const bscRes = await fetch(bscUrl, { cache: "no-store" });
  const bscData = await bscRes.json();

  const incoming = Array.isArray(bscData.result)
    ? bscData.result.filter((t: { to: string; confirmations: string }) => t.to.toLowerCase() === addr)
    : [];

  const { data: wallet } = await supabase
    .from("wallets")
    .select("id, balance")
    .eq("user_id", session.id)
    .eq("currency", "USDT")
    .maybeSingle();

  return NextResponse.json({
    wallet_address: addr,
    usdt_wallet: wallet,
    bsc_status: bscData.status,
    bsc_message: bscData.message,
    total_txns: Array.isArray(bscData.result) ? bscData.result.length : 0,
    incoming_to_addr: incoming.map((t: { hash: string; value: string; tokenDecimal: string; confirmations: string; from: string }) => ({
      hash: t.hash,
      amount: parseInt(t.value) / Math.pow(10, parseInt(t.tokenDecimal) || 6),
      confirmations: t.confirmations,
      from: t.from,
    })),
  });
}
