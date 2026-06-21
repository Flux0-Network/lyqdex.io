import { NextRequest, NextResponse } from "next/server";
import { mexcRequest } from "@/lib/mexc";

export async function POST(req: NextRequest) {
  const { apiKey, secretKey } = await req.json();

  if (!apiKey || !secretKey) {
    return NextResponse.json(
      { error: "API-Key und Secret sind erforderlich." },
      { status: 400 }
    );
  }

  try {
    await mexcRequest("/api/v3/account", apiKey, secretKey);
    return NextResponse.json({ connected: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verbindung fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
