import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { signToken } from "@/lib/auth";
import { hashSeedPhrase } from "@/lib/wallet";

export async function POST(req: NextRequest) {
  const { seedPhrase } = await req.json();

  if (!seedPhrase) {
    return NextResponse.json(
      { error: "Seed Phrase ist erforderlich." },
      { status: 400 }
    );
  }

  const seedHash = hashSeedPhrase(seedPhrase.trim().toLowerCase());

  const { data: users } = await supabase
    .from("users")
    .select("id, wallet_address")
    .eq("seed_hash", seedHash);

  const user = users?.[0];

  if (!user) {
    return NextResponse.json(
      { error: "Ungültige Seed Phrase." },
      { status: 401 }
    );
  }

  const token = signToken({ id: user.id, address: user.wallet_address });

  const res = NextResponse.json({
    user: { id: user.id, address: user.wallet_address },
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
