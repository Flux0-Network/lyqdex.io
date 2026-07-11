"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AppNavbar } from "@/components/shared/app-navbar";
import { ChartPanel } from "@/components/trade/chart-panel";
import { OrderbookPanel } from "@/components/trade/orderbook-panel";
import { IconUser } from "@tabler/icons-react";

const SIDEBAR_W = 36;

export default function TradePage() {
  const [timeframe, setTimeframe] = useState("1H");
  const [walletAddr, setWalletAddr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.user?.wallet_address && setWalletAddr(d.user.wallet_address))
      .catch(() => {});
  }, []);

  return (
    <div className="h-screen bg-[#0a0b0e] overflow-hidden">

      {/* Full-height sidebar */}
      <div
        className="fixed left-0 top-0 bottom-0 bg-[#0c0d14] border-r border-white/[0.06] z-50 flex flex-col items-center justify-between py-2.5"
        style={{ width: SIDEBAR_W }}
      >
        <Link href="/" className="flex items-center justify-center">
          <Image src="/lyqdex-icon.png" alt="LyqDex" width={26} height={26} />
        </Link>
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center">
          {walletAddr ? (
            <span className="text-[9px] font-bold text-cyan-300">{walletAddr.slice(2, 4).toUpperCase()}</span>
          ) : (
            <IconUser className="h-3 w-3 text-gray-500" />
          )}
        </div>
      </div>

      {/* Navbar with timeframe buttons merged in */}
      <AppNavbar
        sidebarWidth={SIDEBAR_W}
        timeframe={timeframe}
        onTimeframe={setTimeframe}
      />

      {/* Content */}
      <div
        className="absolute top-11 bottom-0 right-0 flex"
        style={{ left: SIDEBAR_W }}
      >
        <div className="flex-1 min-w-0 border-r border-white/5">
          <ChartPanel timeframe={timeframe} />
        </div>
        <div className="w-[220px] shrink-0 hidden md:block">
          <OrderbookPanel />
        </div>
      </div>

    </div>
  );
}
