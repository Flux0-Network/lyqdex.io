"use client";

import { useEffect, useState } from "react";

interface Wallet {
  id: string;
  currency: string;
  balance: string;
}

export function WalletPanel() {
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setWallets(data.wallets))
      .catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col text-[11px]">
      <div className="px-3 py-2 border-b border-white/5 font-semibold text-xs text-white">
        Wallet
      </div>
      <div className="grid grid-cols-2 gap-2 px-3 py-1 text-gray-500 border-b border-white/5">
        <div>Asset</div>
        <div className="text-right">Balance</div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {wallets.length === 0 ? (
          <div className="px-3 py-6 text-center text-gray-600">
            Nicht angemeldet
          </div>
        ) : (
          wallets.map((w) => (
            <div key={w.id} className="grid grid-cols-2 gap-2 px-3 py-1.5 hover:bg-white/[0.02]">
              <div className="font-medium text-white">{w.currency}</div>
              <div className="text-right text-gray-400">{parseFloat(w.balance).toFixed(w.currency === "USDT" ? 2 : 6)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
