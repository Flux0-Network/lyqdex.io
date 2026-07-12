import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Registrierung derzeit nicht verfügbar." }, { status: 403 });
}
