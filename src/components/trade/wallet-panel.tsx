"use client";

import { useEffect, useState } from "react";

interface Wallet {
  id: string;
  currency: string;
  balance: string;
}

export function WalletPanel({ mode: _mode, onModeChange: _onModeChange }: { mode?: string; onModeChange?: (m: string) => void }) {
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    fetch("/api/wallet")
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setWallets(d.wallets))
      .catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col text-[11px]">
      <div className="px-2 py-1.5 border-b border-white/5 flex items-center justify-between">
        <span className="font-semibold text-[11px] text-white">Wallet</span>
      </div>
      <div className="grid grid-cols-2 gap-2 px-3 py-1 text-gray-500 border-b border-white/5">
        <div>Asset</div>
        <div className="text-right">Balance</div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {wallets.length === 0 ? (
          <div className="px-3 py-4 text-center text-gray-600">Nicht angemeldet</div>
        ) : (
          wallets.map(w => (
            <div key={w.id} className="grid grid-cols-2 gap-2 px-3 py-1.5 hover:bg-white/[0.02]">
              <div className="font-medium text-white">{w.currency}</div>
              <div className="text-right text-gray-400 tabular-nums">
                {parseFloat(w.balance || "0").toFixed(w.currency === "USDT" ? 2 : 6)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
