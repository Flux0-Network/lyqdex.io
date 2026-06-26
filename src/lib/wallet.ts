import crypto from "crypto";
import * as bip39 from "bip39";

export function generateWalletAddress(): string {
  const bytes = crypto.randomBytes(20);
  return "0x" + bytes.toString("hex");
}

export function generateSeedPhrase(): string {
  return bip39.generateMnemonic();
}

export function hashSeedPhrase(seed: string): string {
  return crypto.createHash("sha256").update(seed).digest("hex");
}
