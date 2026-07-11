"use client";

import { useEffect, useState } from "react";
import { AppNavbar } from "@/components/shared/app-navbar";
import { ChartPanel } from "@/components/trade/chart-panel";
import { OrderbookPanel } from "@/components/trade/orderbook-panel";
import { IconUser } from "@tabler/icons-react";

export default function TradePage() {
  const [walletAddr, setWalletAddr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.user?.wallet_address && setWalletAddr(d.user.wallet_address))
      .catch(() => {});
  }, []);

  return (
    <div className="h-screen bg-[#0a0b0e] flex flex-col overflow-hidden">
      <AppNavbar />

      {/* h-11 = 44px offset for slim nav */}
      <div className="mt-11 flex-1 min-h-0 flex">

        {/* Thin left sidebar */}
        <div className="w-9 shrink-0 bg-[#0c0d14] border-r border-white/[0.06] flex flex-col items-center justify-end pb-3 z-40">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center overflow-hidden">
            {walletAddr ? (
              <span className="text-[9px] font-bold text-cyan-300">
                {walletAddr.slice(2, 4).toUpperCase()}
              </span>
            ) : (
              <IconUser className="h-3 w-3 text-gray-500" />
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex">
          <div className="flex-1 min-w-0 border-r border-white/5">
            <ChartPanel />
          </div>
          <div className="w-[220px] shrink-0 hidden md:block">
            <OrderbookPanel />
          </div>
        </div>

      </div>
    </div>
  );
}
