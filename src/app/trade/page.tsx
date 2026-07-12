"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppNavbar } from "@/components/shared/app-navbar";
import { ChartPanel } from "@/components/trade/chart-panel";
import { OrderbookPanel } from "@/components/trade/orderbook-panel";
import { IconLogin, IconLayoutDashboard } from "@tabler/icons-react";

const SIDEBAR_W = 36;

export default function TradePage() {
  const [timeframe,    setTimeframe]    = useState("1H");
  const [walletAddr,   setWalletAddr]   = useState<string | null>(null);
  const [replayActive, setReplayActive] = useState(false);

  const replayToggleFn = useRef<(() => void) | null>(null);
  const saveChartRef   = useRef<(() => void) | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.user?.wallet_address && setWalletAddr(d.user.wallet_address))
      .catch(() => {});
  }, []);

  const handleReplayChange = useCallback((active: boolean, toggle: () => void) => {
    setReplayActive(active);
    replayToggleFn.current = toggle;
  }, []);

  return (
    <div className="h-screen bg-[#0a0b0e] overflow-hidden">

      {/* Full-height sidebar */}
      <div
        className="fixed left-0 top-0 bottom-0 bg-[#0c0d14] z-50 flex flex-col items-center"
        style={{ width: SIDEBAR_W }}
      >
        {/* Top: logo */}
        <div className="h-11 flex items-center justify-center shrink-0">
          <Link href="/" className="flex items-center justify-center">
            <Image src="/lyqdex-icon.png" alt="LyqDex" width={26} height={26} />
          </Link>
        </div>

        {/* Middle: nav icons */}
        <div className="flex-1 w-full border-r border-white/[0.06] flex flex-col items-center pt-2 gap-1">
          <Link
            href="/dashboard"
            title="Dashboard"
            className="h-6 w-6 rounded flex items-center justify-center text-gray-600 hover:text-cyan-400 hover:bg-white/[0.06] transition"
          >
            <IconLayoutDashboard className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Bottom: login/profile */}
        <div className="w-full border-r border-white/[0.06] flex flex-col items-center pb-2.5">
          {walletAddr ? (
            <div
              className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center cursor-pointer"
              title={walletAddr}
            >
              <span className="text-[9px] font-bold text-cyan-300">{walletAddr.slice(2, 4).toUpperCase()}</span>
            </div>
          ) : (
            <Link
              href="/login"
              title="Anmelden"
              className="h-6 w-6 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30 transition"
            >
              <IconLogin className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Navbar */}
      <AppNavbar
        sidebarWidth={SIDEBAR_W}
        timeframe={timeframe}
        onTimeframe={setTimeframe}
        replayActive={replayActive}
        onReplayToggle={() => replayToggleFn.current?.()}
        onSaveChart={() => saveChartRef.current?.()}
      />

      {/* Content */}
      <div className="absolute top-11 bottom-0 right-0 flex" style={{ left: SIDEBAR_W }}>
        <div className="flex-1 min-w-0 border-r border-white/5">
          <ChartPanel
            timeframe={timeframe}
            onReplayChange={handleReplayChange}
            saveRef={saveChartRef}
          />
        </div>
        <div className="w-[220px] shrink-0 hidden md:block">
          <OrderbookPanel />
        </div>
      </div>

    </div>
  );
}
