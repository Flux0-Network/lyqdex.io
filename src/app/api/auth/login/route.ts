import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email und Passwort sind erforderlich." },
      { status: 400 }
    );
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, email, name, password")
    .eq("email", email)
    .single();

  if (!user) {
    return NextResponse.json(
      { error: "Ungültige Anmeldedaten." },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json(
      { error: "Ungültige Anmeldedaten." },
      { status: 401 }
    );
  }

  const token = signToken({ id: user.id, email: user.email });

  const res = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
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
