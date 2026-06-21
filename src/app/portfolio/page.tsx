"use client";

import { useState } from "react";
import { IconLink, IconLoader2, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";

interface Balance {
  asset: string;
  free: string;
  locked: string;
  total: string;
}

export default function PortfolioPage() {
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [error, setError] = useState("");

  async function handleConnect() {
    setLoading(true);
    setError("");

    try {
      const connectRes = await fetch("/api/mexc/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, secretKey }),
      });

      const connectData = await connectRes.json();
      if (!connectRes.ok) {
        setError(connectData.error);
        setLoading(false);
        return;
      }

      const balanceRes = await fetch("/api/mexc/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, secretKey }),
      });

      const balanceData = await balanceRes.json();
      if (!balanceRes.ok) {
        setError(balanceData.error);
        setLoading(false);
        return;
      }

      setBalances(balanceData.balances || []);
      setConnected(true);
    } catch {
      setError("Verbindung fehlgeschlagen. Bitte überprüfe deine Keys.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Image src="/icon_logo.png" alt="LyqDex" width={24} height={24} />
            LyqDex
          </Link>
          <span className="text-sm text-gray-400">Portfolio</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold mb-2">Börse verknüpfen</h1>
        <p className="text-gray-400 text-sm mb-10">
          Verbinde dein MEXC-Konto um deine Assets hier zu sehen.
        </p>

        {!connected ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <IconLink className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h2 className="font-medium">MEXC verbinden</h2>
                <p className="text-xs text-gray-500">
                  Erstelle einen API-Key auf mexc.com mit Read-Only Berechtigung.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">API Key</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="mx0v..."
                  className="w-full bg-gray-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Secret Key</label>
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 transition"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-2.5">
                  <IconAlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleConnect}
                disabled={loading || !apiKey || !secretKey}
                className="w-full bg-white text-black font-medium py-2.5 rounded-lg text-sm hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verbinden"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-6 text-sm text-emerald-400">
              <IconCheck className="h-4 w-4" />
              MEXC verbunden
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-white/5 text-xs text-gray-500 font-medium">
                <div>Asset</div>
                <div className="text-right">Verfügbar</div>
                <div className="text-right">Gesperrt</div>
                <div className="text-right">Gesamt</div>
              </div>
              {balances.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-gray-500">
                  Keine Assets gefunden.
                </div>
              ) : (
                balances.map((b) => (
                  <div
                    key={b.asset}
                    className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-white/5 last:border-0 text-sm hover:bg-white/[0.02] transition"
                  >
                    <div className="font-medium">{b.asset}</div>
                    <div className="text-right text-gray-300">{b.free}</div>
                    <div className="text-right text-gray-500">{b.locked}</div>
                    <div className="text-right text-white">{b.total}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
