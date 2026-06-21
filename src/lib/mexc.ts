import crypto from "crypto";

const MEXC_BASE = "https://api.mexc.com";

export function createSignature(
  queryString: string,
  secretKey: string
): string {
  return crypto
    .createHmac("sha256", secretKey)
    .update(queryString)
    .digest("hex");
}

export async function mexcRequest(
  path: string,
  apiKey: string,
  secretKey: string,
  params: Record<string, string> = {}
) {
  const timestamp = Date.now().toString();
  const allParams = { ...params, timestamp };
  const queryString = new URLSearchParams(allParams).toString();
  const signature = createSignature(queryString, secretKey);

  const url = `${MEXC_BASE}${path}?${queryString}&signature=${signature}`;

  const res = await fetch(url, {
    headers: {
      "X-MEXC-APIKEY": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`MEXC API Error: ${res.status} – ${error}`);
  }

  return res.json();
}
