"use client";

import { useEffect, useState } from "react";

type AccountMode = "demo" | "real";

interface Wallet {
  id: string;
  currency: string;
  balance: string;
  demo_balance?: string;
}

interface Props {
  mode: AccountMode;
  onModeChange: (m: AccountMode) => void;
}

export function WalletPanel({ mode, onModeChange }: Props) {
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setWallets(data.wallets))
      .catch(() => {});
  }, []);

  function balOf(w: Wallet) {
    const raw = mode === "real" ? w.balance : (w.demo_balance ?? "0");
    return parseFloat(raw || "0");
  }

  return (
    <div className="h-full flex flex-col text-[11px]">
      {/* Header + toggle */}
      <div className="px-2 py-1.5 border-b border-white/5 flex items-center justify-between">
        <span className="font-semibold text-[11px] text-white">Wallet</span>
        <div className="flex gap-0.5 p-0.5 rounded bg-white/[0.04]">
          {(["demo", "real"] as AccountMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`text-[10px] px-2 py-0.5 rounded font-medium transition ${
                mode === m
                  ? m === "demo"
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-emerald-500/20 text-emerald-300"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {m === "demo" ? "Demo" : "Real"}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-2 gap-2 px-3 py-1 text-gray-500 border-b border-white/5">
        <div>Asset</div>
        <div className="text-right">Balance</div>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {wallets.length === 0 ? (
          <div className="px-3 py-4 text-center text-gray-600">
            Nicht angemeldet
          </div>
        ) : (
          wallets.map((w) => (
            <div key={w.id} className="grid grid-cols-2 gap-2 px-3 py-1.5 hover:bg-white/[0.02]">
              <div className="font-medium text-white">{w.currency}</div>
              <div className="text-right text-gray-400 tabular-nums">
                {balOf(w).toFixed(w.currency === "USDT" ? 2 : 6)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
