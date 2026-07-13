import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const NETWORKS = [
  {
    id: "bsc",
    contract: "0x55d398326f99059fF775485246999027B3197955",
    api: "https://api.bscscan.com/api",
    envKey: "BSCSCAN_API_KEY",
  },
  {
    id: "eth",
    contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    api: "https://api.etherscan.io/api",
    envKey: "ETHERSCAN_API_KEY",
  },
];

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { data: user } = await supabase
    .from("users")
    .select("wallet_address")
    .eq("id", session.id)
    .single();

  if (!user?.wallet_address) return NextResponse.json({ credited: 0, txns: [] });

  const addr = user.wallet_address.toLowerCase();
  let totalCredited = 0;
  const newTxns: string[] = [];

  for (const net of NETWORKS) {
    try {
      const apiKey = process.env[net.envKey] ?? "";
      const url = `${net.api}?module=account&action=tokentx&contractaddress=${net.contract}&address=${addr}&sort=desc&page=1&offset=20${apiKey ? `&apikey=${apiKey}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (data.status !== "1" || !Array.isArray(data.result)) continue;

      const incoming = data.result.filter(
        (t: { to: string; confirmations: string }) =>
          t.to.toLowerCase() === addr && parseInt(t.confirmations) >= 6
      );

      for (const tx of incoming) {
        const amount = parseInt(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal) || 6);
        if (amount <= 0) continue;

        // Skip if already processed
        const { data: existing } = await supabase
          .from("deposit_txns")
          .select("id")
          .eq("tx_hash", tx.hash)
          .eq("network", net.id)
          .maybeSingle();
        if (existing) continue;

        // Credit USDT wallet
        const { data: wallet } = await supabase
          .from("wallets")
          .select("id, balance")
          .eq("user_id", session.id)
          .eq("currency", "USDT")
          .maybeSingle();
        if (!wallet) continue;

        await supabase.from("wallets").update({ balance: parseFloat(wallet.balance || "0") + amount }).eq("id", wallet.id);
        await supabase.from("deposit_txns").insert({ user_id: session.id, tx_hash: tx.hash, currency: "USDT", amount, network: net.id });

        totalCredited += amount;
        newTxns.push(tx.hash);
      }
    } catch { /* skip network error */ }
  }

  return NextResponse.json({ credited: totalCredited, txns: newTxns });
}
