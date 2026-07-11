import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { identifier, password } = await req.json();

  if (!identifier || !password) {
    return NextResponse.json(
      { error: "Alle Felder sind erforderlich." },
      { status: 400 }
    );
  }

  const isEmail = identifier.includes("@");
  const column = isEmail ? "email" : "phone";

  const { data: users } = await supabase
    .from("users")
    .select("id, wallet_address, password_hash")
    .eq(column, identifier);

  const user = users?.[0];

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
