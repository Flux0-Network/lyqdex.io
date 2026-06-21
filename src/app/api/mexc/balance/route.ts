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
    const data = await mexcRequest("/api/v3/account", apiKey, secretKey);

    const balances = data.balances
      ?.filter(
        (b: { free: string; locked: string }) =>
          parseFloat(b.free) > 0 || parseFloat(b.locked) > 0
      )
      .map((b: { asset: string; free: string; locked: string }) => ({
        asset: b.asset,
        free: b.free,
        locked: b.locked,
        total: (parseFloat(b.free) + parseFloat(b.locked)).toString(),
      }));

    return NextResponse.json({ balances });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
