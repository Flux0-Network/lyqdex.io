import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { signToken } from "@/lib/auth";
import { hashSeedPhrase } from "@/lib/wallet";

const ADMIN_EMAIL = "bezzo19@gmx.de";

export async function POST(req: NextRequest) {
  const { identifier, password, seedPhrase } = await req.json();

  let user: { id: string; wallet_address: string; password_hash: string | null; email: string | null } | undefined;

  // ── Login via 12-word recovery phrase ──────────────────────────
  if (seedPhrase) {
    const words = String(seedPhrase).trim().toLowerCase().split(/\s+/);
    if (words.length !== 12) {
      return NextResponse.json(
        { error: "Die Wiederherstellungsphrase muss aus 12 Wörtern bestehen." },
        { status: 400 }
      );
    }
    const seedHash = hashSeedPhrase(words.join(" "));
    const { data: users } = await supabase
      .from("users")
      .select("id, wallet_address, password_hash, email")
      .eq("seed_hash", seedHash);
    user = users?.[0];

    if (!user) {
      return NextResponse.json(
        { error: "Ungültige Wiederherstellungsphrase." },
        { status: 401 }
      );
    }
  } else {
    // ── Login via email / phone + password ───────────────────────
    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Alle Felder sind erforderlich." },
        { status: 400 }
      );
    }

    // Only admin may log in
    const isEmail = identifier.includes("@");
    if (isEmail && identifier.trim().toLowerCase() !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Zugang derzeit nicht verfügbar." },
        { status: 403 }
      );
    }

    const column = isEmail ? "email" : "phone";

    const { data: users } = await supabase
      .from("users")
      .select("id, wallet_address, password_hash, email")
      .eq(column, identifier);

    user = users?.[0];

    if (!user || !user.password_hash) {
      return NextResponse.json(
        { error: "Ungültige Anmeldedaten." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Ungültige Anmeldedaten." },
        { status: 401 }
      );
    }
  }

  const token = signToken({ id: user.id, address: user.wallet_address, email: user.email ?? undefined });

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
