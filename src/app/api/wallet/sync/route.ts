import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const USDT_ERC20    = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const USDT_BSC      = "0x55d398326f99059fF775485246999027B3197955";
const USDT_SOL_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

async function fetchSolanaUsdtTxns(address: string) {
  // Use Helius or public Solscan API to find USDT (SPL) transfers to this address
  const rpc = process.env.HELIUS_RPC_URL ?? "https://api.mainnet-beta.solana.com";
  const body = {
    jsonrpc: "2.0", id: 1,
    method: "getSignaturesForAddress",
    params: [address, { limit: 20 }],
  };
  const sigRes = await fetch(rpc, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const sigData = await sigRes.json();
  const sigs: Array<{ signature: string; err: unknown }> = sigData?.result ?? [];
  const results: Array<{ hash: string; amount: number }> = [];

  for (const sig of sigs.filter(s => !s.err)) {
    try {
      const txRes = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getTransaction", params: [sig.signature, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }] }),
      });
      const txData = await txRes.json();
      const instructions = txData?.result?.transaction?.message?.instructions ?? [];
      for (const ix of instructions) {
        if (ix.program !== "spl-token") continue;
        const info = ix.parsed?.info;
        if (!info || ix.parsed?.type !== "transferChecked") continue;
        if (info.mint !== USDT_SOL_MINT) continue;
        if (info.destination !== address) continue;
        const amount = parseFloat(info.tokenAmount?.uiAmountString ?? "0");
        if (amount > 0) results.push({ hash: sig.signature, amount });
      }
    } catch { /* skip */ }
  }
  return results;
}

async function fetchEtherscanTxns(address: string, contractAddress: string, network: "eth" | "bsc") {
  const apiKey = process.env.ETHERSCAN_API_KEY ?? "";
  const baseUrl = network === "bsc"
    ? "https://api.bscscan.com/api"
    : "https://api.etherscan.io/api";
  const url = `${baseUrl}?module=account&action=tokentx&contractaddress=${contractAddress}&address=${address}&sort=desc&offset=20&page=1${apiKey ? `&apikey=${apiKey}` : ""}`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const data = await res.json();
  if (data.status !== "1" || !Array.isArray(data.result)) return [];
  return data.result as Array<{
    hash: string;
    to: string;
    value: string;
    tokenDecimal: string;
    confirmations: string;
  }>;
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { data: user } = await supabase
    .from("users")
    .select("wallet_address, solana_address")
    .eq("id", session.id)
    .single();

  if (!user?.wallet_address) {
    return NextResponse.json({ error: "Keine Wallet-Adresse gefunden." }, { status: 400 });
  }

  const addr = user.wallet_address.toLowerCase();
  let totalCredited = 0;
  const newTxns: string[] = [];

  const networks: Array<{ network: "eth" | "bsc"; contract: string; label: string }> = [
    { network: "eth", contract: USDT_ERC20, label: "ERC-20" },
    { network: "bsc", contract: USDT_BSC,   label: "BEP-20" },
  ];

  for (const { network, contract } of networks) {
    let txns: Awaited<ReturnType<typeof fetchEtherscanTxns>>;
    try {
      txns = await fetchEtherscanTxns(addr, contract, network);
    } catch {
      continue;
    }

    // Filter: only incoming, at least 6 confirmations
    const incoming = txns.filter(
      t => t.to.toLowerCase() === addr && parseInt(t.confirmations) >= 6
    );

    for (const tx of incoming) {
      const decimals = parseInt(tx.tokenDecimal) || 6;
      const amount = parseInt(tx.value) / Math.pow(10, decimals);
      if (amount <= 0) continue;

      // Check if already processed
      const { data: existing } = await supabase
        .from("deposit_txns")
        .select("id")
        .eq("tx_hash", tx.hash)
        .eq("network", network)
        .maybeSingle();

      if (existing) continue;

      // Credit USDT balance
      const { data: wallet } = await supabase
        .from("wallets")
        .select("id, balance")
        .eq("user_id", session.id)
        .eq("currency", "USDT")
        .maybeSingle();

      if (!wallet) continue;

      const newBal = parseFloat(wallet.balance || "0") + amount;
      await supabase
        .from("wallets")
        .update({ balance: newBal })
        .eq("id", wallet.id);

      // Record tx so we don't process it again
      await supabase.from("deposit_txns").insert({
        user_id: session.id,
        tx_hash: tx.hash,
        currency: "USDT",
        amount,
        network,
      });

      totalCredited += amount;
      newTxns.push(tx.hash);
    }
  }

  // Solana USDT (SPL)
  const solAddr = (user as { solana_address?: string }).solana_address;
  if (solAddr) {
    try {
      const solTxns = await fetchSolanaUsdtTxns(solAddr);
      for (const { hash, amount } of solTxns) {
        const { data: existing } = await supabase
          .from("deposit_txns")
          .select("id")
          .eq("tx_hash", hash)
          .eq("network", "sol")
          .maybeSingle();
        if (existing) continue;

        const { data: wallet } = await supabase
          .from("wallets")
          .select("id, balance")
          .eq("user_id", session.id)
          .eq("currency", "USDT")
          .maybeSingle();
        if (!wallet) continue;

        await supabase.from("wallets").update({ balance: parseFloat(wallet.balance || "0") + amount }).eq("id", wallet.id);
        await supabase.from("deposit_txns").insert({ user_id: session.id, tx_hash: hash, currency: "USDT", amount, network: "sol" });
        totalCredited += amount;
        newTxns.push(hash);
      }
    } catch { /* skip */ }
  }

  return NextResponse.json({ credited: totalCredited, txns: newTxns });
}
