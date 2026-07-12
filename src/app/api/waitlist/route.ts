import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Ungültige E-Mail-Adresse." }, { status: 400 });
  }

  const { error } = await supabase
    .from("waitlist")
    .insert({ email: email.toLowerCase().trim() });

  if (error) {
    if (error.code === "23505") {
      // Already on list — treat as success to avoid enumeration
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Fehler beim Eintragen." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
