import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { solana_address } = await req.json();

  // Basic Solana address validation (Base58, 32-44 chars)
  if (solana_address !== null && solana_address !== "") {
    const base58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!base58.test(solana_address)) {
      return NextResponse.json({ error: "Ungültige Solana-Adresse." }, { status: 400 });
    }
  }

  const { error } = await supabase
    .from("users")
    .update({ solana_address: solana_address || null })
    .eq("id", session.id);

  if (error) return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
