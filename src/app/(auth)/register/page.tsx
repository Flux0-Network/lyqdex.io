"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IconLoader2, IconAlertCircle, IconCopy, IconCheck, IconAlertTriangle } from "@tabler/icons-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [address, setAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleCreate() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setSeedPhrase(data.seedPhrase);
      setAddress(data.user.address);
    } catch {
      setError("Ein Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(seedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleContinue() {
    router.push("/wallet");
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 mb-10">
          <Image src="/icon_logo.png" alt="LyqDex" width={32} height={32} />
          <span className="text-xl font-semibold text-white tracking-tight">LyqDex</span>
        </Link>

        {!seedPhrase ? (
          <>
            <h1 className="text-xl font-semibold text-white text-center mb-1">Wallet erstellen</h1>
            <p className="text-sm text-gray-500 text-center mb-8">
              Erstelle ein neues Wallet mit einem Klick. Kein Email nötig.
              <br />
              <Link href="/login" className="text-violet-400 hover:text-violet-300">
                Bereits ein Wallet? Anmelden
              </Link>
            </p>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-2.5 mb-4">
                <IconAlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full bg-white text-black font-medium py-3 rounded-lg text-sm hover:bg-gray-200 transition disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? <IconLoader2 className="h-4 w-4 animate-spin" /> : "Neues Wallet erstellen"}
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-white text-center mb-1">Wallet erstellt!</h1>

            <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="text-xs text-gray-500 mb-1">Deine Wallet-Adresse</div>
              <div className="text-sm text-white font-mono break-all">{address}</div>
            </div>

            <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-2">
                <IconAlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Seed Phrase sichern!</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Dies ist dein einziger Zugang zu deinem Wallet. Speichere diese Wörter sicher ab. Wir können sie nicht wiederherstellen.
              </p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {seedPhrase.split(" ").map((word, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-gray-900 rounded-lg px-2 py-1.5">
                    <span className="text-[10px] text-gray-600">{i + 1}</span>
                    <span className="text-xs text-white">{word}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-white py-2 border border-white/10 rounded-lg transition"
              >
                {copied ? (
                  <>
                    <IconCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Kopiert!
                  </>
                ) : (
                  <>
                    <IconCopy className="h-3.5 w-3.5" />
                    Seed Phrase kopieren
                  </>
                )}
              </button>
            </div>

            <label className="flex items-start gap-2 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 accent-violet-500"
              />
              <span className="text-xs text-gray-400">
                Ich habe meine Seed Phrase sicher gespeichert und verstehe, dass LyqDex sie nicht wiederherstellen kann.
              </span>
            </label>

            <button
              onClick={handleContinue}
              disabled={!confirmed}
              className="w-full mt-4 bg-white text-black font-medium py-2.5 rounded-lg text-sm hover:bg-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Zum Wallet
            </button>
          </>
        )}
      </div>
    </div>
  );
}
