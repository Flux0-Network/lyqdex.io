"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppNavbar } from "@/components/shared/app-navbar";
import { AppSidebar, SIDEBAR_W } from "@/components/shared/app-sidebar";
import { ChartPanel } from "@/components/trade/chart-panel";
import { OrderbookPanel } from "@/components/trade/orderbook-panel";

export default function TradePage() {
  const [symbol,       setSymbol]       = useState("BTCUSDT");
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
      <AppSidebar active="trade" walletAddr={walletAddr} />

      {/* Navbar */}
      <AppNavbar
        sidebarWidth={SIDEBAR_W}
        symbol={symbol}
        onSymbol={setSymbol}
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
            symbol={symbol}
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
