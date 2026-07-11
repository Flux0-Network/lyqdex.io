"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AppNavbar } from "@/components/shared/app-navbar";
import { ChartPanel } from "@/components/trade/chart-panel";
import { OrderbookPanel } from "@/components/trade/orderbook-panel";
import { IconUser } from "@tabler/icons-react";

const SIDEBAR_W = 36; // px

export default function TradePage() {
  const [walletAddr, setWalletAddr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.user?.wallet_address && setWalletAddr(d.user.wallet_address))
      .catch(() => {});
  }, []);

  return (
    <div className="h-screen bg-[#0a0b0e] overflow-hidden">

      {/* Full-height left sidebar — sits behind + beside the navbar */}
      <div
        className="fixed left-0 top-0 bottom-0 bg-[#0c0d14] border-r border-white/[0.06] z-50 flex flex-col items-center justify-between py-2.5"
        style={{ width: SIDEBAR_W }}
      >
        {/* Logo top */}
        <Link href="/" className="flex items-center justify-center">
          <Image src="/lyqdex-icon.png" alt="LyqDex" width={26} height={26} />
        </Link>

        {/* Profile avatar bottom */}
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

      {/* Slim navbar — starts to the right of the sidebar */}
      <AppNavbar sidebarWidth={SIDEBAR_W} />

      {/* Content — offset right of sidebar and below navbar */}
      <div
        className="absolute top-11 bottom-0 right-0 flex"
        style={{ left: SIDEBAR_W }}
      >
        <div className="flex-1 min-w-0 border-r border-white/5">
          <ChartPanel />
        </div>
        <div className="w-[220px] shrink-0 hidden md:block">
          <OrderbookPanel />
        </div>
      </div>

    </div>
  );
}
