import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email und Passwort sind erforderlich." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Passwort muss mindestens 8 Zeichen lang sein." },
      { status: 400 }
    );
  }

  const { data: existingUsers } = await supabase
    .from("users")
    .select("id")
    .eq("email", email);

  if (existingUsers && existingUsers.length > 0) {
    return NextResponse.json(
      { error: "Diese Email ist bereits registriert." },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 12);

  const { data: user, error } = await supabase
    .from("users")
    .insert({ email, password: hashed, name: name || null })
    .select("id, email, name")
    .single();

  if (error || !user) {
    console.error("Supabase insert error:", error);
    return NextResponse.json(
      { error: "Registrierung fehlgeschlagen: " + (error?.message || "Unbekannt") },
      { status: 500 }
    );
  }

  const token = signToken({ id: user.id, email: user.email });

  const res = NextResponse.json({ user });
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}
