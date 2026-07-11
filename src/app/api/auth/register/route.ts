import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { signToken } from "@/lib/auth";
import { generateWalletAddress, generateSeedPhrase, hashSeedPhrase } from "@/lib/wallet";

const DEFAULT_CURRENCIES = ["USDT", "BTC", "ETH"];

export async function POST(req: NextRequest) {
  const { firstName, lastName, username, email, phone, password } = await req.json();

  if (!firstName || !lastName || !username || !password) {
    return NextResponse.json(
      { error: "Vorname, Nachname, Benutzername und Passwort sind erforderlich." },
      { status: 400 }
    );
  }
  if (!email && !phone) {
    return NextResponse.json(
      { error: "E-Mail oder Telefonnummer ist erforderlich." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Passwort muss mindestens 8 Zeichen haben." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const address = generateWalletAddress();
  const seedPhrase = generateSeedPhrase();
  const seedHash = hashSeedPhrase(seedPhrase);

  const { data: user, error } = await supabase
    .from("users")
    .insert({
      wallet_address: address,
      seed_hash: seedHash,
      first_name: firstName,
      last_name: lastName,
      username,
      email: email || null,
      phone: phone || null,
      password_hash: passwordHash,
    })
    .select("id, wallet_address")
    .single();

  if (error || !user) {
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "E-Mail, Telefonnummer oder Benutzername bereits vergeben." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Konto konnte nicht erstellt werden." },
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
