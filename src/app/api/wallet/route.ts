import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const SUPPORTED_CURRENCIES = ["USDT"];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { data: wallets } = await supabase
    .from("wallets")
    .select("id, currency, balance, created_at")
    .eq("user_id", session.id)
    .eq("currency", "USDT");

  return NextResponse.json({
    wallets: wallets || [],
    supported: SUPPORTED_CURRENCIES,
  });
}
