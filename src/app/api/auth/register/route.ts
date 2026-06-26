import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { signToken } from "@/lib/auth";
import { generateWalletAddress, generateSeedPhrase, hashSeedPhrase } from "@/lib/wallet";

const DEFAULT_CURRENCIES = ["USDT", "BTC", "ETH"];

export async function POST() {
  const address = generateWalletAddress();
  const seedPhrase = generateSeedPhrase();
  const seedHash = hashSeedPhrase(seedPhrase);

  const { data: user, error } = await supabase
    .from("users")
    .insert({ wallet_address: address, seed_hash: seedHash })
    .select("id, wallet_address")
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: "Wallet konnte nicht erstellt werden." },
      { status: 500 }
    );
  }

  const wallets = DEFAULT_CURRENCIES.map((currency) => ({
    user_id: user.id,
    currency,
    balance: 0,
  }));
  await supabase.from("wallets").insert(wallets);

  const token = signToken({ id: user.id, address: user.wallet_address });

  const res = NextResponse.json({
    user: { id: user.id, address: user.wallet_address },
    seedPhrase,
  });
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}
