import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { PLATFORM_ADDRESS } from "@/lib/platform-wallet";

const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955";
const BSC_API = "https://api.bscscan.com/api";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const addr = PLATFORM_ADDRESS.toLowerCase();
  const apiKey = process.env.BSCSCAN_API_KEY ?? "";
  let totalCredited = 0;
  const newTxns: string[] = [];

  try {
    const url = `${BSC_API}?module=account&action=tokentx&contractaddress=${USDT_BSC}&address=${addr}&sort=desc&page=1&offset=50${apiKey ? `&apikey=${apiKey}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    if (data.status !== "1" || !Array.isArray(data.result)) {
      return NextResponse.json({ credited: 0, txns: [], debug: data.message });
    }

    // Each incoming tx — identify which user sent it by matching from-address to users.wallet_address
    const incoming = data.result.filter(
      (t: { to: string; confirmations: string }) =>
        t.to.toLowerCase() === addr && parseInt(t.confirmations) >= 6
    );

    for (const tx of incoming) {
      const amount = parseInt(tx.value) / 1e18;
      if (amount <= 0) continue;

      const { data: existing } = await supabase
        .from("deposit_txns")
        .select("id")
        .eq("tx_hash", tx.hash)
        .eq("network", "bsc")
        .maybeSingle();
      if (existing) continue;

      // Find user by from-address
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", tx.from)
        .maybeSingle();

      const userId = user?.id ?? session.id;

      const { data: wallet } = await supabase
        .from("wallets")
        .select("id, balance")
        .eq("user_id", userId)
        .eq("currency", "USDT")
        .maybeSingle();
      if (!wallet) continue;

      await supabase.from("wallets").update({ balance: parseFloat(wallet.balance || "0") + amount }).eq("id", wallet.id);
      await supabase.from("deposit_txns").insert({ user_id: userId, tx_hash: tx.hash, currency: "USDT", amount, network: "bsc" });

      totalCredited += amount;
      newTxns.push(tx.hash);
    }
  } catch (e) {
    return NextResponse.json({ credited: 0, txns: [], debug: String(e) });
  }

  return NextResponse.json({ credited: totalCredited, txns: newTxns });
}
